import { getActiveTabURL } from "./utils.js"                                          //utols file to get current url

const prefillFirstNames = [
  "firstname",
  "first_name",
  "first-name",
  "first name",
]

const prefillLastNames = [
  "lastname",
  "last_name",
  "last-name",
  "last name",
]

const fullNames = [
  "name",
  "fullname",
  "full_name",
  "full-name",
  "full name",
]

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
      chrome.tabs.sendMessage(activeTab.id, { message: "getProfileData" }, (response) => {
        const variablesContainer = document.getElementById("variables-container");
        const variables = variablesContainer?.children;
        for (let i = 0; i < variables?.length; i++) {
          const variable = variables[i];
          const variableName = variable?.id;
          // If variable is in first names array
          if (prefillFirstNames.includes(variableName?.toLowerCase())) {
            variable.value = response?.firstName ? response?.firstName : "";
          }
          // If variable is in last names array
          if (prefillLastNames.includes(variableName?.toLowerCase())) {
            variable.value = response?.lastName ? response?.lastName : "";
          }
          // If variable is in full names array
          if (fullNames.includes(variableName?.toLowerCase())) {
            variable.value = response?.nameString ? response?.nameString : "";
          }
        }
      });
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
  window.close();
  chrome.tabs.sendMessage(activeTab.id, { message: "addMessage", value: messageWithVariables });                   //send message to content.js
});

const addVariablesButton = document.getElementById("addVariables");
addVariablesButton.addEventListener("click", async () => {
  const activeTab = await getActiveTabURL();
  // Get the value of the linkedin-automation-message input
  const messageInput = document.getElementById("linkedin-automation-message");
  const message = messageInput.value;

  // Get existing variables
  const existingVariables = document.getElementById("variables-container").children;
  const existingVariablesObject = {};
  for (let i = 0; i < existingVariables.length; i++) {
    const variable = existingVariables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    existingVariablesObject[variableName] = variableValue;
  }
  
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
    // Prefill variables with existing values
    for (const variable in existingVariablesObject) {
      const variableInput = document.getElementById(variable);
      if(variableInput) {
        variableInput.value = existingVariablesObject[variable];
      } 
    }
    chrome.tabs.sendMessage(activeTab.id, { message: "getProfileData" }, (response) => {
      const variablesContainer = document.getElementById("variables-container");
      const variables = variablesContainer?.children;
      for (let i = 0; i < variables?.length; i++) {
        const variable = variables[i];
        const variableName = variable?.id;
        // If variable is in first names array
        if (prefillFirstNames.includes(variableName?.toLowerCase())) {
          variable.value = response?.firstName ? response?.firstName : "";
        }
        // If variable is in last names array
        if (prefillLastNames.includes(variableName?.toLowerCase())) {
          variable.value = response?.lastName ? response?.lastName : "";
        }
        // If variable is in full names array
        if (fullNames.includes(variableName?.toLowerCase())) {
          variable.value = response?.nameString ? response?.nameString : "";
        }
      }
    });
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
  // Save template to chrome storage
  chrome.storage.sync.get(['templates'], function (result) {
    let templates = result.templates || [];
    templates[0] = template;
    chrome.storage.sync.set({ templates: templates }, function () {
      console.log('Value is set to ' + templates);
    });
  }
  );
});

const copyMessage = document.getElementById("copyMessage");
copyMessage.addEventListener("click", async () => {
  const messageInput = document.getElementById("linkedin-automation-message");
  // Get variables and replace them in message
  const variables = document.getElementById("variables-container").children;
  const variablesObject = {};
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    variablesObject[variableName] = variableValue;
  }
  // Replace variables in message
  let messageWithVariables = messageInput.value;
  for (const variable in variablesObject) {
    messageWithVariables = messageWithVariables.replace(`%${variable}%`, variablesObject[variable]);  
  }
  // Copy the messagewithvariables to clipboard
  navigator.clipboard.writeText(messageWithVariables);
});