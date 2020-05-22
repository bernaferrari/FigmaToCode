"use strict";
const create = document.getElementById("create");
if (create) {
    create.onclick = () => {
        const textbox = document.getElementById("count");
        const count = parseInt(textbox.value, 10);
        parent.postMessage({ pluginMessage: { type: "create-rectangles", count } }, "*");
    };
}
const cancel = document.getElementById("cancel");
if (cancel) {
    cancel.onclick = () => {
        parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
    };
}
