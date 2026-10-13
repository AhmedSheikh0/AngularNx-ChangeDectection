import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog } from '@demo/shared/util';

/**
 * DEFAULT (Eager) timer.
 * `seconds` is changed by a plain setInterval callback. Zone.js patches setInterval, so
 * after EVERY tick Angular runs a change-detection pass and this Eager component is re-checked.
 * The console and the screen agree.
 */
@Component({
  selector: 'demo-default-cd-timer',
  imports: [DomFlash, RenderCount],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- intentional: this IS the "Eager/Default" demo
  changeDetection: ChangeDetectionStrategy.Eager, // <-- formerly `Default`
  // 💥 BREAK 1 (step 2/2): swap the line above for the next one -> the clock freezes at 0
  //    while the console keeps counting:
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Timer - setInterval every 1s</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ seconds }}s</strong>
        <span
          class="demo-badge"
          demoRenderCount="default"
          demoRenderLabel="timer"
        ></span>
      </div>
      <button class="demo-btn" type="button" (click)="toggle()">
        {{ running ? 'Stop' : 'Start' }}
      </button>
      <p class="demo-hint">Open the console (F12): every tick is logged.</p>
    </div>
  `,
})
export class DefaultCdTimer implements OnInit, OnDestroy {
  seconds = 0; // plain field - no signal
  running = false;
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.start();
  }

  toggle(): void {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start(): void {
    this.running = true;
    this.intervalId = setInterval(() => {
      this.seconds++;
      demoLog('default', `timer tick -> this.seconds = ${this.seconds}`);
    }, 1000);
  }

  private stop(): void {
    this.running = false;
    clearInterval(this.intervalId);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
