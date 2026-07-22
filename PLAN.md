# Lorapok Sorcerer — Plan (Lorapok Labs product)

Firefox addon: right-click any image/GIF → "Send to A2B" → intelligently resolves the **original/full-resolution** image (any extension: png/jpg/jpeg/webp/gif/avif/svg/bmp…) → shows a **preview window** where you can attach a note (text/links, formatted) → downloads and posts to a Discord channel webhook. Also supports sending plain text or URLs without an image.

## 1. Original-Image Resolution (core new feature)
When the user right-clicks an image, the addon must find the best/original source, not just the rendered `srcUrl`:

1. **Content script inspection** (injected on demand into the clicked frame):
   - Locate the clicked `<img>` element (via `info.targetElementId` / `browser.menus.getTargetElement`).
   - Candidate sources, scored by resolution:
     - `srcset` / `<picture><source srcset>` → pick largest width/density descriptor
     - Wrapping `<a href>` pointing to an image file (common "click for full size" pattern)
     - Common lazy-load attrs: `data-src`, `data-original`, `data-full`, `data-zoom-image`, `data-large_image`
     - `og:image` meta as fallback when the page is an image detail page
     - Site-specific URL cleanup: strip resize params/suffixes (e.g. `?w=`, `&width=`, `=s0`/`=w` (Google), `_640`→ orig (Twimg: `?name=orig`, `format=`), Wikipedia `/thumb/` → original path, Pinterest `236x/474x` → `originals`)
   - `srcUrl` itself is always the final fallback.
2. **Background verification**: HEAD/GET each candidate in score order; first one that returns an image content-type and loads wins. Compare byte size — keep the largest under Discord's limit.
3. Send with correct filename + extension preserved (GIF stays animated).
4. Discord upload: multipart `files[0]` + `payload_json` (embed with note + source page URL); fallback to posting the direct URL if download/upload fails or file > 10 MB (Discord's webhook limit).

## 1b. Preview & Note (before send)
- After choosing a channel (or "Send to A2B → Preview…"), a branded preview window opens showing:
  - the resolved original image (with dimensions/size/format) and other candidates to pick from
  - a **note field**: text and links, delivered as a formatted Discord embed (note as description, source page as field, image attached) — links stay clickable in Discord
  - channel selector + Send / Cancel
- Quick-send (skip preview) available as a per-setting toggle.

## 1c. Text/URL-only sending
- Toolbar popup: compose text or URL and send to any enabled channel without an image.
- Context menu on selected text / links: "Send to A2B" → sends selection or link URL (with optional preview).

## 2. Settings / UI — Lorapok Labs design system
Restyle options page (and add a browser-action popup) using the Brand Bible tokens:
- Dark "Biological UI": `--bg-void #050505`, surfaces `#111/#1a1a1a`, glassmorphism cards (rgba white 3%, blur 12px)
- Accents: Neon Green `#00ff88`, Neon Cyan `#00e5ff`, Hex Blue `#1a237e`; status colors (`#ffab00` beta, `#ff3d71` error)
- Typography: Inter (display/body), JetBrains Mono (code/webhook URLs)
- Neon buttons, subtle pulse/breathing idle animations, 4/8/12px radii, neon glow shadows
- Branding: "Lorapok Sorcerer — a Lorapok Labs product"; professional logo: hexagonal neon-green sorcerer/wand mark on void black, generated as SVG → exported PNG icon set (16–128px)
- Features kept: add/edit/delete webhooks, per-channel enable/disable (controls right-click submenu), Test button, notifications
- New: toolbar popup showing channel list + recent sends log

## 3. Project Structure & Tooling
Industry-level layout: modular source (resolver / discord client / storage / ui separated), unit-tested pure logic, CI, versioned releases.

```
lorapok-sorcerer/
├─ src/                     # extension source (MV2, plain JS)
│  ├─ manifest.json
│  ├─ js/ (background, content-resolver, options, popup)
│  ├─ options.html, popup.html, css/, icons/
├─ scripts/
│  ├─ build.sh              # local build: lint + zip via web-ext
│  └─ test.sh               # local test: lint + unit tests
├─ tests/                   # unit tests (Node built-in test runner) for
│  │                        #   URL-cleanup rules, srcset parsing, filename logic
├─ .github/workflows/ci.yml
├─ package.json             # web-ext devDependency
└─ README.md, PLAN.md
```

## 4. CI/CD (GitHub Actions)
- **CI (push/PR):** install deps → `web-ext lint` → `node --test` unit tests → `web-ext build` → upload `.zip` artifact
- **Release (tag `v*`):** build → create GitHub Release with the zip attached
  - Optional later: auto-sign/publish to addons.mozilla.org via `web-ext sign` (needs AMO API keys as repo secrets)

## 5. Local scripts
- `./scripts/build.sh` → lint + produce `dist/a2b-media-sender-<version>.zip`
- `./scripts/test.sh` → lint + unit tests (srcset picker, URL de-thumbnailing, webhook validation)

## 6. Deliverables
1. Restructured repo with the above layout
2. Original-image resolver (content script + heuristics + tests)
3. Lorapok-branded options page + popup
4. CI workflow + release workflow
5. Build/test scripts + updated README
