// Backend (Domain/Units/UnitTypeNames + næringsberegningen) forholder seg til enhetstypene via navnet:
//   vekt   -> grunnenhet gram
//   volum  -> grunnenhet milliliter
//   antall -> ingen omregning, forholdstall alltid 1
// Se documentation/10-backlog.md, seksjon 7 (B13), for ønsket om en fast `dimension`-kolonne i stedet for navnematching.
export const BASE_UNIT_BY_TYPE: Record<string, string> = {
  vekt: "g",
  volum: "ml",
};

export const COUNT_UNIT_TYPE = "antall";

export const formatRatio = (ratio: number): string =>
  ratio.toLocaleString("nb-NO", { maximumFractionDigits: 10 });
