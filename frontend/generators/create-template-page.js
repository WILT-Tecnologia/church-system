const fs = require("fs");
const path = require("path");
const readline = require("readline");

const createTemplatePage = async (name) => {
  const dirTemplate = path.join(process.cwd(), `src/templates/${name}`);
  const dirPage = path.join(process.cwd(), `src/app/${name}/`);

  if (fs.existsSync(dirTemplate)) {
    console.error(`A template with the name ${name} already exists.`);
    return;
  }

  if (fs.existsSync(dirPage)) {
    console.error(`A page with the name ${name}Page already exists.`);
  }

  fs.mkdirSync(dirTemplate);
  fs.mkdirSync(dirPage);

  const indexFile = path.join(dirTemplate, "index.tsx");
  fs.writeFileSync(
    indexFile,
    `import Base from "../Base";

export default function ${name}() {
  return <Base></Base>;
}
`,
  );

  const indexFilePage = path.join(dirPage, "page.tsx");
  fs.writeFileSync(
    indexFilePage,
    `import ${name} from '@/templates/${name}';

export default function ${name}Page() {
  return <${name}/>
}
`,
  );
};

const [, , componentName] = process.argv;
if (!componentName) {
  console.error("Please provide a template name.");
} else {
  createTemplatePage(componentName);
}
