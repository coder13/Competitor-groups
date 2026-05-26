import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useConfirm } from './ConfirmContext';
import { ConfirmProvider } from './ConfirmProvider';

function ConfirmConsumer() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string>('pending');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void (async () => {
            setResult((await confirm('Continue?')) ? 'confirmed' : 'cancelled');
          })();
        }}>
        Open confirm
      </button>
      <span>{result}</span>
    </>
  );
}

describe('ConfirmProvider', () => {
  it('resolves true when the user confirms', async () => {
    render(
      <ConfirmProvider>
        <ConfirmConsumer />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('confirmed')).toBeInTheDocument();
  });

  it('resolves false when the user cancels', async () => {
    render(
      <ConfirmProvider>
        <ConfirmConsumer />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('cancelled')).toBeInTheDocument();
  });

  it('resolves false when the user presses Escape', async () => {
    render(
      <ConfirmProvider>
        <ConfirmConsumer />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open confirm' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(await screen.findByText('cancelled')).toBeInTheDocument();
  });
});
