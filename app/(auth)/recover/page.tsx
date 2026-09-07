"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session/SessionProvider";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { RecoverPassword } from "@/components/forms/auth/RecoverPassword";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session || !session.role) return;

    const role = session.role.toLowerCase();
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "user") {
      router.push("/dashboard");
    }
  }, [session?.role, router]);

  const isRedirecting = Boolean(session?.role);

  return (
    <AsyncMainContainer size={420} py={40} loading={isRedirecting}>
      <RecoverPassword />
    </AsyncMainContainer>
  );
};

export default ForgotPasswordPage;