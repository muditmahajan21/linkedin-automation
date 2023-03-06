(()=> {

async function fill(selector, input) {
  return new Promise(async function (resolve, reject) {
    try {
      let inputBox = await tab.findElement(
        swd.By.css(
          selector
        )
      );
      await inputBox.sendKeys(input);
      await tab;
      resolve();
    } catch (error) {
      reject();
    }
  })
}

const hide = (elem) => {
  elem.classList.remove("visible");
  elem.classList.remove("hidden");	// Add hidden class only if it is not there in classList of element
  elem.classList.add("hidden");
};

chrome.runtime.onMessage.addListener(async (obj, sender, response) => {  
  try {
  if(obj.message === "addMessage") {
    // Find the linkedin Message Button in the profile
    const messageButton = document.getElementsByClassName("message-anywhere-button pvs-profile-actions__action artdeco-button")[0];
    if(messageButton) {
      await messageButton.click();
      
      // Find the Message Box and fill it
      const messageBox = document.getElementsByClassName("msg-form__contenteditable t-14 t-black--light t-normal flex-grow-1 notranslate")[0];
      if(messageBox) {
        await messageBox.click();
        await messageBox.sendKeys("Hello, I am interested in your profile. Please accept my request.");
      }

      // Find the Send Button and click it
      const sendButton = document.getElementsByClassName("msg-form__send-button");
      if(sendButton) {
        await sendButton[0].click();
      }
    }
    console.log("Message Button Clicked");
  }   
  } catch(error) {
    console.log(error);
  }                             //list of all serach results
});
})();