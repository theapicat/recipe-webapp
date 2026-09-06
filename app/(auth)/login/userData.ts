export interface DevUserAccount {
  label: string;
  description: string;
  credentials: {
    email: string;
    password?: string;
  };
}

export const DEV_USERS: Record<string, DevUserAccount> = {
  admin: {
    label: "System Admin",
    description: "Full tilgang og admin-rettigheter",
    credentials: {
      email: "admin@kjoekkenhylla.local",
      password: "AdminSuperSecretPassword123!",
    },
  },
  confirmed: {
    label: "Bekreftet Bruker",
    description: "Standard aktiv brukerkonto (Ola Nordmann)",
    credentials: {
      email: "confirmed@example.com",
      password: "DevUser123!",
    },
  },
  unconfirmed: {
    label: "Ubekreftet Bruker",
    description: "Viser varsel om bekreftelses-epost (Kari Ubekreftet)",
    credentials: {
      email: "unconfirmed@example.com",
      password: "DevUser123!",
    },
  },
  newUser: {
    label: "Ny Bruker",
    description: "Ubekreftet e-post & ufullført velkomstsone (Pelle Nykomling)",
    credentials: {
      email: "newuser@example.com",
      password: "DevUser123!",
    },
  },
};