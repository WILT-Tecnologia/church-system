import { Meta, StoryObj } from "@storybook/react";
import { Send } from "@styled-icons/feather";

import Fab from ".";

const meta: Meta<typeof Fab> = {
  title: "Inputs/Fab",
  component: Fab,
  argTypes: {
    children: {
      type: "string",
      description: "Children of the component",
    },
    color: {
      type: "string",
      description: "Color of the component",
    },
    labelColor: {
      type: "string",
      description: "Label color of the component",
    },
    disabled: {
      type: "boolean",
      description: "Set to true to disable",
    },
    size: {
      control: { type: "radio" },
      option: ["small", "medium", "large"],
      description: "Size of the component",
    },
    variant: {
      control: { type: "radio" },
      option: ["circular", "extended"],
      description: "Variant of the component",
    },
    as: {
      type: "string",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Fab>;

export const Circular: Story = {
  args: {
    size: "large",
    labelColor: "white",
    color: "primary",
    icon: <Send />,
    variant: "circular",
  },
};

export const Extended: Story = {
  args: {
    children: "My Fab",
    size: "large",
    icon: <Send />,
    variant: "extended",
    labelColor: "white",
    color: "primary",
  },
};
