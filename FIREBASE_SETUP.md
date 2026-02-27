# Firebase + Gemini Setup (Step by Step)

This guide configures Firebase Firestore to store every debate conversation (player and AI messages). Stored data is used to:

1. **Persist conversation** across sessions and devices  
2. **Load history** when entering a debate room  
3. **Provide conversation context to the Gemini AI API** when generating AI opponent replies  

---

## Step 1: Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).  
2. Click **Add project** (or use an existing project).  
3. Name it (e.g. `nextgen-debate`) and follow the wizard (Analytics optional).  
4. Click **Continue** until the project is created.  

---

## Step 2: Enable Firestore Database

1. In the left sidebar, open **Build → Firestore Database**.  
2. Click **Create database**.  
3. Choose **Start in test mode** (for development). For production, switch to **production mode** and add security rules.  
4. Pick a Firestore location (e.g. `us-central1`) and click **Enable**.  

---

## Step 3: Get your Firebase config

1. In the left sidebar, click the **gear icon** next to “Project Overview” → **Project settings**.  
2. Scroll to **Your apps**. Click the **</>** (Web) icon to add a web app.  
3. Register the app (e.g. nickname “NextGen Debate”) and click **Register app**.  
4. Copy the `firebaseConfig` object. It looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

---

## Step 4: Create `.env.local` with Firebase and Gemini keys

In your project root (same folder as `package.json`), create a file named `.env.local` and add:

```env
# Firebase (from Step 3)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Gemini (for AI opponent and judge)
NEXT_PUBLIC_GEMINI_KEY=your_gemini_api_key_here
```

- Replace each value with the ones from your Firebase config and your [Google AI Studio](https://aistudio.google.com/apikey) Gemini API key.  
- Do **not** commit `.env.local` (it should be in `.gitignore`).  

---

## Step 5: Install dependencies and run

```bash
npm install
npm run dev
```

If Firebase config is present, the app will:

- **On entering a debate room:** load existing messages from Firestore for that challenge.  
- **On every send (player or AI):** append the message to Firestore under `debate_conversations/{challengeId}/messages`.  
- **When calling Gemini:** use the in-memory conversation (which was loaded from or written to Firestore) as the transcript for the AI opponent.  

---

## Data structure in Firestore

- **Collection:** `debate_conversations`  
- **Document ID:** `challengeId` (e.g. the debate/challenge id)  
- **Subcollection:** `messages`  
  - Each document: `id`, `player` (pro/con), `name`, `text`, `timestamp`, `score`, `source` (player | ai), `flags`  

This structure lets you load all messages for a debate and pass them to the Gemini API as conversation history.  

---

## Optional: Firestore index

If you see an error in the browser console asking for an index, open the link in the error message. It will take you to the Firebase Console to create the required index. For a simple `orderBy("timestamp", "asc")` on `messages`, Firestore often works without a composite index.  

---

## Optional: Security rules (production)

For production, set Firestore rules (e.g. in **Firestore → Rules**) so only authenticated users can read/write their debate data. Example (adjust to your auth):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /debate_conversations/{challengeId}/messages/{msgId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

- **Messages not saving:** Check the browser console for errors. Ensure `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` variables and you restarted `npm run dev` after adding them.  
- **Messages not loading:** Confirm the same `challengeId` is used when entering the room and when writing (e.g. `challenge.id`).  
- **Gemini not replying:** Ensure `NEXT_PUBLIC_GEMINI_KEY` is set. Conversation data is still stored in Firebase even if Gemini fails.  
