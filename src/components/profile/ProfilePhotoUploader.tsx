import React, { useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import { getProfile, setPhotoUrl } from "../../lib/profileStore";

export default function ProfilePhotoUploader() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(getProfile().photoUrl || getProfile().photo);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const profile = getProfile();
    const profileId = profile.id || 'default';
    const objectRef = ref(storage, `profiles/${profileId}.jpg`);
    const task = uploadBytesResumable(objectRef, file, { contentType: file.type || "image/jpeg" });

    setIsUploading(true);
    setProgress(0);

    task.on("state_changed",
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(pct));
      },
      (err) => {
        console.error("Upload failed:", err);
        setIsUploading(false);
      },
      async () => {
        const url = await getDownloadURL(objectRef);
        setPhotoUrl(url);
        setPreview(url);
        setIsUploading(false);
      }
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-800 p-4">
      <div className="flex items-center gap-4">
        <div className="size-20 overflow-hidden rounded-2xl bg-neutral-700 ring-1 ring-neutral-600">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
              No Photo
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm text-neutral-600">
            Upload a clear photo. This is shown to others when you match.
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={onPick}
              className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
              disabled={isUploading}
            >
              {isUploading ? "Uploading…" : "Choose Photo"}
            </button>
            {isUploading && (
              <div className="text-sm text-neutral-600">{progress}%</div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />
    </div>
  );
}
