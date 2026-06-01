"use client";

import React from "react";
import { XCircle, Star } from "lucide-react"; // Assuming lucide icons are available in the project
import { PendingImage } from "./ImageUploader";

interface ImageThumbProps {
  img: PendingImage;
  onCover: () => void;
  onRemove: () => void;
}

export const ImageThumb = React.memo(function ImageThumb({ img, onCover, onRemove }: ImageThumbProps) {
  return (
    <div className="relative w-20 h-20 rounded overflow-hidden border border-serena-blush/30 group">
      {/* Thumbnail image */}
      <img
        src={img.previewUrl}
        alt={img.originalName}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onClick={onCover}
      />

      {/* Cover badge */}
      {img.isCover && (
        <div className="absolute top-1 left-1 bg-serena-gold/80 text-white rounded-full p-0.5">
          <Star size={12} />
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0 right-0 text-serena-gold hover:text-serena-charcoal bg-white/70 rounded-bl p-0.5"
        aria-label="Eliminar imagen"
      >
        <XCircle size={14} />
      </button>
    </div>
  );
});
