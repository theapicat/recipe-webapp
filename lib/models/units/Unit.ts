export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  unitTypeId: string;
  // Forholdstall til denne enhetstypens basisenhet (f.eks. gram for Vekt, milliliter for Volum).
  // Universelt for enheten, ikke avhengig av hvilken ingrediens den brukes på.
  baseUnitRatio: number;
}
