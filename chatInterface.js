// chatInterface.js - Thành phần giao diện chat của Bella
// Module này chịu trách nhiệm tạo và quản lý giao diện chat đẹp mắt, thể hiện tính cách ấm áp của Bella

class ChatInterface {
    constructor() {
        this.isVisible = false;
        this.messages = [];
        this.maxMessages = 50; // Tối đa hiển thị 50 tin nhắn
        this.chatContainer = null;
        this.messageContainer = null;
        this.inputContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.toggleButton = null;
        this.settingsPanel = null;
        this.isSettingsVisible = false;
        
        this.init();
    }

    // Khởi tạo giao diện chat
    init() {
        this.createChatContainer();
        this.createToggleButton();
        this.createSettingsPanel();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    // Tạo khung chat chính
    createChatContainer() {
        // Khung chat chính
        this.chatContainer = document.createElement("div");
        this.chatContainer.className = "bella-chat-container";
        this.chatContainer.innerHTML = `
            <div class="bella-chat-header">
                <div class="bella-chat-title">
                    <div class="bella-avatar">💝</div>
                    <div class="bella-title-text">
                        <h3>Bella</h3>
                        <span class="bella-status">Online</span>
                    </div>
                </div>
                <div class="bella-chat-controls">
                    <button class="bella-settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="bella-minimize-btn" title="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="bella-chat-messages"></div>
            <div class="bella-chat-input-container">
                <div class="bella-input-wrapper">
                    <input type="text" class="bella-message-input" placeholder="Chat with Bella..." maxlength="500">
                    <button class="bella-send-btn" title="Send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="bella-input-hint">
                    Press Enter to send, Shift + Enter for new line
                </div>
            </div>
        `;

        // Lấy tham chiếu các phần tử chính
        this.messageContainer = this.chatContainer.querySelector(".bella-chat-messages");
        this.inputContainer = this.chatContainer.querySelector(".bella-chat-input-container");
        this.messageInput = this.chatContainer.querySelector(".bella-message-input");
        this.sendButton = this.chatContainer.querySelector(".bella-send-btn");
        
        document.body.appendChild(this.chatContainer);
    }

    // Tạo nút chuyển đổi chat
    createToggleButton() {
        this.toggleButton = document.createElement("button");
        this.toggleButton.className = "bella-chat-toggle";
        this.toggleButton.innerHTML = `
            <div class="bella-toggle-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="bella-toggle-text">Chat with Bella</div>
        `;
        this.toggleButton.title = "Open chat window";
        
        document.body.appendChild(this.toggleButton);
    }

    // Tạo bảng cài đặt
    createSettingsPanel() {
        this.settingsPanel = document.createElement("div");
        this.settingsPanel.className = "bella-settings-panel";
        this.settingsPanel.innerHTML = `
            <div class="bella-settings-header">
                <h4>Chat Settings</h4>
                <button class="bella-settings-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="bella-settings-content">
                <div class="bella-setting-group">
                    <label>AI Provider</label>
                    <select class="bella-provider-select">
                        <option value="local">Local Model</option>
                        <option value="openai">OpenAI GPT</option>
                        <option value="qwen">Qwen</option>
                        <option value="ernie">ERNIE</option>
                        <option value="glm">GLM</option>
                    </select>
                </div>
                <div class="bella-setting-group bella-api-key-group" style="display: none;">
                    <label>API Key</label>
                    <input type="password" class="bella-api-key-input" placeholder="Enter API Key">
                    <button class="bella-api-key-save">Save</button>
                </div>
                <div class="bella-setting-group">
                    <label>Chat Mode</label>
                    <select class="bella-mode-select">
                        <option value="casual">Casual Chat</option>
                        <option value="assistant">Assistant</option>
                        <option value="creative">Creative</option>
                    </select>
                </div>
                <div class="bella-setting-group">
                    <button class="bella-clear-history">Clear Chat History</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsPanel);
    }

    // Gắn các sự kiện
    bindEvents() {
        // Nút chuyển đổi chat
        this.toggleButton.addEventListener("click", () => {
            this.toggle();
        });

        // Nút thu nhỏ
        this.chatContainer.querySelector(".bella-minimize-btn").addEventListener("click", () => {
            this.hide();
        });

        // Nút cài đặt
        this.chatContainer.querySelector(".bella-settings-btn").addEventListener("click", () => {
            this.toggleSettings();
        });

        // Nút gửi tin nhắn
        this.sendButton.addEventListener("click", () => {
            this.sendMessage();
        });

        // Sự kiện nhập liệu
        this.messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Tự động điều chỉnh chiều cao input
        this.messageInput.addEventListener("input", () => {
            this.adjustInputHeight();
        });

        // Sự kiện bảng cài đặt
        this.bindSettingsEvents();
    }

    // Gắn sự kiện cho bảng cài đặt
    bindSettingsEvents() {
        // Đóng bảng cài đặt
        this.settingsPanel.querySelector(".bella-settings-close").addEventListener("click", () => {
            this.hideSettings();
        });

        // Chọn nhà cung cấp AI
        const providerSelect = this.settingsPanel.querySelector(".bella-provider-select");
        const apiKeyGroup = this.settingsPanel.querySelector(".bella-api-key-group");
        
        providerSelect.addEventListener("change", (e) => {
            const provider = e.target.value;
            if (provider === "local") {
                apiKeyGroup.style.display = "none";
            } else {
                apiKeyGroup.style.display = "block";
            }
            
            // Gọi callback khi đổi provider
            this.onProviderChange?.(provider);
        });

        // Lưu API Key
        this.settingsPanel.querySelector(".bella-api-key-save").addEventListener("click", () => {
            const provider = providerSelect.value;
            const apiKey = this.settingsPanel.querySelector(".bella-api-key-input").value;
            
            if (apiKey.trim()) {
                this.onAPIKeySave?.(provider, apiKey.trim());
                this.showNotification("API Key saved", "success");
            }
        });

        // Xóa lịch sử chat
        this.settingsPanel.querySelector(".bella-clear-history").addEventListener("click", () => {
            this.clearMessages();
            this.onClearHistory?.();
            this.hideSettings();
        });
    }

    // Thêm tin nhắn chào mừng
    addWelcomeMessage() {
        this.addMessage("assistant", "Hello! I'm Bella, your AI companion. Nice to meet you! Anything you want to talk about?", true);
    }

    // Chuyển đổi hiển thị/ẩn chat
    toggle() {
        console.log("ChatInterface.toggle() called");
        console.log("Trước khi chuyển đổi isVisible:", this.isVisible);
        
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
        
        console.log("Sau khi chuyển đổi isVisible:", this.isVisible);
    }

    // Hiển thị chat
    show() {
        console.log("ChatInterface.show() called");
        console.log("Trước khi hiển thị isVisible:", this.isVisible);
        console.log("Trước khi hiển thị chatContainer.className:", this.chatContainer.className);
        
        this.isVisible = true;
        this.chatContainer.classList.add("visible");
        
        console.log("Sau khi hiển thị isVisible:", this.isVisible);
        console.log("Sau khi hiển thị chatContainer.className:", this.chatContainer.className);
        console.log("chatContainer opacity:", window.getComputedStyle(this.chatContainer).opacity);
        console.log("chatContainer transform:", window.getComputedStyle(this.chatContainer).transform);
        
        this.toggleButton.classList.add("active");
        this.messageInput.focus();
        this.scrollToBottom();
    }

    // Ẩn chat
    hide() {
        this.isVisible = false;
        this.chatContainer.classList.remove("visible");
        this.toggleButton.classList.remove("active");
        this.hideSettings();
    }

    // Chuyển đổi bảng cài đặt
    toggleSettings() {
        if (this.isSettingsVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    // Hiển thị bảng cài đặt
    showSettings() {
        this.isSettingsVisible = true;
        this.settingsPanel.classList.add("visible");
    }

    // Ẩn bảng cài đặt
    hideSettings() {
        this.isSettingsVisible = false;
        this.settingsPanel.classList.remove("visible");
    }

    // Gửi tin nhắn
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Thêm tin nhắn người dùng
        this.addMessage("user", text);
        
        // Xóa input
        this.messageInput.value = "";
        this.adjustInputHeight();
        
        // Gọi callback gửi tin nhắn
        this.onMessageSend?.(text);
    }

    // Thêm tin nhắn vào giao diện chat
    addMessage(role, content, isWelcome = false) {
        const messageElement = document.createElement("div");
        messageElement.className = `bella-message bella-message-${role}`;
        
        if (isWelcome) {
            messageElement.classList.add("bella-welcome-message");
        }

        const timestamp = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

        messageElement.innerHTML = `
            <div class="bella-message-avatar">
                ${role === "user" ? "👤" : "💝"}
            </div>
            <div class="bella-message-content">
                <div class="bella-message-text">${this.formatMessage(content)}</div>
                <div class="bella-message-time">${timestamp}</div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.messages.push({ role, content, timestamp: Date.now() });

        // Giới hạn số lượng tin nhắn
        if (this.messages.length > this.maxMessages) {
            const oldMessage = this.messageContainer.firstChild;
            if (oldMessage) {
                this.messageContainer.removeChild(oldMessage);
            }
            this.messages.shift();
        }

        // Cuộn xuống cuối
        this.scrollToBottom();

        // Thêm hiệu ứng xuất hiện
        setTimeout(() => {
            messageElement.classList.add("bella-message-appear");
        }, 10);
    }

    // Định dạng nội dung tin nhắn
    formatMessage(content) {
        // Định dạng đơn giản, hỗ trợ xuống dòng
        return content
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");
    }

    // Hiển thị hiệu ứng đang nhập
    showTypingIndicator() {
        const existingIndicator = this.messageContainer.querySelector(".bella-typing-indicator");
        if (existingIndicator) return;

        const typingElement = document.createElement("div");
        typingElement.className = "bella-typing-indicator";
        typingElement.innerHTML = `
            <div class="bella-message-avatar">💝</div>
            <div class="bella-message-content">
                <div class="bella-typing-dots">
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        // Thêm hiệu ứng xuất hiện
        setTimeout(() => {
            typingElement.classList.add("bella-typing-show");
        }, 10);
    }

    // Ẩn hiệu ứng đang nhập
    hideTypingIndicator() {
        const indicator = this.messageContainer.querySelector(".bella-typing-indicator");
        if (indicator) {
            this.messageContainer.removeChild(indicator);
        }
    }

    // Xóa tất cả tin nhắn
    clearMessages() {
        this.messageContainer.innerHTML = "";
        this.messages = [];
        this.addWelcomeMessage();
    }

    // Cuộn xuống cuối
    scrollToBottom() {
        setTimeout(() => {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }, 10);
    }

    // Điều chỉnh chiều cao input
    adjustInputHeight() {
        this.messageInput.style.height = "auto";
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + "px";
    }

    // Hiển thị thông báo
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `bella-notification bella-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add("bella-notification-show");
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove("bella-notification-show");
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Kiểm tra cửa sổ chat có hiển thị không
    getVisibility() {
        return this.isVisible;
    }

    // Các callback
    onMessageSend = null;
    onProviderChange = null;
    onAPIKeySave = null;
    onClearHistory = null;
}

// ES6模块导出
export { ChatInterface };