import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
// 🔧 FIX 1 (step 1/3): uncomment this import (we need `inject` + `ChangeDetectorRef`):
// import { ChangeDetectorRef, inject } from '@angular/core';
import { DomFlash, RenderCount } from '@demo/shared/ui';
import { demoLog } from '@demo/shared/util';

/**
 * OnPush WITHOUT signals.
 *
 * `seconds` is updated inside a setInterval callback. Zone.js still triggers a
 * change-detection pass after every tick, but OnPush says "skip me unless I'm dirty" and
 * nothing marked us dirty -> the console counts 1, 2, 3 ... while the screen stays at 0s.
 *
 * 🔧 FIX 1 = call markForCheck() inside the interval (steps 1-3).
 * 🔧 FIX 3 = use a signal instead:
 *      1. import { signal } from '@angular/core';
 *      2. seconds = 0;                        ->  readonly seconds = signal(0);
 *      3. this.seconds++;                     ->  this.seconds.update((s) => s + 1);
 *      4. template: {{ seconds }}s            ->  {{ seconds() }}s
 *      5. log line: ${this.seconds}           ->  ${this.seconds()}   (a signal is a function!)
 */
@Component({
  selector: 'demo-onpush-timer',
  imports: [DomFlash, RenderCount],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-card">
      <div class="demo-card__label">Timer - setInterval every 1s</div>
      <div class="demo-card__body">
        <strong class="demo-value" demoDomFlash>{{ seconds }}s</strong>
        <span
          class="demo-badge"
          demoRenderCount="onpush"
          demoRenderLabel="timer"
        ></span>
      </div>
      <button class="demo-btn" type="button" (click)="toggle()">
        {{ running ? 'Stop' : 'Start' }}
      </button>
      <p class="demo-hint">
        Console (F12) logs every tick. Is the screen keeping up?
      </p>
    </div>
  `,
})
export class OnPushTimer implements OnInit, OnDestroy {
  seconds = 0; // plain field - Angular cannot observe it
  running = false;
  private intervalId?: ReturnType<typeof setInterval>;

  // 🔧 FIX 1 (step 2/3): uncomment
  // private readonly cdr = inject(ChangeDetectorRef);

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
      demoLog(
        'onpush',
        `timer tick -> this.seconds = ${this.seconds}  (is the screen showing it?)`,
      );

      // 🔧 FIX 1 (step 3/3): uncomment -> marks this component dirty so the next pass re-checks it
      // this.cdr.markForCheck();
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
