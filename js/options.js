/* global browser */

const form = document.getElementById("channel-form");
const idField = document.getElementById("channel-id");
const nameField = document.getElementById("channel-name");
const urlField = document.getElementById("webhook-url");
const errorField = document.getElementById("form-error");
const list = document.getElementById("channel-list");
const emptyState = document.getElementById("empty-state");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const toast = document.getElementById("toast");
let channels = [];
let toastTimer;

function validWebhookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "discord.com" || url.hostname === "discordapp.com") &&
      /^\/api\/webhooks\/[^/]+\/[^/]+/.test(url.pathname);
  } catch (error) {
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
}

function resetForm() {
  form.reset();
  idField.value = "";
  saveButton.textContent = "Add channel";
  cancelButton.classList.add("hidden");
  errorField.textContent = "";
}

function render() {
  list.textContent = "";
  emptyState.hidden = channels.length > 0;
  channels.forEach((channel) => {
    const item = document.createElement("div");
    item.className = "channel";
    const details = document.createElement("div");
    const channelName = document.createElement("div");
    channelName.className = "channel-name";
    channelName.textContent = channel.name;
    const channelUrl = document.createElement("div");
    channelUrl.className = "channel-url";
    channelUrl.textContent = channel.url;
    details.append(channelName, channelUrl);
    const actions = document.createElement("div");
    actions.className = "channel-actions";
    const toggleLabel = document.createElement("label");
    toggleLabel.className = "toggle";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = channel.enabled;
    toggle.addEventListener("change", () => updateChannel(channel.id, { enabled: toggle.checked }));
    toggleLabel.append(toggle, document.createTextNode("Enabled"));
    const testButton = document.createElement("button");
    testButton.className = "secondary";
    testButton.textContent = "Test";
    testButton.addEventListener("click", () => testChannel(channel, testButton));
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editChannel(channel));
    const deleteButton = document.createElement("button");
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteChannel(channel));
    actions.append(toggleLabel, testButton, editButton, deleteButton);
    item.append(details, actions);
    list.append(item);
  });
}

function saveChannels() {
  return browser.storage.local.set({ channels });
}

function updateChannel(id, changes) {
  channels = channels.map((channel) => channel.id === id ? { ...channel, ...changes } : channel);
  return saveChannels().then(render);
}

function editChannel(channel) {
  idField.value = channel.id;
  nameField.value = channel.name;
  urlField.value = channel.url;
  saveButton.textContent = "Save changes";
  cancelButton.classList.remove("hidden");
  nameField.focus();
}

function deleteChannel(channel) {
  if (!window.confirm("Delete the webhook for " + channel.name + "?")) {
    return;
  }
  channels = channels.filter((item) => item.id !== channel.id);
  saveChannels().then(() => {
    render();
    showToast("Channel deleted");
  });
}

function testChannel(channel, button) {
  button.disabled = true;
  fetch(channel.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "A2B Media Sender test message" })
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Request failed");
    }
    showToast("Test message sent");
  }).catch(() => showToast("Test message failed"))
    .finally(() => { button.disabled = false; });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorField.textContent = "";
  const name = nameField.value.trim();
  const url = urlField.value.trim();
  if (!name) {
    errorField.textContent = "Enter a channel name.";
    return;
  }
  if (!validWebhookUrl(url)) {
    errorField.textContent = "Enter a valid Discord webhook URL.";
    return;
  }
  const existingId = idField.value;
  if (existingId) {
    channels = channels.map((channel) => channel.id === existingId ?
      { ...channel, name, url } : channel);
  } else {
    channels.push({ id: crypto.randomUUID(), name, url, enabled: true });
  }
  saveChannels().then(() => {
    render();
    resetForm();
    showToast(existingId ? "Channel updated" : "Channel added");
  });
});

cancelButton.addEventListener("click", resetForm);
browser.storage.local.get({ channels: [] }).then((data) => {
  channels = Array.isArray(data.channels) ? data.channels : [];
  render();
});
