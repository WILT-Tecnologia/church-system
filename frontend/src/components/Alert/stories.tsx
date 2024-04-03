import { Meta, StoryObj } from "@storybook/react";
import { AlertCircle } from "@styled-icons/feather";

import Alert from ".";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  argTypes: {
    children: { type: "string" },
    description: { type: "string" },
    color: { type: "string" },
    backgroundColor: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    children: "My Alert",
    backgroundColor: "primary",
    color: "white",
  },
};

export const WithDescription: Story = {
  args: {
    children: "My Alert",
    description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis enim, architecto nostrum ab tempore quis sapiente autem itaque voluptas, nulla atque expedita culpa earum quaerat impedit molestias quidem quasi eveniet!`,
    backgroundColor: "primary",
    color: "white",
  },
};

export const WithIcon: Story = {
  args: {
    children: "My Alert",
    backgroundColor: "primary",
    color: "white",
    icon: <AlertCircle />,
  },
};

export const DescriptionWithIcon: Story = {
  args: {
    children: "My Alert",
    backgroundColor: "primary",
    color: "white",
    description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis enim, architecto nostrum ab tempore quis sapiente autem itaque voluptas, nulla atque expedita culpa earum quaerat impedit molestias quidem quasi eveniet!`,
    icon: <AlertCircle />,
  },
};

export const WithCloseIcon: Story = {
  args: {
    children: "My Alert",
    backgroundColor: "primary",
    color: "white",
    description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Perferendis enim, architecto nostrum ab tempore quis sapiente autem itaque voluptas, nulla atque expedita culpa earum quaerat impedit molestias quidem quasi eveniet!`,
    icon: <AlertCircle />,
    closeIcon: true,
  },
};
