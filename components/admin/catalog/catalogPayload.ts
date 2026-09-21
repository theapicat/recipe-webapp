// Felt backend har på leseformen (isSystem, usageCount — se documentation/10, seksjon 7, B7), men som ikke hører hjemme i
// en PUT: de settes av serveren. Fjernes fra raden før den sendes tilbake ved redigering.
export const toWritable = <T extends object>(item: T): Omit<T, "isSystem" | "usageCount"> => {
  const copy = { ...item } as Record<string, unknown>;
  delete copy.isSystem;
  delete copy.usageCount;
  return copy as Omit<T, "isSystem" | "usageCount">;
};
