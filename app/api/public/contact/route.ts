import { agentExternal } from "@/lib/agent/agentExternal";
import { apiRoute } from "@/lib/http/apiRoute";
import { ContactRequest } from "@/lib/models/public/ContactRequest";

// POST /api/public/contact
export const POST = (request: Request) =>
  apiRoute("Meldingen kunne ikke sendes. Vennligst prøv igjen senere.", async (options) => {
    const data: ContactRequest = await request.json();

    // Core svarer med ren tekst (ikke JSON) — agentExternal ignorerer bodyen, og ved feil brukes reservemeldingen.
    await agentExternal.post("/public/contact-form", data, options);

    return { message: "Takk for din henvendelse! Meldingen er sendt." };
  });
