# Publishing

## Firefox Add-ons (AMO)

1. Validate with `./scripts/build.sh firefox`.
2. Create an AMO developer account and submit the Firefox ZIP.
3. Complete Mozilla's data-use questionnaire and privacy disclosures.
4. For local signing, install `web-ext` and run:

   ```sh
   web-ext sign --source-dir .build/firefox --api-key "$AMO_JWT_ISSUER" \
     --api-secret "$AMO_JWT_SECRET"
   ```

5. Upload the signed artifact or let AMO host the signed release.

## Chrome Web Store

Upload `dist/lorapok-sorcerer-chromium-2.0.0.zip` in the Developer Dashboard,
complete the privacy practices and permissions forms, add screenshots, and
submit it for review. A one-time developer registration fee may apply.

## Microsoft Edge Add-ons

Create a Partner Center developer account, upload the Chromium ZIP, complete
the content/privacy declarations, and submit for certification.

## Opera Add-ons

Create an Opera developer account, upload the Chromium ZIP, provide listing
metadata and screenshots, and submit for review.

Keep release tags aligned with the manifest version (`v2.0.0`, for example).

## Automated tagged releases

The release workflow is the canonical path for public artifacts:

1. Run `npm ci`, `bash scripts/check-version.sh`, and
   `bash scripts/test.sh` locally.
2. Create a release commit with the synchronized version:

   ```sh
   ./scripts/version.sh patch
   git add package.json package-lock.json manifests src/manifest.json site/version.json
   git commit -m "Release v2.0.1"
   git tag v2.0.1
   git push origin main --tags
   ```

3. The `v*` workflow verifies that the tag exactly matches
   `package.json`, builds Firefox and Chromium archives, renames them to
   `lorapok-sorcerer-<target>-v<version>.zip`, and attaches both to the
   GitHub Release.
4. Re-running the same tag overwrites matching assets. Tags containing a
   prerelease suffix such as `v2.1.0-beta.1` are marked as prereleases.
   GitHub generates notes from commits since the previous tag.

## GitHub Pages

In repository settings, open **Pages**, choose **GitHub Actions** as the
source, and save. The `pages.yml` workflow deploys `site/` on pushes that
touch the website and can also be started manually from the Actions tab.
