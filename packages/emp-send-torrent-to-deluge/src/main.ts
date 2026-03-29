import { GM, GM_registerMenuCommand } from "$";

GM_config.init({
  id: "EmpDeluge",
  fields: {
    Host: {
      label: "Host",
      type: "text",
      default: "",
    },
    Password: {
      label: "Password",
      type: "text",
      default: "",
    },
    Label: {
      label: "Label",
      type: "text",
      default: "2d",
    },
  },
});

GM_registerMenuCommand("Configure Deluge", () => GM_config.open());

let DELUGE_URL = "";
let DELUGE_PASSWORD = "";

function makeAsyncRequest(
  method: string,
  params: Array<any>,
): Promise<{ result: any }> {
  DELUGE_URL = GM_config.get("Host") as string;
  DELUGE_PASSWORD = GM_config.get("Password") as string;
  if (!DELUGE_URL || !DELUGE_PASSWORD) {
    GM_config.open();
    throw new Error("Config not filled out");
  }
  return new Promise((resolve, reject) => {
    console.log(`Sending ${method} request to ${DELUGE_URL}`);
    GM.xmlHttpRequest({
      method: "POST",
      url: `${DELUGE_URL}/json`,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        method,
        params,
        id: idCount++,
      }),
      onload: (response) => {
        try {
          const result = JSON.parse(response.responseText);
          if (result.error) {
            reject(result);
          } else {
            resolve(result);
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

let idCount = 0;
async function sendRequest(method: string, params: Array<any>) {
  try {
    const result = await makeAsyncRequest(method, params);
    console.log(result);
    return result;
  } catch (err) {
    console.warn(err);
    throw err;
  }
}
function main() {
  for (const link of document.links) {
    if (
      link.href?.indexOf("action=download") === -1 ||
      link.href.indexOf("usetoken") !== -1
    ) {
      continue;
    }
    // if (!link.parentNode) {
    //   continue;
    // }
    const spanNode = document.createElement("SPAN");
    spanNode.classList.add("icon");

    const divNode = document.createElement("DIV");
    divNode.classList.add("icon_container");

    const stackDivNode = document.createElement("DIV");
    stackDivNode.classList.add("icon_stack");

    const iconNode = document.createElement("i");
    iconNode.classList.add("font_icon");
    iconNode.classList.add("torrent_icons");
    iconNode.classList.add("clickable");
    iconNode.classList.add("bookmark");
    iconNode.classList.add("icon_nav_seeding");
    iconNode.onclick = async (e) => {
      const label = GM_config.get("Label") as string;
      try {
        await sendRequest("auth.login", [GM_config.get("Password") as string]);
        console.log("Downloading file to temp directory");
        const tempFile: { result: string } = await sendRequest(
          "web.download_torrent_from_url",
          [link.href],
        );
        console.log(`Adding temp file at path ${tempFile.result} to Deluge`);
        const response = await sendRequest("web.add_torrents", [
          [{ path: tempFile.result, options: {} }],
        ]);
        const torrentId = response.result[0][1];
        console.log(`Torrent added to Deluge with id ${torrentId}`);
        if (label) {
          await sendRequest("label.set_torrent", [torrentId, label]);
        }
        iconNode.classList.remove("bookmark");
        iconNode.classList.add("seeding");
        GM.notification(
          `EMP entry sent to Deluge with id ${torrentId.substring(0, 5)} with label ${label}`,
        );
        e.preventDefault();
      } catch (err) {
        console.log(JSON.stringify(err));
      }
    };

    stackDivNode.appendChild(iconNode);
    divNode.appendChild(stackDivNode);
    spanNode.appendChild(divNode);

    link.parentElement?.after(spanNode);
  }
}

main();
