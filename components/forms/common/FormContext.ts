"use client";

import { createFormContext } from "@mantine/form";

export const [AppFormProvider, useAppFormContext, useAppForm] = createFormContext<unknown>();
