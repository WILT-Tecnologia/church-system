import { Meta, StoryObj } from "@storybook/react";

import Navbar from ".";

const meta: Meta<typeof Navbar> = {
  title: "Surfaces/Navbar",
  component: Navbar,
  argTypes: {
    color: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    color: "white",
    enableColorOnDark: false,
    percentDark: 0,
  },
};

export const Dark: Story = {
  args: {
    color: "white",
    enableColorOnDark: true,
    percentDark: 0.5,
  },
};
