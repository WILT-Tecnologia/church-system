import { Meta, StoryObj } from "@storybook/react";

import ListItem from ".";

const meta: Meta<typeof ListItem> = {
  title: "Surfaces/Dropdown/ListItem",
  component: ListItem,
  argTypes: {
    children: { type: "string" },
    color: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  args: {
    children: "My ListItem",
    color: "primary",
  },
};
