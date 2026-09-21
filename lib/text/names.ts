// Backend lagrer alle navn og titler lowercase, trimmet og med sammenpressede mellomrom (se
// documentation/04, seksjon 5). Frontend viser dem med stor forbokstav og sender dem aldri lowercase selv.

export const capitalize = (text: string): string =>
  text.charAt(0).toLocaleUpperCase("nb-NO") + text.slice(1);

// Samme normalisering som backend bruker på navn — brukes til å sjekke duplikater og søke.
export const normalizeName = (text: string): string =>
  text.trim().replace(/\s+/g, " ").toLocaleLowerCase("nb-NO");
