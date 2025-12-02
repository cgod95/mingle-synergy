export const DEMO = import.meta.env.VITE_DEMO_MODE === "true";

const KEY = "mingle_demo_state";
type DemoState = { currentVenueId?: string; lastFeedbackAt?: number };

function read(): DemoState {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(s: DemoState) { localStorage.setItem(KEY, JSON.stringify(s)); }

export function getCurrentVenueId(): string | undefined { return read().currentVenueId; }
export function setCurrentVenue(id: string | undefined): void { 
  const s = read(); 
  if (id !== undefined) {
    s.currentVenueId = id;
  } else {
    delete s.currentVenueId;
  }
  write(s); 
}

export function markFeedback() { const s = read(); s.lastFeedbackAt = Date.now(); write(s); }
export function getLastFeedbackAt(): number | undefined { return read().lastFeedbackAt; }
