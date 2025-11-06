export type Profile = {
  id: string;          // "me"
  name: string;
  age?: number;
  bio?: string;
  photoDataUrl?: string; // base64 data URL
};

const KEY = "mingle_profile_v1";

export function getProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { id: "me", name: "You" };
    const p = JSON.parse(raw);
    return {
      id: "me",
      name: typeof p.name === "string" && p.name.trim() ? p.name.trim() : "You",
      age: typeof p.age === "number" ? p.age : undefined,
      bio: typeof p.bio === "string" ? p.bio : undefined,
      photoDataUrl: typeof p.photoDataUrl === "string" ? p.photoDataUrl : undefined,
    };
  } catch {
    return { id: "me", name: "You" };
  }
}

export function saveProfile(update: Partial<Profile>) {
  const cur = getProfile();
  const next: Profile = { ...cur, ...update, id: "me" };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}
