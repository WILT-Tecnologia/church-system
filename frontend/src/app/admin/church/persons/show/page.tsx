import * as S from "@/app/admin/church/styles";
import CustomTabs from "@/components/Tabs";
import { Card } from "@mui/material";
import ShowGuests from "../modules/guests/page";
import ShowMembers from "../modules/members/show/page";

export default function ShowPersons() {
  return (
    <S.WrapperChidlren>
      <Card variant="outlined">
        <CustomTabs labels={["Membros", "Convidados"]}>
          <ShowMembers />
          <ShowGuests />
        </CustomTabs>
      </Card>
    </S.WrapperChidlren>
  );
}
