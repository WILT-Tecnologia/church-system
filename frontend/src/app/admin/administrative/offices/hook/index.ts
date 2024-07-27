import { zodResolver } from "@hookform/resolvers/zod";
import { GridRowModesModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useOfficesFormSchema } from "./schema";

type Schema = z.infer<typeof useOfficesFormSchema>;

export default function useOfficesForm() {
  const [showPassword, setShowPassword] = useState(false);
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
  } = useForm({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(useOfficesFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: true,
    },
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const onSubmit: SubmitHandler<Schema> = async (data: Schema) => {
    console.log(data);
  };

  const handleBack = () => {
    return router.back();
  };

  return {
    loadingRef,
    control,
    errors,
    isSubmitting,
    showPassword,
    isLoading,
    rowModesModel,
    setRowModesModel,
    watch,
    setValue,
    Controller,
    register,
    onSubmit,
    handleSubmit,
    handleBack,
    handleClickShowPassword,
    handleMouseDownPassword,
  };
}
