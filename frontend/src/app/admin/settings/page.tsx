"use client";

import CustomTabs from "@/components/Tabs";
import { Card } from "@mui/material";
import GeneralSettings from "./general";
import IdentityVisual from "./identityVisual";
import * as S from "./identityVisual/styles";

const SettingsPage = () => {
  return (
    <S.Wrapper>
      <Card variant="outlined">
        <CustomTabs labels={["Geral", "Identidade visual"]}>
          <GeneralSettings />
          <IdentityVisual />
        </CustomTabs>
      </Card>
    </S.Wrapper>
  );
};

export default SettingsPage;
