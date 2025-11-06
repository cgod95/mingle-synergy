type Handler = () => void;

const listeners: Record<string, Set<Handler>> = {};

export function on(event: string, fn: Handler) {
  (listeners[event] ||= new Set()).add(fn);
  return () => off(event, fn);
}
export function off(event: string, fn: Handler) {
  listeners[event]?.delete(fn);
}
export function emit(event: string) {
  listeners[event]?.forEach(fn => fn());
}
