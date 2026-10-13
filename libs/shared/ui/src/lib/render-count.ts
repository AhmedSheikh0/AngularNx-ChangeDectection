import { Directive, DoCheck, ElementRef, inject, input } from '@angular/core';
import { demoConfig, demoLog, DemoScope } from '@demo/shared/util';

/**
 * Put this on an empty element INSIDE a component's template:
 *
 *   <span demoRenderCount="onpush" demoRenderLabel="counter"></span>
 *
 * `ngDoCheck` of a directive runs every time Angular refreshes the template it lives in.
 * - Component is checked  -> the number goes up.
 * - Component is SKIPPED (OnPush + nothing dirty) -> the number stays put.
 *
 * It writes straight to the DOM (no `{{ }}` binding on purpose), otherwise the counter
 * itself would change during the pass and Angular would throw ExpressionChanged... (NG0100).
 */
@Directive({ selector: '[demoRenderCount]' })
export class RenderCount implements DoCheck {
  readonly demoRenderCount = input<DemoScope>('source');
  readonly demoRenderLabel = input('');

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private checks = 0;

  ngDoCheck(): void {
    this.checks++;
    this.host.textContent = `checked ×${this.checks}`;
    this.host.animate(
      [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
      {
        duration: 300,
        easing: 'ease-out',
      },
    );

    if (demoConfig.logTemplateChecks) {
      demoLog(
        this.demoRenderCount(),
        `${this.demoRenderLabel()} template CHECKED (#${this.checks})`,
      );
    }
  }
}
