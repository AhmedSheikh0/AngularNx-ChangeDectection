import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoPanel } from '@demo/shared/ui';
import { SignalsCounter } from './signals-counter';
import { SignalsTimer } from './signals-timer';

@Component({
  selector: 'demo-signals-panel',
  imports: [DemoPanel, SignalsCounter, SignalsTimer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <demo-panel
      scope="signals"
      heading="OnPush + signals"
      strategy="OnPush + signal()"
      description="Reading a signal in the template tells Angular exactly which view depends on it. When the signal changes, only that view is refreshed - from anywhere, with no markForCheck()."
    >
      <demo-signals-counter />
      <demo-signals-timer />
    </demo-panel>
  `,
})
export class SignalsPanel {}
