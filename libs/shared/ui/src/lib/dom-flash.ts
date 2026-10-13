import {
  Directive,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';

/**
 * Flashes yellow whenever the DOM text inside the host REALLY changes.
 *
 *   <strong demoDomFlash>{{ count }}</strong>
 *
 * Angular only writes to the DOM when a binding's value changed, so:
 *   - template checked but value identical  -> NO flash   (the "checked ×N" badge grows)
 *   - template checked and value different  -> flash
 *   - template never checked (frozen view)  -> NO flash   (while the console shows new values)
 *
 * The MutationObserver runs OUTSIDE the Angular zone so that observing the DOM can never
 * trigger yet another change-detection pass (which would pollute the counters).
 */
@Directive({ selector: '[demoDomFlash]' })
export class DomFlash implements OnInit, OnDestroy {
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private observer?: MutationObserver;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.observer = new MutationObserver(() => {
        this.host.animate(
          [{ backgroundColor: '#ffe066' }, { backgroundColor: 'transparent' }],
          {
            duration: 900,
          },
        );
      });
      this.observer.observe(this.host, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
