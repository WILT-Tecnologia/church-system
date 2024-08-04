import { z } from "zod";

export const schema = z.object({
  user_id: z.string().min(1, { message: "Campo obrigatório." }),
  image: z.string(),
  name: z.string().min(1, { message: "Campo obrigatório." }),
  cpf: z.string().min(1, { message: "Campo obrigatório." }),
  email: z.string().email({ message: "Email inválido." }).min(1, {
    message: "Campo obrigatório.",
  }),
  birth_date: z.string().min(1, { message: "Campo obrigatório." }),
  sex: z.string().min(1, { message: "Campo obrigatório." }),
  phone_one: z.string().min(1, { message: "Campo obrigatório." }),
  phone_two: z.string(),
  cep: z.string().min(1, { message: "Campo obrigatório." }),
  street: z.string().min(1, { message: "Campo obrigatório." }),
  number: z
    .string()
    .min(1, { message: "Campo obrigatório." })
    .max(8, { message: "Tamanho excedido (8)." }),
  neighborhood: z.string().min(1, { message: "Campo obrigatório." }),
  complement: z.string().max(255, {
    message: "Tamanho excedido (255).",
  }),
  city: z.string().min(1, { message: "Campo obrigatório." }),
  state: z.string().min(1, { message: "Campo obrigatório." }),
  country: z.string().min(1, { message: "Campo obrigatório." }),
  nationality_id: z.string().min(1, { message: "Campo obrigatório." }),
  naturalness: z.string().min(1, { message: "Campo obrigatório." }),
});
