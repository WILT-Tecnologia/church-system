'use client';

import BasicTabs from '@/components/Tabs/Tab';
import { Box, Card } from '@mui/material';
import ShowPerson from './person/show/page';

export default function Administrative() {
  const tabs = [
    {
      label: 'Pessoas',
      content: <ShowPerson />,
    },
    {
      label: 'Igrejas',
      content: 'Igrejas',
    },
    {
      label: 'Usuários',
      content: 'Usuários',
    },
    {
      label: 'Cargos',
      content: 'Cargos',
    },
  ];

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Card
        variant="elevation"
        sx={{ backgroundColor: '#ffffff', width: '100%' }}
      >
        <BasicTabs tabs={tabs} />
      </Card>
    </Box>
  );
}
