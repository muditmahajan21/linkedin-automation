import { getActiveTabURL } from "./utils.js"                                          //utols file to get current url
let total = 0;

document.addEventListener("DOMContentLoaded", async (tab) => {
  const activeTab = await getActiveTabURL();
  if (!activeTab.url.includes("www.linkedin.com/in/")) {                                 //check if url is linkedin search
    const container = document.getElementsByClassName('container')[0];
    container.innerHTML = '<div class="title text-white">This is not a Linkedin Profile Page</div>'
  } else {
    chrome.storage.sync.get(['templates'], function (result) {
      const templates = result.templates || [];
      // Set the value of the linkedin-automation-message input
      if(templates.length === 0) {
        return;
      }
      const messageInput = document.getElementById("linkedin-automation-message");
      messageInput.value = templates[0].message;
      const variables = templates[0].variables;
      const variablesContainer = document.getElementById("variables-container");
      variablesContainer.innerHTML = "";
      for (const variable in variables) {
        const variableInput = document.createElement("input");
        variableInput.setAttribute("type", "text");
        variableInput.setAttribute("placeholder", variable);
        variableInput.setAttribute("id", variable);
        variableInput.setAttribute("value", variables[variable]);
        variablesContainer.appendChild(variableInput);
      }
    });
  }
});

const addMessageButton = document.getElementById("addMessage");  
addMessageButton.addEventListener("click", async () => {
  const activeTab = await getActiveTabURL();
  // Get the value of the linkedin-automation-message input
  const messageInput = document.getElementById("linkedin-automation-message");
  const message = messageInput.value;
  // Get the variables
  const variables = document.getElementById("variables-container").children;
  const variablesObject = {};
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    variablesObject[variableName] = variableValue;
  }
  // Replace variables in message
  let messageWithVariables = message;
  for (const variable in variablesObject) {
    messageWithVariables = messageWithVariables.replace(`%${variable}%`, variablesObject[variable]);
  }
  chrome.tabs.sendMessage(activeTab.id, { message: "addMessage", value: messageWithVariables });                   //send message to content.js
});

const addVariablesButton = document.getElementById("addVariables");
addVariablesButton.addEventListener("click", async () => {
  // Get the value of the linkedin-automation-message input
  const messageInput = document.getElementById("linkedin-automation-message");
  const message = messageInput.value;
  // Variables are enclosed in % and %
  const variables = message.match(/%.*?%/g);
  if (variables) {
    // Add form fields for user to enter values for variables
    const variablesContainer = document.getElementById("variables-container");
    variablesContainer.innerHTML = "";
    variables.forEach((variable) => {
      const variableName = variable.replace(/%/g, "");
      const variableInput = document.createElement("input");
      variableInput.setAttribute("type", "text");
      variableInput.setAttribute("placeholder", variableName);
      variableInput.setAttribute("id", variableName);
      variablesContainer.appendChild(variableInput);
    }
    );
  }
});

const saveTemplateButton = document.getElementById("save-template");
saveTemplateButton.addEventListener("click", async () => {
  // Get the value of the linkedin-automation-message input
  const messageInput = document.getElementById("linkedin-automation-message");
  // Get the variables
  const variables = document.getElementById("variables-container").children;
  const variablesObject = {};
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    variablesObject[variableName] = variableValue;
  }
  const template = {
    message: messageInput.value,
    variables: variablesObject
  }
  chrome.storage.sync.get(['templates'], function (result) {
    let templates = result.templates || [];
    templates.unshift(template);
    chrome.storage.sync.set({ templates: templates }, function () {
      console.log('Value is set to ' + templates);
    });
  }
  );
});