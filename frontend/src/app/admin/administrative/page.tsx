"use client";

import CustomTabs from "@/components/Tabs";
import { Card } from "@mui/material";
import ChurchShow from "./churchs/show/page";
import Offices from "./offices/show/page";
import Persons from "./persons/show/page";
import Profiles from "./profiles/show/page";
import Reports from "./reports/show/page";
import * as S from "./styles";
import Users from "./users/show/page";

const Administrative = () => {
  return (
    <S.Wrapper>
      <Card variant="outlined">
        <CustomTabs
          labels={[
            "Igrejas",
            "Pessoas",
            "Usuários",
            "Cargos",
            "Perfis",
            "Relatórios",
          ]}
        >
          <ChurchShow />
          <Persons />
          <Users />
          <Offices />
          <Profiles />
          <Reports />
        </CustomTabs>
      </Card>
    </S.Wrapper>
  );
};

export default Administrative;
