# Mobile Build Instructions

To build this app for Android using Android Studio:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate App Icons (Required for Store):
   ```bash
   npx capacitor-assets generate --android
   ```

3. Build the web assets:
   ```bash
   npm run build
   ```

4. Initialize the Android platform:
   ```bash
   npx cap add android
   ```

5. Sync the configuration:
   ```bash
   npx cap sync
   ```

6. Open in Android Studio:
   ```bash
   npx cap open android
   ```

## 🛑 Is it ready yet?
**No.** Running the commands above only prepares the code. To publish, you must perform two major phases:
1.  **Generate the Signed App Bundle** (Inside Android Studio).
2.  **Upload to Google Play Console** (On the web).

---

## Phase 1: Generate Signed Bundle (In Android Studio)

1.  **Open Build Menu:**
    In Android Studio, click **Build** > **Generate Signed Bundle / APK**.

2.  **Select Format (Crucial):**
    Select **Android App Bundle** (not APK) and click Next.

3.  **Key Store Setup:**
    You will be asked for a "Key store path".
    - **First time?** Click **Create new...**
    
    **If creating new:**
    1.  **Key store path:** Click the folder icon 📁. Choose a safe location (e.g., Documents) and name it `upload-key.jks`. **Do not lose this file.**
    2.  **Password:** Set a strong password. You need this for every future update.
    3.  **Key Alias:** Leave as `key0`.
    4.  **Certificate:** Enter your "First and Last Name".
    5.  Click OK.

4.  **Build Release:**
    - Select your key alias (`key0`) and enter passwords.
    - Click Next.
    - Select **release**.
    - Click **Create** (or Finish).

5.  **Locate the File:**
    - Wait for the build to finish.
    - A popup will appear: *"Signed bundle 'app-release.aab' generated successfully"*.
    - Click **locate** in that popup.
    - **This `.aab` file is your final app.**

---

## Phase 2: Publish (In Web Browser)

You cannot publish from the command line. You must use the website.

1.  **Register:** Go to [Google Play Console](https://play.google.com/console) and pay the $25 registration fee.
2.  **Create App:** Click **Create App** and fill in the name (Shiko Progresin) and language.
3.  **Setup:** The dashboard will show a checklist:
    - **Privacy Policy:** You need a URL (you can use a free generator or Google Sites).
    - **App Content:** Answer questions about ads (No), news (No), and target audience (18+).
    - **Store Listing:** Upload your **App Icon** (512x512) and **Feature Graphic** (1024x500), plus screenshots of the app.
4.  **Upload Bundle:**
    - Go to **Production** in the left sidebar.
    - Click **Create new release**.
    - Drag and drop your `.aab` file here.
5.  **Review:** Click **Next** -> **Save** -> **Send for Review**.

Google usually takes 2-5 days to review your app.

## Troubleshooting

### Error: "npm.ps1 cannot be loaded"
1. Copy this command: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
2. Paste into terminal and press Enter.
3. Type `A` and Enter.

### App ID Conflict
If Google says `com.shikoprogresin.app` is already taken, you must change `appId` in `capacitor.config.ts`, run `npx cap sync`, and rebuild.
