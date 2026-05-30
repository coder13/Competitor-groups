import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RemoteAutoAdvanceToggle } from './RemoteAutoAdvanceToggle';

interface AutoAdvanceStoryArgs {
  checked: boolean;
  disabled: boolean;
}

function AutoAdvanceStory({ checked, disabled }: AutoAdvanceStoryArgs) {
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <div className="flex items-start gap-2 bg-panel p-4 text-default">
      <div className="space-y-1 text-right">
        <div className="type-meta text-muted">Auto-advance</div>
        <div className="max-w-sm type-meta text-subtle">
          Automatically moves Live Activities to the next scheduled group when the current group
          ends.
        </div>
      </div>
      <div className="pt-0.5">
        <RemoteAutoAdvanceToggle
          checked={isChecked}
          disabled={disabled}
          onToggle={() => {
            setIsChecked((currentValue) => !currentValue);
          }}
        />
      </div>
    </div>
  );
}

const meta = {
  title: 'Pages/Competition/Remote/Auto Advance Toggle',
  component: AutoAdvanceStory,
  render: (args) => <AutoAdvanceStory {...args} />,
  args: {
    checked: false,
    disabled: false,
  },
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoAdvanceStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};
