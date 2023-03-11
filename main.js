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

// Template Divs
const templateMessage = document.getElementById("linkedin-automation-message");
const templateVariables = document.getElementById("variables-container");
// Buttons
const addTemplateVariablesButton = document.getElementById("addVariables");
const sendTemplateButton = document.getElementById("addMessage");
const saveTemplateButton = document.getElementById("save-template");
const copyTemplateButton = document.getElementById("copyMessage");

//Connection Divs
const connectionMessage = document.getElementById("linkedin-automation-connection");
const connectionVariables = document.getElementById("connection-variables-container");
// Buttons
const addConnectionVariablesButton = document.getElementById("addConnectionVariables");
const sendConnectionButton = document.getElementById("addConnectionRequest");
const saveConnectionTemplateButton = document.getElementById("save-connection-template");
const copyConnectionButton = document.getElementById("copyConnectionRequest");


document.addEventListener("DOMContentLoaded", async (tab) => {
  const activeTab = await getActiveTabURL();
  if (!activeTab.url.includes("www.linkedin.com/in/")) {                                 //check if url is linkedin search
    const container = document.getElementsByClassName('container')[0];
    container.innerHTML = '<div class="title text-white">This is not a Linkedin Profile Page</div>'
  } else {
    chrome.storage.sync.get(['templates'], async (result) => {
      const templates = result.templates || [];
      if(templates.length === 0) {
        return;
      }
      
      templateMessage.value = templates[0].message;
      const variables = templates[0].variables;
      templateVariables.innerHTML = "";
      for (const variable in variables) {
        const variableInput = document.createElement("input");
        variableInput.setAttribute("type", "text");
        variableInput.setAttribute("placeholder", variable);
        variableInput.setAttribute("id", variable);
        variableInput.setAttribute("value", variables[variable]);
        templateVariables.appendChild(variableInput);
      }
      
      await addProfileData("template");
      await addVariablesFeature("template");
    });

    chrome.storage.sync.get(['connections'], async (result) => {
      const connections = result.connections || [];
      if(connections.length === 0) {
        return;
      }
      
      connectionMessage.value = connections[0].message;
      const variables = connections[0].variables;
      connectionVariables.innerHTML = "";
      for (const variable in variables) {
        const variableInput = document.createElement("input");
        variableInput.setAttribute("type", "text");
        variableInput.setAttribute("placeholder", variable);
        variableInput.setAttribute("id", variable);
        variableInput.setAttribute("value", variables[variable]);
        connectionVariables.appendChild(variableInput);
      }
      
      await addProfileData("connection");
      await addVariablesFeature("connection");
    })
  }
});

const addProfileData = async (type) => {
  const activeTab = await getActiveTabURL();
  let variables = [];
  if(type === "template") {
    variables = templateVariables.children;
  } else if(type === "connection") {
    variables = connectionVariables.children;
  }
  chrome.tabs.sendMessage(activeTab.id, { message: "getProfileData" }, (response) => {
    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      const variableName = variable.id;
      // If variable is in first names array
      if (prefillFirstNames.includes(variableName.toLowerCase())) {
        variable.value = response.firstName ? response.firstName : "";
      }
      // If variable is in last names array
      else if (prefillLastNames.includes(variableName.toLowerCase())) {
        variable.value = response.lastName ? response.lastName : "";
      }
      // If variable is in full names array
      else if (fullNames.includes(variableName.toLowerCase())) {
        variable.value = response.nameString ? response.nameString : "";
      }
    }
  });
}

const sendMessageFeature = async (type) => {
  const activeTab = await getActiveTabURL();
  let message = "";
  let variables = [];
  if(type === "template") {
    message = templateMessage.value;
    variables = templateVariables.children;         //send message to content.js
  } else if(type === "connection") {
    message = connectionMessage.value;
    variables = connectionVariables.children;
  }
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
    if(messageWithVariables !== "") {
      window.close();
      chrome.tabs.sendMessage(activeTab.id, { 
        message: type === "template" ? "addMessage" : "sendConnectionRequest",
        value: messageWithVariables 
      });        
    }  
}

const addVariablesFeature = async (type) => {
  let message = "";
  let variables = [];
  let variablesContainer = {};
  let existingVariables = {};
  let existingVariablesObject = {};
  if(type === "template") {
    message = templateMessage.value;
    existingVariables = templateVariables.children;
    variablesContainer = templateVariables;
  } else if(type === "connection") {
    message = connectionMessage.value;
    existingVariables = connectionVariables.children;
    variablesContainer = connectionVariables;
  }
  for (let i = 0; i < existingVariables.length; i++) {
    const variable = existingVariables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    existingVariablesObject[variableName] = variableValue;
  }

  // Variables are enclosed in % and %
  variables = message.match(/%.*?%/g);
  if (variables) {
    variablesContainer.innerHTML = "";
    variables.forEach((variable) => {
      const variableName = variable.replace(/%/g, "");
      const variableInput = document.createElement("input");
      variableInput.setAttribute("type", "text");
      variableInput.setAttribute("placeholder", variableName);
      variableInput.setAttribute("id", variableName);
      variableInput.setAttribute("value", existingVariablesObject[variableName] || "");
      variablesContainer.appendChild(variableInput);
    });
    addProfileData(type);
  } else {
    variablesContainer.innerHTML = "";
  }
}

const saveTemplateFeature = async (type) => {
  let message = "";
  let variables = [];
  if(type === "template") {
    message = templateMessage.value;
    variables = templateVariables.children;
  } else if(type === "connection") {
    message = connectionMessage.value;
    variables = connectionVariables.children;
  }
  const variablesObject = {};
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    const variableName = variable.id;
    const variableValue = variable.value;
    variablesObject[variableName] = variableValue;
  }
  const template = {
    message: message,
    variables: variablesObject
  };
  // Store the template and connection in chrome storage depending on the type
  if(type === "template") {
    chrome.storage.sync.get(["templates"], (result) => {
      const templates = result.templates ? result.templates : [];
      templates[0] = template;
      chrome.storage.sync.set({ templates: templates }, () => {
        console.log("Template saved");
      });
    });
  }
  else if(type === "connection") {
    chrome.storage.sync.get(["connections"], (result) => {
      const connections = result.connections ? result.connections : [];
      connections[0] = template;
      chrome.storage.sync.set({ connections: connections }, () => {
        console.log("Connection saved");
      });
    });
  }
}

const copyToClipboardFeature = async (type) => {
  let message = "";
  let variables = [];
  let variablesObject = {};
  if(type === "template") {
    message = templateMessage.value;
    variables = templateVariables.children;
  }
  else if(type === "connection") {
    message = connectionMessage.value;
    variables = connectionVariables.children;
  }
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
  // Copy to clipboard
  navigator.clipboard.writeText(messageWithVariables);
}

sendTemplateButton.addEventListener("click", async () => {
  await sendMessageFeature("template");
});

addTemplateVariablesButton.addEventListener("click", async () => {
  await addVariablesFeature("template");
});

saveTemplateButton.addEventListener("click", async () => {
  await saveTemplateFeature("template");
});

copyTemplateButton.addEventListener("click", async () => {
  await copyToClipboardFeature("template");
});

addConnectionVariablesButton.addEventListener("click", async () => {
  await addVariablesFeature("connection");
});

sendConnectionButton.addEventListener("click", async () => {
  await sendMessageFeature("connection");
});

saveConnectionTemplateButton.addEventListener("click", async () => {
  await saveTemplateFeature("connection");
});

copyConnectionButton.addEventListener("click", async () => {
  await copyToClipboardFeature("connection");
});