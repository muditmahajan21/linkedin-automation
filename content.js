(()=> {
chrome.runtime.onMessage.addListener(async (obj, sender, response) => {  
  try {
    if(obj.message === "addMessage") {  
      const messageButtonElements = document.getElementsByClassName("artdeco-button artdeco-button--2");
      const nameDiv = document.getElementsByClassName("text-heading-xlarge")[0];
      let firstName = "";
      if(nameDiv) {
        const nameArray = nameDiv.innerText.split(" ");
        firstName = nameArray[0];
      }
      // The message button is the one with "Message" in it's label
      // Find the message button 
      let messageButton = null;
      for (let i = 0; i < messageButtonElements.length; i++) {
        const element = messageButtonElements[i];
        if(element?.ariaLabel?.includes("Message " + firstName)) {
          messageButton = element;
          break;
        }       
      }
      if(!messageButton) {
        messageButton = document.getElementsByClassName("message-anywhere-button pvs-profile-actions__action artdeco-button")[1];
      }
      if(messageButton) {
        await messageButton.click();
      }
      // Wait for the message box to appear
      await new Promise(resolve => setTimeout(resolve, 1000));
      const messageBox = document.getElementsByClassName("msg-form__contenteditable")[0];
      if(messageBox) {       
        
        messageBox.innerHTML = "<p><br/>" + obj.value + "</p>";
        messageBox.dispatchEvent(new Event('input', {bubbles: true}));

        // Find the Send Button and click it
        const sendButton = document.getElementsByClassName("msg-form__send-button");
        if(sendButton) {
          sendButton[0].disabled = false;
          await sendButton[0].click();
        }
      } else {
        console.log("Message box not found");
      }
    } else if(obj.message === "getProfileData") {
      // Take the first name and last name from the profile
      const name = document.getElementsByClassName("text-heading-xlarge")[0];
      if(name) {
        const nameArray = name.innerText.split(" ");
        const firstName = nameArray[0];
        const lastName = nameArray[nameArray.length - 1];
        const nameString = firstName + " " + lastName;
        // Send the first name and last name to the popup
        response({ firstName, lastName, nameString });
      }
    }
  } catch(error) {
    console.log(error);
  }                             //list of all serach results
});
})();