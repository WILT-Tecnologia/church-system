import { Meta, StoryObj } from "@storybook/react";
import { Plus } from "@styled-icons/feather";
import Button from ".";

const meta: Meta<typeof Button> = {
  title: "Inputs/Button",
  component: Button,
  argTypes: {
    children: {
      type: "string",
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium", "large"],
    },
    color: {
      type: "string",
    },
    labelColor: {
      type: "string",
    },
    variant: {
      control: { type: "radio" },
      option: ["contained", "outlined", "text"],
    },
    fullWidth: {
      type: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "My Button",
    color: "primary",
    labelColor: "white",
    size: "medium",
    variant: "contained",
  },
};

export const Contained: Story = {
  args: {
    children: "contained",
    color: "primary",
    labelColor: "white",
    size: "medium",
    variant: "contained",
  },
};

export const Outlined: Story = {
  args: {
    children: "outline",
    color: "primary",
    labelColor: "primary",
    size: "medium",
    variant: "outlined",
  },
};

export const Text: Story = {
  args: {
    children: "text",
    color: "primary",
    labelColor: "primary",
    size: "medium",
    variant: "text",
  },
};

export const WithIcon: Story = {
  args: {
    children: "My Button",
    color: "primary",
    labelColor: "white",
    size: "medium",
    variant: "contained",
    icon: <Plus />,
  },
};

export const Disabled: Story = {
  args: {
    children: "My Button",
    color: "primary",
    labelColor: "white",
    size: "medium",
    variant: "contained",
    disabled: true,
    icon: <Plus />,
  },
};

export const FullWidth: Story = {
  args: {
    children: "My Button",
    color: "primary",
    labelColor: "white",
    size: "medium",
    variant: "contained",
    fullWidth: true,
    icon: <Plus />,
  },
};
