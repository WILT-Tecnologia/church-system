const fs = require('fs');
const files = [
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/churches/churches.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/users/users.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/member-origin/member-origin.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/event-types/event-types.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/modules/modules.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/persons/persons.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/occupations/occupations.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/members/members.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/members/shared/families/families.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/financial/shared/patrimonies/patrimonies.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/members/shared/status-member/status-member.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/members/shared/ordinations/ordinations.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/administrative/profiles/profiles.component.ts',
  '/home/tiago-persch/Projetos/church-system/frontend/src/app/pages/private/church/guests/guests.component.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^import\s*\{\s*MatPaginator\s*\}\s*from\s*'@angular\/material\/paginator';\r?\n/gm, '');
    content = content.replace(/^import\s*\{\s*MatSort\s*\}\s*from\s*'@angular\/material\/sort';\r?\n/gm, '');
    content = content.replace(/^[ \t]*@ViewChild\(MatPaginator\)\s*paginator!:\s*MatPaginator;\r?\n/gm, '');
    content = content.replace(/^[ \t]*@ViewChild\(MatSort\)\s*sort!:\s*MatSort;\r?\n/gm, '');
    content = content.replace(/^[ \t]*this\.dataSourceMat\.paginator\s*=\s*this\.paginator;\r?\n/gm, '');
    content = content.replace(/^[ \t]*this\.dataSourceMat\.sort\s*=\s*this\.sort;\r?\n/gm, '');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
