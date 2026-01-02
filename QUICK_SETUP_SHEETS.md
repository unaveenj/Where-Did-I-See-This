# Google Sheets Setup - Quick Steps

**Follow in this exact order!**

---

## ⚡ Step-by-Step (10 minutes total)

### 1️⃣ Get Extension ID (1 min)
```
1. Load extension in Chrome (with placeholder Client ID)
2. chrome://extensions/ → Enable Developer mode
3. Load unpacked → Select folder
4. COPY the Extension ID (long string under extension name)
5. Save it somewhere!
```

### 2️⃣ Create Google Cloud Project (2 min)
```
1. Go to: https://console.cloud.google.com
2. New Project → Name: "Where Did I See This"
3. Wait for creation
```

### 3️⃣ Enable APIs (2 min)
```
1. Menu → APIs & Services → Library
2. Search "Google Sheets API" → Enable
3. Search "Google Drive API" → Enable
```

### 4️⃣ Configure OAuth Consent (2 min)
```
1. OAuth consent screen → External → Create
2. App name: "Where Did I See This"
3. Add your email
4. Test users: Add your email
5. Save & Continue through all screens
```

### 5️⃣ Create OAuth Client (2 min)
```
1. Credentials → Create Credentials → OAuth client ID
2. Application type: Chrome extension
3. Name: "Where Did I See This Extension"
4. Item ID: PASTE YOUR EXTENSION ID (from step 1)
5. Create
6. COPY the Client ID
```

### 6️⃣ Update manifest.json (1 min)
```
1. Open manifest.json
2. Line 14: Replace "YOUR_CLIENT_ID" with your actual Client ID
3. Save file
4. chrome://extensions/ → Reload extension
```

### 7️⃣ Test! (1 min)
```
1. Click extension icon
2. Click "🔐 Sign In"
3. Allow Google permissions
4. Visit some websites
5. Click "🔄 Sync"
6. Click "Yes" to open Google Sheet
7. See your data! ✓
```

---

## 🎯 Key Points

**Extension ID First!**
- You NEED the Extension ID BEFORE creating OAuth client
- Load extension with placeholder Client ID first
- Get ID, then create OAuth client

**Test Users**
- Don't forget to add your email as a test user
- Otherwise sign-in will fail

**Exact Match**
- Item ID in OAuth client MUST match Extension ID exactly
- Copy-paste, don't type manually

---

## ✅ Success Checklist

- [ ] Extension loaded in Chrome
- [ ] Extension ID copied
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] Email added as test user
- [ ] OAuth client created with Extension ID
- [ ] Client ID copied
- [ ] manifest.json updated with Client ID
- [ ] Extension reloaded
- [ ] Sign in works
- [ ] Sync creates Google Sheet

---

## 🐛 Common Issues

**"Item ID is required"**
- You need Extension ID first
- Load extension → get ID → then create OAuth client

**"Sign in failed"**
- Check you added your email as test user
- Check Client ID in manifest.json matches exactly

**"Failed to create sheet"**
- Check Google Drive API is enabled
- Check you allowed all permissions

---

**Follow these exact steps and it will work!** 🎉
