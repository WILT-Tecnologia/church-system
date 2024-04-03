const fs = require("fs");
const path = require("path");
const readline = require("readline");

const createComponent = async (name) => {
  const componentDir = path.join(process.cwd(), `src/components/${name}`);
  if (fs.existsSync(componentDir)) {
    console.error(`A component with the name ${name} already exists.`);
    return;
  }

  const shouldCreateStoriesFile = async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question("Create stories file? (y/n) ", (answer) => {
        resolve(answer === "y");
        rl.close();
      });
    });
  };

  fs.mkdirSync(componentDir);

  const indexFile = path.join(componentDir, "index.tsx");
  fs.writeFileSync(
    indexFile,
    `import * as S from './styles';

export type ${name}Props = {
  children?: string;
};

const ${name} = ({ children }: ${name}Props) => {
  return <S.Wrapper>{children}</S.Wrapper>
};

export default ${name};
`,
  );

  const stylesFile = path.join(componentDir, "styles.ts");
  fs.writeFileSync(
    stylesFile,
    `import styled, { css } from 'styled-components';

export const Wrapper = styled.div\`
  \${({ theme }) => css\`\`}
\`;
`,
  );

  if (await shouldCreateStoriesFile()) {
    const storiesFile = path.join(componentDir, "stories.tsx");
    fs.writeFileSync(
      storiesFile,
      `import { Meta, StoryObj } from "@storybook/react";

import ${name} from '.';

const meta: Meta<typeof ${name}> = {
  title: '${name}',
  component: ${name},
  argTypes: {
    children: { type: 'string' },
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: 'My ${name}',
  },
};`,
    );
  }
};

const [, , componentName] = process.argv;
if (!componentName) {
  console.error("Please provide a component name.");
} else {
  createComponent(componentName);
}
