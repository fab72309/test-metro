import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pertesDeChargeTable as defaultTable } from '../constants/pertesDeChargeTable';

const STORAGE_KEY = 'pertesDeChargePerso';

export type PertesDeChargeTableType = typeof defaultTable;

const PRESSION_LANCE_KEY = 'custom.pressionLance';
const PRESSION_LANCE_DEFAULT = 6.0;
const PRESSIONS_KEY = 'custom.pressions';
export const DEFAULT_PRESSIONS = [5, 6, 7, 8];

interface PertesDeChargeTableContextProps {
  table: PertesDeChargeTableType;
  setTable: (t: PertesDeChargeTableType) => void;
  resetTable: () => void;
  loading: boolean;
  pressionLance: number;
  setPressionLance: (v: number) => void;
  resetPressionLance: () => void;
  customPressions: number[];
  setCustomPression: (idx: number, v: number) => void;
  setCustomPressions: (arr: number[]) => void;
  resetCustomPressions: () => void;
}

const PertesDeChargeTableContext = createContext<PertesDeChargeTableContextProps | undefined>(undefined);

function isFiniteNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  );
}

export const usePertesDeChargeTable = () => {
  const ctx = useContext(PertesDeChargeTableContext);
  if (!ctx) throw new Error('usePertesDeChargeTable must be used within a PertesDeChargeTableProvider');
  return ctx;
};

export const PertesDeChargeTableProvider = ({ children }: { children: ReactNode }) => {
  const [table, setTableState] = useState<PertesDeChargeTableType>(defaultTable);
  const [loading, setLoading] = useState(true);
  const [pressionLance, setPressionLanceState] = useState<number>(PRESSION_LANCE_DEFAULT);
  const [customPressions, setCustomPressionsState] = useState<number[]>(DEFAULT_PRESSIONS);

  // Charger depuis AsyncStorage au montage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setTableState(parsed as PertesDeChargeTableType);
          } else {
            throw new Error('Table de pertes de charge invalide');
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTable));
          setTableState(defaultTable);
        }

        const pl = await AsyncStorage.getItem(PRESSION_LANCE_KEY);
        const parsedPressure = pl ? Number(pl) : PRESSION_LANCE_DEFAULT;
        setPressionLanceState(
          Number.isFinite(parsedPressure) && parsedPressure >= 0
            ? parsedPressure
            : PRESSION_LANCE_DEFAULT
        );

        const cp = await AsyncStorage.getItem(PRESSIONS_KEY);
        const parsedPressures = cp ? JSON.parse(cp) : DEFAULT_PRESSIONS;
        if (isFiniteNumberArray(parsedPressures)) {
          setCustomPressionsState(parsedPressures);
        } else {
          throw new Error('Pressions rapides invalides');
        }
      } catch {
        setTableState(defaultTable);
        setPressionLanceState(PRESSION_LANCE_DEFAULT);
        setCustomPressionsState(DEFAULT_PRESSIONS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTable));
        await AsyncStorage.setItem(PRESSION_LANCE_KEY, PRESSION_LANCE_DEFAULT.toString());
        await AsyncStorage.setItem(PRESSIONS_KEY, JSON.stringify(DEFAULT_PRESSIONS));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Setter qui sauvegarde aussi
  const setTable = (t: PertesDeChargeTableType) => {
    setTableState(t);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  };

  const setPressionLance = (v: number) => {
    setPressionLanceState(v);
    AsyncStorage.setItem(PRESSION_LANCE_KEY, v.toString());
  };

  const setCustomPression = (idx: number, v: number) => {
    const newArr = [...customPressions];
    newArr[idx] = v;
    setCustomPressionsState(newArr);
    AsyncStorage.setItem(PRESSIONS_KEY, JSON.stringify(newArr));
  };

  // Ajout : setCustomPressions pour update groupé
  const setCustomPressions = (arr: number[]) => {
    if (!isFiniteNumberArray(arr)) return;
    setCustomPressionsState(arr);
    void AsyncStorage.setItem(PRESSIONS_KEY, JSON.stringify(arr));
  };

  const resetCustomPressions = () => {
    setCustomPressionsState(DEFAULT_PRESSIONS);
    AsyncStorage.setItem(PRESSIONS_KEY, JSON.stringify(DEFAULT_PRESSIONS));
  };

  const resetPressionLance = () => {
    setPressionLanceState(PRESSION_LANCE_DEFAULT);
    AsyncStorage.setItem(PRESSION_LANCE_KEY, PRESSION_LANCE_DEFAULT.toString());
  };

  const resetTable = () => {
    setTableState(defaultTable);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTable));
  };

  return (
    <PertesDeChargeTableContext.Provider value={{
      table,
      setTable,
      resetTable,
      loading,
      pressionLance,
      setPressionLance,
      resetPressionLance,
      customPressions,
      setCustomPression,
      setCustomPressions,
      resetCustomPressions,
    }}>
      {children}
    </PertesDeChargeTableContext.Provider>
  );
};
