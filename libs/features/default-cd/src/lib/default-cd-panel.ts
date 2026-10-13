import { ChangeDetectionStrategy, Component } from '@angular/core';
// ❌ BOUNDARY 2 - scope isolation (default <-> onpush <-> signals must stay independent)
//    Uncomment the next line + use it, then run:  npx nx lint features-default-cd
//    Expect: "A project tagged with "scope:default" can only depend on libs tagged with
//    "scope:default", "scope:shared"". Each strategy demo must never reach into another.
// import { OnPushCounter } from '@demo/features/onpush';
import { DemoPanel } from '@demo/shared/ui';
import { DefaultCdCounter } from './default-cd-counter';
import { DefaultCdTimer } from './default-cd-timer';

/**
 * This panel MUST be Eager as well: an OnPush parent is skipped by change detection, and
 * everything below a skipped component is skipped with it - so Eager children inside an
 * OnPush parent would NOT be re-checked. The whole chain
 * (shell -> panel -> counter/timer) has to be Eager for "Default" behaviour.
 */
@Component({
  selector: 'demo-default-cd-panel',
  imports: [DemoPanel, DefaultCdCounter, DefaultCdTimer],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- intentional: this IS the "Eager/Default" demo
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <demo-panel
      scope="default"
      heading="Default (Eager)"
      strategy="ChangeDetectionStrategy.Eager"
      description="Checked on EVERY change-detection pass - after any click, timer or HTTP response anywhere in the app. Simple, but it re-runs the template even when nothing changed."
    >
      <demo-default-cd-counter />
      <demo-default-cd-timer />
    </demo-panel>
  `,
})
export class DefaultCdPanel {}
