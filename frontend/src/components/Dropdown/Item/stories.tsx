import { Meta, StoryObj } from "@storybook/react";
import { Home } from "@styled-icons/feather";

import Item from ".";

const meta: Meta<typeof Item> = {
  title: "Surfaces/Dropdown/Item",
  component: Item,
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
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  args: {
    children: "My Item",
    color: "primary",
    size: "medium",
    dark: false,
  },
};

export const dark: Story = {
  args: {
    children: "My Item",
    color: "primary",
    size: "medium",
    dark: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: "My Item",
    color: "primary",
    size: "medium",
    dark: false,
    icon: <Home />,
  },
};
