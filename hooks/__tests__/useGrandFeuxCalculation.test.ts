import { renderHook, act } from '@testing-library/react-native';
import { useGrandFeuxCalculation } from '../useGrandFeuxCalculation';

describe('useGrandFeuxCalculation', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useGrandFeuxCalculation());
        expect(result.current.mode).toBe('combustible');
        expect(result.current.strategie).toBe('offensive');
        expect(result.current.surface).toBe('');
    });

    it('should calculate offensive strategy correctly', () => {
        const { result } = renderHook(() => useGrandFeuxCalculation());

        act(() => {
            result.current.setSurface('100');
            result.current.setHauteur('10');
            result.current.setCombustible(1);
            result.current.setFraction(100);
            result.current.setRendement(0.5);
        });

        act(() => {
            result.current.handleCalculate();
        });

        // Pmax = 100 * 10 * 1 * 1 = 1000 MW
        // Q = 1000 * 42.5 = 42500 L/min
        expect(result.current.resultOffensive).toContain('42500 L/min');
    });

    it('should calculate propagation strategy correctly', () => {
        const { result } = renderHook(() => useGrandFeuxCalculation());

        act(() => {
            result.current.setMode('combustible');
            result.current.setStrategie('propagation');
            result.current.setSurfaceVertical('50');
            result.current.setTauxApplication(10);
        });

        act(() => {
            result.current.handleCalculate();
        });

        // Q = 50 * 10 = 500 L/min
        expect(result.current.resultPropagation).toBe('500.00');
    });
});
