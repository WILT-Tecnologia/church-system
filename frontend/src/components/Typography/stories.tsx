import { Meta, StoryObj } from "@storybook/react";

import Typography from ".";

const meta: Meta<typeof Typography> = {
  title: "Display/Typography",
  component: Typography,
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
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: "My Typography",
    color: "primary",
    size: "small",
    align: "left",
    transform: "none",
  },
};
