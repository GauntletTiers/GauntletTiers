
# Create a comprehensive SETUP.md guide for Firebase setup
setup_md = '''# Firebase Setup Guide for Gauntlet Tiers

This guide will help you set up Firebase Realtime Database so your tier list data syncs across all devices in real-time.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `gauntlet-tiers` (or any name you prefer)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. In the Firebase Console, click "Build" in the left sidebar
2. Click "Realtime Database"
3. Click "Create Database"
4. Choose location (default is fine)
5. **IMPORTANT**: Start in "test mode" for now (we'll secure it later)
6. Click "Enable"

## Step 3: Get Your Firebase Config

1. Click the gear icon (⚙️) next to "Project Overview" and select "Project settings"
2. In the "General" tab, scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Register app with nickname: "Gauntlet Tiers Web"
5. Click "Register"
6. Copy the `firebaseConfig` object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Update Your Website Files

You need to update the Firebase config in these files:
- `index.html`
- `tierlist.html`
- `admin.html`

Replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. with your actual values from Step 3.

**Example - Find this in each HTML file:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Replace with your actual config:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "gauntlet-tiers.firebaseapp.com",
    databaseURL: "https://gauntlet-tiers-default-rtdb.firebaseio.com",
    projectId: "gauntlet-tiers",
    storageBucket: "gauntlet-tiers.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
```

## Step 5: Set Database Rules

For the tier list to work publicly (anyone can view, only admin can edit):

1. In Firebase Console, go to Realtime Database
2. Click "Rules" tab
3. Replace the rules with:

```json
{
  "rules": {
    "tiers": {
      ".read": true,
      ".write": "auth != null && auth.token.email === 'support.gauntlettiers@gmail.com'"
    }
  }
}
```

**For testing (less secure, allows anyone to edit):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Click "Publish"

## Step 6: Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all the website files
3. Go to Settings > Pages
4. Select "Deploy from a branch" → "main" → "/ (root)"
5. Wait 2-3 minutes for deployment
6. Your site is live at `https://yourusername.github.io/repository-name/`

## Step 7: Test It Works

1. Open your deployed website on your phone
2. Open the same website on your computer
3. As admin, add a player to any tier
4. **Magic**: The player appears on both devices instantly!

## How It Works

- **Firebase Realtime Database** stores all tier list data in the cloud
- When you add/edit/delete a player, it updates the database
- All connected devices receive the update instantly
- Data persists even if users clear their browser cache

## Security Note

The rules above allow:
- **Anyone** to view the tier list (`.read: true`)
- **Only admin** (support.gauntlettiers@gmail.com) to edit

For production, you should:
1. Set up Firebase Authentication properly
2. Use more secure rules
3. Validate data structure

## Troubleshooting

**"Permission denied" error:**
- Check your database rules allow writes
- For testing, use `.write: true`

**Data not syncing:**
- Check your `databaseURL` in the config
- Make sure it ends with `firebaseio.com`

**"Firebase not initialized" error:**
- Check that `firebase-app.js` is loading
- Check browser console for errors

## Free Tier Limits

Firebase Spark Plan (free) includes:
- 100 simultaneous connections
- 1 GB stored data
- 10 GB/month downloaded data

This is plenty for a tier list website!

## Need Help?

- Firebase docs: https://firebase.google.com/docs/database
- Check browser console (F12) for error messages
- Verify your config values match exactly
'''

with open('/mnt/kimi/output/gauntlet-tiers/FIREBASE_SETUP.md', 'w') as f:
    f.write(setup_md)

print("FIREBASE_SETUP.md created with detailed instructions")

# Also update the main README
with open('/mnt/kimi/output/gauntlet-tiers/README.md', 'r') as f:
    readme = f.read()

readme += '''

## Firebase Setup (REQUIRED for cross-device sync)

To make the tier list work across all devices with shared data:

1. Follow the detailed guide in `FIREBASE_SETUP.md`
2. Get your free Firebase project at https://firebase.google.com
3. Update the config in all HTML files
4. Deploy to GitHub Pages

**Without Firebase**: Each device sees its own local data only
**With Firebase**: All devices see the same data in real-time