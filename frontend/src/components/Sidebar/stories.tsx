import { Meta, StoryObj } from "@storybook/react";

import Sidebar from '.';

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar',
  component: Sidebar,
  argTypes: {
    children: { type: 'string' },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    children: 'My Sidebar',
  },
};