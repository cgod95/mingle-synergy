import { useEffect, useState } from "react";
import { onToast } from "../lib/toast";

export default function ToastHost() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  useEffect(() => {
    return onToast((t) => {
      setItems((cur) => [...cur, t]);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 2200);
    });
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-20 left-0 right-0 z-[60] flex justify-center">
      <div className="flex w-full max-w-md flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full rounded-xl border border-neutral-700 bg-neutral-800 text-white px-3 py-2 text-sm shadow-lg">
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
