import { FormattedUsers } from "@/model/User";
import { listUsers } from "@/requests/queries/users";
import { profiles, users } from "@/utils/mocks";
import { zodResolver } from "@hookform/resolvers/zod";
import { GridRowId, GridRowModesModel } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schemaUsers } from "./schema";

type Schema = z.infer<typeof schemaUsers>;
type User = typeof users;

const useUsersForm = (initialData?: Schema) => {
  const [rows, setRows] = useState<FormattedUsers[]>([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [userData, setUserData] = useState<User | any>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const {
    data: users,
    isError,
    refetch,
  } = useQuery<FormattedUsers[]>({
    queryKey: ["get-users"],
    queryFn: () => listUsers(),
  });

  useEffect(() => {
    if (users) {
      setRows(users);
    }
  }, [users]);

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

  const handleEditClick = (id: GridRowId) => async () => {
    const userToEdit = rows.find((row) => row.id === id);
    if (userToEdit) {
      setOpenPopup(true);
      //setUserToEdit(userToEdit);
    }
  };

  const handleDeleteClick = (id: GridRowId) => async () => {
    try {
      const userToDelete = rows.find((row) => row.id === id);
      if (userToDelete) {
        //confirmDelete(userToDelete);
        const updatedRows = rows.filter((row) => row.id !== id);
        setRows(updatedRows);
      }
    } catch (error) {
      console.error(error);
    } finally {
      refetch();
    }
  };

  const onSubmit: SubmitHandler<Schema> = async (data: Schema) => {
    console.log(data);
  };

  const handleBack = () => {
    return router.back();
  };

  return {
    loadingRef,
    isError,
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
    rows,
    setRows,
    setRowModesModel,
    watch,
    setValue,
    Controller,
    register,
    onSubmit,
    handleSubmit,
    handleBack,
    handleEditClick,
    handleDeleteClick,
    handleClickShowPassword,
    handleMouseDownPassword,
  };
};

export default useUsersForm;
