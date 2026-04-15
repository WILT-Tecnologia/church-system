import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  private readonly errorMessages: { [key: string]: (args?: any) => string } = {
    minlength: (args: { requiredLength: number }) =>
      `É preciso no mínimo ${args.requiredLength} caracteres.`,
    maxlength: (args: { requiredLength: number }) =>
      `Ultrapassou o limite máximo de ${args.requiredLength} caracteres.`,
    min: (args: { min: number }) => `O valor mínimo é ${args.min}.`,
    max: (args: { max: number }) => `O valor máximo é ${args.max}.`,
    required: () => 'Este campo é obrigatório.',
    email: () => 'Informe um e-mail válido.',
    pattern: () => 'Formato inválido.',
    nullValidator: () => 'Valor nulo não permitido.',
    passwordMismatch: () => 'As senhas não coincidem.',
    invalidPassword: () =>
      'A senha deve ter pelo menos uma letra maiúscula, uma minúscula, um número e um caracter especial (@,$,!,%,*,?,&).',
    emailExists: () => 'O e-mail já existe e pertence a um usuário.',
    cpfInvalid: () => 'CPF inválido.',
    cnpjInvalid: () => 'CNPJ inválido.',
    phoneInvalid: () => 'Telefone inválido.',
    invalidPhone: () => 'O telefone informado é inválido.',
    invalidPhoneLength: () => 'O telefone deve ter 10 ou 11 dígitos.',
    invalidPhoneStart: () => 'O telefone com 11 dígitos deve começar com 9.',
    invalidPhoneSequence: () => 'O telefone não pode ter todos os dígitos iguais.',
    invalidCpf: () => 'O CPF informado é inválido.',
    invalidCpfLength: () => 'O CPF deve conter 11 dígitos.',
    invalidCpfSequence: () => 'O CPF não pode conter todos os dígitos iguais.',
    invalidCnpj: () => 'O CNPJ informado é inválido.',
    invalidCnpjLength: () => 'O CNPJ deve conter 14 dígitos.',
    invalidCnpjSequence: () => 'O CNPJ não pode conter todos os dígitos iguais.',
    mask: () => 'O valor não está seguindo o padrão do estabelecido.',
    dateInvalid: () => 'Data inválida.',
    futureDate: () => 'A data deve ser futura.',
    pastDate: () => 'A data deve ser passada.',
    urlInvalid: () => 'URL inválida.',
  };

  /**
   * Obtém a primeira mensagem de erro para o conjunto de erros fornecido.
   * @param errors Objeto de erros do formulário.
   * @returns Mensagem de erro amigável em Português.
   */
  getErrorMessage(errors: ValidationErrors | null): string {
    if (!errors || Object.keys(errors).length === 0) {
      return '';
    }

    const firstKey = Object.keys(errors)[0];
    const messageGetter = this.errorMessages[firstKey];

    if (messageGetter) {
      return messageGetter(errors[firstKey]);
    }

    return 'Campo inválido.';
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(control.value) ? null : { invalidPassword: true };
    };
  }
}
