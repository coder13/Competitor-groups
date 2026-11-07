import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, useRef } from 'react';
import { MemoryRouter, NavigateFunction, useLocation, useNavigate } from 'react-router-dom';
import { createScrollPositionStore } from './scrollPositions';
import { useSessionScrollRestoration } from './useSessionScrollRestoration';

let navigate: NavigateFunction;
let capacities: WeakMap<HTMLElement, number>;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let resizeCallbacks: Set<ResizeObserverCallback>;
let navigationTiming: string;
let resizeObserveCalls: number;
const originalNavigationTiming = performance.getEntriesByType;
const originalScrollTo = HTMLElement.prototype.scrollTo;
const originalResizeObserver = global.ResizeObserver;

beforeEach(() => {
  sessionStorage.clear();
  capacities = new WeakMap();
  frames = new Map();
  nextFrame = 0;
  resizeCallbacks = new Set();
  navigationTiming = 'reload';
  resizeObserveCalls = 0;
  Object.defineProperty(performance, 'getEntriesByType', {
    configurable: true,
    value: () => [{ type: navigationTiming }],
  });
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  HTMLElement.prototype.scrollTo = jest.fn(function (
    this: HTMLElement,
    options: ScrollToOptions | number = {},
    top?: number,
  ) {
    const target = typeof options === 'number' ? { left: options, top } : options;
    this.scrollTop = Math.min(target.top || 0, capacities.get(this) ?? 3000);
    this.scrollLeft = target.left || 0;
  });
  global.ResizeObserver = class {
    callback: ResizeObserverCallback;
    elements = new Set<Element>();
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(element: Element) {
      resizeObserveCalls += 1;
      this.elements.add(element);
      resizeCallbacks.add(this.callback);
    }
    unobserve(element: Element) {
      this.elements.delete(element);
      if (!this.elements.size) resizeCallbacks.delete(this.callback);
    }
    disconnect() {
      this.elements.clear();
      resizeCallbacks.delete(this.callback);
    }
  };
});

afterEach(() => {
  jest.restoreAllMocks();
  HTMLElement.prototype.scrollTo = originalScrollTo;
  global.ResizeObserver = originalResizeObserver;
  Object.defineProperty(performance, 'getEntriesByType', {
    configurable: true,
    value: originalNavigationTiming,
  });
});

function Harness({ loaded = true, showPane = true }: { loaded?: boolean; showPane?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const location = useLocation();
  navigate = useNavigate();
  useSessionScrollRestoration(root);
  const paneId = location.pathname.startsWith('/competitions/') ? 'competition' : 'page';
  const max = location.pathname.includes('/persons/') || !loaded ? 50 : 3000;
  return (
    <main ref={root} data-scroll-restoration="root" data-testid="root">
      <output>{location.pathname + location.search}</output>
      {showPane && (
        <div
          key={paneId}
          ref={(pane) => {
            if (pane) {
              capacities.set(pane, max);
              pane.scrollTop = Math.min(pane.scrollTop, max);
            }
          }}
          data-scroll-restoration={paneId}
          data-testid="pane">
          <div>{loaded ? 'Loaded content' : 'Loading content'}</div>
          <a href="#target">A link</a>
          <input aria-label="Filter" />
        </div>
      )}
    </main>
  );
}

const groups = '/competitions/Test';
const person = '/competitions/Test/persons/1';
const pane = () => screen.getByTestId('pane');
const go = (to: string | number, replace = false) =>
  act(() => {
    if (typeof to === 'number') navigate(to);
    else navigate(to, { replace });
  });
const scroll = (top: number, target = pane(), left = 0) => {
  target.scrollTop = top;
  target.scrollLeft = left;
  fireEvent.scroll(target);
};
const flush = async () => {
  await act(async () => {});
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  });
};
const resize = async () => {
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
  await flush();
};

it('remembers the outgoing long list before DOM shrink and restores Back/Forward repeatedly', () => {
  render(
    <MemoryRouter initialEntries={[groups]}>
      <Harness />
    </MemoryRouter>,
  );
  scroll(850);
  go(person);
  expect(pane().scrollTop).toBe(0);
  scroll(30);
  go(-1);
  expect(pane().scrollTop).toBe(850);
  go(1);
  expect(pane().scrollTop).toBe(30);
  go(-1);
  expect(pane().scrollTop).toBe(850);
});

it('isolates repeated URLs, query entries, PUSH and REPLACE', () => {
  render(
    <MemoryRouter initialEntries={[groups]}>
      <Harness />
    </MemoryRouter>,
  );
  scroll(500);
  go(groups);
  expect(pane().scrollTop).toBe(0);
  scroll(200);
  go(`${groups}?q=amy`);
  expect(pane().scrollTop).toBe(0);
  scroll(100);
  go(-1);
  expect(pane().scrollTop).toBe(200);
  go(-1);
  expect(pane().scrollTop).toBe(500);
  go(2);
  expect(pane().scrollTop).toBe(100);
  go(`${groups}?q=bob`, true);
  expect(pane().scrollTop).toBe(0);
  scroll(70);
  go(-1);
  expect(pane().scrollTop).toBe(200);
  go(1);
  expect(pane().scrollTop).toBe(70);
});

it.each([
  '/competitions/Test/events',
  '/competitions/Test/activities',
  '/competitions/Test/results/333-r1',
  '/competitions/Test/persons/1/results',
  '/',
  '/about',
  '/support',
  '/me/results',
  '/live-activities',
  '/settings',
])('restores the correct root or competition scroll owner on %s', (route) => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Harness />
    </MemoryRouter>,
  );
  const offset = route.includes('/persons/') ? 40 : 640;
  scroll(offset, pane(), 20);
  scroll(25, screen.getByTestId('root'));
  go('/other');
  expect(pane().scrollTop).toBe(0);
  go(-1);
  expect(pane().scrollTop).toBe(offset);
  expect(pane().scrollLeft).toBe(20);
  expect(screen.getByTestId('root').scrollTop).toBe(25);
});

it('waits through short async content and restores after it grows', async () => {
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  const view = render(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness loaded={false} />
    </MemoryRouter>,
  );
  expect(pane().scrollTop).toBe(50);
  fireEvent.scroll(pane());
  fireEvent(window, new Event('pagehide'));
  expect(createScrollPositionStore().get('delayed', groups)?.competition.top).toBe(900);
  view.rerender(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness />
    </MemoryRouter>,
  );
  await resize();
  expect(pane().scrollTop).toBe(900);
  scroll(300);
  await resize();
  expect(pane().scrollTop).toBe(300);
});

it('restores a pane that mounts only after async data arrives', async () => {
  createScrollPositionStore().set('delayed', '/me/results', { page: { left: 0, top: 780 } });
  const view = render(
    <MemoryRouter initialEntries={[{ pathname: '/me/results', key: 'delayed' }]}>
      <Harness showPane={false} />
    </MemoryRouter>,
  );
  view.rerender(
    <MemoryRouter initialEntries={[{ pathname: '/me/results', key: 'delayed' }]}>
      <Harness />
    </MemoryRouter>,
  );
  await flush();
  expect(pane().scrollTop).toBe(780);
});

it.each(['wheel', 'touchStart', 'pointerDown', 'keyDown'])(
  'cancels pending restoration on manual %s without blocking the interaction',
  async (type) => {
    createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
    const view = render(
      <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
        <Harness loaded={false} />
      </MemoryRouter>,
    );
    const event =
      type === 'keyDown'
        ? new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true })
        : new Event(type.toLowerCase(), { bubbles: true, cancelable: true });
    fireEvent(pane(), event);
    expect(event.defaultPrevented).toBe(false);
    scroll(20);
    view.rerender(
      <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
        <Harness />
      </MemoryRouter>,
    );
    await resize();
    expect(pane().scrollTop).toBe(20);
    fireEvent(window, new Event('pagehide'));
    expect(createScrollPositionStore().get('delayed', groups)?.competition.top).toBe(20);
  },
);

it('does not move focus or interfere with Tab and typing while data arrives', async () => {
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  const view = render(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness loaded={false} />
    </MemoryRouter>,
  );
  const input = screen.getByRole('textbox');
  fireEvent.keyDown(document, { key: 'Tab' });
  input.focus();
  fireEvent.change(input, { target: { value: 'amy' } });
  view.rerender(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness />
    </MemoryRouter>,
  );
  await resize();
  expect(input).toHaveFocus();
  expect(input).toHaveValue('amy');
  expect(pane().scrollTop).toBe(50);
});

it('cancels stale callbacks on newer navigation and saves the unfulfilled target for Back', async () => {
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  const view = render(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness loaded={false} />
    </MemoryRouter>,
  );
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
  go('/about');
  view.rerender(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness />
    </MemoryRouter>,
  );
  await flush();
  expect(pane().scrollTop).toBe(0);
  go(-1);
  expect(pane().scrollTop).toBe(900);
});

it('rehydrates the current entry on reload, with pagehide saving the latest coordinates', () => {
  const entry = { pathname: groups, key: 'reload-entry' };
  const view = render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  pane().scrollTop = 650;
  fireEvent(window, new Event('pagehide'));
  expect(createScrollPositionStore().get(entry.key, groups)?.competition.top).toBe(650);
  // Reload does not run React cleanup. Save the persisted snapshot before test unmount.
  const persisted = sessionStorage.getItem('competition-groups:session-scroll:v1')!;
  view.unmount();
  sessionStorage.setItem('competition-groups:session-scroll:v1', persisted);
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  expect(pane().scrollTop).toBe(650);
});

it('starts fresh document navigation at the top, then remembers its first entry on Back', () => {
  navigationTiming = 'navigate';
  createScrollPositionStore().set('default', '/', { page: { left: 0, top: 900 } });
  render(
    <MemoryRouter initialEntries={['/']}>
      <Harness />
    </MemoryRouter>,
  );
  expect(pane().scrollTop).toBe(0);
  scroll(300);
  go('/about');
  go(-1);
  expect(pane().scrollTop).toBe(300);
});

it('handles StrictMode and cleans up observers, frames and native restoration ownership', async () => {
  window.history.scrollRestoration = 'auto';
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  const view = render(
    <StrictMode>
      <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
        <Harness loaded={false} />
      </MemoryRouter>
    </StrictMode>,
  );
  expect(window.history.scrollRestoration).toBe('manual');
  expect(resizeCallbacks.size).toBe(1);
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
  view.unmount();
  expect(window.history.scrollRestoration).toBe('auto');
  expect(frames.size).toBe(0);
  expect(resizeCallbacks.size).toBe(0);
  const stored = sessionStorage.getItem('competition-groups:session-scroll:v1');
  fireEvent(window, new Event('pagehide'));
  await flush();
  expect(sessionStorage.getItem('competition-groups:session-scroll:v1')).toBe(stored);
});

it('observes unreachable positions without a re-observe animation loop, including image-only growth', async () => {
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  render(
    <MemoryRouter initialEntries={[{ pathname: groups, key: 'delayed' }]}>
      <Harness loaded={false} />
    </MemoryRouter>,
  );
  const subscribed = resizeObserveCalls;
  expect(subscribed).toBeGreaterThan(0);
  await resize();
  await resize();
  expect(resizeObserveCalls).toBe(subscribed);
  expect(frames.size).toBe(0);
  capacities.set(pane(), 3000);
  await resize();
  expect(pane().scrollTop).toBe(900);
  expect(resizeCallbacks.size).toBe(0);
});

it('persists when the tab becomes hidden without waiting for navigation', () => {
  const entry = { pathname: groups, key: 'hidden-entry' };
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  scroll(420);
  const visibility = jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  fireEvent(document, new Event('visibilitychange'));
  expect(createScrollPositionStore().get(entry.key, groups)?.competition.top).toBe(420);
  visibility.mockRestore();
});

it('does not revive an abandoned target when manual input precedes the async pane mount', async () => {
  createScrollPositionStore().set('delayed', '/me/results', { page: { left: 0, top: 950 } });
  const entry = { pathname: '/me/results', key: 'delayed' };
  const view = render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness showPane={false} />
    </MemoryRouter>,
  );
  fireEvent.wheel(screen.getByTestId('root'));
  fireEvent(window, new Event('pagehide'));
  expect(createScrollPositionStore().get(entry.key, entry.pathname)?.page).toBeUndefined();
  view.rerender(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  await flush();
  expect(pane().scrollTop).toBe(0);
  go('/about');
  go(-1);
  expect(pane().scrollTop).toBe(0);
});

it('does not mistake browser or programmatic focus for a manual scroll override', async () => {
  createScrollPositionStore().set('delayed', groups, { competition: { left: 0, top: 900 } });
  const entry = { pathname: groups, key: 'delayed' };
  const view = render(
    <MemoryRouter initialEntries={[entry]}>
      <Harness loaded={false} />
    </MemoryRouter>,
  );
  const input = screen.getByRole('textbox');
  input.focus();
  view.rerender(
    <MemoryRouter initialEntries={[entry]}>
      <Harness />
    </MemoryRouter>,
  );
  await resize();
  expect(input).toHaveFocus();
  expect(pane().scrollTop).toBe(900);
});
