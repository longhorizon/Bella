// simpleBellaAI.js - Phiên bản rút gọn của BellaAI, dùng để test giao diện chat
// Đã loại bỏ các phụ thuộc phức tạp, chỉ tập trung vào chức năng chat

class SimpleBellaAI {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = new SimpleBellaAI();
            await this.instance.init();
        }
        return this.instance;
    }

    constructor() {
        this.currentMode = "casual"; // Chế độ chat: casual, assistant, creative
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log("Initializing SimpleBellaAI...");
            // Mô phỏng quá trình khởi tạo
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.isInitialized = true;
            console.log("SimpleBellaAI initialized");
        } catch (error) {
            console.error("SimpleBellaAI initialization failed:", error);
            throw error;
        }
    }

    async think(prompt) {
        try {
            console.log("Bella is thinking:", prompt);
            
            // Mô phỏng thời gian suy nghĩ
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            // Sinh phản hồi theo chế độ
            return this.generateResponse(prompt);
            
        } catch (error) {
            console.error("Error during thinking:", error);
            return this.getErrorResponse();
        }
    }

    generateResponse(prompt) {
        const responses = {
            casual: [
                `Haha, what you said "${prompt}" is really interesting! I think this topic is great!`,
                `About "${prompt}", I think it's really fun! Do you want to talk about something else?`,
                `Hmm, "${prompt}" reminds me of a lot! Let's keep chatting!`,
                `Wow, I like the topic "${prompt}"! Your ideas are always so special!`,
                `Hearing you say "${prompt}", I feel happier! Keep sharing with me!`
            ],
            assistant: [
                `About "${prompt}", let me provide you with some useful information and suggestions.`,
                `For the question "${prompt}", I suggest you can consider the following aspects.`,
                `"${prompt}" is a good question, let me help you analyze it.`,
                `Based on "${prompt}", I can provide you with the following professional advice.`,
                `About "${prompt}", I have compiled some relevant information for your reference.`
            ],
            creative: [
                `Wow! "${prompt}" instantly ignited my creativity! Let's imagine together...`,
                `"${prompt}" is such an imaginative topic! Countless wonderful scenes appear in my mind!`,
                `Hearing "${prompt}", I seem to see a whole new world! Let's explore together!`,
                `"${prompt}" inspired me! I thought of a super interesting idea...`,
                `Wow! "${prompt}" makes my imagination fly! Let's create something special!`
            ]
        };

        const modeResponses = responses[this.currentMode] || responses.casual;
        const randomResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];
        
        return randomResponse;
    }

    // Lấy phản hồi lỗi
    getErrorResponse() {
        const errorResponses = [
            "Sorry, I'm a bit confused right now, let me reorganize my thoughts...",
            "Hmm... I need to think a bit more, please wait a moment.",
            "My mind is a bit messy, give me some time to sort it out.",
            "Let me reorganize my words, please wait a moment.",
            "Oops, I was distracted just now, can you say it again?"
        ];
        
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    // Đặt chế độ chat
    setChatMode(mode) {
        if (["casual", "assistant", "creative"].includes(mode)) {
            this.currentMode = mode;
            console.log(`Chat mode switched to: ${mode}`);
            return true;
        }
        return false;
    }

    // Lấy thông tin cấu hình hiện tại
    getCurrentConfig() {
        return {
            useCloudAPI: false,
            provider: { name: "simple", model: "SimpleBellaAI" },
            mode: this.currentMode,
            isConfigured: true,
            isInitialized: this.isInitialized
        };
    }

    // Xóa lịch sử hội thoại (bản rút gọn không cần thực hiện)
    clearHistory() {
        console.log("Chat history cleared");
    }
}

// Xuất SimpleBellaAI ra biến toàn cục
window.SimpleBellaAI = SimpleBellaAI;
// Đồng thời xuất ra BellaAI để giữ tương thích
window.BellaAI = SimpleBellaAI;

console.log("SimpleBellaAI 已加载完成");