const releaseApi = "https://api.github.com/repos/Maijied/Lorapok-Sorcerer/releases/latest";
const releasesPage = "https://github.com/Maijied/Lorapok-Sorcerer/releases";
const browserNames = { 
  firefox: "Firefox", 
  chromium: "Chrome", 
  edge: "Edge", 
  opera: "Opera", 
  brave: "Brave" 
};
const assets = { 
  firefox: /firefox.*\.zip$/i, 
  chromium: /chromium.*\.zip$/i,
  edge: /edge.*\.zip$/i,
  opera: /opera.*\.zip$/i,
  brave: /brave.*\.zip$/i
};

const installationSteps = {
  firefox: [
    "Download the Firefox extension archive (.zip file)",
    "Open Firefox and navigate to about:addons (Extensions & Themes)",
    "Click the gear icon and select 'Install Add-on From File...'",
    "Select the downloaded .zip file and confirm installation",
    "Pin the extension to your toolbar for easy access"
  ],
  chromium: [
    "Download the Chrome extension archive (.zip file)",
    "Open Chrome and navigate to chrome://extensions/",
    "Enable 'Developer mode' using the toggle in the top right",
    "Click 'Load unpacked' and select the extracted folder",
    "Alternatively, drag and drop the .zip file into the extensions page"
  ],
  edge: [
    "Download the Edge extension archive (.zip file)",
    "Open Edge and navigate to edge://extensions/",
    "Enable 'Developer mode' using the toggle in the top left",
    "Click 'Load unpacked' and select the extracted folder",
    "Pin the extension to your toolbar for easy access"
  ],
  opera: [
    "Download the Opera extension archive (.zip file)",
    "Open Opera and navigate to opera://extensions/",
    "Enable 'Developer mode' using the toggle in the top right",
    "Click 'Load unpacked' and select the extracted folder",
    "Pin the extension to your toolbar for easy access"
  ],
  brave: [
    "Download the Brave extension archive (.zip file)",
    "Open Brave and navigate to brave://extensions/",
    "Enable 'Developer mode' using the toggle in the top right",
    "Click 'Load unpacked' and select the extracted folder",
    "Pin the extension to your toolbar for easy access"
  ]
};

function releaseUrl(target, release) {
  const asset = release?.assets?.find((item) => assets[target].test(item.name));
  return asset?.browser_download_url || releasesPage;
}

async function loadRelease() {
  try {
    const response = await fetch(releaseApi, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error("No release");
    return await response.json();
  } catch (error) { 
    console.log("Release API unavailable, using fallback");
    return null; 
  }
}

function showModal(browser) {
  const modal = document.getElementById("downloadModal");
  const title = document.getElementById("modalTitle");
  const steps = document.getElementById("modalSteps");
  const downloadLink = document.getElementById("modalDownloadLink");
  
  title.textContent = `Install for ${browserNames[browser]}`;
  steps.innerHTML = installationSteps[browser].map(step => `<li>${step}</li>`).join("");
  
  loadRelease().then((release) => {
    const url = releaseUrl(browser, release);
    downloadLink.href = url;
    downloadLink.textContent = `Download for ${browserNames[browser]}`;
    downloadLink.onclick = (e) => {
      e.preventDefault();
      // Direct download
      window.open(url, '_blank');
      hideModal();
    };
  }).catch(() => {
    // Fallback to releases page if API fails
    downloadLink.href = releasesPage;
    downloadLink.textContent = `Go to Releases Page`;
    downloadLink.onclick = (e) => {
      e.preventDefault();
      window.open(releasesPage, '_blank');
      hideModal();
    };
  });
  
  modal.classList.add("active");
}

function hideModal() {
  const modal = document.getElementById("downloadModal");
  modal.classList.remove("active");
}

document.querySelector("#year")?.replaceChildren(String(new Date().getFullYear()));

document.querySelectorAll(".browser-tabs button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".browser-tabs button").forEach((item) => item.classList.toggle("active", item === button));
  const target = button.dataset.browser;
  document.querySelector("#browser-name").textContent = browserNames[target] || button.textContent;
  const link = document.querySelector(".download-link");
  link.dataset.target = target; 
  link.textContent = `Download ${button.textContent} build ↓`;
}));

document.querySelectorAll(".download-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.target || "firefox";
    showModal(target);
  });
});

document.getElementById("closeModal").addEventListener("click", hideModal);
document.getElementById("downloadModal").addEventListener("click", (e) => {
  if (e.target.id === "downloadModal") {
    hideModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideModal();
  }
});

loadRelease().then((release) => {
  const tag = release?.tag_name || release?.name;
  if (tag) document.querySelectorAll("[data-version]").forEach((node) => { 
    node.textContent = tag.startsWith("v") ? tag : "v" + tag; 
  });
});

fetch("version.json").then((response) => response.json()).then((data) => {
  document.querySelectorAll("[data-version]").forEach((node) => { 
    if (node.textContent === "v2.0.0" && data.version) node.textContent = "v" + data.version; 
  });
}).catch(() => {});
