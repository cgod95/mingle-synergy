import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getVenues } from "../lib/api";

const ACTIVE_KEY = "mingle_active_venue";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const venues = useMemo(() => getVenues(), []);
  const [checked, setChecked] = useState<boolean>(() => !!localStorage.getItem(ACTIVE_KEY));

  const onCheckIn = (id: string) => {
    localStorage.setItem(ACTIVE_KEY, id);
    setChecked(true);
    navigate(`/venues/${id}`);
  };

  const preselect = params.get("id");

  return (
    <div>
      <h1 className="text-xl font-semibold">Check In</h1>
      <p className="text-neutral-600">Select your current venue.</p>
      <div className="mt-4 space-y-3">
        {venues.map(v => (
          <button
            key={v.id}
            onClick={() => onCheckIn(v.id)}
            className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm hover:border-indigo-400 ${preselect===v.id ? "border-indigo-500" : ""}`}
          >
            <div className="font-medium">{v.name}</div>
            <div className="text-sm text-neutral-500">{v.id}</div>
          </button>
        ))}
      </div>
      {checked && <p className="mt-4 text-sm text-green-700">Checked in. You can browse people now.</p>}
    </div>
  );
}
