import { Meta, StoryObj } from "@storybook/react";

import Avatar from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Display/Avatar",
  component: Avatar,
  argTypes: {
    src: { type: "string" },
    fallback: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Image: Story = {
  args: {
    src: "/assets/storage/app/public/default.png",
    height: 50,
    width: 50,
  },
};

export const Fallback: Story = {
  args: {
    fallback: "Jhon Doe",
  },
};
