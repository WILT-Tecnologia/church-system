import { Meta, StoryObj } from '@storybook/react';

import Badge from '.';

const meta: Meta<typeof Badge> = {
  title: 'Data display/Badge',
  component: Badge,
  argTypes: {
    children: {
      type: 'string',
    },
    styledType: {
      control: { type: 'radio' },
      options: ['success', 'info', 'orange', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    styledType: 'success',
  },
};
