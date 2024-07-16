const global = [
  {
    path: "/",
    name: "Inicio",
  },
  {
    path: "/admin/dashboard/",
    name: "Dashboard",
    subRoutes: [
      { path: "/admin/dashboard/overview", name: "Visão Geral" },
      { path: "/admin/dashboard/reports", name: "Relatórios" },
    ],
  },
  {
    path: "/admin/persons",
    name: "Pessoas",
    subRoutes: [
      { path: "/admin/persons/list", name: "Lista de Pessoas" },
      { path: "/admin/persons/add", name: "Adicionar Pessoa" },
    ],
  },
  {
    path: "/admin/registrations",
    name: "Cadastros",
    subRoutes: [
      { path: "/admin/registrations/new", name: "Novo Cadastro" },
      { path: "/admin/registrations/manage", name: "Gerenciar Cadastros" },
    ],
  },
  {
    path: "/admin/queries",
    name: "Consultas",
    subRoutes: [
      { path: "/admin/queries/search", name: "Buscar" },
      { path: "/admin/queries/results", name: "Resultados" },
    ],
  },
  {
    path: "/admin/events",
    name: "Eventos",
    subRoutes: [
      { path: "/admin/events/next", name: "Próximos Eventos" },
      { path: "/admin/events/last", name: "Eventos Passados" },
    ],
  },
  {
    path: "/admin/settings",
    name: "Configurações",
    // subRoutes: [
    //   { path: "/admin/settings/profile", name: "Perfil" },
    //   { path: "/admin/settings/security", name: "Segurança" },
    // ],
  },
];

export { global };
