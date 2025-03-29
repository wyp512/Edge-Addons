// 监听消息，当收到消息时，创建一个新的弹出窗口
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COPIED_TEXT') {
    // 检查收到的消息是否是 COPIED_TEXT 类型
      const copiedText = request.text;
      console.log('Background copied text saved:', copiedText);
      // 从 request 中提取 text 字段（即用户复制的文本）
      // 在控制台打印日志
  
      chrome.storage.local.get("popupWindowId", (data) => {
      // 从 chrome.storage.local（本地存储）中读取 popupWindowId，检查是否已有弹出窗口
        if (data.popupWindowId) {
          // 如果有弹出窗口，则更新为 "翻译中..."
          chrome.storage.local.set({ llmResponse: "翻译中..." });
        } 
        else {
          chrome.windows.create({
            url: "popup.html",
            type: "popup",
            width: 300,
            height: 350
          }, (window) => {
            if (window) {
              chrome.storage.local.set({ popupWindowId: window.id, llmResponse: "翻译中..." });
            }
            // 如果没有弹出窗口，则创建一个新的弹出窗口
            // 在弹出窗口中显示“翻译中...”
          });
        }
      });
    }
  });

  // 调用 DeepSeek API进行翻译
  try {
    const apiKey = "sk-ba61bfb87c7245768a7ad1980bb3192d"; 
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                {"role": "system", "content": "你是一个翻译助手，将用户输入的文本翻译成中文"},
                {"role": "user", "content": copiedText}
            ],
            stream: false
        })
    });

    const result = await response.json();
    const translatedText = result.choices[0].message.content;
  }