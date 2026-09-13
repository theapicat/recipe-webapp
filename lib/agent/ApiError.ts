/**
 * Feil kastet av agentAuth/agentAuthAdmin når Gatewayen svarer med en feilkode.
 * Bærer den faktiske HTTP-statuskoden videre, slik at route handlers kan propagere den i stedet
 * for å flate alt til 400 — spesielt viktig for 401 (utløpt/ugyldig token), som agentInternal
 * bruker som signal på at den bør prøve å fornye tokenet og prøve kallet på nytt.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
