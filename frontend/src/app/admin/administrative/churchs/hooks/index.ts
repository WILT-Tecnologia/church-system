"use client";

import { useSearchCep } from "@/hooks/useSearchCep";
import { Interpole } from "@/utils/Interpole";
import { churchs } from "@/utils/mocks";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectChangeEvent } from "@mui/material";
import { GridRowModesModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./schema";

type Schema = z.infer<typeof schema>;

export default function useChurchForm() {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const router = useRouter();

  const {
    control,
    register,
    setValue,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<Schema>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      site: "",
      responsible_id: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
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
    const { ...otherFields } = data;
    const [cnpjLimpo, cepLimpo] = Interpole(otherFields.cnpj, otherFields.cep);

    const updatedData = {
      ...otherFields,
      cnpj: cnpjLimpo,
      cep: cepLimpo,
    };

    console.log(updatedData);
  };

  const handleChangeShepherd = (event: SelectChangeEvent) => {
    setValue("responsible_id", event.target.value as string);
  };

  const handleBack = () => {
    router.back();
  };

  return {
    loadingRef,
    control,
    errors,
    isSubmitting,
    streetValue,
    neighborhoodValue,
    cityValue,
    stateValue,
    isLoading,
    rowModesModel,
    churchs,
    setValue,
    watch,
    register,
    onSubmit,
    handleSubmit,
    handleBack,
    handleCepChange,
    handleChangeShepherd,
    setRowModesModel,
  };
}
