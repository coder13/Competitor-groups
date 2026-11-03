import { ScrollPosition, ScrollPositions } from './scrollPositions';

const PANE_SELECTOR = '[data-scroll-restoration]';
const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
]);
const atPosition = (actual: ScrollPosition, expected: ScrollPosition) =>
  Math.abs(actual.left - expected.left) < 1 && Math.abs(actual.top - expected.top) < 1;

/** One controller per history entry. Disposing cancels all deferred restoration. */
export function restoreScroll(root: HTMLElement, saved: ScrollPositions = {}) {
  const positions: ScrollPositions = { ...saved };
  const pending = new Map(Object.entries(saved));
  const panes = new Map<string, HTMLElement>();
  const initialized = new Set<string>();
  const observed = new Set<Element>();
  let disposed = false;
  let interrupted = false;
  let frame: number | undefined;

  const read = (id: string, pane: HTMLElement): ScrollPosition =>
    id === 'window'
      ? { left: window.scrollX, top: window.scrollY }
      : { left: pane.scrollLeft, top: pane.scrollTop };

  const remember = () => {
    for (const [id, pane] of panes) {
      // Do not replace an unfulfilled position with the loading screen's zero.
      if (!pending.has(id)) positions[id] = read(id, pane);
    }
  };

  const onScroll = (event: Event) => {
    for (const [id, pane] of panes) {
      if (
        (id === 'window' ? event.target === document : event.target === pane) &&
        !pending.has(id)
      ) {
        positions[id] = read(id, pane);
      }
    }
  };

  const resizeObserver =
    typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);

  function attempt() {
    frame = undefined;
    if (disposed) return;
    const current = new Map<string, HTMLElement>([['window', document.documentElement]]);
    if (root.matches(PANE_SELECTOR)) current.set(root.dataset.scrollRestoration!, root);
    root.querySelectorAll<HTMLElement>(PANE_SELECTOR).forEach((pane) => {
      current.set(pane.dataset.scrollRestoration!, pane);
    });
    for (const [id, pane] of panes) {
      if (current.get(id) !== pane) initialized.delete(id);
    }
    panes.clear();
    const needsObservation = new Set<Element>();
    for (const [id, pane] of current) {
      panes.set(id, pane);
      if (!initialized.has(id)) {
        initialized.add(id);
        if (!interrupted) pending.set(id, positions[id] || { left: 0, top: 0 });
        else positions[id] = read(id, pane);
      }
      const target = pending.get(id);
      if (!target) continue;
      const before = read(id, pane);
      if (!atPosition(before, target)) {
        if (id === 'window') {
          window.scrollTo({ ...target, behavior: 'instant' });
        } else {
          pane.scrollTo({ ...target, behavior: 'instant' });
        }
      }
      if (atPosition(read(id, pane), target)) {
        positions[id] = target;
        pending.delete(id);
      } else {
        // Pane size alone does not change when its children grow after a fetch.
        needsObservation.add(pane);
        Array.from(pane.children).forEach((child) => needsObservation.add(child));
      }
    }
    // Re-observing an unchanged element produces a fresh ResizeObserver delivery.
    // Keep subscriptions stable so an unreachable position does not poll forever.
    for (const element of observed) {
      if (!needsObservation.has(element)) {
        resizeObserver?.unobserve(element);
        observed.delete(element);
      }
    }
    for (const element of needsObservation) {
      if (!observed.has(element)) {
        observed.add(element);
        resizeObserver?.observe(element);
      }
    }
  }

  function schedule() {
    if (!disposed && frame === undefined) frame = requestAnimationFrame(attempt);
  }

  const interrupt = (event: Event) => {
    if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key) && event.key !== 'Tab')
      return;
    // Do not prevent input, move focus, or fight a user's scroll while data loads.
    interrupted = true;
    for (const id of pending.keys()) delete positions[id];
    pending.clear();
    resizeObserver?.disconnect();
    observed.clear();
    remember();
  };

  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
  document.addEventListener('scroll', onScroll, true);
  root.addEventListener('load', schedule, true);
  const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  inputEvents.forEach((type) =>
    document.addEventListener(type, interrupt, { capture: true, passive: true }),
  );
  attempt();

  return {
    snapshot(readCurrent = false) {
      if (readCurrent) remember();
      return { ...positions };
    },
    dispose() {
      disposed = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener('scroll', onScroll, true);
      root.removeEventListener('load', schedule, true);
      inputEvents.forEach((type) => document.removeEventListener(type, interrupt, true));
    },
  };
}
