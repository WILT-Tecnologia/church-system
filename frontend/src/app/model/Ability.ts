import { AbilityBuilder, AbilityTuple, PureAbility } from '@casl/ability';

// Actions que você usa
export type Actions = 'read' | 'write' | 'delete' | 'manage';

// Subjects: você pode usar os nomes dos módulos ou "all"
export type Subjects =
  | 'dashboard_administrativo'
  | 'usuarios'
  | 'perfis'
  | 'modulos'
  | 'pessoas'
  | 'igrejas'
  | 'dashboard_igreja'
  | 'membros'
  | 'convidados_e_visitantes'
  | 'eventos'
  | 'tasks'
  | 'financeiro'
  | 'all';

// Tipo da Ability
export type AppAbility = PureAbility<AbilityTuple<Actions, Subjects>>;

export const defineAbilitiesFor = (permissions: string[]) => {
  const { can, rules } = new AbilityBuilder<AppAbility>(PureAbility);

  permissions.forEach((perm) => {
    const [action, ...rest] = perm.split('_');
    const subject = rest.join('_');

    if (action && subject) {
      can(action as Actions, subject as Subjects);
    }
  });

  return rules;
};
