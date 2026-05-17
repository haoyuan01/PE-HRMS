"use client";

import { useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";

interface AccountAvatarProps {
  firstName: string | null;
  lastName: string | null;
  profilePhoto: string | null;
  onImageChange?: (file: File) => void;
}

export function AccountAvatar({
  firstName,
  lastName,
  profilePhoto,
  onImageChange,
}: AccountAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initials =
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "") || "U";

  const displayUrl = previewUrl ?? profilePhoto;

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full bg-surface-container-low transition-all hover:ring-2 hover:ring-ds-primary/40"
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ds-primary text-xl font-semibold text-on-primary">
              {initials.toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
            <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </button>
        <span
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-surface-container-lowest bg-ds-primary text-on-primary shadow-sm transition-opacity hover:opacity-90"
        >
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Upload area */}
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-outline-variant/30 px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          {displayUrl ? "Change Photo" : "Upload Photo"}
        </button>
        <p className="mt-1.5 text-xs text-on-surface-variant">
          JPG or PNG. Max size of 800K
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreviewUrl(URL.createObjectURL(file));
              onImageChange?.(file);
            }
          }}
        />
      </div>
    </div>
  );
}
