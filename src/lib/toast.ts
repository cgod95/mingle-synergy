type Toast = { id: number; text: string };
type Listener = (t: Toast) => void;

let id = 1;
const listeners = new Set<Listener>();

export function onToast(fn: Listener): () => void { 
  listeners.add(fn); 
  return () => { listeners.delete(fn); };
}

export function toast(text: string) {
  const t = { id: id++, text };
  listeners.forEach(fn => fn(t));
}
