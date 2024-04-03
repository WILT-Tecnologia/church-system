import { Meta, StoryObj } from "@storybook/react";

import Base from ".";

const meta: Meta<typeof Base> = {
  title: "Surfaces/Dropdown/Base",
  component: Base,
  argTypes: {
    children: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Base>;

export const Default: Story = {};
