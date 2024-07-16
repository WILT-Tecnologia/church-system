"use client";

import { useSearchCep } from "@/hooks/useSearchCep";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./schema";

type Schema = z.infer<typeof schema>;

export default function useGeneralSettingsForm() {
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<Schema>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const streetValue = watch("street");
  const neighborhoodValue = watch("neighborhood");
  const cityValue = watch("city");
  const stateValue = watch("state");

  const handleCepChange = async (cep: string | any) => {
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

  return {
    loadingRef,
    register,
    control,
    handleSubmit,
    errors,
    isSubmitting,
    watch,
    handleCepChange,
    streetValue,
    neighborhoodValue,
    cityValue,
    stateValue,
    onSubmit,
  };
}
