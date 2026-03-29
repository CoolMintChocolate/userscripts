import { GM, GM_registerMenuCommand } from "$";

GM_registerMenuCommand("Send to MeTube", makeAsyncRequest);
GM_registerMenuCommand("Configure MeTube", () => GM_config.open());

GM_config.init({
  id: "MeTubeQuickSend",
  fields: {
    Host: {
      label: "Host",
      type: "text",
      default: "",
    },
  },
});

let METUBE_URL = "";

function makeAsyncRequest() {
  METUBE_URL = GM_config.get("Host") as string;
  if (!METUBE_URL) {
    GM_config.open();
    throw new Error("Config not filled out");
  }
  return new Promise((resolve, reject) => {
    console.log(`Sending POST request to ${METUBE_URL}`);
    GM.xmlHttpRequest({
      method: "POST",
      url: `${METUBE_URL}/add`,
      data: JSON.stringify({ url: document.location.href, quality: "best" }),
      onload: (response) => {
        try {
          const result = JSON.parse(response.responseText);
          if (result.status === "ok") {
            GM.notification(`Entry sent to MeTube`);
            resolve(result);
          } else {
            reject(result);
          }
        } catch (err) {
          reject(err);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

// Create a floating upload button on the top right of the screen
function createFloatingUploadButton() {
  // Create the button element
  const button = document.createElement("button");
  button.id = "floating-upload-btn";
  button.setAttribute("aria-label", "Upload logo");

  // Add SVG upload icon
  const uploadIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  uploadIcon.setAttribute("width", "24");
  uploadIcon.setAttribute("height", "24");
  uploadIcon.setAttribute("viewBox", "0 0 24 24");
  uploadIcon.setAttribute("fill", "none");
  uploadIcon.setAttribute("stroke", "currentColor");
  uploadIcon.setAttribute("stroke-width", "2");

  uploadIcon.innerHTML = `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  `;

  button.appendChild(uploadIcon);

  // Style the button
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #0066cc;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0.5;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
  `;

  // Add hover effects
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#0052a3";
    button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#0066cc";
    button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  });

  // Add click handler
  button.addEventListener("click", makeAsyncRequest);

  // Append to body
  document.body.appendChild(button);
}

// Initialize button when DOM is ready
document.addEventListener("DOMContentLoaded", createFloatingUploadButton);
