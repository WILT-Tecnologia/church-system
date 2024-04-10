import { Meta, StoryObj } from "@storybook/react";

import Sidebar from ".";

const meta: Meta<typeof Sidebar> = {
  title: "Surfaces/Sidebar",
  component: Sidebar,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {},
};
