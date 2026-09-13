import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { ContactForm } from "@/components/forms/public/ContactForm";

export default function ContactPage() {
  return (
    <AsyncMainContainer size="sm" py="xl">
      <ContactForm />
    </AsyncMainContainer>
  );
}
