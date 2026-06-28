// src/features/customer/MyVirtualWardrobe.tsx
"use client";

import React, { useMemo } from "react";
import { Customer } from "@/domain/customer/entities/Customer";
import { SizeCalculatorService } from "@/domain/customer/services/SizeCalculatorService";
import { Avatar3DViewer } from "@/features/fitting/Avatar3DViewer";
import { Ruler, Sparkles, AlertCircle, RefreshCw, Calendar } from "lucide-react";

interface MyVirtualWardrobeProps {
    customer: Customer;
    onTriggerFormUpdate: () => void;
}

/**
 * Componente Premium: "Mi Vestidor Virtual" Unificado (Hito 4.3).
 * Fusiona las métricas de dominio con el Avatar WebGL interactivo en tiempo real.
 */
export function MyVirtualWardrobe({ customer, onTriggerFormUpdate }: MyVirtualWardrobeProps) {
    const profile = customer.morphologicalProfile;

    // Evalúa obsolescencia de las métricas corporativas (> 6 meses)
    const isOutdated = useMemo(() => {
        if (!profile) return false;
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
        return new Date().getTime() - profile.measuredAt.getTime() > sixMonthsInMs;
    }, [profile]);

    // Invocar el motor matemático de talles para el mercado argentino
    const suggestedSizes = useMemo(() => {
        if (!profile) return null;
        return SizeCalculatorService.calculate(profile);
    }, [profile]);

    return (
        <div className="w-full max-w-[420px] mx-auto bg-serena-cream rounded-2xl p-6 border border-serena-blush/20 shadow-xs space-y-5 font-ui text-serena-charcoal">

            {/* Encabezado */}
            <div className="flex justify-between items-start border-b border-serena-blush/20 pb-4">
                <div>
                    <h2 className="font-editorial text-lg font-bold leading-tight">Mi Vestidor Virtual</h2>
                    <p className="text-[10px] uppercase tracking-widest text-serena-gold font-bold mt-0.5">
                        Línea de Calce: {customer.fullName}
                    </p>
                </div>
                <div className="bg-serena-silk p-2 rounded-xl border border-serena-blush/30">
                    <Ruler className="w-4 h-4 text-serena-gold" />
                </div>
            </div>

            {/* Proyección Visual del Avatar 3D Paramétrico */}
            <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/40 block">Proyección del Avatar Digital</span>
                <Avatar3DViewer measurements={profile || undefined} />
            </div>

            {/* ESTADO 1: AVATAR EN BLANCO */}
            {!profile && (
                <div className="bg-white rounded-2xl p-5 border border-dashed border-serena-blush text-center space-y-4">
                    <div className="w-10 h-10 bg-serena-champagne rounded-full flex items-center justify-center mx-auto text-serena-gold">
                        <Sparkles className="w-5 h-5 fill-serena-champagne" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-editorial text-sm font-semibold">Torso Tridimensional Base</h3>
                        <p className="text-[11px] text-serena-charcoal/60 leading-relaxed">
                            Carga tus centímetros para ajustar la masa y curvas del modelo 3D según tu contextura fisiológica exacta.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onTriggerFormUpdate}
                        className="w-full bg-serena-charcoal text-white text-[11px] font-bold py-3 rounded-xl uppercase tracking-widest hover:opacity-90 smooth-transition"
                    >
                        Configurar Mis Medidas
                    </button>
                </div>
            )}

            {/* ESTADO 2: PERFIL ACTIVO CARGADO */}
            {profile && suggestedSizes && (
                <div className="space-y-5 animate-fade-in">

                    {isOutdated && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex gap-2.5 items-start text-[11px] font-medium leading-tight">
                            <AlertCircle className="w-4 h-4 text-serena-gold shrink-0 mt-0.5" />
                            <div>
                                Tus centímetros se registraron hace más de 6 meses. Te aconsejamos una rápida recalibración de silueta.
                            </div>
                        </div>
                    )}

                    {/* Ficha Métrica en Centímetros */}
                    <div className="bg-white rounded-2xl p-4 border border-serena-blush/20 space-y-3">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/40 block">Métricas Anatómicas Guardadas</span>

                        <div className="grid grid-cols-2 gap-3 text-center text-serena-charcoal">
                            <div className="bg-serena-silk/40 p-2 rounded-xl border border-serena-blush/10">
                                <span className="text-[9px] text-serena-charcoal/50 block font-medium">Busto</span>
                                <span className="text-base font-bold font-mono">{profile.bust}<span className="text-[10px] font-normal font-ui ml-0.5">cm</span></span>
                            </div>
                            <div className="bg-serena-silk/40 p-2 rounded-xl border border-serena-blush/10">
                                <span className="text-[9px] text-serena-charcoal/50 block font-medium">Bajo Busto</span>
                                <span className="text-base font-bold font-mono">{profile.underbust}<span className="text-[10px] font-normal font-ui ml-0.5">cm</span></span>
                            </div>
                            <div className="bg-serena-silk/40 p-2 rounded-xl border border-serena-blush/10">
                                <span className="text-[9px] text-serena-charcoal/50 block font-medium">Cintura</span>
                                <span className="text-base font-bold font-mono">{profile.waist}<span className="text-[10px] font-normal font-ui ml-0.5">cm</span></span>
                            </div>
                            <div className="bg-serena-silk/40 p-2 rounded-xl border border-serena-blush/10">
                                <span className="text-[9px] text-serena-charcoal/50 block font-medium">Cadera</span>
                                <span className="text-base font-bold font-mono">{profile.hips}<span className="text-[10px] font-normal font-ui ml-0.5">cm</span></span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-serena-charcoal/50 pt-2 border-t border-serena-blush/10">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {profile.measuredAt.toLocaleDateString("es-AR")}</span>
                            <span className="font-bold text-serena-gold uppercase">Calce: {profile.preference === 'SNUG' ? 'Firme' : profile.preference === 'LOOSE' ? 'Suelto' : 'Justo'}</span>
                        </div>
                    </div>

                    {/* Panel Consolidado Sugerido */}
                    <div className="bg-serena-charcoal text-white rounded-2xl p-4 border border-serena-charcoal shadow-sm space-y-3">
                        <div className="flex items-center gap-1 text-serena-gold font-bold uppercase text-[9px] tracking-widest">
                            <Sparkles className="w-3.5 h-3.5 text-serena-gold fill-serena-gold" /> Tu Ficha de Talles Recomendados
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-serena-charcoal">
                            <div className="bg-white p-3 rounded-xl flex flex-col">
                                <span className="text-[8px] text-serena-charcoal/40 uppercase font-bold tracking-wider">Corpiño Sugerido</span>
                                <span className="text-lg font-bold text-serena-charcoal mt-1">{suggestedSizes.braSizeCommercial}</span>
                                <span className="text-[9px] text-serena-gold font-semibold uppercase mt-0.5">{suggestedSizes.braCupTheoretical}</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl flex flex-col">
                                <span className="text-[8px] text-serena-charcoal/40 uppercase font-bold tracking-wider">Bombacha Sugerida</span>
                                <span className="text-lg font-bold text-serena-charcoal mt-1">{suggestedSizes.pantySizeCommercial}</span>
                                <span className="text-[9px] text-emerald-700 font-semibold uppercase mt-0.5">Calce Óptimo</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onTriggerFormUpdate}
                        className="w-full bg-white text-serena-charcoal border border-serena-blush border-b-2 text-[11px] font-bold py-3 rounded-xl uppercase tracking-wider hover:bg-serena-silk/20 smooth-transition flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-serena-gold" /> Recalibrar Silueta Corporal
                    </button>
                </div>
            )}
        </div>
    );
}