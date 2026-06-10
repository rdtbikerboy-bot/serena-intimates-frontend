"use client";

import React from "react";
import { Product } from "@/core/types";
import { ImageLoader } from "./ImageLoader";

interface CompleteTheLookMiniCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function CompleteTheLookMiniCard({ product, onClick }: CompleteTheLookMiniCardProps) {
  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-serena-cream rounded-2xl overflow-hidden shadow-xs border border-serena-blush/20 hover:shadow-md cursor-pointer transition-all duration-300 group flex flex-col"
    >
      <div className="relative aspect-[4/5] bg-[#F0E8E0] overflow-hidden">
        <ImageLoader 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        <div className="absolute bottom-2 left-2 bg-serena-cream/90 backdrop-blur-md py-1 px-2 rounded-xl border border-serena-blush/30 shadow-xs">
          <span className="text-[8px] font-bold text-serena-gold uppercase tracking-widest">
            {product.brand}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-editorial text-xs font-semibold text-serena-charcoal leading-tight line-clamp-1">
          {product.title}
        </h4>
        <span className="text-xs font-bold text-serena-gold font-ui block mt-1">
          ${product.price.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}
