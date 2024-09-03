import { Church } from './Church';
import { Person } from './Person';

/*
TODO: Criar um model para os membros
  [] Criar ENUM os campos abaixo:
    [] civil_status
    [] color_race
    [] formation
    [] profission
  [] Separar a tela de membro em: Dados pessoais, Dados complementares e Dados espirituais
    [x] Em dados pessoais deve conter os campos:
      [x] person_id
      [x] church_id
      [x] rg
      [x] issuing_body
      [x] civil_status
      [x] nationality
      [x] naturalness
      [x] color_race
    [] Em dados complementares deve conter os campos:
      [] formation
      [] formation_course
      [] profission
      [] def_physical
      [] def_visual
      [] def_hearing
      [] def_intellectual
      [] def_mental
      [] def_multiple
      [] def_other
      [] def_other_description
    [] Em dados espirituais deve conter os campos:
      [] baptism_date
      [] baptism_locale
      [] baptism_official
      [] baptism_holy_spirit
      [] baptism_holy_spirit_date
      [] member_origin_id
      [] receipt_date
*/

export type Members = {
  id: string;
  person_id: Person;
  church_id: Church;
  rg: string;
  issuing_body: string;
  civil_status: string;
  nationality: string;
  naturalness: string;
  color_race: string;
  formation: string;
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
