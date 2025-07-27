// cloudAPI.js - Module dịch vụ AI cloud của Bella
// Module này chịu trách nhiệm giao tiếp với các API AI cloud khác nhau, cung cấp khả năng suy nghĩ mạnh mẽ hơn cho Bella

class CloudAPIService {
    constructor() {
        this.apiConfigs = {
            // Cấu hình OpenRouter AI
            openrouter: {
                baseURL: "https://openrouter.ai/api/v1/chat/completions",
                model: "qwen/qwen3-235b-a22b-2507:free",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                }
            },
            // Cấu hình OpenAI GPT-3.5/4
            openai: {
                baseURL: "https://api.openai.com/v1/chat/completions",
                model: "gpt-3.5-turbo",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_OPENAI_API_KEY"
                }
            },
            // Cấu hình Qwen (Aliyun Tongyi)
            qwen: {
                baseURL: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
                model: "qwen-turbo",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_QWEN_API_KEY"
                }
            },
            // Cấu hình Ernie (Baidu Wenxin Yiyan)
            ernie: {
                baseURL: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
                model: "ERNIE-Bot-turbo",
                headers: {
                    "Content-Type": "application/json"
                }
            },
            // Cấu hình GLM (Zhipu AI)
            glm: {
                baseURL: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                model: "glm-3-turbo",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_GLM_API_KEY"
                }
            }
        };
        
        this.currentProvider = "openrouter"; // Mặc định dùng openrouter
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Lưu tối đa 10 lượt hội thoại gần nhất
    }

    // Thiết lập API key
    setAPIKey(provider, apiKey) {
        if (this.apiConfigs[provider]) {
            if (provider === "openai" || provider === "qwen" || provider === "glm" || provider === "openrouter") {
                this.apiConfigs[provider].headers["Authorization"] = `Bearer ${apiKey}`;
            } else if (provider === "ernie") {
                this.apiConfigs[provider].accessToken = apiKey;
            } else
            return true;
        }
        return false;
    }

    // Chuyển đổi nhà cung cấp AI
    switchProvider(provider) {
        if (this.apiConfigs[provider]) {
            this.currentProvider = provider;
            return true;
        }
        return false;
    }

    // Thêm hội thoại vào lịch sử
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        
        // Giữ lịch sử ở độ dài hợp lý
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    // Tạo system prompt cá nhân hóa cho Bella
    getBellaSystemPrompt() {
        return {
            role: "system",
            content: `You are Bella, a warm, intelligent, and elegant AI companion. Your characteristics are:
1. Communicate with users in a warm and friendly tone, like a caring friend
2. Respond concisely, avoid lengthy explanations
3. Be empathetic and understand users' emotions
4. Occasionally show a cute and playful side
5. Reply in English, use natural and fluent language
6. Remember the conversation and keep it coherent
Always maintain this warm and elegant personality.`
        };
    }

    // Gọi API cloud để chat
    async chat(userMessage) {
        const config = this.apiConfigs[this.currentProvider];
        if (!config) {
            throw new Error(`Unsupported AI provider: ${this.currentProvider}`);
        }

        // Thêm tin nhắn người dùng vào lịch sử
        this.addToHistory("user", userMessage);

        try {
            let response;
            
            switch (this.currentProvider) {
                case "openai":
                    response = await this.callOpenAI(userMessage);
                    break;
                case "qwen":
                    response = await this.callQwen(userMessage);
                    break;
                case "ernie":
                    response = await this.callErnie(userMessage);
                    break;
                case "glm":
                    response = await this.callGLM(userMessage);
                    break;
                case "openrouter":
                    response = await this.callOpenRouter(userMessage);
                    break;
                default:
                    throw new Error(`Unimplemented AI provider: ${this.currentProvider}`);
            }

            // Thêm phản hồi AI vào lịch sử
            this.addToHistory("assistant", response);
            return response;
            
        } catch (error) {
            console.error(`Cloud API call failed (${this.currentProvider}):`, error);
            throw error;
        }
    }

    // Gọi OpenRouter API
    async callOpenRouter(userMessage) {
        const config = this.apiConfigs.openrouter;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 1024,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Gọi OpenAI API
    async callOpenAI(userMessage) {
        const config = this.apiConfigs.openai;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 150,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Gọi Qwen API
    async callQwen(userMessage) {
        const config = this.apiConfigs.qwen;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                input: {
                    messages: messages
                },
                parameters: {
                    max_tokens: 150,
                    temperature: 0.8,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Qwen API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.output.text.trim();
    }

    // Gọi Ernie API
    async callErnie(userMessage) {
        const config = this.apiConfigs.ernie;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const url = `${config.baseURL}?access_token=${config.accessToken}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                messages: messages,
                temperature: 0.8,
                top_p: 0.9,
                max_output_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`Ernie API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.result.trim();
    }

    // Gọi GLM API
    async callGLM(userMessage) {
        const config = this.apiConfigs.glm;
        const messages = [
            this.getBellaSystemPrompt(),
            ...this.conversationHistory
        ];

        const response = await fetch(config.baseURL, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({
                model: config.model,
                messages: messages,
                max_tokens: 150,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            throw new Error(`GLM API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Xóa lịch sử hội thoại
    clearHistory() {
        this.cloudAPI.clearHistory();
    }

    // Lấy thông tin nhà cung cấp hiện tại
    getCurrentProvider() {
        return {
            name: this.currentProvider,
            model: this.apiConfigs[this.currentProvider]?.model
        };
    }

    // Kiểm tra cấu hình API đã đầy đủ chưa
    isConfigured(provider = this.currentProvider) {
        const config = this.apiConfigs[provider];
        if (!config) return false;
        
        if (provider === "ernie") {
            return !!config.accessToken;
        } else {
            return config.headers["Authorization"] && 
                   config.headers["Authorization"] !== "Bearer YOUR_OPENAI_API_KEY" &&
                   config.headers["Authorization"] !== "Bearer YOUR_QWEN_API_KEY" &&
                   config.headers["Authorization"] !== "Bearer YOUR_GLM_API_KEY";
        }
    }
}

export default CloudAPIService;