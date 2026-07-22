/* global browser */
const compose = document.getElementById("compose");
const channel = document.getElementById("channel");
const status = document.getElementById("status");
browser.storage.local.get({ channels: [] }).then((data) => {
  data.channels.filter((item) => item.enabled).forEach((item) => { const option = new Option(item.name, item.id); channel.add(option); });
});
document.getElementById("settings").onclick = () => browser.runtime.openOptionsPage();
document.getElementById("send").onclick = () => {
  const text = compose.value.trim(); if (!text || !channel.value) { status.textContent = "Add text and select a channel."; return; }
  status.textContent = "Sending…"; browser.runtime.sendMessage({ type: "popup-send", text, channelId: channel.value })
    .then(() => { status.classList.remove("error"); status.textContent = "Signal sent."; compose.value = ""; }).catch(() => { status.classList.add("error"); status.textContent = "Send failed."; });
};
