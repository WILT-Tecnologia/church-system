'use client';

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-zinc-600 text-white flex flex-col justify-center items-center gap-8 h-screen">
      <p className="text-6xl font-bold">Não encontrada</p>
      <p className="text-2xl">Sorry, this page does not exist 🥺</p>
      <Button color="primary" variant="contained" onClick={handleBack}>
        Retornar a página inicial
      </Button>
    </div>
  );
}
