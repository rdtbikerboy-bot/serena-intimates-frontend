// src/app/admin/page.tsx
"use client";

import React, { useState } from "react";
import {
    Lock, ShieldAlert, Package, Users, BarChart3,
    Plus, Sparkles, TrendingUp, DollarSign,
    ShoppingBag, Calendar, MapPin, AlertTriangle, EyeOff, LogOut
} from "lucide-react";

/**
 * PANEL ADMINISTRATIVO ENTERPRISE - SERENA INTIMATES (Hito 6.1)
 * Centro operativo unificado para control de stock inteligente, CRM comercial y balance contable.
 */
export default function AdminPanelPage() {
    // --- ESTADOS DE SEGURIDAD Y ACCESO ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // --- ESTADOS DE NAVEGACIÓN INTERNA ---
    const [activeTab, setActiveTab] = useState<"productos" | "clientas" | "contabilidad">("productos");

    // --- ESTADOS FORMULARIO PRODUCTO (VARIANTES DINÁMICAS) ---
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [silueta, setSilueta] = useState("Conjunto Premium");
    const [tela, setTela] = useState("Seda Stretch");
    const [costoOrig, setCostoOrig] = useState("");
    const [precioVent, setPrecioVent] = useState("");
    const [descripcion, setDescripcion] = useState("");

    // Matriz elástica de stock por Talle/Color (Ejemplo base sugerido)
    const [stock90Negro, setStock90Negro] = useState(5);
    const [stock95Negro, setStock95Negro] = useState(3);
    const [stock90Blush, setStock90Blush] = useState(4);

    // --- DATOS SIMULADOS PREMIUM PARA INTELIGENCIA DE NEGOCIO ---
    const mockClientas = [
        { id: "1", nombre: "María Paz Figueroa", talle: "95", preferencia: "Negro / Encaje", compras: 4, zona: "Capital", valor: "$185.000" },
        { id: "2", nombre: "Sofía Altamirano", talle: "90", preferencia: "Rose Blush / Seda", compras: 3, zona: "San Martín", valor: "$142.000" },
        { id: "3", nombre: "Luciana Leguizamón", talle: "100", preferencia: "Blanco / Microfibra", compras: 5, zona: "Orán", valor: "210.000" }
    ];

    const departamentosSalta = [
        "Capital", "Cerrillos", "Rosario de Lerma", "Chicoana", "Cafayate",
        "San Martín", "Orán", "Metán", "Rosario de la Frontera", "Cachi"
    ];

    // --- RUTINA SEGURO DE AUTENTICACIÓN ---
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Validación estricta local previa para Serena y Vos
        if (
            (username.toLowerCase() === "serena" && password === "serena2026") ||
            (username.toLowerCase() === "administrador" && password === "intimates2026")
        ) {
            setIsAuthenticated(true);
            setLoginError("");
        } else {
            setLoginError("Credenciales incorrectas. Verifique el acceso privado.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername("");
        setPassword("");
    };

    // ------------------------------------------------------------
    // 🔐 INTERFAZ 1: PANTALLA DE ACCESO SEGURO (LOCK)
    // ------------------------------------------------------------
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4 font-ui">
                <div className="w-full max-w-[400px] bg-white rounded-2xl p-8 border border-neutral-200 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="font-editorial text-2xl font-bold tracking-widest text-neutral-800">Serena Admin</h1>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Acceso Privado Comercial</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Usuario Autorizado</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ej: Serena"
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-600 text-neutral-800 font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Clave de Seguridad</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-600 text-neutral-800 font-mono"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-medium flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-neutral-900 text-white font-bold text-xs py-4 rounded-xl uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg"
                        >
                            Validar Credenciales
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------
    // 🎛️ INTERFAZ 2: PANEL DE CONTROL COMPLETO AUTORIZADO
    // ------------------------------------------------------------
    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-ui text-neutral-800">

            {/* Barra de Navegación Superior Premium */}
            <header className="w-full bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center shadow-xs">
                <div className="flex items-center gap-4">
                    <h1 className="font-editorial text-3xl font-bold text-neutral-900 tracking-wider">Serena Intimates</h1>
                    <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest">
                        Centro de Control
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs font-bold text-neutral-700 uppercase">Modo Operador Activo</p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Sincronizado a Supabase
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Cerrar Sesión Segura"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Menú de Solapas / Pestañas Principales */}
            <div className="bg-white border-b border-neutral-200 px-8 flex gap-6">
                <button
                    onClick={() => setActiveTab("productos")}
                    className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "productos" ? "border-amber-600 text-amber-600" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                >
                    <Package className="w-4 h-4" /> 1. Gestión de Prendas & Stock
                </button>
                <button
                    onClick={() => setActiveTab("clientas")}
                    className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "clientas" ? "border-amber-600 text-amber-600" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                >
                    <Users className="w-4 h-4" /> 2. CRM & Fichas de Clientas
                </button>
                <button
                    onClick={() => setActiveTab("contabilidad")}
                    className={`py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === "contabilidad" ? "border-amber-600 text-amber-600" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                >
                    <BarChart3 className="w-4 h-4" /> 3. Balance Contable Inteligente
                </button>
            </div>

            {/* CONTENEDOR PRINCIPAL OPERATIVO */}
            <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto">

                {/* SOLAPA 1: ALTA DE PRODUCTOS Y CONTROL DE STOCK */}
                {activeTab === "productos" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario de Carga */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-1.5 border-b pb-3">
                                <Plus className="w-5 h-5 text-amber-600" />
                                <h2 className="text-sm font-bold uppercase tracking-wider">Subir Nueva Prenda al Catálogo</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Marca</label>
                                    <input type="text" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ej: Serena Premium" className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Modelo / Nombre</label>
                                    <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ej: Conjunto Encaje Silk" className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Tipo de Silueta</label>
                                    <select value={silueta} onChange={e => setSilueta(e.target.value)} className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800">
                                        <option>Conjunto Premium</option>
                                        <option>Corpiño Suelto</option>
                                        <option>Bombacha Satinada</option>
                                        <option>Bustier Editorial</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Tipo de Tela (Propiedad Textil 3D)</label>
                                    <select value={tela} onChange={e => setTela(e.target.value)} className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800">
                                        <option>Seda Stretch (25% Elongación)</option>
                                        <option>Encaje Alta Resistencia (15% Elongación)</option>
                                        <option>Microfibra Compresión (35% Elongación)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Costo de Origen (ARS)</label>
                                    <input type="number" value={costoOrig} onChange={e => setCostoOrig(e.target.value)} placeholder="$" className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Precio de Venta al Público (ARS)</label>
                                    <input type="number" value={precioVent} onChange={e => setPrecioVent(e.target.value)} placeholder="$" className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase">Descripción Fina de la Prenda</label>
                                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} placeholder="Detalles de costuras, calce y cuidados..." className="w-full bg-neutral-50 border p-3 rounded-xl text-sm text-neutral-800" />
                            </div>

                            {/* Matriz Elástica de Stock */}
                            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Inventario de Variantes (Talle + Color)</span>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white p-3 rounded-xl border text-center">
                                        <span className="text-[10px] font-bold block text-neutral-600">Talle 90 / Negro</span>
                                        <input type="number" value={stock90Negro} onChange={e => setStock90Negro(Number(e.target.value))} className="w-16 text-center text-sm font-mono font-bold mt-1 border rounded" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border text-center">
                                        <span className="text-[10px] font-bold block text-neutral-600">Talle 95 / Negro</span>
                                        <input type="number" value={stock95Negro} onChange={e => setStock95Negro(Number(e.target.value))} className="w-16 text-center text-sm font-mono font-bold mt-1 border rounded" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border text-center">
                                        <span className="text-[10px] font-bold block text-neutral-600">Talle 90 / Rose Blush</span>
                                        <input type="number" value={stock90Blush} onChange={e => setStock90Blush(Number(e.target.value))} className="w-16 text-center text-sm font-mono font-bold mt-1 border rounded" />
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-amber-600 text-white font-bold text-xs py-3.5 rounded-xl uppercase tracking-widest hover:bg-amber-700 transition-colors">
                                Publicar Producto e Inyectar en Supabase
                            </button>
                        </div>

                        {/* Panel de Alertas de Stock Crítico */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Alertas de Stock Crítico (≤ 3 unidades)
                                </div>
                                <div className="space-y-2.5">
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-neutral-800">Conjunto Seda Negligee</p>
                                            <p className="text-[10px] text-neutral-500">Variante: Talle 95 / Negro</p>
                                        </div>
                                        <span className="bg-amber-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">Últimas 3 u.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center gap-1.5 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                                    <EyeOff className="w-4 h-4 text-neutral-400" /> Publicaciones Ocultadas Automatizadas (Stock 0)
                                </div>
                                <div className="space-y-2.5">
                                    <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 flex justify-between items-center text-xs opacity-60">
                                        <div>
                                            <p className="font-bold text-neutral-600">Bustier Encaje Esmeralda</p>
                                            <p className="text-[10px] text-neutral-400">Variante: Talle 90 / Verde</p>
                                        </div>
                                        <span className="bg-neutral-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">Oculto</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SOLAPA 2: CRM & HISTORIAL DE CLIENTAS */}
                {activeTab === "clientas" && (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="space-y-0.5">
                                <h2 className="text-sm font-bold uppercase tracking-wider">Fichero de Inteligencia de Clientas</h2>
                                <p className="text-xs text-neutral-500">Control metrológico, historial de siluetas y volumen de compras corporativas.</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" /> Algoritmo de Sugerencia Sutil Activo
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-400 font-bold uppercase text-[10px] tracking-wider border-b">
                                        <th className="p-4">Nombre Completo</th>
                                        <th className="p-4">Zona (Salta)</th>
                                        <th className="p-4">Talle Calculado</th>
                                        <th className="p-4">Preferencia de Calce</th>
                                        <th className="p-4 text-center">Órdenes</th>
                                        <th className="p-4 text-right">Inversión Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-neutral-700 font-medium">
                                    {mockClientas.map(c => (
                                        <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-4 font-bold text-neutral-900">{c.nombre}</td>
                                            <td className="p-4 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-400" /> {c.zona}</td>
                                            <td className="p-4 font-mono font-bold text-amber-700">Corpiño {c.talle}</td>
                                            <td className="p-4 text-neutral-500">{c.preferencia}</td>
                                            <td className="p-4 text-center font-bold bg-neutral-50/30 font-mono">{c.compras}</td>
                                            <td className="p-4 text-right font-bold font-mono text-neutral-900">{c.valor}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SOLAPA 3: BALANCES CONTABLES Y LOGÍSTICA DE COMPRAS */}
                {activeTab === "contabilidad" && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider">Ventas Efectuadas</span>
                                    <span className="text-2xl font-bold font-mono text-neutral-900">48 <span className="text-xs font-normal text-neutral-400">pedidos</span></span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider">Facturación Bruta MTD</span>
                                    <span className="text-2xl font-bold font-mono text-neutral-900">$1.640.000</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] text-neutral-400 uppercase font-bold block tracking-wider">Ganancia Neta Limpia (CMV)</span>
                                    <span className="text-2xl font-bold font-mono text-emerald-700">$984.000</span>
                                </div>
                            </div>
                        </div>

                        {/* Barra Avanzada de Filtros */}
                        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Filtros Avanzados de Optimización de Compra</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <select className="bg-neutral-50 border p-2.5 rounded-xl font-medium"><option>Rango: Últimos 30 días</option><option>Este Año</option></select>
                                <select className="bg-neutral-50 border p-2.5 rounded-xl font-medium">
                                    <option>Filtrar por Departamento (Salta)</option>
                                    {departamentosSalta.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <select className="bg-neutral-50 border p-2.5 rounded-xl font-medium"><option>Por Silueta: Todos</option><option>Conjuntos</option></select>
                                <select className="bg-neutral-50 border p-2.5 rounded-xl font-medium"><option>Por Talle: Todos</option><option>Talle 90</option><option>Talle 95</option></select>
                            </div>
                        </div>

                        {/* Recomendación de Compra Inteligente Automatizada */}
                        <div className="bg-neutral-900 text-white rounded-2xl p-6 border border-neutral-900 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="space-y-1">
                                <div className="text-amber-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 fill-amber-500" /> Sugerencia de Reposición Automática (Previene Clavos)
                                </div>
                                <p className="text-xs text-neutral-300 max-w-[700px] leading-relaxed">
                                    Basado en las métricas de las clientas registradas en los departamentos de **Capital** y **San Martín**, el sistema detecta alta rotación de conjuntos de **Tela Microfibra en Talle 95**. Sugerimos concentrar un **40% más de presupuesto** en esta configuración para las compras del próximo mes.
                                </p>
                            </div>
                            <span className="bg-amber-600 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-xl tracking-wider">
                                Optimizar Próxima Compra
                            </span>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}