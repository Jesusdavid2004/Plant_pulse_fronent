import { useCallback, useEffect, useState } from 'react';
import { petService, type Equipment } from '../services/PetService';
import type { PetProfile, PotKey } from '../types';

export type ProfileStatus = 'loading' | 'ready' | 'error';

export interface PetProfileState {
  profile: PetProfile | null;
  status: ProfileStatus;
  busy: boolean;
  actionError: boolean;
  replaceProfile: (profile: PetProfile) => void;
  reload: () => Promise<void>;
  equip: (equipment: Equipment) => Promise<void>;
  buyPot: (pot: PotKey) => Promise<void>;
}

export function usePetProfile(plantId: string): PetProfileState {
  const [profile, setProfile] = useState<PetProfile | null>(null);
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setProfile(await petService.getProfile(plantId));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [plantId]);

  useEffect(() => {
    let cancelled = false;
    petService
      .getProfile(plantId)
      .then((loaded) => {
        if (cancelled) return;
        setProfile(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [plantId]);

  const runAction = useCallback(async (action: () => Promise<PetProfile>) => {
    setBusy(true);
    setActionError(false);
    try {
      setProfile(await action());
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  }, []);

  const equip = useCallback(
    (equipment: Equipment) => runAction(() => petService.equip(plantId, equipment)),
    [plantId, runAction],
  );
  const buyPot = useCallback(
    (pot: PotKey) => runAction(() => petService.buyPot(plantId, pot)),
    [plantId, runAction],
  );

  return { profile, status, busy, actionError, replaceProfile: setProfile, reload, equip, buyPot };
}
