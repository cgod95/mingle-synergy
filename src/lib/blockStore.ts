const KEY = "mingle:blocked"; // string[] of ids
function load(): string[] { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }
function save(a: string[]) { localStorage.setItem(KEY, JSON.stringify(a)); try{window.dispatchEvent(new Event("mingle:block"));}catch{} }
export function isBlocked(id: string){ return load().includes(id); }
export function block(id: string){ const a=load(); if(!a.includes(id)){ a.push(id); save(a);} }
export function unblock(id: string){ save(load().filter(x=>x!==id)); }
export function listBlocked(){ return load(); }
