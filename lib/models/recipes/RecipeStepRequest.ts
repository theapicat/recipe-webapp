export interface RecipeStepRequest {
  description: string;
  // 0-10 080 minutter. Utelat/null = ingen timer. Stegnummer settes av rekkefølgen i lista.
  timerMinutes?: number | null;
}
