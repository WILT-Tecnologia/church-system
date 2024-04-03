import { Meta, StoryObj } from "@storybook/react";

import Header from ".";

const meta: Meta<typeof Header> = {
  title: "Surfaces/Dropdown/Header",
  component: Header,
  argTypes: {
    children: { type: "string" },
    color: { type: "string" },
    size: {
      control: { type: "select" },
      options: [
        "xxsmall",
        "xsmall",
        "small",
        "medium",
        "large",
        "xlarge",
        "xxlarge",
        "huge",
        "xhuge",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    children: "My Header",
    color: "primary",
    size: "medium",
  },
};

export const Disabled: Story = {
  args: {
    children: "My Header",
    disabled: true,
    size: "medium",
  },
};
