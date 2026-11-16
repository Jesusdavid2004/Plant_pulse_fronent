import { useCallback, useEffect, useRef, useState } from 'react';
import { careService } from '../services/CareService';
import type { CareType, LoggedCare, PlantMood } from '../types';

const EFFECT_DURATION_MS = 1800;

export type PetStatus = 'loading' | 'ready' | 'error';

export interface PlantPetState {
  snapshot: PlantMood | null;
  status: PetStatus;
  pendingCare: CareType | null;
  activeEffect: CareType | null;
  logCare: (type: CareType) => Promise<void>;
  reload: () => Promise<void>;
}

export function usePlantPet(
  plantId: string,
  onCareLogged?: (care: LoggedCare) => void,
): PlantPetState {
  const [snapshot, setSnapshot] = useState<PlantMood | null>(null);
  const [status, setStatus] = useState<PetStatus>('loading');
  const [pendingCare, setPendingCare] = useState<CareType | null>(null);
  const [activeEffect, setActiveEffect] = useState<CareType | null>(null);
  const effectTimer = useRef(0);

  const reload = useCallback(async () => {
    try {
      setSnapshot(await careService.getMood(plantId));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [plantId]);

  useEffect(() => {
    let cancelled = false;
    careService
      .getMood(plantId)
      .then((mood) => {
        if (cancelled) return;
        setSnapshot(mood);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      window.clearTimeout(effectTimer.current);
    };
  }, [plantId]);

  const logCare = useCallback(
    async (type: CareType) => {
      setPendingCare(type);
      try {
        const care = await careService.logCare(plantId, type);
        onCareLogged?.(care);
        setActiveEffect(type);
        window.clearTimeout(effectTimer.current);
        effectTimer.current = window.setTimeout(() => setActiveEffect(null), EFFECT_DURATION_MS);
        await reload();
      } catch {
        setStatus('error');
      } finally {
        setPendingCare(null);
      }
    },
    [plantId, reload, onCareLogged],
  );

  return { snapshot, status, pendingCare, activeEffect, logCare, reload };
}
