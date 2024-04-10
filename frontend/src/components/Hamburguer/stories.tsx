import { Meta, StoryObj } from "@storybook/react";
import { Menu } from "@styled-icons/feather";

import Hamburguer from ".";

const meta: Meta<typeof Hamburguer> = {
  title: "Display/Hamburguer",
  component: Hamburguer,
  argTypes: {
    position: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Hamburguer>;

export const Default: Story = {
  args: {
    icon: <Menu />,
    position: "fixed",
  },
};
