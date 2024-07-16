import { z } from "zod";

export const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .email({ message: "Email inválido." }),
  password: z
    .string({ required_error: "Campo obrigatório." })
    .min(8, { message: "A senha é muito curta." })
    .max(255, { message: "A senha é muito longa (255)." }),
});
