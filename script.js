// Nhập module lõi BellaAI
import { BellaAI } from "./core.js";
import { ChatInterface } from "./chatInterface.js";

document.addEventListener("DOMContentLoaded", async function() {
    // --- Lấy tất cả các phần tử DOM cần thiết ---
    const transcriptDiv = document.getElementById("transcript");
    const loadingScreen = document.getElementById("loading-screen");
    const video1 = document.getElementById("video1");
    const video2 = document.getElementById("video2");
    const micButton = document.getElementById("mic-button");


    // --- Khởi tạo lõi AI ---
    let bellaAI;
    let chatInterface;
    
    // Đầu tiên khởi tạo giao diện chat (không phụ thuộc AI)
    try {
        chatInterface = new ChatInterface();
        console.log("Chat interface initialized successfully");
        console.log("ChatInterface instance created:", chatInterface);
        console.log("Chat container element:", chatInterface.chatContainer);
        console.log("Is chat container in DOM:", document.body.contains(chatInterface.chatContainer));
        
        // Tự động hiển thị giao diện chat (dùng cho debug)
        setTimeout(() => {
            console.log("Trying to auto show chat interface...");
            chatInterface.show();
            console.log("Chat interface auto shown");
            console.log("Chat interface visibility:", chatInterface.getVisibility());
            console.log("Chat container class name:", chatInterface.chatContainer.className);
        }, 2000);
    } catch (error) {
        console.error("Failed to initialize chat interface:", error);
    }
    
    // Sau đó thử khởi tạo lõi AI
    micButton.disabled = true;
    transcriptDiv.textContent = "Waking up Bella's core...";
    try {
        bellaAI = await BellaAI.getInstance();
        console.log("Bella AI initialized successfully");
        
        // Thiết lập hàm callback AI cho giao diện chat
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                try {
                    chatInterface.showTypingIndicator();
                    const response = await bellaAI.think(message);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage("assistant", response);
                } catch (error) {
                    console.error("AI processing error:", error);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage("assistant", "Sorry, I'm a bit confused right now, please try again later...");
                }
            };
        }
        
        micButton.disabled = false;
        transcriptDiv.textContent = "Bella is ready, please click the microphone to start a conversation.";
    } catch (error) {
        console.error("Failed to initialize Bella AI:", error);
        transcriptDiv.textContent = "AI model failed to load, but the chat interface is still available.";
        
        // Ngay cả khi AI thất bại, vẫn cung cấp chức năng chat cơ bản
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                chatInterface.showTypingIndicator();
                setTimeout(() => {
                    chatInterface.hideTypingIndicator();
                    const fallbackResponses = [
                        "My AI core is still loading, please try again later...",
                        "Sorry, I can't think properly right now, but I'm learning!",
                        "My brain is still starting up, please give me a moment...",
                        "System is updating, temporarily unable to provide intelligent replies."
                    ];
                    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
                    chatInterface.addMessage("assistant", randomResponse);
                }, 1000);
            };
        }
        
        // Vô hiệu hóa chức năng giọng nói, nhưng vẫn giữ giao diện khả dụng
        micButton.disabled = true;
    }

    // --- Xử lý màn hình loading ---
    setTimeout(() => {
        loadingScreen.style.opacity = "0";
        // Ẩn sau hiệu ứng để không chặn tương tác
        setTimeout(() => {
            loadingScreen.style.display = "none";
            // Hiển thị bảng điều khiển chat
            const chatControlPanel = document.querySelector(".chat-control-panel");
            if (chatControlPanel) {
                chatControlPanel.classList.add("visible");
            }
        }, 500); // Thời gian này nên khớp với transition trong CSS
    }, 1500); // Bắt đầu mờ dần sau 1.5 giây

    let activeVideo = video1;
    let inactiveVideo = video2;

    // Danh sách video
    const videoList = [
        "视频资源/3D 建模图片制作.mp4",
        "视频资源/jimeng-2025-07-16-1043-笑着优雅的左右摇晃，过一会儿手扶着下巴，保持微笑.mp4",
        "视频资源/jimeng-2025-07-16-4437-比耶，然后微笑着优雅的左右摇晃.mp4",
        "视频资源/生成加油视频.mp4",
        "视频资源/生成跳舞视频.mp4",
        "视频资源/负面/jimeng-2025-07-16-9418-双手叉腰，嘴巴一直在嘟囔，表情微微生气.mp4"
    ];

    // --- Chức năng chuyển đổi video fade in/out ---
    function switchVideo() {
        // 1. Chọn video tiếp theo
        const currentVideoSrc = activeVideo.querySelector("source").getAttribute("src");
        let nextVideoSrc = currentVideoSrc;
        while (nextVideoSrc === currentVideoSrc) {
            const randomIndex = Math.floor(Math.random() * videoList.length);
            nextVideoSrc = videoList[randomIndex];
        }

        // 2. Đặt source cho video không hoạt động
        inactiveVideo.querySelector("source").setAttribute("src", nextVideoSrc);
        inactiveVideo.load();

        // 3. Khi video không hoạt động có thể phát, thực hiện chuyển đổi
        inactiveVideo.addEventListener("canplaythrough", function onCanPlayThrough() {
            // Đảm bảo sự kiện chỉ kích hoạt một lần
            inactiveVideo.removeEventListener("canplaythrough", onCanPlayThrough);

            // 4. Phát video mới
            inactiveVideo.play().catch(error => {
                console.error("Video play failed:", error);
            });

            // 5. Chuyển đổi class active để kích hoạt hiệu ứng CSS
            activeVideo.classList.remove("active");
            inactiveVideo.classList.add("active");

            // 6. Cập nhật vai trò
            [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

            // Gắn sự kiện ended cho video active mới
            activeVideo.addEventListener("ended", switchVideo, { once: true });
        }, { once: true }); // Sử dụng { once: true } để đảm bảo sự kiện chỉ xử lý một lần
    }

    // Khởi động ban đầu
    activeVideo.addEventListener("ended", switchVideo, { once: true });
    
    // Sự kiện nút điều khiển chat
    const chatToggleBtn = document.getElementById("chat-toggle-btn");
    const chatTestBtn = document.getElementById("chat-test-btn");
    
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener("click", () => {
            if (chatInterface) {
                console.log("Chat button clicked");
                console.log("Chat interface state before click:", chatInterface.getVisibility());
                console.log("Chat container class name before click:", chatInterface.chatContainer.className);
                
                chatInterface.toggle();
                
                console.log("Chat interface state after click:", chatInterface.getVisibility());
                console.log("Chat container class name after click:", chatInterface.chatContainer.className);
                console.log("Chat interface toggled, current state:", chatInterface.getVisibility());
                
                // Cập nhật trạng thái nút
                const isVisible = chatInterface.getVisibility();
                chatToggleBtn.innerHTML = isVisible ? 
                    "<i class=\"fas fa-times\"></i><span>Close</span>" : 
                    "<i class=\"fas fa-comments\"></i><span>Chat</span>";
                console.log("Button text updated to:", chatToggleBtn.innerHTML);
            }
        });
    }
    
    if (chatTestBtn) {
        chatTestBtn.addEventListener("click", () => {
            if (chatInterface) {
                const testMessages = [
                    "Hello! I'm Bella, nice to meet you!",
                    "The chat interface is working fine and all features are ready.",
                    "This is a test message to verify the interface functionality."
                ];
                const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
                chatInterface.addMessage("assistant", randomMessage);
                
                // Nếu giao diện chat chưa hiển thị, tự động hiển thị
                if (!chatInterface.getVisibility()) {
                    chatInterface.show();
                    chatToggleBtn.innerHTML = "<i class=\"fas fa-times\"></i><span>Close</span>";
                }
                
                console.log("Test message added:", randomMessage);
            }
        });
    }


    // --- Nhân lõi nhận diện giọng nói ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    // Kiểm tra trình duyệt có hỗ trợ nhận diện giọng nói không
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Nhận diện liên tục
        recognition.lang = "en-US"; // Đặt ngôn ngữ là tiếng Anh
        recognition.interimResults = true; // Lấy kết quả tạm thời

        recognition.onresult = async (event) => {
            const transcriptContainer = document.getElementById("transcript");
            let final_transcript = "";
            let interim_transcript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            // Cập nhật kết quả tạm thời
            transcriptContainer.textContent = `You: ${final_transcript || interim_transcript}`;

            // Khi có kết quả cuối cùng, xử lý với AI
            if (final_transcript && bellaAI) {
                const userText = final_transcript.trim();
                transcriptContainer.textContent = `You: ${userText}`;

                // Nếu giao diện chat đang mở, cũng hiển thị trong cửa sổ chat
                if (chatInterface && chatInterface.getVisibility()) {
                    chatInterface.addMessage("user", userText);
                }

                try {
                    // Để Bella suy nghĩ
                    const thinkingText = document.createElement("p");
                    thinkingText.textContent = "Bella is thinking...";
                    thinkingText.style.color = "#888";
                    thinkingText.style.fontStyle = "italic";
                    transcriptContainer.appendChild(thinkingText);
                    
                    const response = await bellaAI.think(userText);
                    
                    transcriptContainer.removeChild(thinkingText);
                    const bellaText = document.createElement("p");
                    bellaText.textContent = `Bella: ${response}`;
                    bellaText.style.color = "#ff6b9d";
                    bellaText.style.fontWeight = "bold";
                    bellaText.style.marginTop = "10px";
                    transcriptContainer.appendChild(bellaText);

                    // Nếu giao diện chat đang mở, cũng hiển thị trong cửa sổ chat
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage("assistant", response);
                    }

                    // Tính năng TTS tạm thời bị tắt, sẽ kích hoạt ở giai đoạn tiếp theo
                    // TODO: Kích hoạt tính năng tổng hợp giọng nói
                    // const audioData = await bellaAI.speak(response);
                    // const blob = new Blob([audioData], { type: "audio/wav" });
                    // const audioUrl = URL.createObjectURL(blob);
                    // const audio = new Audio(audioUrl);
                    // audio.play();

                } catch (error) {
                    console.error("Bella AI processing error:", error);
                    const errorText = document.createElement("p");
                    const errorMsg = "Bella encountered a problem while processing, but she is still learning...";
                    errorText.textContent = errorMsg;
                    errorText.style.color = "#ff9999";
                    transcriptContainer.appendChild(errorText);
                    
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage("assistant", errorMsg);
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

    } else {
        console.log("Your browser does not support speech recognition.");
        // Có thể hiển thị thông báo cho người dùng trên giao diện
    }

    // --- Tương tác nút micro ---
    let isListening = false;

    micButton.addEventListener("click", function() {
        if (!SpeechRecognition) return; // Nếu không hỗ trợ thì không làm gì

        isListening = !isListening;
        micButton.classList.toggle("is-listening", isListening);
        const transcriptContainer = document.querySelector(".transcript-container");
        const transcriptText = document.getElementById("transcript");

        if (isListening) {
            transcriptText.textContent = "Listening..."; // Hiển thị thông báo ngay lập tức
            transcriptContainer.classList.add("visible");
            recognition.start();
        } else {
            recognition.stop();
            transcriptContainer.classList.remove("visible");
            transcriptText.textContent = ""; // Xóa nội dung
        }
    });



});