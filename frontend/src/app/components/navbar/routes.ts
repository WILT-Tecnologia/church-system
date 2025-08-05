type RouteProps = {
  path: string;
  icon: string;
  label: string;
  items?: RouteProps[];
};

const USER: RouteProps[] = [
  {
    path: 'account',
    icon: 'settings',
    label: 'Conta',
    items: [
      {
        path: 'profile',
        icon: 'person',
        label: 'Perfil',
      },
      {
        path: 'logout',
        icon: 'logout',
        label: 'Sair',
      },
    ],
  },
];

export { USER };
