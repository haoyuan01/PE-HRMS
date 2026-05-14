"use client";

import { useRef } from "react";
import Image from "next/image";

interface AccountAvatarProps {
  firstName: string | null;
  lastName: string | null;
  profilePhoto: string | null;
}

export function AccountAvatar({
  firstName,
  lastName,
  profilePhoto,
}: AccountAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "") || "U";

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface-container-low">
        {profilePhoto ? (
          <Image
            src={profilePhoto}
            alt="Profile photo"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ds-primary text-xl font-semibold text-on-primary">
            {initials.toUpperCase()}
          </div>
        )}
      </div>

      {/* Upload area */}
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium text-ds-primary hover:text-ds-primary-dim transition-colors"
        >
          Change Photo
        </button>
        <p className="mt-1 text-xs text-on-surface-variant">
          JPG, GIF or PNG. Max size of 800K
        </p>
        {/* TODO: Implement photo upload when API is available */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
        />
      </div>
    </div>
  );
}
