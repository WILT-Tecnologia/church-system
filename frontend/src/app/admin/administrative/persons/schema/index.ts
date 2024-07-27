import { z } from "zod";

export const schema = z.object({
  // user_id: z.string().min(1, { message: "Campo obrigatório." }),
  // church_id: z.string().min(1, { message: "Campo obrigatório." }),
  name: z.string().min(1, { message: "Campo obrigatório." }),
  cpf: z.string().min(1, { message: "Campo obrigatório." }),
  email: z.string().email({ message: "Email inválido." }).min(1, {
    message: "Campo obrigatório.",
  }),
  birth_date: z.string().min(1, { message: "Campo obrigatório." }),
  sex: z.string().min(1, { message: "Campo obrigatório." }),
  phone_one: z.string().min(1, { message: "Campo obrigatório." }),
  phone_two: z.string(),
  // rg: z.string().min(1, { message: "Campo obrigatório." }),
  // issuing_body: z.string().min(1, { message: "Campo obrigatório." }),
  // civil_status: z.string().min(1, { message: "Campo obrigatório." }),
  // formation: z.string().min(1, { message: "Campo obrigatório." }),
  // profission: z.string().min(1, { message: "Campo obrigatório." }),
  // possuiDef: z.string().min(1, { message: "Campo obrigatório." }),
  // def_physics: z.string().min(1, { message: "Campo obrigatório." }),
  // def_mental: z.string().min(1, { message: "Campo obrigatório." }),
  // def_visual: z.string().min(1, { message: "Campo obrigatório." }),
  // def_hearing: z.string().min(1, { message: "Campo obrigatório." }),
  // def_intellectual: z.string().min(1, { message: "Campo obrigatório." }),
  // def_multiple: z.string().min(1, { message: "Campo obrigatório." }),
  // def_other: z.string().min(1, { message: "Campo obrigatório." }),
  // def_other_description: z.string().max(255, {
  //   message: "Tamanho excedido (255).",
  // }),
  // color_race: z.string().min(1, { message: "Campo obrigatório." }),
  // father_name: z.string(),
  // mother_name: z.string().min(1, { message: "Campo obrigatório." }),
  // wedding_date: z.string().min(1, { message: "Campo obrigatório." }),
  // wife_name: z.string().min(1, { message: "Campo obrigatório." }),
  // wife_is_member: z.string().min(1, { message: "Campo obrigatório." }),
  // number_children: z.string().min(1, { message: "Campo obrigatório." }),
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
  //country: z.string().min(1, { message: "Campo obrigatório." }),
  nationality_id: z.string().min(1, { message: "Campo obrigatório." }),
  naturalness: z.string().min(1, { message: "Campo obrigatório." }),
  // baptism_date: z.string().min(1, { message: "Campo obrigatório." }),
  // baptism_local: z.string().min(1, { message: "Campo obrigatório." }),
  // baptism_person_performed: z
  //   .string()
  //   .min(1, { message: "Campo obrigatório." }),
  // baptism_holy_spirit: z.string().min(1, { message: "Campo obrigatório." }),
  // baptism_holy_spirit_date: z
  //   .string()
  //   .min(1, { message: "Campo obrigatório." }),
  // member_origin_id: z.string().min(1, { message: "Campo obrigatório." }),
  // receipt_date: z.string().min(1, { message: "Campo obrigatório." }),
});
