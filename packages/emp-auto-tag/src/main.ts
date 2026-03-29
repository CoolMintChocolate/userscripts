import { GM_registerMenuCommand } from "$";

let TAGS = "";
GM_config.init({
  id: "EmpAutoTag",
  fields: {
    Tags: {
      label: "Tags",
      type: "text",
      default: "",
    },
  },
  events: {
    init: () => {
      TAGS = GM_config.get("Tags") as string;
      const searchBox = document.querySelector<HTMLInputElement>(
        "input#searchbox_tags",
      );
      if (searchBox) {
        searchBox.value = ` ${TAGS}`;
      }
    },
  },
});

GM_registerMenuCommand("Configure EMP Auto Tag", () => GM_config.open());

// The taglist on the right hand side is dynamically retrieved, so give it some time before changing the hrefs
setTimeout(() => {
  const currentTags = new URL(document.location.href).searchParams.get(
    "taglist",
  );
  const allTags = document.querySelectorAll<HTMLAnchorElement>(
    "div.tags a[href*='taglist'], div#torrent_tags a[href*='taglist']",
  );
  for (const tag of allTags) {
    const url = new URL(tag.href);
    url.searchParams.set(
      "taglist",
      `${url.searchParams.get("taglist")} ${TAGS}`,
    );
    tag.href = url.toString();

    if (currentTags) {
      const plusNode = document.createElement("a");
      url.searchParams.set("taglist", `${currentTags} ${tag.textContent}`);
      plusNode.href = url.toString();
      plusNode.textContent = "+";
      tag.after(plusNode);
    }
  }
}, 2000);
