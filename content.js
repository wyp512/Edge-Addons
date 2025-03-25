document.addEventListener('copy', async (event) => {


    const selectedText = window.getSelection().toString().trim();
  
    chrome.runtime.sendMessage({
          type: 'COPIED_TEXT',
          text: selectedText
    });
  
    console.log('Copied text:', selectedText);
  });