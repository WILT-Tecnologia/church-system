import { useSearchCep } from "@/hooks/useSearchCep";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "../../schema";

type Schema = z.infer<typeof schema>;

export default function usePersonForm() {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const {
    control,
    register,
    setValue,
    setError,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      // user_id: "",
      // church_id: "",
      name: "",
      cpf: "",
      email: "",
      sex: "",
      phone_one: "",
      phone_two: "",
      birth_date: "",
      // rg: "",
      // issuing_body: "",
      // civil_status: "",
      // formation: "",
      // profission: "",
      // possuiDef: "",
      // def_physics: "",
      // def_mental: "",
      // def_visual: "",
      // def_hearing: "",
      // def_intellectual: "",
      // def_multiple: "",
      // def_other: "",
      // def_other_description: "",
      // color_race: "",
      // father_name: "",
      // mother_name: "",
      // wedding_date: "",
      // wife_name: "",
      // wife_is_member: "",
      // number_children: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      complement: "",
      city: "",
      state: "",
      //country: "",
      nationality_id: "",
      naturalness: "",
      // baptism_date: "",
      // baptism_local: "",
      // baptism_person_performed: "",
      // baptism_holy_spirit: "",
      // baptism_holy_spirit_date: "",
      // member_origin_id: "",
      // receipt_date: "",
    },
  });

  const streetValue = watch("street");
  const neighborhoodValue = watch("neighborhood");
  const cityValue = watch("city");
  const stateValue = watch("state");

  // const possuiDef = watch("possuiDef");
  // const baptismHolySpirit = watch("baptism_holy_spirit");

  const handleCepChange = async (cep: string) => {
    if (loadingRef.current) {
      loadingRef.current.style.display = "block";
    }

    try {
      const data = await useSearchCep(cep);
      setValue("street", data.street || data.logradouro || "");
      setValue("neighborhood", data.neighborhood || data.bairro || "");
      setValue("city", data.city || data.cidade || "");
      setValue("state", data.state || data.estado || "");
    } catch (err) {
      setError("cep", { type: "manual", message: "CEP não encontrado." });
      setValue("street", "");
      setValue("neighborhood", "");
      setValue("city", "");
      setValue("state", "");
    } finally {
      if (loadingRef.current) {
        loadingRef.current.style.display = "none";
      }
    }
  };

  const onSubmit: SubmitHandler<Schema> = async (data: Schema) => {
    console.log(data);
  };

  const handleBack = () => {
    return router.back();
  };

  return {
    streetValue,
    neighborhoodValue,
    cityValue,
    stateValue,
    // possuiDef,
    // baptismHolySpirit,
    loadingRef,
    control,
    errors,
    isSubmitting,
    watch,
    setValue,
    Controller,
    register,
    handleCepChange,
    onSubmit,
    handleSubmit,
    handleBack,
  };
}
