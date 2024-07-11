import { z } from "zod";

export const schema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "A senha é muito curta." })
    .max(255, { message: "A senha é muito longa (255)." }),
});
