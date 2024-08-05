"use client";

import * as S from "@/app/admin/church/styles";
import { churchs } from "@/utils/mocks";
import { MemberCrudSteps } from "@/utils/steps";
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grow,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import useMembersForm from "../hook/useMembersForm";

const MemberForm = () => {
  const media = useMediaQuery("(min-width: 768px)");

  const {
    open,
    control,
    currentStep,
    canGoToPrevStep,
    canGoToNextStep,
    def_otherValue,
    baptism_holy_spiritValue,
    Controller,
    register,
    goToNextStep,
    goToPrevStep,
    handleSubmit,
    onSubmit,
    handleClose,
    handleNext,
    handleConfirm,
    handleChuchChange,
    formState: { errors, isSubmitting },
  } = useMembersForm();

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <>
            <S.Inputs>
              <TextField
                type="text"
                label="RG"
                {...register("rg")}
                error={!!errors.rg}
                helperText={errors.rg?.message}
                disabled={isSubmitting}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                type="text"
                label="Orgão Emissor"
                {...register("issuing_body")}
                error={!!errors.issuing_body}
                helperText={errors.issuing_body?.message}
                disabled={isSubmitting}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                label="Estado Civil"
                {...register("civil_status")}
                disabled={isSubmitting}
                error={!!errors.civil_status}
                helperText={errors.civil_status?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
            <S.Inputs>
              <TextField
                label="Nacionalidade"
                {...register("nationality")}
                disabled={isSubmitting}
                error={!!errors.nationality}
                helperText={errors.nationality?.message}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                label="Naturalidade"
                {...register("naturalness")}
                disabled={isSubmitting}
                error={!!errors.naturalness}
                helperText={errors.naturalness?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
          </>
        );
      case 2:
        return (
          <>
            <S.Inputs>
              <TextField
                label="Cor/Raça"
                {...register("color_race")}
                error={!!errors.color_race}
                helperText={errors.color_race?.message}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                label="Profissão"
                {...register("profission")}
                error={!!errors.profission}
                helperText={errors.profission?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
            <S.Inputs>
              <TextField
                label="Curso"
                {...register("formation_course")}
                error={!!errors.formation_course}
                helperText={errors.formation_course?.message}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                label="Formação"
                {...register("formation")}
                error={!!errors.formation}
                helperText={errors.formation?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
            <Divider />
            <Typography
              variant={media ? "h5" : "h6"}
              color="primary"
              sx={{ my: "1rem", fontWeight: "bold" }}
            >
              Possui alguma deficiência?
            </Typography>
            <Typography variant="subtitle2" color="gray">
              Selecione as deficiências que o membro possui!
            </Typography>
            <S.Inputs>
              <Controller
                name="def_physics"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência Física"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
              <Controller
                name="def_visual"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência Visual"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
              <Controller
                name="def_hearing"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência Auditiva"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
            </S.Inputs>
            <S.Inputs>
              <Controller
                name="def_intellectual"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência Intelectual"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
              <Controller
                name="def_mental"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência mental"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
              <Controller
                name="def_multiple"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Deficiência Multipla"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
            </S.Inputs>
            <S.Inputs>
              <Controller
                name="def_other"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Outra deficiência"
                    control={
                      <Checkbox
                        {...field}
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
            </S.Inputs>
            <S.Inputs>
              {def_otherValue && (
                <Grow in={def_otherValue} style={{ transformOrigin: "1 1 1" }}>
                  <TextField
                    label="Descrição da deficiência"
                    {...register("def_other_description")}
                    error={!!errors.def_other_description}
                    helperText={errors.def_other_description?.message}
                    variant="filled"
                    required={!!def_otherValue}
                    fullWidth
                    multiline
                    rows={5}
                    sx={{
                      width: media ? "45%" : "100%",
                    }}
                  />
                </Grow>
              )}
            </S.Inputs>
          </>
        );
      case 3:
        return (
          <>
            <S.Inputs>
              <Controller
                name="baptism_holy_spirit"
                control={control}
                render={({ field }) => (
                  <FormControl {...field} fullWidth required variant="filled">
                    <InputLabel id="church_id">Igreja</InputLabel>
                    <Select
                      labelId="church_id"
                      id="church_id"
                      label="Igreja"
                      variant="filled"
                      {...register("church_id")}
                      onChange={handleChuchChange}
                      error={!!errors.church_id}
                      fullWidth
                    >
                      {churchs.map((church) => (
                        <MenuItem
                          key={`${church.id}-${church.name}`}
                          value={church.id}
                        >
                          {church.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText error={!!errors.church_id}>
                      {errors.church_id?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </S.Inputs>
            <S.Inputs>
              <TextField
                label="Data do Batismo"
                type="date"
                {...register("baptism_date")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.baptism_date}
                helperText={errors.baptism_date?.message}
                variant="filled"
                required
                fullWidth
              />
              <TextField
                label="Local do Batismo"
                {...register("baptism_local")}
                error={!!errors.baptism_local}
                helperText={errors.baptism_local?.message}
                variant="filled"
                required
                fullWidth
              />

              <TextField
                label="Oficializante do Batismo"
                {...register("baptism_officializing")}
                error={!!errors.baptism_officializing}
                helperText={errors.baptism_officializing?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
            <S.Inputs>
              <TextField
                label="Origem do Membro"
                {...register("member_origin")}
                error={!!errors.member_origin}
                helperText={errors.member_origin?.message}
                variant="filled"
                fullWidth
              />
              <TextField
                label="Data de Recebimento"
                type="date"
                {...register("receiving_date")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.receiving_date}
                helperText={errors.receiving_date?.message}
                variant="filled"
                required
                fullWidth
              />
            </S.Inputs>
            <S.Inputs>
              <Controller
                name="baptism_holy_spirit"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="Batizado com o Espírito Santo"
                    control={
                      <Checkbox
                        checked={!!field.value}
                        disabled={isSubmitting}
                      />
                    }
                  />
                )}
              />
              {baptism_holy_spiritValue && (
                <Grow
                  in={!!baptism_holy_spiritValue}
                  style={{ transformOrigin: "1 1 1" }}
                >
                  <TextField
                    label="Data do batismo com o Espírito Santo"
                    type="date"
                    {...register("baptism_holy_spirit_date")}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.baptism_holy_spirit_date}
                    helperText={errors.baptism_holy_spirit_date?.message}
                    variant="filled"
                    required
                    sx={{ width: media ? "30%" : "100%" }}
                  />
                </Grow>
              )}
            </S.Inputs>
          </>
        );
      default:
        return <div>Erro: Passo inválido</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <S.Wrapper>
        <Card variant="elevation" sx={{ p: 3 }}>
          <Typography
            variant={media ? "h4" : "h5"}
            color="primary"
            sx={{ my: "1rem", fontWeight: "bold", textAlign: "center" }}
          >
            Criação de membro
            {/* {userData ? "Edição de usuário" : "Criação de usuário"} */}
          </Typography>
          <Typography
            variant="subtitle2"
            color="gray"
            sx={{ my: "1rem", fontWeight: "bold", textAlign: "center" }}
          >
            Informações básicas de identificação do membro.
          </Typography>
          <Stepper
            orientation="horizontal"
            activeStep={currentStep}
            alternativeLabel
          >
            {MemberCrudSteps.map((label: string, index: number) => (
              <Step active={currentStep === index} key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grow in>
            <div>{renderStepContent(currentStep)}</div>
          </Grow>
          <Divider />
          <S.CTA>
            <Button
              variant="outlined"
              disabled={!canGoToPrevStep}
              onClick={goToPrevStep}
            >
              Voltar
            </Button>
            {currentStep === MemberCrudSteps.length ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={handleNext}>
                Próximo
              </Button>
            )}
          </S.CTA>

          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirmação de Cadastro"}
            </DialogTitle>
            <DialogContent>
              <Typography>
                Tem certeza de que deseja salvar os dados?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancelar
              </Button>
              <Button color="primary" autoFocus>
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      </S.Wrapper>
    </form>
  );
};

export default MemberForm;
