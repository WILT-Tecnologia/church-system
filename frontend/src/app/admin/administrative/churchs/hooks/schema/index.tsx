import { z } from "zod";

export const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  cnpj: z
    .string()
    .min(14, { message: "Campo obrigatório." })
    .max(18, { message: "Tamanho excedido (18)." }),
  email: z
    .string()
    .email({ message: "Email inválido." })
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  site: z.string().url({ message: "URL inválida." }),
  responsible_id: z.string().min(1, { message: "Campo obrigatório." }),
  cep: z.string().min(8, { message: "Campo obrigatório." }),
  street: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  number: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  complement: z.string().max(255, { message: "Tamanho excedido (255)." }),
  neighborhood: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  city: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
  state: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(255, { message: "Tamanho excedido (255)." }),
});
