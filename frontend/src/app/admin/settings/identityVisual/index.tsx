"use client";

import ContainerIdentityVisual from "@/components/IdentityVisual/ContainerIdentityVisual";
import useFetchPrimaryColor from "@/requests/queries/FetchPrimaryColor";
import { Help as HelpIcon, Palette as PaletteIcon } from "@mui/icons-material";
import {
  Button,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { ChromePicker } from "react-color";
import Logo from "../../../../../public/assets/storage/app/public/example.png";
import * as S from "./styles";

export default function IdentityVisual() {
  const primaryColor = useFetchPrimaryColor();
  const [statePicker, setStatePicker] = useState(false);
  const [stateColor, setStateColor] = useState(primaryColor);

  const handleOpenSetColor = () => {
    setStatePicker((prevState) => !prevState);
  };

  const handleSetColor = (color: any) => {
    setStateColor(color.hex);
  };

  const handleReset = () => {
    setStateColor(primaryColor);
  };

  return (
    <form>
      {/* Logo */}
      <ContainerIdentityVisual>
        <S.Identity>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Logo
            <Tooltip
              color="primary"
              title="A dimensão recomendada é de 165 x 45 pixels com o formato SVG, WEBP, JPEG ou PNG de no mínimo 2MB. Imagens com dimensões diferentes serão redimensionadas."
            >
              <IconButton size="small">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <Image src={Logo} width={165} height={45} quality={80} alt="logo" />
        </S.Identity>
        <S.CTA>
          <Button color="primary" size="large" variant="outlined" fullWidth>
            Trocar
          </Button>
        </S.CTA>
      </ContainerIdentityVisual>

      {/* Favicon */}
      <ContainerIdentityVisual>
        <S.Identity>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Favicon
            <Tooltip
              color="primary"
              title="A dimensão recomendada é de 32 x 32 pixels com o formato SVG, WEBP, JPEG ou PNG de no máximo 2MB. Imagens com dimensões diferentes serão redimensionadas."
            >
              <IconButton size="small">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <Image src={Logo} width={32} height={32} quality={80} alt="Favicon" />
        </S.Identity>
        <S.CTA>
          <Button color="primary" size="large" variant="outlined" fullWidth>
            Trocar
          </Button>
        </S.CTA>
      </ContainerIdentityVisual>

      {/* Cor */}
      <ContainerIdentityVisual>
        <S.Identity>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Cor
            <Tooltip
              color="primary"
              title="A definição da cor norteará a identidade visual do sistema inteiro, entre títulos, botões e demais ícones."
            >
              <IconButton size="small">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <S.ColorPicker>
            <TextField
              id="color"
              type="text"
              label="Cor"
              value={stateColor}
              onChange={() => {}}
              variant="filled"
              disabled
              aria-readonly
              required
              hidden
              fullWidth
            />
            <IconButton
              size="large"
              onClick={handleOpenSetColor}
              style={{ color: stateColor }}
            >
              <PaletteIcon
                width={54}
                height={54}
                style={{ color: stateColor }}
              />
            </IconButton>
          </S.ColorPicker>
          {statePicker && (
            <ChromePicker
              color={stateColor}
              onChange={handleSetColor}
              onChangeComplete={handleSetColor}
              styles={{
                default: {
                  body: {
                    fontFamily: "Poppins, sans-serif",
                  },
                },
              }}
            />
          )}
        </S.Identity>
      </ContainerIdentityVisual>

      {/* Background */}
      <ContainerIdentityVisual>
        <S.Identity>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Imagem de fundo
            <Tooltip
              color="primary"
              title="A dimensão recomendada é de 1920 x 1080 pixels com o formato SVG, WEBP, JPEG ou PNG de no mínimo 5MB. Imagens com dimensões diferentes serão redimensionadas."
            >
              <IconButton size="small">
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          <Image src={Logo} width={192} height={108} quality={80} alt="logo" />
        </S.Identity>
        <S.CTA>
          <Button color="primary" size="large" variant="outlined" fullWidth>
            Trocar
          </Button>
        </S.CTA>
      </ContainerIdentityVisual>

      <Divider />

      {/* CTA */}
      <S.ContainerCTAConclusive>
        <S.LastAlteration variant="subtitle2">
          Última alteração em 25/04/2022 às 22:00 por Peixola
        </S.LastAlteration>
        <S.Buttons>
          <Button
            type="reset"
            color="inherit"
            size="large"
            variant="outlined"
            fullWidth
            onClick={handleReset}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            size="large"
            variant="contained"
            type="submit"
            fullWidth
          >
            Salvar
          </Button>
        </S.Buttons>
      </S.ContainerCTAConclusive>
    </form>
  );
}
