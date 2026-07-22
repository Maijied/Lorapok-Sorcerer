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
