const releaseApi = "https://api.github.com/repos/Maijied/Lorapok-Sorcerer/releases/latest";
const releasesPage = "https://github.com/Maijied/Lorapok-Sorcerer/releases";
const browserNames = { firefox: "Firefox", chromium: "Chrome" };
const assets = { firefox: /firefox.*\.zip$/i, chromium: /chromium.*\.zip$/i };
function releaseUrl(target, release) {
  const asset = release?.assets?.find((item) => assets[target].test(item.name));
  return asset?.browser_download_url || releasesPage;
}
async function loadRelease() {
  try {
    const response = await fetch(releaseApi, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("No release");
    return await response.json();
  } catch (error) { return null; }
}
document.querySelector("#year")?.replaceChildren(String(new Date().getFullYear()));
document.querySelectorAll(".browser-tabs button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".browser-tabs button").forEach((item) => item.classList.toggle("active", item === button));
  const target = button.dataset.browser;
  document.querySelector("#browser-name").textContent = browserNames[target] || button.textContent;
  const link = document.querySelector(".download-link");
  link.dataset.target = target; link.textContent = `Download ${button.textContent} build ↓`;
}));
loadRelease().then((release) => {
  document.querySelectorAll(".download-link").forEach((link) => {
    link.href = releaseUrl(link.dataset.target || "firefox", release);
  });
  const tag = release?.tag_name || release?.name;
  if (tag) document.querySelectorAll("[data-version]").forEach((node) => { node.textContent = tag.startsWith("v") ? tag : "v" + tag; });
});
fetch("version.json").then((response) => response.json()).then((data) => {
  document.querySelectorAll("[data-version]").forEach((node) => { if (node.textContent === "v2.0.0" && data.version) node.textContent = "v" + data.version; });
}).catch(() => {});
