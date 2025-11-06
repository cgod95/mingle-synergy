import { demoPeopleByVenue, DemoPerson } from "../demo/people";

const K = (k: string) => `mingle_demo_${k}`;

export function getCheckedInVenue(uid: string): string | null {
  return localStorage.getItem(K(`checkin_${uid}`));
}

export function checkIn(uid: string, venueId: string) {
  localStorage.setItem(K(`checkin_${uid}`), venueId);
}

export function checkOut(uid: string) {
  localStorage.removeItem(K(`checkin_${uid}`));
}

export function getPeopleAtVenue(venueId: string): DemoPerson[] {
  return demoPeopleByVenue[venueId] ?? [];
}

function likesKey(venueId: string, uid: string) {
  return K(`likes_${venueId}_${uid}`);
}

export function likePerson(myUid: string, venueId: string, targetId: string) {
  const key = likesKey(venueId, myUid);
  const list = JSON.parse(localStorage.getItem(key) || "[]") as string[];
  if (!list.includes(targetId)) {
    list.push(targetId);
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export function getMyLikes(myUid: string, venueId: string): string[] {
  const key = likesKey(venueId, myUid);
  return JSON.parse(localStorage.getItem(key) || "[]");
}

// Demo mutual-like approximation (~40% chance)
export function getMatches(myUid: string, venueId: string): DemoPerson[] {
  const mine = new Set(getMyLikes(myUid, venueId));
  const roster = getPeopleAtVenue(venueId);
  return roster.filter(p => {
    if (!mine.has(p.id)) return false;
    const seed = (p.id.charCodeAt(0) + venueId.length) % 10;
    return seed < 4;
  });
}
