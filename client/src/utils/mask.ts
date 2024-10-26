type Sex = {
  M: 'Masculino';
  F: 'Feminino';
};

export const Sex = (value: string) => {
  if (!value) return '';
  if (value.toUpperCase() === 'M') return 'Masculino';
  if (value.toUpperCase() === 'F') return 'Feminino';
  return value;
};

export const maskCpf = (value: string) => {
  if (value.length <= 11) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
};

export const maskPhone = (value: string) => {
  let phone = value.toString().replace(/\D/g, '');

  // Telefone com DDD (Brasil)
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }

  // Telefone fixo com DDD (Brasil)
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }

  // Telefone sem DDD
  if (phone.length === 8) {
    return `${phone.slice(0, 4)}-${phone.slice(4)}`;
  }

  // Número inválido
  return value.toString();
};

export const cepMasked = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length > 8) {
    return cleanValue.slice(0, 8);
  }
  return cleanValue
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};
