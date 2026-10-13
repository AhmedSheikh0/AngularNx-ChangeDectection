import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
// 🔧 FIX 2 (step 1/3): uncomment this import (we need `inject` + `ChangeDetectorRef`):
// import { ChangeDetectorRef, inject } from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog, globalCounterSource } from '@demo/shared/util';

/**
 * OnPush WITHOUT signals.
 *
 * The shell's "+1 to all counters" button changes `count` from OUTSIDE this component's
 * template. The console log proves the value changed, but Angular does not know it must
 * re-check this component:
 *   - no @Input changed             (there are none)
 *   - no event fired in OUR template (the click happened in the shell)
 *   - no markForCheck() call
 *   - no signal read in the template
 * -> OnPush skips the component -> the DOM keeps showing the old number.
 *
 * Click the LOCAL button below and the screen suddenly "catches up": an event inside the
 * template marks the component dirty, so the pass finally re-reads `count`.
 *
 * 🔧 FIX 2 = tell Angular explicitly (steps 1-3 below, ~3 lines).
 * 🔧 FIX 3 = the modern fix: make `count` a signal (steps below):
 *      1. import { signal } from '@angular/core';
 *      2. count = 0;                          ->  readonly count = signal(0);
 *      3. this.count++;  (both places)        ->  this.count.update((c) => c + 1);
 *      4. template: {{ count }}               ->  {{ count() }}
 *      5. log lines: ${this.count}            ->  ${this.count()}   (a signal is a function!)
 *    Result: identical to libs/features/onpush-signals (no markForCheck needed).
 */
@Component({
  selector: 'demo-onpush-counter',
  imports: [DomFlash, RenderCount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Counter</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ count }}</strong>
        <span
          class="demo-badge"
          demoRenderCount="onpush"
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
export class OnPushCounter implements OnDestroy {
  count = 0; // plain field - Angular cannot observe it

  // 🔧 FIX 2 (step 2/3): uncomment
  // private readonly cdr = inject(ChangeDetectorRef);

  private readonly stopListening = globalCounterSource.subscribe((total) => {
    this.count++;
    demoLog(
      'onpush',
      `source emitted (total ${total}) -> this.count = ${this.count}  (is the screen showing it?)`,
    );

    // 🔧 FIX 2 (step 3/3): uncomment -> marks this component dirty so the next pass re-checks it
    // this.cdr.markForCheck();
  });

  incrementLocally(): void {
    this.count++; // runs from our OWN template event -> Angular marks us dirty automatically
    demoLog('onpush', `local click -> this.count = ${this.count}`);
  }

  ngOnDestroy(): void {
    this.stopListening();
  }
}
