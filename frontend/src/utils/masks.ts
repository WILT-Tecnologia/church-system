export const cpfMasked = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length > 11) {
    return cleanValue.slice(0, 11);
  }
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const dateMasked = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length > 8) {
    return cleanValue.slice(0, 8);
  }
  return cleanValue
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1');
};

export const phoneMasked = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length > 11) {
    return cleanValue.slice(0, 11);
  }
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1)$2')
    .replace(/(\d{5})(\d)/, '$1-$2');
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
