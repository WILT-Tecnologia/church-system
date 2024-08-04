import { profiles, users } from "@/utils/mocks";
import { zodResolver } from "@hookform/resolvers/zod";
import { GridRowModesModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schemaUsers } from "./schema";

type Schema = z.infer<typeof schemaUsers>;
type User = typeof users;

const useUsersForm = (initialData?: Schema) => {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [userData, setUserData] = useState<User | any>(null);
  const router = useRouter();

  // Simula a obtenção de dados para edição
  useEffect(() => {
    const userId = new URLSearchParams(window.location.search).get("id");
    if (userId) {
      const user = users.find((user) => user.id === userId);
      if (user) {
        setUserData(user);
      }
    }
  }, []);

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
    resolver: zodResolver(schemaUsers),
    defaultValues: initialData || {
      login: "",
      password: "",
      change_password: true,
      status: true,
      is_view_admin: false,
      profile: "",
    },
  });

  useEffect(() => {
    if (userData) {
      setValue("login", userData.login);
      setValue("password", userData.password);
      setValue("change_password", userData.change_password);
      setValue("status", userData.status);
      setValue("is_view_admin", userData.is_view_admin);
      setValue("profile", userData.profile);
    }
  }, [userData, setValue]);

  const changePasswordValue = watch("change_password");

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
    rowModesModel,
    isLoading,
    changePasswordValue,
    users,
    profiles,
    userData,
    router,
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
};

export default useUsersForm;
