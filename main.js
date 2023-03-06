import { getActiveTabURL } from "./utils.js"                                          //utols file to get current url
let total = 0;

document.addEventListener("DOMContentLoaded", async (tab) => {
  const activeTab = await getActiveTabURL();
  if (!activeTab.url.includes("www.linkedin.com/in/")) {                                 //check if url is linkedin search
    const container = document.getElementsByClassName('container')[0];
    container.innerHTML = '<div class="title text-white">This is not a Linkedin Profile Page</div>'
  }
});

const addMessageButton = document.getElementById("addMessage");  
addMessageButton.addEventListener("click", async () => {
  const activeTab = await getActiveTabURL();
  chrome.tabs.sendMessage(activeTab.id, { message: "addMessage" });                   //send message to content.js
});