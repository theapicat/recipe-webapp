"use client";

import React from "react";
import {
  ComboboxData,
  Grid,
  GridColProps,
  NumberInput,
  PasswordInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useAppFormContext } from "./FormContext";
import { norwegianNumberProps } from "./numberInputProps";

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "textarea" | "select" | "number";
  required?: boolean;
  disabled?: boolean;
  span?: GridColProps["span"];
  minRows?: number;
  maxRows?: number;
  autosize?: boolean;
  /** Kun for type="select": alternativene i nedtrekkslisten. */
  data?: ComboboxData;
  /** Kun for type="number": nedre/øvre grense og maks antall desimaler. Negative tall er alltid avslått. */
  min?: number;
  max?: number;
  decimalScale?: number;
  extra?: React.ReactNode;
}

export const FormField = ({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  span = 12,
  minRows = 8,
  maxRows = 16,
  autosize = true,
  data,
  min,
  max,
  decimalScale,
  extra,
}: FormFieldProps) => {
  const form = useAppFormContext();

  let InputComponent: React.ElementType = TextInput;
  if (type === "password") InputComponent = PasswordInput;
  if (type === "textarea") InputComponent = Textarea;
  if (type === "select") InputComponent = Select;
  if (type === "number") InputComponent = NumberInput;

  return (
    <Grid.Col span={span}>
      <InputComponent
        label={label}
        placeholder={placeholder}
        withAsterisk={required}
        disabled={disabled}
        {...(type === "textarea" ? { minRows, maxRows, autosize } : {})}
        {...(type === "select" ? { data, allowDeselect: false } : {})}
        {...(type === "number" ? { min, max, decimalScale, ...norwegianNumberProps } : {})}
        key={form.key(name)}
        {...form.getInputProps(name)}
      />
      {extra}
    </Grid.Col>
  );
};
