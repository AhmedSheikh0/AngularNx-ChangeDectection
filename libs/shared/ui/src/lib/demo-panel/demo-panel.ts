// ❌ BOUNDARY 1 - layer rule (ui must never import a feature)
//    A `type:ui` lib may only depend on `type:util`. Uncomment the next line, then run:
//      npx nx lint shared-ui
//    Expect: Circular dependency between "shared-ui" and "features-default-cd" detected.
//    Why a cycle? Because the layers are respected everywhere else, features ALREADY import ui,
//    so an upward import closes a loop - and Nx checks for cycles before it checks tags.
//    The layer rule behind it says: A project tagged with "type:ui" can only depend on libs
//    tagged with "type:util" (you get exactly that message when the upward import doesn't close a loop).
// import { DefaultCdPanel } from '@demo/features/default-cd';

import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { DemoScope } from '@demo/shared/util';

/**
 * The column wrapper shared by the three demos (title, colored accent, shared look for
 * `.demo-card`, `.demo-value`, `.demo-badge`, `.demo-btn`).
 *
 * ViewEncapsulation.None on purpose: the feature components render their own markup
 * (projected into this panel) and re-use these classes, so their templates stay tiny.
 */
@Component({
  selector: 'demo-panel',
  templateUrl: './demo-panel.html',
  styleUrl: './demo-panel.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPanel {
  readonly scope = input.required<DemoScope>();
  readonly heading = input.required<string>();
  readonly strategy = input.required<string>();
  readonly description = input('');
}
