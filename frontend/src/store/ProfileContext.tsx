import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface LocalProfile {
  id: string;
  name: string;
}

interface ProfileContextData {
  activeProfileId: string | null;
  profiles: LocalProfile[];
  isLoading: boolean;
  setActiveProfileId: (id: string) => void;
  createProfile: (name: string, id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

const PROFILES_KEY = 'jobmailer_local_profiles';
const ACTIVE_PROFILE_KEY = 'jobmailer_active_profile_id';

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const storedProfiles = await SecureStore.getItemAsync(PROFILES_KEY);
        if (storedProfiles) {
          setProfiles(JSON.parse(storedProfiles));
        }
        const storedActiveId = await SecureStore.getItemAsync(ACTIVE_PROFILE_KEY);
        if (storedActiveId) {
          setActiveProfileIdState(storedActiveId);
        }
      } catch (e) {
        console.error("Error loading profiles", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const setActiveProfileId = async (id: string) => {
    await SecureStore.setItemAsync(ACTIVE_PROFILE_KEY, id);
    setActiveProfileIdState(id);
  };

  const createProfile = async (name: string, id: string) => {
    const newProfile = { id, name };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(updatedProfiles));
    await setActiveProfileId(id);
  };

  const deleteProfile = async (id: string) => {
    const updatedProfiles = profiles.filter(p => p.id !== id);
    setProfiles(updatedProfiles);
    await SecureStore.setItemAsync(PROFILES_KEY, JSON.stringify(updatedProfiles));
    if (activeProfileId === id) {
      if (updatedProfiles.length > 0) {
        await setActiveProfileId(updatedProfiles[0].id);
      } else {
        await SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY);
        setActiveProfileIdState(null);
      }
    }
  };

  return (
    <ProfileContext.Provider value={{ activeProfileId, profiles, isLoading, setActiveProfileId, createProfile, deleteProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
