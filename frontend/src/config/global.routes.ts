const global = [
  {
    path: '/',
    name: 'Inicio',
  },
  {
    path: '/admin/church',
    name: 'Igreja',
  },
  {
    path: '/admin/administrative',
    name: 'Administrativo',
  },
  // {
  //   path: "/admin/dashboard/",
  //   name: "Dashboard",
  //   subRoutes: [
  //     { path: "/admin/dashboard/overview", name: "Visão Geral" },
  //     { path: "/admin/dashboard/reports", name: "Relatórios" },
  //   ],
  // },
  // {
  //   path: "/admin/persons",
  //   name: "Pessoas",
  //   subRoutes: [
  //     { path: "/admin/persons/users", name: "Usuários" },
  //     { path: "/admin/persons/create", name: "Adicionar Pessoa" },
  //     { path: "/admin/persons/list", name: "Lista de Pessoas" },
  //   ],
  // },
  // {
  //   path: "/admin/registrations",
  //   name: "Cadastros",
  //   subRoutes: [
  //     { path: "/admin/registrations/new", name: "Novo Cadastro" },
  //     { path: "/admin/registrations/manage", name: "Gerenciar Cadastros" },
  //   ],
  // },
  // {
  //   path: "/admin/queries",
  //   name: "Consultas",
  //   subRoutes: [
  //     { path: "/admin/queries/search", name: "Buscar" },
  //     { path: "/admin/queries/results", name: "Resultados" },
  //   ],
  // },
  // {
  //   path: "/admin/events",
  //   name: "Eventos",
  //   subRoutes: [
  //     { path: "/admin/events/next", name: "Próximos Eventos" },
  //     { path: "/admin/events/last", name: "Eventos Passados" },
  //   ],
  // },
  // {
  //   path: "/admin/settings",
  //   name: "Configurações",
  //   // subRoutes: [
  //   //   { path: "/admin/settings/profile", name: "Perfil" },
  //   //   { path: "/admin/settings/security", name: "Segurança" },
  //   // ],
  // },
];

const routes = {
  index: '/',
  church: '/admin/church',
  administrative: {
    index: '/admin/administrative',
    churchs: '/admin/administrative/church',
    persons: '/admin/administrative/persons',
    users: '/admin/administrative/users',
    occupations: '/admin/administrative/offices',
    profiles: '/admin/administrative/profiles',
    eventType: '/admin/administrative/event-type',
    reports: '/admin/administrative/reports',
  },
};

export { global, routes };
