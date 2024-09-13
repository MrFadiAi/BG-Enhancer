import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsjbae0AhFjGWWB9U979DE4h1mdPzd2dE",
  authDomain: "twitter-enhancer-291af.firebaseapp.com",
  projectId: "twitter-enhancer-291af",
  storageBucket: "twitter-enhancer-291af.appspot.com",
  messagingSenderId: "282856163646",
  appId: "1:282856163646:web:c3703c7010587ba48f446f",
  measurementId: "G-L61DLXXB8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Listen for messages from content scripts or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background:", message);

  if (message.action === "signOut") {
    // Handle sign out
    signOut(auth).then(() => {
      console.log("User signed out successfully");
      sendResponse({ success: true });
    }).catch((error) => {
      console.error("Sign out error:", error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Indicates asynchronous response

  } else if (message.action === "authenticated") {
    // Handle successful authentication
    console.log("User authenticated successfully");
    sendResponse({ success: true });
  }

  return true; // Indicates asynchronous response
});

// Optional: Listen for a second message for when the user clicks the extension icon
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authenticated') {
    const popupUrl = chrome.runtime.getURL("popup/popup.html");
    chrome.tabs.create({ url: popupUrl });
  }
});
