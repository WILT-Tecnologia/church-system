import { Meta, StoryObj } from "@storybook/react";

import Divider from ".";

const meta: Meta<typeof Divider> = {
  title: "Display/Divider",
  component: Divider,
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Light: Story = {
  args: {
    light: false,
  },
};

export const Dark: Story = {
  args: {
    light: true,
  },
};
