"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { agentInternal } from "@/lib/agent/agentInternal";
import { normalizeRole, UserRoleType } from "@/lib/models/types";

interface SessionContextType {
  user?: UserProfileResponse;
  setUser: (user: UserProfileResponse | undefined) => void;
  updateUser: (partialUser: Partial<UserProfileResponse>) => void;
  refreshProfile: () => Promise<void>;
  role?: UserRoleType;
  setRole: (role: UserRoleType | undefined) => void;
}

interface Props {
  initialUser?: UserProfileResponse;
  children?: ReactNode;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ initialUser, children }: Props) => {
  // Normaliserer allerede ved seeding — en cookie skrevet før rolle-normaliseringen ble innført
  // (eller på en annen maskin/eldre versjon) kan fortsatt inneholde "Admin"/"User" med stor forbokstav.
  const normalizedInitialUser = initialUser
    ? { ...initialUser, role: normalizeRole(initialUser.role) }
    : undefined;

  const [user, setUserState] = useState<UserProfileResponse | undefined>(normalizedInitialUser);
  const [role, setRole] = useState<UserRoleType | undefined>(normalizedInitialUser?.role);

  const setUser = (newUser: UserProfileResponse | undefined) => {
    const normalized = newUser ? { ...newUser, role: normalizeRole(newUser.role) } : undefined;
    setUserState(normalized);
    setRole(normalized?.role);
  };

  const updateUser = (partialUser: Partial<UserProfileResponse>) => {
    setUserState((prev) => {
      if (!prev) return undefined;
      const updated = { ...prev, ...partialUser };
      if (partialUser.role !== undefined) {
        updated.role = normalizeRole(partialUser.role);
        setRole(updated.role);
      }
      return updated;
    });
  };

  // Henter fersk profil fra serveren og oppdaterer tilstanden
  const refreshProfile = async () => {
    try {
      const res = await agentInternal.get<UserProfileResponse>("/api/auth/me");
      if (res.ok) {
        const { body: freshUser } = await res.json();
        if (freshUser) setUser(freshUser);
      }
    } catch (err) {
      console.error("Kunne ikke fornye brukerprofil:", err);
    }
  };

  return (
    <SessionContext.Provider value={{ user, role, setUser, updateUser, refreshProfile, setRole }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
