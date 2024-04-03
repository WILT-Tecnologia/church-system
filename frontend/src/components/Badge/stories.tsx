import { Meta, StoryObj } from "@storybook/react";

import Badge from ".";

const meta: Meta<typeof Badge> = {
  title: "Display/Badge",
  component: Badge,
  argTypes: {
    children: {
      type: "string",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "success",
  },
};
