import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog } from '@demo/shared/util';

/**
 * OnPush WITH signals - the reference ("fixed") version of the timer.
 * Same setInterval as the OnPush demo, but `seconds` is a signal that the template reads.
 * Each tick marks only this view dirty, so the screen follows the console.
 */
@Component({
  selector: 'demo-signals-timer',
  imports: [DomFlash, RenderCount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Timer - setInterval every 1s</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ seconds() }}s</strong>
        <span
          class="demo-badge"
          demoRenderCount="signals"
          demoRenderLabel="timer"
        ></span>
      </div>
      <button class="demo-btn" type="button" (click)="toggle()">
        {{ running() ? 'Stop' : 'Start' }}
      </button>
      <p class="demo-hint">
        Console (F12) logs every tick. Is the screen keeping up?
      </p>
    </div>
  `,
})
export class SignalsTimer implements OnInit, OnDestroy {
  readonly seconds = signal(0);
  readonly running = signal(false);
  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.start();
  }

  toggle(): void {
    if (this.running()) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start(): void {
    this.running.set(true);
    this.intervalId = setInterval(() => {
      this.seconds.update((s) => s + 1);
      demoLog('signals', `timer tick -> seconds() = ${this.seconds()}`);
    }, 1000);
  }

  private stop(): void {
    this.running.set(false);
    clearInterval(this.intervalId);
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
