"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface ReceiptDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPT = "image/png,image/jpeg,application/pdf";

export function ReceiptDropzone({ file, onChange }: ReceiptDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0] ?? null;
    if (picked) onChange(picked);
  };

  if (file) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-ds-primary" />
          <span className="truncate text-sm text-on-surface">{file.name}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          aria-label="Remove receipt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
        isDragging
          ? "border-ds-primary bg-ds-primary/5"
          : "border-outline-variant/40 bg-surface-container-low hover:border-ds-primary/40"
      }`}
    >
      <UploadCloud className="h-6 w-6 text-on-surface-variant" />
      <span className="text-sm font-medium text-on-surface">
        Click or drag receipt here
      </span>
      <span className="text-xs text-on-surface-variant">
        PNG, JPG, PDF · Max 5MB
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </button>
  );
}
