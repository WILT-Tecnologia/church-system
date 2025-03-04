import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SanitizeValuesService {
  sanitizeInput(data: any) {
    return {
      ...data,
      sex: data.sex?.toUpperCase() || data.sex,
      cep: data.cep?.replace(/[^0-9]/g, '') || data.cep,
      cnpj: data.cnpj?.replace(/[^0-9]/g, '') || data.cnpj,
      cpf: data.cpf?.replace(/[^0-9]/g, '') || data.cpf,
      phone_one: data.phone_one?.replace(/[^0-9]/g, '') || data.phone_one,
      phone_two: data.phone_two?.replace(/[^0-9]/g, '') || data.phone_two,
    };
  }
}
