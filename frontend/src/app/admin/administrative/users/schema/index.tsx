import { z } from "zod";

export const schemaUsers = z.object({
  login: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  password: z
    .string()
    .min(8, { message: "Mínimo de 8 dígitos." })
    .max(255, { message: "Tamanho excedido (255)." }),
  change_password: z.boolean(),
  status: z.boolean(),
  //profile: z.string(),
});
