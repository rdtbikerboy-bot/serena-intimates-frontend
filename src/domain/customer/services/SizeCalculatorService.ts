// src/domain/customer/services/SizeCalculatorService.ts
import { BodyMeasurements } from "../values/BodyMeasurements";

export interface RecommendedSizes {
    braSizeCommercial: string; // Ej: "95"
    braCupTheoretical: string;  // Ej: "Copa B"
    pantySizeCommercial: string; // Ej: "M"
}

/**
 * Domain Service: Motor Matemático de Tallado Estándar Argentino.
 */
export class SizeCalculatorService {
    public static calculate(measurements: BodyMeasurements): RecommendedSizes {
        const bust = measurements.bust;
        const underbust = measurements.underbust;
        const hips = measurements.hips;

        // 1. Determinar Banda/Talle Comercial de Corpiño por Bajo Busto
        let braSize = "95"; // Base por defecto
        if (underbust >= 68 && underbust <= 72) braSize = "85";
        else if (underbust >= 73 && underbust <= 77) braSize = "90";
        else if (underbust >= 78 && underbust <= 82) braSize = "95";
        else if (underbust >= 83 && underbust <= 87) braSize = "100";
        else if (underbust >= 88 && underbust <= 92) braSize = "105";
        else if (underbust > 92) braSize = "110";

        // 2. Determinar Copa Teórica por diferencia entre Busto y Bajo Busto
        const diff = bust - underbust;
        let cup = "Copa B (Estándar)";
        if (diff > 18) cup = "Copa C / D (Volumen Pronunciado)";
        if (diff < 12) cup = "Copa A (Volumen Suave)";

        // 3. Determinar Talle Comercial de Bombacha por Contorno de Cadera
        let pantySize = "M";
        if (hips >= 85 && hips <= 90) pantySize = "S";
        else if (hips >= 91 && hips <= 96) pantySize = "M";
        else if (hips >= 97 && hips <= 102) pantySize = "L";
        else if (hips > 102) pantySize = "XL";

        return {
            braSizeCommercial: braSize,
            braCupTheoretical: cup,
            pantySizeCommercial: pantySize
        };
    }
}