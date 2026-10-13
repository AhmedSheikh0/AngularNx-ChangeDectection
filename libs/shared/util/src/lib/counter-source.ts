export type CounterListener = (total: number) => void;

/**
 * A tiny, framework-agnostic event source.
 *
 * Think of it as "something that lives OUTSIDE Angular": a WebSocket message, a store,
 * a third-party library callback. It does not know that Angular exists - that is exactly
 * why it is allowed to live in the `type:util` layer (see eslint.config.mjs).
 *
 * The big "+1 to all counters" button in the shell calls `increment()`.
 * Every counter component "listens" by subscribing to it and decides for itself how
 * to react - and THAT is where the three change-detection strategies behave differently.
 */
export class CounterSource {
  private total = 0;
  private readonly listeners = new Set<CounterListener>();

  increment(): void {
    this.total++;
    this.listeners.forEach((listener) => listener(this.total));
  }

  /** Returns an `unsubscribe` function. */
  subscribe(listener: CounterListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

/** One shared instance for the whole demo (the "outside world"). */
export const globalCounterSource = new CounterSource();
