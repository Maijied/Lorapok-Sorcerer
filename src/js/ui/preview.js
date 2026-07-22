/* global browser */
const media = document.getElementById("media");
const candidatesBox = document.getElementById("candidates");
const note = document.getElementById("note");
const channel = document.getElementById("channel");
const status = document.getElementById("status");
let request;
let selected;
function formatBytes(size) { if (!size) return "unknown size"; const units = ["B", "KB", "MB"]; let i = 0; while (size > 1024 && i < 2) { size /= 1024; i++; } return size.toFixed(i ? 1 : 0) + " " + units[i]; }
function show(candidate) {
  selected = candidate; media.textContent = ""; const image = document.createElement("img"); image.src = candidate.url; image.alt = "Resolved media"; media.append(image);
  const info = document.createElement("div"); info.className = "meta"; info.textContent = [candidate.type || "image", formatBytes(candidate.size), candidate.width && candidate.height ? candidate.width + "×" + candidate.height : ""].filter(Boolean).join(" · "); media.append(info);
  [...candidatesBox.children].forEach((item) => item.classList.toggle("active", item.dataset.url === candidate.url));
}
function init(data) {
  request = data; selected = data.selected; note.value = data.note || ""; show(selected);
  data.candidates.forEach((candidate, index) => { const button = document.createElement("button"); button.className = "candidate"; button.dataset.url = candidate.url; button.textContent = (index + 1) + " · " + (candidate.reason || "candidate"); button.onclick = () => show(candidate); candidatesBox.append(button); });
  browser.storage.local.get({ channels: [] }).then((channels) => channels.channels.filter((item) => item.enabled).forEach((item) => channel.add(new Option(item.name, item.id))));
}
const id = new URLSearchParams(location.search).get("id");
browser.storage.local.get("preview_" + id).then((data) => { if (data["preview_" + id]) init(data["preview_" + id]); });
document.getElementById("cancel").onclick = () => window.close();
document.getElementById("send").onclick = () => {
  if (!selected) return; status.textContent = "Sending…";
  browser.runtime.sendMessage({ type: "preview-send", channelId: channel.value || request.channelId, request: { ...request, selected, note: note.value } })
    .then(() => { status.textContent = "Sent successfully."; setTimeout(() => window.close(), 700); }).catch(() => { status.textContent = "Send failed."; });
};
