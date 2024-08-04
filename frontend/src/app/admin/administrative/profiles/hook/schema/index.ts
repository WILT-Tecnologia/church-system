import { z } from "zod";

export const useProfilesFormSchema = z.object({
  user_id: z.string(),
  name: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  description: z.string().max(255, { message: "Tamanho excedido (255)." }),
  status: z.boolean(),
});
