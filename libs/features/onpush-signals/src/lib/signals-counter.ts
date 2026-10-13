import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  signal,
} from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog, globalCounterSource } from '@demo/shared/util';

/**
 * OnPush WITH signals - the reference ("fixed") version.
 *
 * `count` is a signal and the template READS it (`count()`). Reading a signal inside a
 * template registers that view as a consumer. When `count.update(...)` runs - even from a
 * callback that lives completely outside Angular's event system - Angular marks exactly
 * THIS view for refresh. No markForCheck(), no Default strategy, no wasted checks:
 * look at the "checked ×N" badge - it only grows when the value really changes.
 *
 * TRY IT (breaks it on purpose): turn `count` back into a plain `number` and the
 * "+1 to all counters" button stops updating this card, just like in the OnPush demo.
 */
@Component({
  selector: 'demo-signals-counter',
  imports: [DomFlash, RenderCount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Counter</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ count() }}</strong>
        <span
          class="demo-badge"
          demoRenderCount="signals"
          demoRenderLabel="counter"
        ></span>
      </div>
      <button class="demo-btn" type="button" (click)="incrementLocally()">
        +1 (click inside this component)
      </button>
      <p class="demo-hint">
        Also listens to the shell's big "+1 to all counters" button.
      </p>
    </div>
  `,
})
export class SignalsCounter implements OnDestroy {
  readonly count = signal(0);

  private readonly stopListening = globalCounterSource.subscribe((total) => {
    this.count.update((c) => c + 1);
    demoLog(
      'signals',
      `source emitted (total ${total}) -> count() = ${this.count()}`,
    );
  });

  incrementLocally(): void {
    this.count.update((c) => c + 1);
    demoLog('signals', `local click -> count() = ${this.count()}`);
  }

  ngOnDestroy(): void {
    this.stopListening();
  }
}
