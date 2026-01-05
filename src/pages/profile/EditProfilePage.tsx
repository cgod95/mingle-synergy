// EditProfilePage - Dark theme with brand purple

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-[#1a1a24] text-[#A78BFA]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>

        <div className="rounded-2xl bg-[#111118] border border-[#2D2D3A] p-6 shadow-lg">
          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">Name</label>
          <input 
            className="mb-4 w-full rounded-xl bg-[#0a0a0f] border border-[#2D2D3A] px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />

          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">Bio</label>
          <textarea 
            className="mb-4 w-full rounded-xl bg-[#0a0a0f] border border-[#2D2D3A] px-4 py-3 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all resize-none" 
            rows={4} 
            value={bio} 
            onChange={e => setBio(e.target.value)}
            placeholder="Tell people a bit about yourself"
          />

          <label className="mb-2 block text-sm font-medium text-[#9CA3AF]">Photos</label>
          <div className="mb-4">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#2D2D3A] rounded-xl cursor-pointer hover:border-[#7C3AED]/50 hover:bg-[#7C3AED]/5 transition-all">
              <div className="text-center">
                <span className="text-[#6B7280] text-sm">Click to upload photos</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                />
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-xl bg-[#1a1a24] border border-[#2D2D3A] p-2 text-xs text-[#9CA3AF] overflow-hidden flex items-center justify-center"
                >
                  {f.name.substring(0, 10)}...
                </div>
              ))}
            </div>
          )}

          <Button 
            className="mt-6 w-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-medium py-3 shadow-lg shadow-[#7C3AED]/25"
          >
            Save Changes
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
