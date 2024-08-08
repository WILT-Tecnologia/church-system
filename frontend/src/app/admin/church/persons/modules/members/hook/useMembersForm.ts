import { zodResolver } from "@hookform/resolvers/zod";
import { SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schemaMembers } from "./schema";

type Schema = z.infer<typeof schemaMembers>;

const useMembersForm = () => {
  const router = useRouter();
  const methods = useForm<Schema>({
    resolver: zodResolver(schemaMembers),
    mode: "all",
    criteriaMode: "all",
    reValidateMode: "onSubmit",
    defaultValues: {
      church_id: "",
      rg: "",
      issuing_body: "",
      civil_status: "",
      nationality: "",
      naturalness: "",
      color_race: "",
      formation: "",
      formation_course: "",
      profission: "",
      def_physics: false,
      def_visual: false,
      def_hearing: false,
      def_intellectual: false,
      def_mental: false,
      def_multiple: false,
      def_other: false,
      def_other_description: "",
      baptism_date: "",
      baptism_local: "",
      baptism_officializing: "",
      baptism_holy_spirit: false,
      baptism_holy_spirit_date: "",
      member_origin: "",
      receiving_date: "",
    },
  });

  const [open, setOpen] = useState(false);

  const onSubmit: SubmitHandler<Schema> = (data: Schema) => {
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    router.refresh();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const field_booleans = methods.watch(["def_other", "baptism_holy_spirit"]);
  const def_otherValue = Boolean(field_booleans[0]);
  const baptism_holy_spiritValue = Boolean(field_booleans[1]);

  const handleBack = () => {
    return router.back();
  };

  const handleChuchChange = (event: SelectChangeEvent) => {
    methods.setValue("church_id", event.target.value as string);
  };

  return {
    ...methods,
    open,
    def_otherValue,
    baptism_holy_spiritValue,
    router,
    Controller,
    onSubmit,
    handleClose,
    handleBack,
    handleConfirm,
    handleChuchChange,
  };
};

export default useMembersForm;
