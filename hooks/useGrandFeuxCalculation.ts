import { useState, useCallback } from 'react';

export type Strategy = 'offensive' | 'propagation';
export type Mode = 'combustible' | 'surface' | 'fhli';

export function useGrandFeuxCalculation() {
    // Common State
    const [mode, setMode] = useState<Mode>('combustible');
    const [strategie, setStrategie] = useState<Strategy>('offensive');

    // Offensive State
    const [surface, setSurface] = useState('');
    const [hauteur, setHauteur] = useState('');
    const [fraction, setFraction] = useState(0);
    const [combustible, setCombustible] = useState(2);
    const [rendement, setRendement] = useState(0.2);
    const [resultOffensive, setResultOffensive] = useState<string | null>(null);
    const [calcDetailsOffensive, setCalcDetailsOffensive] = useState<string | null>(null);
    const [resultPmax, setResultPmax] = useState<string | null>(null);
    const [resultFlowLmin, setResultFlowLmin] = useState<string | null>(null);
    const [resultFlowM3h, setResultFlowM3h] = useState<string | null>(null);

    // Propagation State
    const [surfaceVertical, setSurfaceVertical] = useState('');
    const [tauxApplication, setTauxApplication] = useState(6);
    const [resultPropagation, setResultPropagation] = useState<string | null>(null);
    const [resultPropLmin, setResultPropLmin] = useState<string | null>(null);
    const [resultPropM3h, setResultPropM3h] = useState<string | null>(null);
    const [calcDetailsPropagation, setCalcDetailsPropagation] = useState<string | null>(null);

    // Surface Approach State
    const [surfaceApprocheSurface, setSurfaceApprocheSurface] = useState('');
    const [resultSurface, setResultSurface] = useState<string | null>(null);
    const [resultSurfaceLmin, setResultSurfaceLmin] = useState<string | null>(null);
    const [resultSurfaceM3h, setResultSurfaceM3h] = useState<string | null>(null);

    const resetAll = useCallback(() => {
        setSurface('');
        setHauteur('');
        setFraction(0);
        setCombustible(2);
        setRendement(0.2);
        setSurfaceVertical('');
        setTauxApplication(6);
        setSurfaceApprocheSurface('');
        setResultOffensive(null);
        setCalcDetailsOffensive(null);
        setResultPmax(null);
        setResultFlowLmin(null);
        setResultFlowM3h(null);
        setResultPropagation(null);
        setCalcDetailsPropagation(null);
        setResultPropLmin(null);
        setResultPropM3h(null);
        setResultSurface(null);
        setResultSurfaceLmin(null);
        setResultSurfaceM3h(null);
    }, []);

    const calculateOffensive = useCallback(() => {
        const surf = parseFloat(surface);
        const haut = parseFloat(hauteur);
        if (isNaN(surf) || isNaN(haut)) return;

        const pmax = surf * haut * combustible * (fraction / 100);
        const multiplier = rendement === 0.5 ? 42.5 : 106;
        const qLmin = pmax * multiplier;
        const qLminStr = qLmin.toFixed(0);
        const qm3h = qLmin / 16.67;
        const qm3hStr = qm3h.toFixed(2);

        setResultPmax(pmax.toFixed(2));
        setResultFlowLmin(qLminStr);
        setResultFlowM3h(qm3hStr);
        setResultOffensive(`${qLminStr} L/min (${qm3hStr} m³/h)`);
        setCalcDetailsOffensive(
            `Pmax = ${surf} m² × ${haut} m × ${combustible} MW/m³ × (${fraction}/100) = ${pmax.toFixed(2)} MW\nDébit requis : ${pmax.toFixed(2)} MW × ${multiplier} L/min/MW = ${qLminStr} L/min\nSoit ${qm3hStr} m³/h`
        );
    }, [surface, hauteur, combustible, fraction, rendement]);

    const calculatePropagation = useCallback(() => {
        const surfVert = parseFloat(surfaceVertical);
        const taux = parseFloat(String(tauxApplication));
        if (isNaN(surfVert) || isNaN(taux)) return;

        const debit = surfVert * taux;
        const res = debit.toFixed(2);
        const m3h = (debit * 0.06).toFixed(2);

        setResultPropLmin(res);
        setResultPropM3h(m3h);
        setResultPropagation(res);
        setCalcDetailsPropagation(`${surfVert} m² × ${taux} L/min/m² = ${res} L/min`);
    }, [surfaceVertical, tauxApplication]);

    const calculateSurface = useCallback(() => {
        const surf = parseFloat(surfaceApprocheSurface);
        const taux = parseFloat(String(tauxApplication));
        if (isNaN(surf) || isNaN(taux)) {
            setResultSurface(null);
            setResultSurfaceLmin(null);
            setResultSurfaceM3h(null);
            return;
        }
        const debit = surf * taux;
        const res = debit.toFixed(2);
        const m3h = (debit * 0.06).toFixed(2);
        setResultSurface(res);
        setResultSurfaceLmin(res);
        setResultSurfaceM3h(m3h);
    }, [surfaceApprocheSurface, tauxApplication]);

    const handleCalculate = useCallback(() => {
        if (mode === 'combustible') {
            if (strategie === 'offensive') {
                calculateOffensive();
            } else {
                calculatePropagation();
            }
        } else if (mode === 'surface') {
            calculateSurface();
        }
    }, [mode, strategie, calculateOffensive, calculatePropagation, calculateSurface]);

    return {
        mode, setMode,
        strategie, setStrategie,
        surface, setSurface,
        hauteur, setHauteur,
        fraction, setFraction,
        combustible, setCombustible,
        rendement, setRendement,
        surfaceVertical, setSurfaceVertical,
        tauxApplication, setTauxApplication,
        surfaceApprocheSurface, setSurfaceApprocheSurface,
        resultOffensive,
        calcDetailsOffensive,
        resultPmax,
        resultFlowLmin,
        resultFlowM3h,
        resultPropagation,
        calcDetailsPropagation,
        resultPropLmin,
        resultPropM3h,
        resultSurface,
        resultSurfaceLmin,
        resultSurfaceM3h,
        handleCalculate,
        resetAll
    };
}
