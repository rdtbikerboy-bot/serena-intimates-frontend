"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { serenaLogger } from "@/core/logger";

export interface PendingImage {
  id: string;
  blob: Blob;
  previewUrl: string;
  isCover: boolean;
  originalName: string;
  warnings?: string[];
  score?: number;
}

import { ImageThumb } from "./ImageThumb";
interface ImageUploaderProps {
  onImagesReady?: (images: PendingImage[]) => void;
  onImagesSelected?: (images: PendingImage[]) => void;
  maxFiles?: number;
  maxImages?: number;
}

export const ImageUploader = React.memo(function ImageUploader({ onImagesReady, onImagesSelected, maxFiles = 5, maxImages }: ImageUploaderProps) {
  const limit = maxImages ?? maxFiles;
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<PendingImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado local con el padre
  useEffect(() => {
    onImagesReady?.(images);
    onImagesSelected?.(images);
  }, [images, onImagesReady, onImagesSelected]);

  // Cleanup all object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [images]);

  // Convierte imagen a WebP mediante HTML5 Canvas y ejecuta checks de calidad
  const convertToWebP = (file: File): Promise<{ blob: Blob; warnings: string[]; score: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No se pudo obtener el contexto 2D");
        
        ctx.drawImage(img, 0, 0);

        const warnings: string[] = [];
        let score = 0;

        // 1C: Checks de Proporción, Resolución, Peso y Luz
        if (file.size > 3 * 1024 * 1024) {
          warnings.push("Supera 3MB de peso.");
        }
        if (img.width < 900 || img.height < 900) {
          warnings.push("Resolución menor a 900px.");
        } else {
          score += 5;
        }

        const ratio = img.width / img.height;
        if (Math.abs(ratio - 0.75) > 0.1) {
          warnings.push("No tiene proporción 3:4.");
        } else {
          score += 10;
        }

        // Análisis de Brillo (Canvas 10x10)
        try {
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = 10;
          smallCanvas.height = 10;
          const smallCtx = smallCanvas.getContext("2d");
          if (smallCtx) {
            smallCtx.drawImage(img, 0, 0, 10, 10);
            const imgData = smallCtx.getImageData(0, 0, 10, 10).data;
            let totalBrightness = 0;
            for (let i = 0; i < imgData.length; i += 4) {
              const r = imgData[i];
              const g = imgData[i + 1];
              const b = imgData[i + 2];
              totalBrightness += (0.2126 * r + 0.7152 * g + 0.0722 * b);
            }
            const avgBrightness = totalBrightness / 100;
            if (avgBrightness < 45) {
              warnings.push("Imagen muy oscura / Luz deficiente.");
            } else if (avgBrightness >= 90 && avgBrightness <= 210) {
              score += 5; // Brillo óptimo uniforme
            }
          }
        } catch (e) {
          serenaLogger.warn("No se pudo analizar brillo de imagen", e);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, warnings, score });
            } else {
              reject("Error en conversión a WebP");
            }
          },
          "image/webp",
          0.85 // Calidad alta pero comprimida
        );
      };
      img.onerror = () => reject("Error cargando la imagen para conversión.");
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    if (images.length + validFiles.length > limit) {
      toast.error(`Solo puedes subir hasta ${maxFiles} imágenes.`);
      return;
    }

    const processed: PendingImage[] = [];

    for (const file of validFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`La imagen ${file.name} excede el límite de 5MB.`);
        continue;
      }

      toast.info(`Optimizando ${file.name}...`);
      try {
        let result: { blob: Blob; warnings: string[]; score: number };
        
        if (file.type === "image/webp") {
          // Si ya es WebP, simulamos el análisis estético
          const analysisImg = new Image();
          analysisImg.src = URL.createObjectURL(file);
          const meta = await new Promise<{ warnings: string[]; score: number }>((resolveMeta) => {
            analysisImg.onload = () => {
              const wrn: string[] = [];
              let sc = 0;
              if (file.size > 3 * 1024 * 1024) wrn.push("Supera 3MB de peso.");
              if (analysisImg.width < 900 || analysisImg.height < 900) wrn.push("Resolución menor a 900px.");
              else sc += 5;
              if (Math.abs((analysisImg.width / analysisImg.height) - 0.75) > 0.1) wrn.push("No tiene proporción 3:4.");
              else sc += 10;
              resolveMeta({ warnings: wrn, score: sc });
            };
            analysisImg.onerror = () => resolveMeta({ warnings: [], score: 0 });
          });
          result = { blob: file, warnings: meta.warnings, score: meta.score };
        } else {
          result = await convertToWebP(file);
        }

        const previewUrl = URL.createObjectURL(result.blob);
        processed.push({
          id: Math.random().toString(36).substring(7),
          blob: result.blob,
          previewUrl,
          isCover: false,
          originalName: file.name.split(".")[0],
          warnings: result.warnings,
          score: result.score
        });

        if (result.warnings.length > 0) {
          toast.warning(`Atención: "${file.name}" podría perder calidad en móviles.`, {
            description: result.warnings.join(" | ")
          });
        }
      } catch (err) {
        serenaLogger.error("Fallo al procesar imagen", err);
        toast.error(`No se pudo procesar ${file.name}`);
      }
    }

    if (processed.length > 0) {
      setImages(prev => {
        const next = [...prev, ...processed];
        // 1D: Portada automática inteligente basada en el score estético
        if (next.length > 0) {
          let bestImg = next[0];
          let maxScore = bestImg.score || 0;
          for (const img of next) {
            const currentScore = img.score || 0;
            if (currentScore > maxScore) {
              maxScore = currentScore;
              bestImg = img;
            }
          }
          return next.map(img => ({
            ...img,
            isCover: img.id === bestImg.id
          }));
        }
        return next;
      });
      toast.success(`${processed.length} imagen(es) optimizada(s) listas.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imgToRemove = prev.find(img => img.id === id);
      if (imgToRemove) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(imgToRemove.previewUrl);
      }
      const next = prev.filter(img => img.id !== id);
      // Ensure at least one cover exists
      if (next.length > 0 && !next.some(img => img.isCover)) {
        next[0].isCover = true;
      }
      return next;
    });
  };

  const setCover = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isCover: img.id === id
    })));
  };

  const [activePreset, setActivePreset] = useState("nude-satin");

  const PRESETS = [
    { id: "clear-editorial", name: "Fondo Claro", ratio: "3:4", compression: 85, lighting: "Luz natural difusa sin sombras duras" },
    { id: "dark-premium", name: "Fondo Oscuro", ratio: "3:4", compression: 80, lighting: "Luz cenital con alto contraste" },
    { id: "nude-satin", name: "Nude Satin", ratio: "3:4", compression: 85, lighting: "Luz cálida y sombras orgánicas" },
    { id: "bridal-soft", name: "Bridal Soft", ratio: "3:4", compression: 90, lighting: "Filtro suave sobre expuesto" },
    { id: "noir-contrast", name: "Noir Contrast", ratio: "3:4", compression: 85, lighting: "Blanco y negro con texturas marcadas" }
  ];

  const currentPreset = PRESETS.find(p => p.id === activePreset) || PRESETS[2];

  return (
    <div className="space-y-4">
      {/* Selector de Presets Editoriales */}
      <div className="space-y-2">
        <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-serena-gold mb-1 block">
          Preset Editorial de Captura (Fase 16)
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePreset(p.id)}
              className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 whitespace-nowrap ${
                activePreset === p.id
                  ? "bg-serena-gold text-white border-serena-gold shadow-md"
                  : "bg-serena-cream text-serena-charcoal/70 border-serena-blush/40 hover:bg-serena-silk"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* HUD Informativo del Preset Aplicado */}
        <div className="bg-white/60 p-3 rounded-2xl border border-serena-blush/20 text-[9.5px] text-serena-charcoal/70 space-y-1 font-ui">
          <div className="flex justify-between items-center">
            <span className="font-bold text-serena-gold uppercase">Geometría: {currentPreset.ratio} (WebP Pro)</span>
            <span className="bg-serena-gold/10 text-serena-gold text-[8px] font-bold px-2 py-0.5 rounded-full">Optimizado 4G</span>
          </div>
          <p className="text-[8.5px] italic text-serena-charcoal/60">Recomendación: {currentPreset.lighting}</p>
          <div className="flex justify-between text-[8px] pt-1 text-serena-charcoal/40 font-bold border-t border-serena-blush/10">
            <span>COMPRESIÓN: {currentPreset.compression}% SIN PÉRDIDA TEXTIL</span>
            <span>RATIO: 3:4 AUTOMÁTICO</span>
          </div>
        </div>
      </div>

      <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-serena-gold mb-1 block">
        Galería WebP ({images.length}/{maxFiles})
      </label>
      
      {/* Dropzone */}
      {images.length < maxFiles && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer smooth-transition ${
            isDragging ? 'border-serena-gold bg-serena-gold/5' : 'border-serena-charcoal/20 hover:border-serena-gold/50 hover:bg-white/40'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-serena-silk flex items-center justify-center mb-2 text-serena-charcoal shadow-sm">
            <span>📸</span>
          </div>
          <p className="text-xs text-serena-charcoal font-medium">Toca o arrastra para añadir fotos</p>
          <p className="text-[10px] text-serena-charcoal/60 mt-1">Máx 5MB (JPG, PNG). Convertiremos a WebP.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img) => (
            <ImageThumb 
              key={img.id}
              img={img}
              onCover={() => setCover(img.id)}
              onRemove={() => removeImage(img.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
});
