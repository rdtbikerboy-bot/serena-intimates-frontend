// src/components/ui-premium/FitVerdictBadge.tsx
"use client";

import React from "react";
import { FitVerdict } from "@/domain/customer/services/FitConfidenceService";
import { ShieldCheck } from "lucide-react";

interface FitVerdictBadgeProps {
    verdict: FitVerdict;
}

export function FitVerdictBadge({ verdict }: FitVerdictBadgeProps) {
    const isPerfect = verdict.zone === 'PERFECT';
    const isLoose = verdict.zone === 'LOOSE';

    const strokeColor = isPerfect ? "text-emerald-600 font-bold" : isLoose ? "text-blue-600 font-bold" : "text-amber-700 font-bold";
    const bgColor = isPerfect ? "bg-emerald-500/10 border-emerald-500/20" : isLoose ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20";

    return (
        <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition-all duration-300 ${bgColor}`}>
            <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1 text-serena-charcoal">
                    <ShieldCheck className="w-3.5 h-3.5 text-serena-gold" /> Calce Textil Inteligente
                </span>
                <span className={`${strokeColor}`}>
                    {isPerfect ? "Calce Ideal (100%)" : isLoose ? "Relajado / Suave" : "Compresión Ajustada"}
                </span>
            </div>
            <div className="w-full h-1.5 bg-serena-charcoal/10 rounded-full overflow-hidden">
                <div
                    className={`h-full smooth-transition ${isPerfect ? "bg-emerald-600" : isLoose ? "bg-blue-500" : "bg-amber-600"}`}
                    style={{ width: `${verdict.score}%` }}
                />
            </div>
            <p className="text-[10px] text-serena-charcoal/80 leading-tight italic">
                "{verdict.advice}"
            </p>
        </div>
    );
}