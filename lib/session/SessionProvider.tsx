"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { agentInternal } from "@/lib/agent/agentInternal";

interface SessionContextType {
  user?: UserProfileResponse;
  setUser: (user: UserProfileResponse | undefined) => void;
  updateUser: (partialUser: Partial<UserProfileResponse>) => void;
  refreshProfile: () => Promise<void>;
  role?: string;
  setRole: (role: string | undefined) => void;
}

interface Props {
  initialUser?: UserProfileResponse;
  children?: ReactNode;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ initialUser, children }: Props) => {
  const [user, setUserState] = useState<UserProfileResponse | undefined>(initialUser);
  const [role, setRole] = useState<string | undefined>(initialUser?.role);

  const setUser = (newUser: UserProfileResponse | undefined) => {
    setUserState(newUser);
    setRole(newUser?.role);
  };

  const updateUser = (partialUser: Partial<UserProfileResponse>) => {
    setUserState((prev) => {
      if (!prev) return undefined;
      const updated = { ...prev, ...partialUser };
      if (partialUser.role !== undefined) {
        setRole(partialUser.role);
      }
      return updated;
    });
  };

  // Henter fersk profil fra serveren og oppdaterer tilstanden
  const refreshProfile = async () => {
    try {
      const res = await agentInternal.get("/api/auth/me");
      if (res.ok) {
        const freshUser: UserProfileResponse = await res.json();
        setUser(freshUser);
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
