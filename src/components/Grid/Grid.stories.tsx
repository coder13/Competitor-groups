import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const cellClassName = 'rounded-md bg-panel p-3 text-center type-body';

const meta = {
  title: 'Components/App/Grid',
  component: Grid,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  render: (args) => (
    <Grid {...args}>
      <div className={cellClassName}>One</div>
      <div className={cellClassName}>Two</div>
      <div className={cellClassName}>Three</div>
    </Grid>
  ),
  args: {
    columnWidths: ['1fr', '2fr', '1fr'],
    className: 'gap-2',
  },
};

export const RowsAndColumns: Story = {
  render: (args) => (
    <Grid {...args}>
      <div className={cellClassName}>A</div>
      <div className={cellClassName}>B</div>
      <div className={cellClassName}>C</div>
      <div className={cellClassName}>D</div>
    </Grid>
  ),
  args: {
    columnWidths: ['1fr', '1fr'],
    rowHeights: ['auto', 'auto'],
    className: 'gap-2',
  },
};
