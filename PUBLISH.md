# Publishing to Chrome Web Store

Simple step-by-step guide to publish your extension.

---

## Prerequisites

Before publishing, ensure:
- ✅ Extension works locally (tested in Chrome)
- ✅ Google OAuth is configured and working
- ✅ manifest.json has your Client ID
- ✅ All files are ready (no placeholder values)

---

## Step 1: Prepare Extension Package

### 1.1 Create a ZIP file

**What to include:**
```
✅ manifest.json
✅ src/ folder (all JS, HTML, CSS files)
✅ assets/ folder (icons)
✅ README.md
```

**What to exclude (see .gitignore):**
```
❌ .git/ folder
❌ node_modules/ (if any)
❌ .gitignore
❌ PUBLISH.md
❌ Any local test files
```

**Create ZIP:**
1. Select: `manifest.json`, `src/`, `assets/`, `README.md`
2. Right-click → Send to → Compressed (zipped) folder
3. Name it: `where-did-i-see-this-v1.0.0.zip`

---

## Step 2: Register as Chrome Web Store Developer

### 2.1 Go to Chrome Web Store Developer Dashboard
```
https://chrome.google.com/webstore/devconsole
```

### 2.2 Pay Developer Registration Fee
- **One-time fee:** $5 USD
- Required to publish extensions
- Payment via credit card

---

## Step 3: Upload Extension

### 3.1 Create New Item
1. Click **"New Item"** button
2. Click **"Choose file"** and select your ZIP file
3. Click **"Upload"**
4. Wait for upload to complete

### 3.2 Fill in Store Listing

**Required fields:**

**Product details:**
- **Extension name:** Where Did I See This?
- **Summary:** (400 chars max)
  ```
  Memory-based recall for webpages. Search your browsing history by keywords instead of scrolling through chronological lists. Find pages you visited using topics and domains. Optional Google Sheets backup.
  ```
- **Description:** (Copy from README.md or write detailed description)
- **Category:** Productivity
- **Language:** English

**Icon & Screenshots:**
- **Icon:** 128x128 PNG (use `assets/icons/icon128.png`)
- **Screenshots:** Required (1280x800 or 640x400 recommended)
  - Take screenshots of:
    1. Extension popup with search results
    2. Google Sheets sync feature
    3. Search functionality in action

**Promotional images (optional but recommended):**
- Small tile: 440x280
- Large tile: 920x680
- Marquee: 1400x560

**Privacy:**
- **Privacy policy URL:** (Required if using OAuth)
  - You can add to your GitHub README or create separate page
  - Example: `https://github.com/unaveenj/Where-Did-I-See-This#privacy--security`

**Single purpose description:**
```
This extension tracks browsing history locally and allows keyword-based search to help users recall previously visited webpages.
```

**Permission justifications:**
- **tabs:** To track page visits and URLs
- **storage:** To save browsing history locally
- **identity:** To enable Google OAuth for Google Sheets sync
- **host_permissions (http://*/* and https://*/* ):** To track all webpage visits

---

## Step 4: Configure OAuth (Important!)

### 4.1 Add Chrome Web Store Redirect URI

After your extension gets an ID from Chrome Web Store, update your Google Cloud OAuth:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth client
3. Add redirect URI:
   ```
   https://<CHROME_STORE_EXTENSION_ID>.chromiumapp.org/
   ```
   (You'll get this ID after first upload)

### 4.2 Update OAuth Consent Screen for Production

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"PUBLISH APP"**
3. Click **"Confirm"**
4. Status changes to: "In production"

**Note:** For personal use, you can keep it in "Testing" mode and just add your email as test user.

---

## Step 5: Submit for Review

### 5.1 Review Checklist
- ✅ All store listing fields filled
- ✅ Screenshots uploaded
- ✅ Privacy policy URL added
- ✅ Permissions justified
- ✅ Single purpose description clear

### 5.2 Submit
1. Click **"Submit for review"**
2. Review takes **1-3 business days** (usually faster)
3. You'll receive email notification

---

## Step 6: After Approval

### 6.1 Update Extension ID
Once published, Chrome assigns a permanent Extension ID.

**Update your OAuth client:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Update Item ID with the new Chrome Web Store Extension ID
4. Save

### 6.2 Publish Updates

For future updates:
1. Update version in `manifest.json` (e.g., 1.0.0 → 1.0.1)
2. Create new ZIP file
3. Go to Developer Dashboard → Your extension → **"Package"** tab
4. Click **"Upload new package"**
5. Submit for review

---

## Common Rejection Reasons

**1. Permissions not justified**
- Solution: Clearly explain why each permission is needed

**2. Privacy policy missing**
- Solution: Add privacy policy URL (can be GitHub README section)

**3. Single purpose unclear**
- Solution: Write clear, specific description of extension's purpose

**4. OAuth not configured**
- Solution: Ensure Google Cloud OAuth is set up correctly

**5. Screenshots missing/poor quality**
- Solution: Add clear, high-quality screenshots showing features

---

## Tips for Faster Approval

✅ Write clear, detailed description
✅ Upload high-quality screenshots
✅ Justify all permissions explicitly
✅ Add privacy policy
✅ Use clear, professional icon
✅ Test thoroughly before submitting
✅ Respond quickly to review feedback

---

## After Publishing

**Monitor:**
- User reviews and ratings
- Crash reports in Developer Dashboard
- OAuth consent screen approvals

**Marketing:**
- Share on social media
- Add to GitHub README
- Submit to extension directories

---

## Useful Links

- Chrome Web Store Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Developer Program Policies: https://developer.chrome.com/docs/webstore/program-policies
- Publish Guide: https://developer.chrome.com/docs/webstore/publish
- Google Cloud Console: https://console.cloud.google.com

---

Good luck with your publication! 🚀
