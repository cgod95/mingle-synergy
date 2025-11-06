import React, { useRef, useState } from "react";
import SafeImg from "../components/common/SafeImg";
import { loadProfile, saveProfile } from "../lib/profileStore";

export default function Profile() {
  const initial = loadProfile();
  const [name, setName] = useState(initial.name || "You");
  const [bio, setBio] = useState(initial.bio || "");
  const [photo, setPhoto] = useState<string | undefined>(initial.photo || undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      setPhoto(data);
    };
    reader.readAsDataURL(f);
  }

  function onSave() {
    saveProfile({ name: name.trim() || "You", bio: bio.trim(), photo });
  }

  function onRemovePhoto() {
    setPhoto(undefined);
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-semibold">Your profile</h1>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-black/10 bg-neutral-100">
          <SafeImg
            src={photo || "/avatar-fallback.png"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onPick}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Upload photo
          </button>
          {photo && (
            <button
              onClick={onRemovePhoto}
              className="text-sm text-red-600 hover:underline text-left"
            >
              Remove photo
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>
      </div>

      <label className="mt-6 block text-sm font-medium">Display name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2 w-full rounded-xl border px-3 py-2"
        placeholder="Your name"
      />

      <label className="mt-4 block text-sm font-medium">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="mt-2 h-28 w-full rounded-xl border px-3 py-2"
        placeholder="Say hi 👋"
      />

      <button
        onClick={onSave}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500"
      >
        Save
      </button>

      <p className="mt-3 text-center text-sm text-neutral-500">
        Saved locally for MVP. We’ll swap to Firebase Storage later.
      </p>
    </div>
  );
}
