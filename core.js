// core.js - Bộ não của Bella (v3)
// Logic AI cốt lõi của Bella, hỗ trợ kiến trúc kết hợp giữa mô hình local và API cloud

import { pipeline, env, AutoTokenizer, AutoModelForSpeechSeq2Seq } from "./vendor/transformers.js";
import CloudAPIService from "./cloudAPI.js";

// Cấu hình mô hình local
env.allowLocalModels = true;
env.useBrowserCache = false;
env.allowRemoteModels = false;
env.backends.onnx.logLevel = "verbose";
env.localModelPath = "./models/";


class BellaAI {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = new BellaAI();
            await this.instance.init();
        }
        return this.instance;
    }

    constructor() {
        this.cloudAPI = new CloudAPIService();
        this.useCloudAPI = true; // Mặc định dùng mô hình cloud
        this.currentMode = "casual"; // Chế độ chat: casual, assistant, creative
        this.conversationHistory = [];
    }

    async init() {
        console.log("Đang khởi tạo AI cốt lõi của Bella...");
        
        // Ưu tiên tải mô hình LLM (chức năng chat)
        try {
            console.log("Đang tải mô hình LLM...");
            this.llm = await pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-248M");
            console.log("Tải mô hình LLM thành công.");
        } catch (error) {
            console.error("Tải mô hình LLM thất bại:", error);
            // LLM tải thất bại nhưng không ngăn cản khởi tạo
        }
        
        // Thử tải mô hình ASR (nhận diện giọng nói)
        try {
            console.log("Đang tải mô hình ASR...");
            const modelPath = "Xenova/whisper-tiny";
            const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
            const model = await AutoModelForSpeechSeq2Seq.from_pretrained(modelPath);
            this.asr = await pipeline("automatic-speech-recognition", model, { tokenizer });
            console.log("Tải mô hình ASR thành công.");
        } catch (error) {
            console.warn("Tải mô hình ASR thất bại, chức năng nhận diện giọng nói sẽ bị tắt:", error);
            // ASR tải thất bại nhưng không ảnh hưởng đến chat
            this.asr = null;
        }

        // Mô hình TTS tạm thời tắt
        try {
            console.log("Đang tải mô hình TTS...");
            this.tts = await pipeline("text-to-speech", "Xenova/speecht5_tts", { quantized: false });
            console.log("Tải mô hình TTS thành công.");
        } catch (error) {
            console.warn("Tải mô hình TTS thất bại, chức năng tổng hợp giọng nói sẽ bị tắt:", error);
            this.tts = null;
        }

        console.log("AI cốt lõi của Bella đã khởi tạo xong.");
    }

    async think(prompt) {
        try {
            // Nếu bật API cloud và cấu hình đúng, ưu tiên dùng cloud
            if (this.useCloudAPI && this.cloudAPI.isConfigured()) {
                return await this.thinkWithCloudAPI(prompt);
            }
            
            // Nếu không thì dùng mô hình local
            return await this.thinkWithLocalModel(prompt);
            
        } catch (error) {
            console.error("Lỗi trong quá trình suy nghĩ:", error);
            
            // Nếu cloud API lỗi, thử chuyển sang local
            if (this.useCloudAPI) {
                console.log("Cloud API lỗi, chuyển sang mô hình local...");
                try {
                    return await this.thinkWithLocalModel(prompt);
                } catch (localError) {
                    console.error("Mô hình local cũng lỗi:", localError);
                }
            }
            
            return this.getErrorResponse();
        }
    }

    // Suy nghĩ bằng API cloud
    async thinkWithCloudAPI(prompt) {
        const enhancedPrompt = this.enhancePromptForMode(prompt);
        return await this.cloudAPI.chat(enhancedPrompt);
    }

    // Suy nghĩ bằng mô hình local
    async thinkWithLocalModel(prompt) {
        if (!this.llm) {
            return "I'm still learning how to think, please wait a moment...";
        }

        const bellaPrompt = this.enhancePromptForMode(prompt, true);

        const result = await this.llm(bellaPrompt, {
            max_new_tokens: 50,
            temperature: 0.8,
            top_k: 40,
            do_sample: true,
        });

        // Làm sạch kết quả sinh ra
        let response = result[0].generated_text;
        if (response.includes(bellaPrompt)) {
            response = response.replace(bellaPrompt, "").trim();
        }

        return response || "I need to think a bit more...";
    }

    // Tăng cường prompt theo chế độ
    enhancePromptForMode(prompt, isLocal = false) {
        const modePrompts = {
            casual: isLocal ? 
                `As a warm and lovely AI companion Bella, respond in a relaxed and friendly tone: ${prompt}` :
                `Please respond in a warm, relaxed tone, like a caring friend. Keep it concise and fun: ${prompt}`,
            assistant: isLocal ?
                `As the intelligent assistant Bella, provide helpful and accurate assistance: ${prompt}` :
                `As a professional but warm AI assistant, provide accurate and useful information and advice: ${prompt}`,
            creative: isLocal ?
                `As the creative AI companion Bella, use your imagination to respond: ${prompt}` :
                `Be creative and imaginative, provide interesting and unique responses and ideas: ${prompt}`
        };
        
        return modePrompts[this.currentMode] || modePrompts.casual;
    }

    // Tạo prompt dựa trên lịch sử hội thoại, định dạng rõ ràng cho T5
    buildPromptFromHistory() {
        const systemPrompt = `The following is a friendly conversation between a human and an AI assistant named Bella. Bella is warm, casual, and always tries to understand the user's intent.`;

        const historyLines = (this.conversationHistory || [])
            .slice(-6)
            .map(turn => `${turn.role === "user" ? "Human" : "Bella"}: ${turn.content}`)
            .join("\n");

        return `${systemPrompt}\n${historyLines}\nBella:`.trim();
    }

    // Lấy phản hồi lỗi
    getErrorResponse() {
        const errorResponses = [
            "Sorry, I'm a bit confused right now, let me reorganize my thoughts...",
            "Hmm... I need to think a bit more, please wait a moment.",
            "My mind is a bit messy, give me some time to sort it out.",
            "Let me reorganize my words, please wait a moment."
        ];
        
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    // Đặt chế độ chat
    setChatMode(mode) {
        if (["casual", "assistant", "creative"].includes(mode)) {
            this.currentMode = mode;
            return true;
        }
        return false;
    }

    // Chuyển đổi nhà cung cấp AI
    switchProvider(provider) {
        if (provider === "local") {
            this.useCloudAPI = false;
            return true;
        } else {
            const success = this.cloudAPI.switchProvider(provider);
            if (success) {
                this.useCloudAPI = true;
            }
            return success;
        }
    }

    // Đặt API key
    setAPIKey(provider, apiKey) {
        return this.cloudAPI.setAPIKey(provider, apiKey);
    }

    // Xóa lịch sử hội thoại
    clearHistory() {
        this.cloudAPI.clearHistory();
    }

    // Lấy thông tin cấu hình hiện tại
    getCurrentConfig() {
        return {
            useCloudAPI: this.useCloudAPI,
            provider: this.useCloudAPI ? this.cloudAPI.getCurrentProvider() : { name: "local", model: "LaMini-Flan-T5-248M" },
            mode: this.currentMode,
            isConfigured: this.useCloudAPI ? this.cloudAPI.isConfigured() : true
        };
    }

    async listen(audioData) {
        if (!this.asr) {
            throw new Error("Mô hình nhận diện giọng nói chưa được khởi tạo");
        }
        const result = await this.asr(audioData);
        return result.text;
    }

    async speak(text) {
        if (!this.tts) {
            throw new Error("Mô hình tổng hợp giọng nói chưa được khởi tạo");
        }
        // Cần embeddings cho SpeechT5
        const speaker_embeddings = "models/Xenova/speecht5_tts/speaker_embeddings.bin";
        const result = await this.tts(text, {
            speaker_embeddings,
        });
        return result.audio;
    }

    // Lấy instance dịch vụ API cloud (cho truy cập ngoài)
    getCloudAPIService() {
        return this.cloudAPI;
    }
}

// Xuất module ES6
export { BellaAI };