export type UserProfile = {
  id?: string;
  name: string;
  bio?: string;
  photo?: string; // dataURL or https URL
  photoUrl?: string; // alias for photo
};

const KEY = "mingle:profile";

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { name: "You" };
    const p = JSON.parse(raw);
    return { name: p.name || "You", bio: p.bio || "", photo: p.photo || "" };
  } catch {
    return { name: "You" };
  }
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function getProfile(): UserProfile {
  return loadProfile();
}

export function setPhotoUrl(photoUrl: string): void {
  const profile = loadProfile();
  saveProfile({ ...profile, photo: photoUrl });
}
