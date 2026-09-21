// Enkel bekreftelsesrespons fra Auth API ("handling utført"). Meldingen er valgfri i praksis — route
// handlers faller tilbake til en egen standardtekst når den mangler.
export interface MessageResponse {
  message: string;
}
