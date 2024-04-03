import { Meta, StoryObj } from "@storybook/react";
import { User } from "@styled-icons/feather";

import Icon from ".";

const meta: Meta<typeof Icon> = {
  title: "Display/Icon",
  component: Icon,
  argTypes: {
    color: { type: "string" },
    size: { type: "string" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    children: <User />,
    color: "primary",
    size: "huge",
  },
};
