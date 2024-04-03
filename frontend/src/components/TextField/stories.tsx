import { Meta, StoryObj } from "@storybook/react";
import { Search } from "@styled-icons/feather";

import TextField from ".";

const meta: Meta<typeof TextField> = {
  title: "Inputs/TextField",
  component: TextField,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "white",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Input: Story = {
  args: {
    label: "input name",
    name: "inputname",
    as: "input",
    size: "large",
  },
};

export const TextArea: Story = {
  args: {
    label: "input name",
    name: "inputname",
    as: "textarea",
    cols: 5,
    rows: 10,
  },
};

export const WithIcon: Story = {
  args: {
    label: "input name",
    name: "inputname",
    icon: <Search />,
  },
};

export const WithMaskCPF: Story = {
  args: {
    label: "input name",
    name: "inputname",
    mask: "cpf",
    maxLength: 11,
  },
};

export const WithMaskCNPJ: Story = {
  args: {
    label: "input name",
    name: "inputname",
    mask: "cnpj",
    maxLength: 14,
  },
};
