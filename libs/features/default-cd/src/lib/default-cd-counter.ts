import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog, globalCounterSource } from '@demo/shared/util';

/**
 * DEFAULT change detection  ==  "Eager" (CheckAlways).
 *
 * Since Angular 22 a component WITHOUT a `changeDetection` property is OnPush.
 * To get the classic "check me on every pass" behaviour you must ask for it explicitly:
 * `ChangeDetectionStrategy.Eager` (the old name `Default` is deprecated but identical).
 *
 * Why it updates: `count` is a plain field. After the shell's click (or any timer/HTTP/event
 * anywhere in the app) Zone.js triggers a change-detection pass and Angular simply re-checks
 * every Eager component, notices `count` is different, and writes the DOM.
 */
@Component({
  selector: 'demo-default-cd-counter',
  imports: [DomFlash, RenderCount],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- intentional: this IS the "Eager/Default" demo
  changeDetection: ChangeDetectionStrategy.Eager, // <-- formerly `Default`
  // 💥 BREAK 1 (step 2/2): replace the line above with the next one, save, and watch this
  //    counter freeze exactly like the OnPush demo (the global "+1" button stops working here):
  // changeDetection: ChangeDetectionStrategy.OnPush,
  //
  // 💥 BREAK 2: delete the whole `changeDetection` line instead -> in Angular 22 you silently get OnPush!
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Counter</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ count }}</strong>
        <span
          class="demo-badge"
          demoRenderCount="default"
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
export class DefaultCdCounter implements OnDestroy {
  count = 0; // plain field - no signal

  private readonly stopListening = globalCounterSource.subscribe((total) => {
    this.count++;
    demoLog(
      'default',
      `source emitted (total ${total}) -> this.count = ${this.count}`,
    );
  });

  incrementLocally(): void {
    this.count++;
    demoLog('default', `local click -> this.count = ${this.count}`);
  }

  ngOnDestroy(): void {
    this.stopListening();
  }
}
