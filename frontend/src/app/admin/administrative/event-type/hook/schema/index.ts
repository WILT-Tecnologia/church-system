import { z } from "zod";

export const useEventTypeFormSchema = z.object({
  church_id: z
    .string({ required_error: "Campo obrigatório." })
    .min(1, { message: "Campo obrigatório." }),
  name: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho maximo de 255 caracteres." }),
  description: z
    .string()
    .max(255, { message: "Tamanho maximo de 255 caracteres." }),
  status: z.boolean().optional(),
});
