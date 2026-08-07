import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION = "site_settings";
const MAIN_DOC = "main";

const DEFAULT_SETTINGS = {
  siteName: "Mandhikkindo",
  tagline: "Find the Best Mandhi Spots in Kerala",
  contactEmail: "contact@mandhikkindo.com",
  contactPhone: "+91 98765 43210",
  facebookLink: "https://facebook.com/mandhikkindo",
  instagramLink: "https://instagram.com/mandhikkindo",
  youtubeLink: "https://youtube.com/mandhikkindo",
  footerText: "© 2026 Mandhikkindo. All Rights Reserved. Kerala's #1 Mandhi Guide.",
  aiBuddyPrompt: "You are MandhiBuddy, Kerala's premier AI assistant for Mandhi recommendations, spicy food spots, pit cooking techniques, and foodie groups.",
  maintenanceMode: false,
};

export const getSiteSettings = async () => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, MAIN_DOC));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.warn("Site Settings fetch fallback:", err);
    return DEFAULT_SETTINGS;
  }
};

export const updateSiteSettings = async (data) => {
  const docRef = doc(db, COLLECTION, MAIN_DOC);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return data;
};
