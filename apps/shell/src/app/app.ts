import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DefaultCdPanel } from '@demo/features/default-cd';
import { OnPushPanel } from '@demo/features/onpush';
import { SignalsPanel } from '@demo/features/onpush-signals';
import { demoConfig, demoLog, globalCounterSource } from '@demo/shared/util';
import { isColumnShown, onlyColumn } from './demo-only';

/**
 * The shell only COMPOSES the three feature libs - it knows nothing about how they detect changes.
 *
 * It is Eager on purpose: the Default demo lives below it, and an OnPush root would be skipped
 * on timer ticks, hiding the Eager children (see the comment in default-cd-panel.ts).
 *
 * Which columns exist is decided at BUILD time (see demo-only.ts): a column that is not shown is
 * never created, so its timers do not run and it cannot trigger change detection for the others.
 */
@Component({
  selector: 'demo-root',
  imports: [DefaultCdPanel, OnPushPanel, SignalsPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- intentional: this IS the "Eager/Default" demo
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  protected readonly shown = {
    default: isColumnShown('default'),
    onpush: isColumnShown('onpush'),
    signals: isColumnShown('signals'),
  };

  /** `null` when all three columns are shown. */
  protected readonly only = onlyColumn;

  constructor() {
    if (this.only) {
      // several servers may be open side by side: make the browser tabs tell them apart
      inject(Title).setTitle(`${this.only.title} - Angular CD demo`);
    }
  }

  /** A click that happens OUTSIDE the counter components (they only "listen"). */
  incrementAll(): void {
    demoLog('source', 'shell button -> globalCounterSource.increment()');
    globalCounterSource.increment();
  }

  setLogTemplateChecks(enabled: boolean): void {
    demoConfig.logTemplateChecks = enabled;
  }
}
