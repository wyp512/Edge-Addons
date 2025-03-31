
const DEEPSEEK_API_KEY = "sk-ba61bfb87c7245768a7ad1980bb3192d"; // 替换成你的 DeepSeek API Key
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"; // DeepSeek API 地址

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COPIED_TEXT') {
    const copiedText = request.text;
    console.log('Background copied text saved:', copiedText);

    chrome.storage.local.get("popupWindowId", (data) => {
      if (data.popupWindowId) {
        // 如果弹窗已打开，更新存储的 LLM 响应
        chrome.storage.local.set({ llmResponse: "翻译中..." });
      } else {
        // 创建新的弹窗
        chrome.windows.create({
          url: "popup.html",
          type: "popup",
          width: 300,
          height: 350
        }, (window) => {
          if (window) {
            chrome.storage.local.set({ popupWindowId: window.id, llmResponse: "翻译中..." });
          }
        });
      }
    });

    // 调用 DeepSeek API 获取翻译结果
    fetchDeepSeekResponse(copiedText)
      .then(responseText => {
        chrome.storage.local.set({ llmResponse: responseText }); // 更新 LLM 结果
        console.log('DeepSeek Response Saved:', responseText);
      })
      .catch(error => console.error("Error fetching DeepSeek response:", error));
  }
});

// 监听弹窗关闭事件
chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get("popupWindowId", (data) => {
    if (data.popupWindowId === windowId) {
      chrome.storage.local.remove("popupWindowId");
    }
  });
});

// 调用 DeepSeek API 的函数
async function fetchDeepSeekResponse(text) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat", // 或其他 DeepSeek 支持的模型
      messages: [
        {
          role: "user",
          content: `请翻译以下内容：${text}` // 可以自定义提示词
        }
      ],
      temperature: 0.3, // 控制生成结果的随机性（0-1）
      max_tokens: 1000, // 限制返回的最大 token 数
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content; // 返回 DeepSeek 的回复
}