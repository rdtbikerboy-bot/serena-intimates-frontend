"use client";

interface ImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ImageLoader({ src, alt, className = "" }: ImageLoaderProps) {
  if (!src) return null;
  console.log("RENDER IMG:", src);



  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ 
        width: "100%", 
        height: "100%", 
        objectFit: "cover", 
        display: "block" 
      }}
    />
  );
}
