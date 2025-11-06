export function getMyPhoto(): string | null {
  try { return localStorage.getItem('mingle:me:photo'); } catch { return null; }
}

export function setMyPhoto(dataUrl: string): void {
  try { localStorage.setItem('mingle:me:photo', dataUrl); } catch {}
}
