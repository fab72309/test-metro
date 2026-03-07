import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_ENGINE_MODELS, type RelayEngineModelV2 } from '@/features/relay/engine/types';

const STORAGE_KEY = 'relay.v2.engineCatalog';

type EngineCatalogStore = {
  models: RelayEngineModelV2[];
  loading: boolean;
  addModel: (model: Omit<RelayEngineModelV2, 'id'>) => void;
  updateModel: (id: string, patch: Partial<RelayEngineModelV2>) => void;
  removeModel: (id: string) => void;
  setModels: (models: RelayEngineModelV2[]) => void;
  resetModels: () => void;
};

const EngineCatalogContext = createContext<EngineCatalogStore | undefined>(undefined);

const DEFAULT_MODEL_IDS = new Set(DEFAULT_ENGINE_MODELS.map((model) => model.id));

const normalizeModelId = (id: unknown): string | null => {
  if (typeof id !== 'string' || id.trim().length === 0) return null;
  const raw = id.trim();
  const aliases: Record<string, string> = {
    '2000-15': 'fpt-2000-15',
    '1000-15': 'fptl-1500-15',
    '2000-10': 'ccem-4000-10',
    '2000/15': 'fpt-2000-15',
    '1000/15': 'fptl-1500-15',
    '2000/10': 'ccem-4000-10',
  };
  return aliases[raw] ?? raw;
};

const mergeWithDefaultModels = (models: RelayEngineModelV2[]): RelayEngineModelV2[] => {
  const byId = new Map<string, RelayEngineModelV2>();
  models.forEach((model) => {
    byId.set(model.id, model);
  });

  const defaultsMerged = DEFAULT_ENGINE_MODELS.map((defaultModel) => {
    const stored = byId.get(defaultModel.id);
    if (!stored) return defaultModel;
    return {
      ...defaultModel,
      nominalFlowLpm: stored.nominalFlowLpm,
      nominalPressureBar: stored.nominalPressureBar,
      maxPressureBar: stored.maxPressureBar,
      enabled: stored.enabled,
    };
  });

  const customModels = models.filter((model) => !DEFAULT_MODEL_IDS.has(model.id));
  return [...defaultsMerged, ...customModels];
};

const normalizeModels = (raw: unknown): RelayEngineModelV2[] => {
  if (!Array.isArray(raw)) return DEFAULT_ENGINE_MODELS;

  const sanitized = raw
    .map((item, idx) => {
      if (!item || typeof item !== 'object') return null;
      const model = item as Partial<RelayEngineModelV2>;
      const id = normalizeModelId(model.id);
      if (!id || !model.label) return null;
      const nominalFlowLpm = Number(model.nominalFlowLpm);
      const nominalPressureBar = Number(model.nominalPressureBar);
      const maxPressureBar = Number(model.maxPressureBar);
      if (!Number.isFinite(nominalFlowLpm) || nominalFlowLpm <= 0) return null;
      if (!Number.isFinite(nominalPressureBar) || nominalPressureBar <= 0) return null;
      if (!Number.isFinite(maxPressureBar) || maxPressureBar <= 0) return null;

      return {
        id,
        label: model.label,
        nominalFlowLpm,
        nominalPressureBar,
        maxPressureBar,
        enabled: model.enabled !== false,
      } as RelayEngineModelV2;
    })
    .filter((item): item is RelayEngineModelV2 => Boolean(item));

  if (sanitized.length === 0) return DEFAULT_ENGINE_MODELS;

  const deduped = Array.from(
    sanitized.reduce((map, model) => map.set(model.id, model), new Map<string, RelayEngineModelV2>()).values()
  );

  const merged = mergeWithDefaultModels(deduped);

  if (!merged.some((model) => model.enabled)) {
    merged[0] = { ...merged[0], enabled: true };
  }

  return merged;
};

export function EngineCatalogProvider({ children }: { children: ReactNode }) {
  const [models, setModelsState] = useState<RelayEngineModelV2[]>(DEFAULT_ENGINE_MODELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const normalized = normalizeModels(parsed);
          setModelsState(normalized);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENGINE_MODELS));
          setModelsState(DEFAULT_ENGINE_MODELS);
        }
      } catch {
        setModelsState(DEFAULT_ENGINE_MODELS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback((updater: (prev: RelayEngineModelV2[]) => RelayEngineModelV2[]) => {
    setModelsState((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addModel = useCallback((model: Omit<RelayEngineModelV2, 'id'>) => {
    persist((prev) => {
      const id = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
      return [...prev, { ...model, id }];
    });
  }, [persist]);

  const updateModel = useCallback((id: string, patch: Partial<RelayEngineModelV2>) => {
    persist((prev) => {
      const next = prev.map((model) => (model.id === id ? { ...model, ...patch } : model));
      if (!next.some((model) => model.enabled) && next.length > 0) {
        next[0] = { ...next[0], enabled: true };
      }
      return next;
    });
  }, [persist]);

  const removeModel = useCallback((id: string) => {
    persist((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((model) => model.id !== id);
      if (!next.some((model) => model.enabled) && next.length > 0) {
        next[0] = { ...next[0], enabled: true };
      }
      return next;
    });
  }, [persist]);

  const setModels = useCallback((nextModels: RelayEngineModelV2[]) => {
    const normalized = normalizeModels(nextModels);
    setModelsState(normalized);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const resetModels = useCallback(() => {
    setModelsState(DEFAULT_ENGINE_MODELS);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENGINE_MODELS));
  }, []);

  const value = useMemo(
    () => ({
      models,
      loading,
      addModel,
      updateModel,
      removeModel,
      setModels,
      resetModels,
    }),
    [addModel, loading, models, removeModel, resetModels, setModels, updateModel]
  );

  return <EngineCatalogContext.Provider value={value}>{children}</EngineCatalogContext.Provider>;
}

export function useEngineCatalogStore() {
  const context = useContext(EngineCatalogContext);
  if (!context) {
    throw new Error('useEngineCatalogStore must be used within an EngineCatalogProvider');
  }
  return context;
}
