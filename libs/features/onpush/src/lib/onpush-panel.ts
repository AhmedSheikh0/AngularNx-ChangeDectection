import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoPanel } from '@demo/shared/ui';
import { OnPushCounter } from './onpush-counter';
import { OnPushTimer } from './onpush-timer';

@Component({
  selector: 'demo-onpush-panel',
  imports: [DemoPanel, OnPushCounter, OnPushTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <demo-panel
      scope="onpush"
      heading="OnPush - no signals"
      strategy="ChangeDetectionStrategy.OnPush"
      description="Re-checked only when: an @Input reference changes, an event fires in its OWN template, markForCheck() runs, or a signal read in the template changes. Plain fields changed from outside are invisible."
    >
      <demo-onpush-counter />
      <demo-onpush-timer />
    </demo-panel>
  `,
})
export class OnPushPanel {}
