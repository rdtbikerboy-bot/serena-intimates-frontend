// src/domain/customer/services/FitConfidenceService.ts
import { BodyMeasurements } from "../values/BodyMeasurements";

export interface FitVerdict {
    score: number;
    zone: 'LOOSE' | 'PERFECT' | 'TIGHT';
    advice: string;
}

/**
 * Domain Service: Motor de Coincidencia Inmersiva FitConfidence.
 * Evalúa el nivel de tensión textil contra las curvas anatómicas de la clienta de Salta.
 */
export class FitConfidenceService {
    public static evaluate(customerProfile: BodyMeasurements, product: any, selectedSize: string): FitVerdict {
        // Extraer propiedades elásticas del material o usar fallback premium por defecto (25% elongación)
        const stretchFactor = product?.textileProperty?.stretchFactor ?? 1.25;

        const nominalBustTarget = this.getNominalBustForSize(selectedSize);
        const userBust = customerProfile.bust;
        const sizeMaxCapacity = nominalBustTarget * stretchFactor;

        let score = 100;
        let zone: 'LOOSE' | 'PERFECT' | 'TIGHT' = 'PERFECT';
        let advice = "Este conjunto se adaptará de manera soñada a tus curvas.";

        if (userBust > sizeMaxCapacity) {
            const excessPercentage = ((userBust - sizeMaxCapacity) / sizeMaxCapacity) * 100;
            score = Math.max(30, Math.round(100 - excessPercentage * 4));
            zone = 'TIGHT';
            advice = `Te va a quedar muy firme debido a que el material cede poco. Te sugerimos subir un talle para mayor confort.`;
        } else if (userBust < nominalBustTarget - 4) {
            const looseDelta = nominalBustTarget - userBust;
            score = Math.max(50, Math.round(100 - looseDelta * 3));
            zone = 'LOOSE';
            advice = "El calce será relajado. Si prefieres un realce pronunciado, elige un talle menos.";
        } else {
            if (customerProfile.preference === 'SNUG') {
                advice = "Calce firme tal como te gusta, ideal para realzar el busto de forma segura.";
            } else if (customerProfile.preference === 'LOOSE') {
                advice = "Ajuste suave y sin marcas, prioridad absoluta en el confort diario.";
            }
        }

        return { score, zone, advice };
    }

    private static getNominalBustForSize(size: string): number {
        const targets: Record<string, number> = {
            "85": 85, "90": 90, "95": 95, "100": 100, "105": 105, "110": 110
        };
        return targets[size] || 95;
    }
}