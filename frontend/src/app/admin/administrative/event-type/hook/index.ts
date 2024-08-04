import { eventType } from "@/utils/mocks";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectChangeEvent } from "@mui/material";
import { GridRowModesModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useEventTypeFormSchema } from "./schema";

type Schema = z.infer<typeof useEventTypeFormSchema>;

export default function useEventTypeForm() {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const router = useRouter();

  const {
    control,
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<Schema>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(useEventTypeFormSchema),
    defaultValues: {
      church_id: "",
      name: "",
      description: "",
      status: true,
    },
  });

  const onSubmit: SubmitHandler<Schema> = async (data: Schema) => {
    console.log(data);
  };

  const handleBack = () => {
    return router.back();
  };

  const handleChangeSelect = (event: SelectChangeEvent) => {
    setValue("church_id", event.target.value as string);
  };

  return {
    loadingRef,
    control,
    errors,
    isSubmitting,
    isLoading,
    rowModesModel,
    eventType,
    setRowModesModel,
    watch,
    handleBack,
    onSubmit,
    register,
    setValue,
    handleSubmit,
    handleChangeSelect,
    Controller,
  };
}
