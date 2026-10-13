# Demo script - "How Angular decides what to re-render" + Nx boundaries

**Total time:** about 30 minutes (10 min Nx/boundaries, 20 min change detection). Each act is independent, so you can cut any of them.

## Mental model to repeat (say it three times)

> After every async event (click, timer, HTTP) Zone.js tells Angular: **"something may have changed"**.
> Angular walks the component tree from the root. For each component it decides **check** (re-run the template) or **skip**.
> The DOM is only written when a binding's **value** is different from last time.

| Strategy                | When is the component checked?                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Eager` (old _Default_) | **every** pass                                                                                                                                            |
| `OnPush`                | only if: an `@Input` reference changed, an event fired in **its own template**, `markForCheck()` was called, or a **signal read in its template** changed |
| `OnPush` + signals      | when (and only when) a signal it reads changes - from anywhere                                                                                            |

## Before you start

```bash
npm install
npm start            # http://localhost:4200
```

- Browser on one side, editor on the other. Open DevTools -> **Console** (F12). Zoom the browser to ~125 %.
- Tip: type `onpush` in the console filter box to show only that column's logs.
- **Two windows?** Keep `npm start` (all three, port 4200) on one screen and run a single-column server on the other, for example `npm run start:onpush` (port 4202; also `start:default` 4201 and `start:signals` 4203). The single-column page names its column in a yellow banner and in the tab title.
- **Make a restore point** so you can undo every live edit in one command:
  `git init && git add -A && git commit -m "demo baseline"` -> reset any time with `git checkout .`
- Saving a `.ts` file reloads the page, so the counters go back to 0. That is expected.

## The page

Three columns, each with a **Counter** and a **Timer**:

| Column              | Color  | Library                        |
| ------------------- | ------ | ------------------------------ |
| Default (Eager)     | orange | `libs/features/default-cd`     |
| OnPush - no signals | blue   | `libs/features/onpush`         |
| OnPush + signals    | green  | `libs/features/onpush-signals` |

On every card: **`checked ×N`** = times Angular ran that template. **Yellow flash** = the DOM text really changed. The big button on top (**+1 to all counters**) lives in the shell, i.e. **outside** the counter components.

---

## Act 1 - Orient (2 min) - slide 3 of your deck

```bash
npm run graph          # nx graph
```

**Show:** 6 projects. `shell` points at the 3 features, features point at `shared-ui` and `shared-util`, `shared-ui` points at `shared-util`. Nothing points up.
**Say:** "Same idea as your slide: one repo, one graph. Every project carries two tags: _type_ (layer) and _scope_ (slice). We'll break the rules in the last act."

## Act 2 - The timer: values change, screen doesn't (4 min)

**Do:** wait ~10 seconds. Keep the console visible.

**Expect:**

|                    | Screen                    | Console                                                                | `checked` badge                 |
| ------------------ | ------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Default            | 10s, flashes every second | `default timer tick -> this.seconds = 10`                              | about ×30 (grows ~3 per second) |
| OnPush, no signals | **stuck on 0s**           | `onpush  timer tick -> this.seconds = 10  (is the screen showing it?)` | **×1**                          |
| OnPush + signals   | 10s, flashes every second | `signals timer tick -> seconds() = 10`                                 | ×11                             |

**Say:**

- "The OnPush console says 10. The screen says 0. The data is right, Angular just never looked."
- "Default was checked ~30 times but flashed 10 times: it re-ran the template on every pass, and wrote the DOM only when the value differed. Why ×3 per second? Three independent timers each start a pass, and Default is re-checked on all of them."
- "Signals: checked once per real change. Zero wasted work."

## Act 3 - The counter: an event from outside (4 min)

**Do:** click **+1 to all counters** three times.

**Expect:** Default `3`, OnPush `0` (frozen), Signals `3`. The console shows all three logging `source emitted (total 3)`, and the OnPush line says `this.count = 3`.

**Say:** "The counter components _listen_ to a plain event source (`libs/shared/util/src/lib/counter-source.ts`). Think WebSocket, store or third-party callback. The OnPush component updated its field, but nothing told Angular: no `@Input` changed, no event in its own template, no `markForCheck()`, no signal."

## Act 4 - The gotcha: "catching up" (2 min)

**Do:** in the **OnPush** column click **+1 (click inside this component)**.

**Expect:** the screen jumps from `0` to `4` (3 from the source + 1 local); badge goes ×1 -> ×2.
**Say:** "An event inside the component's own template marks it dirty, so this one pass finally re-read the field. That's why OnPush bugs look random: they only show up when the change comes from outside."

Bonus: press **Stop** on the OnPush timer. The screen jumps to the current value for the same reason.

---

## Act 5 - Fix it live (8 min)

Search the code for `🔧 FIX`. Do them **one at a time**, saving after each, and re-run Acts 2 and 3. Files:

- `libs/features/onpush/src/lib/onpush-timer.ts` (FIX 1, FIX 3)
- `libs/features/onpush/src/lib/onpush-counter.ts` (FIX 2, FIX 3)

### FIX 1 - `markForCheck()` in the timer (3 uncomments)

```ts
import { ChangeDetectorRef, inject } from '@angular/core'; // step 1/3

export class OnPushTimer implements OnInit, OnDestroy {
  seconds = 0;
  running = false;
  private intervalId?: ReturnType<typeof setInterval>;
  private readonly cdr = inject(ChangeDetectorRef); // step 2/3

  private start(): void {
    this.running = true;
    this.intervalId = setInterval(() => {
      this.seconds++;
      demoLog('onpush', `timer tick -> this.seconds = ${this.seconds}`);
      this.cdr.markForCheck(); // step 3/3
    }, 1000);
  }
}
```

**Expect:** the OnPush timer now counts on screen and its badge grows once per tick. **Say:** "It works, but _you_ must remember to call it every time a plain field changes."

### FIX 2 - `markForCheck()` in the counter (3 uncomments)

```ts
import { ChangeDetectorRef, inject } from '@angular/core'; // step 1/3

export class OnPushCounter implements OnDestroy {
  count = 0;
  private readonly cdr = inject(ChangeDetectorRef); // step 2/3

  private readonly stopListening = globalCounterSource.subscribe((total) => {
    this.count++;
    demoLog(
      'onpush',
      `source emitted (total ${total}) -> this.count = ${this.count}`,
    );
    this.cdr.markForCheck(); // step 3/3
  });
}
```

**Expect:** click **+1 to all counters**: all three columns move together.

### FIX 3 - the modern fix: a signal (instead of FIX 1/2)

First re-comment FIX 1/2 (or `git checkout .`). Then, in **`onpush-timer.ts`**:

```ts
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';

readonly seconds = signal(0);                          // was: seconds = 0;

this.seconds.update((s) => s + 1);                     // was: this.seconds++;
demoLog('onpush', `timer tick -> seconds() = ${this.seconds()}`);

// template:  {{ seconds() }}s                         // was: {{ seconds }}s
```

and in **`onpush-counter.ts`**:

```ts
import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';

readonly count = signal(0);                            // was: count = 0;

private readonly stopListening = globalCounterSource.subscribe((total) => {
  this.count.update((c) => c + 1);                     // was: this.count++;
  demoLog('onpush', `source emitted (total ${total}) -> this.count = ${this.count()}`);
});

incrementLocally(): void {
  this.count.update((c) => c + 1);                     // was: this.count++;
}

// template:  {{ count() }}                            // was: {{ count }}
```

**Say:** "Reading `count()` in the template registers this view as a consumer. When the signal changes, Angular refreshes _exactly this view_, from a timer, a socket, anywhere. No `markForCheck`, no wasted passes. The finished version is `libs/features/onpush-signals/`: open `signals-timer.ts` next to it."

> Gotcha to mention: a signal is a function. `${this.count}` in a log line prints the function's source, you need `${this.count()}`.

---

## Act 6 - Break the Default one (3 min)

Files: `libs/features/default-cd/src/lib/default-cd-counter.ts` and `default-cd-timer.ts`.

### BREAK 1 - swap `Eager` for `OnPush`

```ts
// changeDetection: ChangeDetectionStrategy.Eager,   // comment this
   changeDetection: ChangeDetectionStrategy.OnPush,  // uncomment this
```

**Expect:** the orange column freezes exactly like the blue one: the strategy, not the code, was the difference.

### BREAK 2 - delete the `changeDetection` line entirely

**Expect:** the same freeze. **Say:** "In Angular 22 _no property_ means OnPush. The classic behaviour is now opt-in: `Eager` (the old name `Default` is a deprecated alias). Angular's own lint rule `prefer-on-push-component-change-detection` even complains about opting out; look at the `eslint-disable` comments above the Eager components."

> Why is the shell (and the panel) Eager too? An OnPush parent is skipped, and everything below a skipped component is skipped with it. For "Default" behaviour the **whole chain** must be Eager. Good question to leave for Q&A.

## Act 7 - Prove it with evidence (2 min)

**Do:** tick **also log every template check to the console** at the top of the page.

**Expect:** the console now shows `template CHECKED (#n)` lines. The Default lines scroll constantly; the OnPush lines almost never appear; the signals lines appear exactly once per real change.
**Say:** "Three columns, one change, three completely different amounts of work."

---

## Act 8 - Module boundaries (8 min) - slides 8-12 of your deck

Each rule has a commented import marked `❌ BOUNDARY n`. Uncomment **one**, run the lint command, show the error (your IDE underlines it red immediately), then re-comment it.

The rules are in `eslint.config.mjs`. Show it first: two tag families, nine short constraints (4 for layers, 5 for scopes).

| #   | File                                                   | Uncomment                                                    | Run                               | Expected error                                                                                              |
| --- | ------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | `libs/shared/ui/src/lib/demo-panel/demo-panel.ts`      | `import { DefaultCdPanel } from '@demo/features/default-cd'` | `npx nx lint shared-ui`           | `Circular dependency between "shared-ui" and "features-default-cd" detected`                                |
| 2   | `libs/features/default-cd/src/lib/default-cd-panel.ts` | `import { OnPushCounter } from '@demo/features/onpush'`      | `npx nx lint features-default-cd` | `A project tagged with "scope:default" can only depend on libs tagged with "scope:default", "scope:shared"` |
| 3   | `libs/shared/util/src/lib/demo-log.ts`                 | `import { DemoPanel } from '@demo/shared/ui'`                | `npx nx lint shared-util`         | `Circular dependency between "shared-util" and "shared-ui" detected`                                        |

**How to tell it:**

1. **Layer rule (slide 12, "arrows only point down")** - `ui` importing a feature is an upward arrow. Nx reports it as a _cycle_ because features already import `ui`: in a healthy layered graph every upward import closes a loop, and Nx checks cycles before it checks tags. The rule behind it (`type:ui` may only depend on `type:util`) fires with its own message when the upward import doesn't close a loop. Run `npm run graph` afterwards to see the loop.
2. **Scope rule** - the second tag family. `type:` says _which layer_, `scope:` says _which slice_. The three strategy demos are islands: they can share `shared`, never each other. That keeps each team's code inside its own area (slide 13, "clear ownership").
3. **Circular dependency (slide 11, second error)** - exactly the message on your slide. Two libs that depend on each other can't be built, tested or published independently.

> Not covered here: slide 11's first error, `imports of apps are forbidden`, because libs can't import the shell in this workspace.

When you finish: `npm run lint` must be green again (all `❌` lines re-commented).

---

## Gotchas and Q&A prep

- **"Why does the Default badge grow 3x per second?"** Three independent `setInterval`s each trigger a global pass; Eager is re-checked on all of them. (Run `npm run start:default` and it grows about once per second instead: the other columns' timers don't exist there.)
- **"Why zone.js?"** The timer contrast needs it: Zone.js patches `setInterval` and starts a pass after every tick. Zoneless apps (`provideZonelessChangeDetection()`) only schedule a pass for signals, `markForCheck()` and template events, which is why signals are the future-proof fix.
- **"Is `markForCheck()` wrong?"** No, it's the right tool for non-signal sources (RxJS, 3rd-party callbacks). `async` pipe uses it for you. Signals just make it automatic.
- **Where does `checked ×N` come from?** `ngDoCheck` of a directive runs each time Angular refreshes the template it sits in, so a skipped OnPush component never increments it (`libs/shared/ui/src/lib/render-count.ts`). It writes to the DOM directly, because a `{{ }}` binding that changes during the pass would throw `ExpressionChangedAfterItHasBeenChecked`.
- **Why doesn't the flash directive trigger more passes?** Its `MutationObserver` runs outside the Angular zone (`libs/shared/ui/src/lib/dom-flash.ts`).
- **Stop button in the OnPush timer** also "fixes" the screen for one pass (Act 4). Don't press it by accident during Act 2.
- **Reset everything:** `git checkout .` (after the `git init` baseline above).
