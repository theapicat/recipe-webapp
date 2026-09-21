"use client";

import { useState } from "react";
import { Anchor } from "@mantine/core";
import Link from "next/link";
import { useForm, isEmail, isNotEmpty } from "@mantine/form";
import { agentInternal } from "@/lib/agent/agentInternal";
import { useSession } from "@/lib/session/SessionProvider";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { RegisterRequest } from "@/lib/models/auth/registerRequest";

interface RegisterFormValues extends RegisterRequest {
  confirmPassword: string;
}

interface RegisterFormProps {
  onRegistered?: (user: UserProfileResponse) => void;
}

export const RegisterForm = ({ onRegistered }: RegisterFormProps) => {
  const [requestActive, setRequestActive] = useState<boolean>(false);
  const [registerFailedMessage, setRegisterFailedMessage] = useState<string | undefined>();

  const session = useSession();

  const form = useForm<RegisterFormValues>({
    mode: "controlled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      firstName: isNotEmpty("Fornavn mangler"),
      lastName: isNotEmpty("Etternavn mangler"),
      email: isEmail("Ikke gyldig e-post"),
      password: (value) => {
        if (!value || value.length < 8) return "Passordet må være minst 8 tegn";
        if (!/[A-Z]/.test(value)) return "Passordet må inneholde minst én stor bokstav";
        if (!/[a-z]/.test(value)) return "Passordet må inneholde minst én liten bokstav";
        if (!/[0-9]/.test(value)) return "Passordet må inneholde minst ett tall";
        if (!/[^a-zA-Z0-9]/.test(value))
          return "Passordet må inneholde minst ett spesialtegn (!@#$%^&*)";
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? "Passordene må være identiske" : null,
    },
  });

  const submitHandler = async (values: typeof form.values) => {
    setRequestActive(true);
    setRegisterFailedMessage(undefined);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;

    try {
      const res = await agentInternal.post<UserProfileResponse>("/api/auth/register", payload);
      const data = await res.json();

      if (res.ok && data.body) {
        session.setUser(data.body);
        if (onRegistered) {
          onRegistered(data.body);
        }
      } else {
        setRegisterFailedMessage(data.message || "Kunne ikke registrere bruker.");
      }
    } catch {
      setRegisterFailedMessage("Det oppstod en nettverksfeil. Vennligst prøv igjen.");
    } finally {
      setRequestActive(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      <CreateFormContainer
        title="Opprett ny bruker"
        onSubmit={form.onSubmit(submitHandler)}
        submitText="Registrer bruker"
        loading={requestActive}
        errorMessage={registerFailedMessage}
        footer={
          <>
            Har du allerede en konto?{" "}
            <Anchor component={Link} href="/login" size="sm" fw={500}>
              Logg inn
            </Anchor>
          </>
        }
      >
        <FormField
          name="firstName"
          label="Fornavn"
          placeholder="Ola"
          span={{ base: 12, sm: 6 }}
          required
          disabled={requestActive}
        />

        <FormField
          name="lastName"
          label="Etternavn"
          placeholder="Nordmann"
          span={{ base: 12, sm: 6 }}
          required
          disabled={requestActive}
        />

        <FormField
          name="email"
          label="E-post"
          placeholder="din@epost.no"
          required
          disabled={requestActive}
        />

        <FormField
          name="password"
          type="password"
          label="Passord"
          placeholder="Passord"
          required
          disabled={requestActive}
        />

        <FormField
          name="confirmPassword"
          type="password"
          label="Gjenta passord"
          placeholder="Gjenta passord"
          required
          disabled={requestActive}
        />
      </CreateFormContainer>
    </AppFormProvider>
  );
};
