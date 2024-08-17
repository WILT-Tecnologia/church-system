"use client";

import CustomTabs from "@/components/Tabs";
import { Card } from "@mui/material";

import ShowPersons from "./persons/show/page";

import ShowRegistrations from "./registrations/show/page";
import * as S from "./styles";
import ShowTasks from "./tasks/show/page";

const ChurchPage = () => {
  return (
    <S.Wrapper>
      <Card variant="outlined">
        <CustomTabs
          labels={[
            "Tarefas",
            "Pessoas",
            "Cadastros",
            "Financeiro",
            "Secretaria",
            "Relatórios",
          ]}
        >
          <ShowTasks />
          <ShowPersons />
          <ShowRegistrations />
        </CustomTabs>
      </Card>
    </S.Wrapper>
  );
};

export default ChurchPage;
