import React from "react";
import { createRoot } from "react-dom/client";

let root: ReturnType<typeof createRoot> | null = null;
function ensureHost() {
  let el = document.getElementById("toast-host");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-host";
    document.body.appendChild(el);
    root = createRoot(el);
  }
  return root!;
}

let queue: string[] = [];
let visible = false;

function render() {
  const host = ensureHost();
  host.render(
    <div className="fixed bottom-6 inset-x-0 z-[9999] flex justify-center pointer-events-none">
      <div className={`transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        {queue.length > 0 && (
          <div className="pointer-events-auto rounded-full bg-black/80 text-white px-4 py-2 text-sm shadow-lg">
            {queue[0]}
          </div>
        )}
      </div>
    </div>
  );
}

export function showToast(msg: string, ms = 1800) {
  queue.push(msg);
  visible = true;
  render();
  setTimeout(() => {
    visible = false;
    render();
    setTimeout(() => {
      queue.shift();
      render();
    }, 250);
  }, ms);
}

export const ToastHost: React.FC = () => null; // nothing to mount, host is body-attached
