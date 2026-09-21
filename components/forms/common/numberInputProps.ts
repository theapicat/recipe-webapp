import { NumberInputProps } from "@mantine/core";

// Felles oppsett for tallfelt i appen (skjemafelt og filtre): norsk desimalkomma i visningen, punktum aksepteres
// fortsatt ved inntasting, ingen negative tall og ingen +/-knapper.
export const norwegianNumberProps: Pick<
  NumberInputProps,
  "decimalSeparator" | "allowedDecimalSeparators" | "allowNegative" | "hideControls"
> = {
  decimalSeparator: ",",
  allowedDecimalSeparators: [",", "."],
  allowNegative: false,
  hideControls: true,
};
