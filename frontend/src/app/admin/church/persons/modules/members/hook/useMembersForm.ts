import { MemberCrudSteps } from "@/utils/steps";
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

  const [currentStep, setCurrentStep] = useState(1);
  const [open, setOpen] = useState(false);

  const canGoToPrevStep = currentStep > 1;
  const canGoToNextStep = currentStep < MemberCrudSteps.length;

  const getFieldsByStep = (step: number): (keyof Schema)[] => {
    switch (step) {
      case 1:
        return [
          "rg",
          "issuing_body",
          "civil_status",
          "nationality",
          "naturalness",
        ];
      case 2:
        return [
          "color_race",
          "profission",
          "formation_course",
          "formation",
          "def_hearing",
          "def_intellectual",
          "def_mental",
          "def_multiple",
          "def_other",
          "def_other_description",
          "def_physics",
          "def_visual",
        ];
      case 3:
        return [
          "church_id",
          "baptism_date",
          "baptism_local",
          "baptism_officializing",
          "member_origin",
          "receiving_date",
          "baptism_holy_spirit",
          "baptism_holy_spirit_date",
        ];
      default:
        return [];
    }
  };

  const goToNextStep = async () => {
    const fieldsToValidate = getFieldsByStep(currentStep);
    const isStepValid = await methods.trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
    return isStepValid;
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  const onSubmit: SubmitHandler<Schema> = (data: Schema) => {
    console.log("data submitted: ", data);
    setOpen(true);
  };

  const handleNext = async () => {
    const isStepValid = await goToNextStep();
    if (isStepValid) {
      await methods.handleSubmit(onSubmit)();
    }
  };

  const handleConfirm = async () => {
    await methods.handleSubmit(onSubmit)();
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

  const watchedValues = methods.watch();
  console.log(watchedValues);

  return {
    ...methods,
    currentStep,
    open,
    canGoToPrevStep,
    canGoToNextStep,
    def_otherValue,
    baptism_holy_spiritValue,
    router,
    Controller,
    goToNextStep,
    goToPrevStep,
    onSubmit,
    handleClose,
    handleBack,
    handleNext,
    handleConfirm,
    handleChuchChange,
  };
};

export default useMembersForm;
