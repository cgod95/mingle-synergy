import { Link } from "react-router-dom";
import { getMyPhoto } from "../lib/me";

export default function Profile() {
  const photo = getMyPhoto();
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold">Your Profile</h1>
      <p className="text-neutral-600 mt-1">This is your public photo used for check-ins & matches.</p>

      <div className="mt-6">
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center">
          {photo ? (
            <img src={photo} className="h-full w-full object-cover" alt="Profile" />
          ) : (
            <span className="text-neutral-500">No photo yet</span>
          )}
        </div>

        <Link
          to="/profile/upload"
          className="mt-4 inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
        >
          {photo ? "Change photo" : "Add photo"}
        </Link>
      </div>
    </div>
  );
}
