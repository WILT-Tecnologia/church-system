import { Church } from './Church';
import { Person } from './Person';

export enum EstadoCivil {
  SOLTEIRO = 'Solteiro',
  CASADO = 'Casado',
  DIVORCIADO = 'Divorciado',
  VIUVO = 'Viúvo',
}

export enum ColorRace {
  BRANCO = 'Branco',
  PRETO = 'Preto',
  PARDO = 'Pardo',
  AMARELO = 'Amarelo',
  INDIGENA = 'Indígena',
  OUTRO = 'Outro',
}

export enum Formation {
  FUNDAMENTAL_INCOMPLETO = 'Ensino Fundamental Incompleto',
  FUNDAMENTAL_COMPLETO = 'Ensino Fundamental Completo',
  MEDIO_INCOMPLETO = 'Ensino Médio Incompleto',
  MEDIO_COMPLETO = 'Ensino Médio Completo',
  SUPERIOR_INCOMPLETO = 'Ensino Superior Incompleto',
  SUPERIOR_COMPLETO = 'Ensino Superior Completo',
  POS_GRADUACAO = 'Pós-Graduação',
  MESTRADO = 'Mestrado',
  DOUTORADO = 'Doutorado',
  OUTRO = 'Outro',
}

/*
TODO: Criar um model para os membros
  [] Criar ENUM os campos abaixo:
    [] civil_status
    [] color_race
    [] formation
    [] profission
  [x] Separar a tela de membro em: Dados pessoais, Dados complementares e Dados espirituais
    [x] Em dados pessoais deve conter os campos:
      [x] person_id
      [x] church_id
      [x] rg
      [x] issuing_body
      [x] civil_status
      [x] nationality
      [x] naturalness
      [x] color_race
    [x] Em dados complementares deve conter os campos:
      [x] formation
      [x] formation_course
      [x] profission
      [x] def_physical
      [x] def_visual
      [x] def_hearing
      [x] def_intellectual
      [x] def_mental
      [x] def_multiple
      [x] def_other
      [x] def_other_description
    [x] Em dados espirituais deve conter os campos:
      [x] baptism_date
      [x] baptism_locale
      [x] baptism_official
      [x] baptism_holy_spirit
      [x] baptism_holy_spirit_date
      [x] member_origin_id
      [x] receipt_date
*/

export type Members = {
  id: string;
  person_id: Person;
  church_id: Church;
  rg: string;
  issuing_body: string;
  civil_status: EstadoCivil;
  nationality: string;
  naturalness: string;
  color_race: ColorRace;
  formation: Formation;
  formation_course: string;
  profission: string;
  def_physical: boolean;
  def_visual: boolean;
  def_hearing: boolean;
  def_intellectual: boolean;
  def_mental: boolean;
  def_multiple: boolean;
  def_other: boolean;
  def_other_description: string;
  baptism_date: string;
  baptism_locale: string;
  baptism_official: string;
  baptism_holy_spirit: boolean;
  baptism_holy_spirit_date: string;
  member_origin_id: string;
  receipt_date: string;
  created_at: string;
  updated_at: string;
};
