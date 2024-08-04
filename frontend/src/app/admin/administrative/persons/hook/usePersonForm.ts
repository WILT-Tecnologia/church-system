import { useSearchCep } from "@/hooks/useSearchCep";
import { persons } from "@/utils/mocks";
import { zodResolver } from "@hookform/resolvers/zod";
import { GridRowModesModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "../hook/schema";

type Schema = z.infer<typeof schema>;

export default function usePersonForm() {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const router = useRouter();
  const {
    control,
    register,
    setValue,
    setError,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<Schema>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: "",
      image: "",
      name: "",
      cpf: "",
      email: "",
      sex: "",
      phone_one: "",
      phone_two: "",
      birth_date: "",
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      complement: "",
      city: "",
      state: "",
      country: "",
      nationality_id: "",
      naturalness: "",
    },
  });

  const streetValue = watch("street");
  const neighborhoodValue = watch("neighborhood");
  const cityValue = watch("city");
  const stateValue = watch("state");

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
    loadingRef,
    control,
    errors,
    isSubmitting,
    persons,
    isLoading,
    rowModesModel,
    watch,
    setValue,
    Controller,
    register,
    handleCepChange,
    onSubmit,
    handleSubmit,
    handleBack,
    setRowModesModel,
  };
}
