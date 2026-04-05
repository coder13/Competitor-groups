import type { Meta, StoryObj } from '@storybook/react';
import { ExternalLink } from './ExternalLink';

const meta = {
  title: 'Components/ExternalLink',
  component: ExternalLink,
  args: {
    href: 'https://www.worldcubeassociation.org/',
    children: 'World Cube Association',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExternalLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
