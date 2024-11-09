const routes = {
  index: '/admin/administrative',
  church: {
    index: '/admin/church',
    members: '/admin/church/members',
    ordinations: '/admin/church/ordinations',
  },
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

export { routes };
