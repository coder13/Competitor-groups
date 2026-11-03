import { fetchWcif } from './api';

jest.mock('./wca-env', () => ({ WCA_ORIGIN: 'https://api.worldcubeassociation.org' }));

describe('fetchWcif', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('requests WCIF v2 explicitly and returns the native response unchanged', async () => {
    const wcif = { formatVersion: '2.2', id: 'Example2026', events: [], persons: [] };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => wcif });

    await expect(fetchWcif('Example2026')).resolves.toBe(wcif);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.worldcubeassociation.org/competitions/Example2026/wcif/version/2',
      {},
    );
  });

  it('preserves API errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, text: async () => 'Not found' });

    await expect(fetchWcif('Missing2026')).rejects.toThrow('Not found');
  });
});
