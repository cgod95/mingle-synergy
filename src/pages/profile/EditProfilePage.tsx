import { useState } from "react";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  return (
    <section className="mx-auto max-w-md p-4">
      <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-4 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-white">Edit Profile</h1>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Name</label>
        <input className="mb-4 w-full rounded-xl border border-neutral-600 bg-neutral-900 text-white px-3 py-2 text-base" value={name} onChange={e=>setName(e.target.value)} />
        <label className="mb-2 block text-sm font-medium text-neutral-300">Bio</label>
        <textarea className="mb-4 w-full rounded-xl border border-neutral-600 bg-neutral-900 text-white px-3 py-2 text-base" rows={4} value={bio} onChange={e=>setBio(e.target.value)} />
        <label className="mb-2 block text-sm font-medium">Photos</label>
        <input type="file" accept="image/*" multiple onChange={(e)=>setFiles(Array.from(e.target.files||[]))} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {files.map((f,i)=>(
            <div key={i} className="aspect-square rounded-xl bg-neutral-700 p-2 text-xs text-neutral-300 overflow-hidden">{f.name}</div>
          ))}
        </div>
        <button className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white">Save</button>
      </div>
    </section>
  );
}
