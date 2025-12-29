import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBackSafely } from "@/utils/navigation";
import { setMyPhoto, getMyPhoto } from "../lib/me";

export default function ProfileUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(getMyPhoto());

  function onPick() { inputRef.current?.click(); }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function onSave() {
    if (!preview) return;
    setMyPhoto(preview);
    navigate("/profile", { replace: true });
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold">Upload profile photo</h1>
      <p className="text-neutral-600 mt-1">Add a clear photo to unlock check-ins & matches.</p>

      <div className="mt-6">
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center">
          {preview ? (
            <img src={preview} className="h-full w-full object-cover" alt="Preview" />
          ) : (
            <span className="text-neutral-500">No photo yet</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onPick} className="flex-1 rounded-xl border px-4 py-2">
            Choose photo
          </button>
          <button
            onClick={onSave}
            disabled={!preview}
            className="flex-1 rounded-xl bg-indigo-600 text-white px-4 py-2 disabled:opacity-50"
          >
            Save
          </button>
        </div>

        <button
          type="button"
          onClick={() => goBackSafely(navigate, '/profile')}
          className="mt-6 w-full text-sm text-neutral-600 underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}
