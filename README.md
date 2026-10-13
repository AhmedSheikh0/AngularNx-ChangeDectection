# Angular change detection + Nx module boundaries - live demo

A teaching workspace for two ideas:

1. **How Angular decides what to re-render** - one counter and one timer, implemented three ways.
2. **Nx module boundaries** - the lint rules that keep the workspace layered.

> Presenting? Open **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)**. It has the order, the talking points, the expected result of every step and the full code of every fix. Every CLI command (run, build, lint, graph, generate, troubleshoot) is in **[COMMANDS.md](COMMANDS.md)**.

## Contents

1. [Run it](#run-it)
2. [Folder structure](#folder-structure)
3. [Where is everything? (lookup table)](#where-is-everything)
4. [Component and directive index](#component-and-directive-index)
5. [Projects, tags and import aliases](#projects-tags-and-import-aliases)
6. [Dependency map (who may import whom)](#dependency-map-who-may-import-whom)
7. [The three strategies](#the-three-strategies)
8. [Marker legend and where each marker lives](#marker-legend-and-where-each-marker-lives)
9. [Generated folders you can ignore](#generated-folders-you-can-ignore)

## Run it

```bash
npm install
npm start          # http://localhost:4200  (open DevTools -> Console with F12)
```

| Command                                                    | What it does                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `npm start`                                                | `nx serve shell` - dev server with live reload on port 4200   |
| `npm run start:default` / `start:onpush` / `start:signals` | one column only, on ports 4201 / 4202 / 4203 (see below)      |
| `npm run build`                                            | `nx build shell` - production build into `dist/apps/shell`    |
| `npm run lint`                                             | `nx run-many -t lint` - lints all 6 projects (boundary rules) |
| `npm run graph`                                            | `nx graph` - opens the interactive project graph              |

Stack: Nx 23, Angular 22, **Zone.js on** (classic change detection), standalone components, ESLint + Prettier. More commands (ports, lint per project, graph, generators, cleanup): [COMMANDS.md](COMMANDS.md).

### One column on its own

A library cannot be served by itself, but the shell can be **built to show a single column**. Run `npm start` (all three, port 4200) next to any of `npm run start:default` (4201), `npm run start:onpush` (4202) or `npm run start:signals` (4203). They are build configurations of the same app, each setting the build-time constant `DEMO_ONLY` (`apps/shell/project.json` + `apps/shell/src/app/demo-only.ts`). Hidden columns are never created, so their timers do not run.

## Folder structure

```
angular-cd-demo/
├── README.md                          this file
├── DEMO_SCRIPT.md                     presenter's script: 8 acts, expected results, full fix code
├── COMMANDS.md                        every CLI command: run, build, lint, graph, generate, troubleshoot
├── package.json                       npm scripts (start / start:* / build / lint / graph) + dependencies
├── nx.json                            Nx config: inferred lint target, cache inputs, generator defaults
├── tsconfig.base.json                 shared TypeScript config + the @demo/* import aliases
├── eslint.config.mjs                  ROOT lint config: the module-boundary rules (depConstraints)
├── .prettierrc / .prettierignore      formatting (single quotes)
├── .gitignore
├── .vscode/extensions.json            recommended editor extensions
│
├── apps/
│   └── shell/                         [scope:shell · type:app] the page that composes everything
│       ├── project.json               build / serve targets, tags, the *-only configurations
│       ├── eslint.config.mjs          app lint config (extends the root one)
│       ├── tsconfig.json              app TS config (strict templates)
│       ├── tsconfig.app.json          app compile config
│       ├── public/favicon.ico
│       └── src/
│           ├── index.html             host page (<demo-root>)
│           ├── main.ts                bootstrapApplication(App, appConfig)
│           ├── styles.css             global styles (body font + background only)
│           └── app/
│               ├── app.config.ts      provideZoneChangeDetection()  <- Zone.js is switched on HERE
│               ├── app.ts             root component (Eager): the global "+1", the log checkbox, which columns to show
│               ├── app.html           header, big button, the 3 columns (each in an @if), legend
│               ├── app.css            page layout
│               └── demo-only.ts       build-time switch DEMO_ONLY: which column(s) this build shows
│
└── libs/
    ├── features/                      one library per change-detection strategy (they are islands)
    │   │
    │   ├── default-cd/                [scope:default · type:feature]  Eager (classic "Default")
    │   │   ├── project.json           tags
    │   │   ├── eslint.config.mjs
    │   │   ├── tsconfig.json / tsconfig.lib.json
    │   │   ├── README.md              (generated stub)
    │   │   └── src/
    │   │       ├── index.ts           PUBLIC API: what other projects may import
    │   │       └── lib/
    │   │           ├── default-cd-counter.ts   plain field, Eager        <- 💥 BREAK 1 / 2
    │   │           ├── default-cd-timer.ts     plain field, Eager        <- 💥 BREAK 1
    │   │           └── default-cd-panel.ts     column wrapper, Eager     <- ❌ BOUNDARY 2
    │   │
    │   ├── onpush/                    [scope:onpush · type:feature]  OnPush, NO signals (the broken one)
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── lib/
    │   │           ├── onpush-counter.ts       plain field, OnPush       <- 🔧 FIX 2 / FIX 3
    │   │           ├── onpush-timer.ts         plain field, OnPush       <- 🔧 FIX 1 / FIX 3
    │   │           └── onpush-panel.ts         column wrapper, OnPush
    │   │
    │   └── onpush-signals/            [scope:signals · type:feature]  OnPush + signal() (the reference solution)
    │       └── src/
    │           ├── index.ts
    │           └── lib/
    │               ├── signals-counter.ts      signal(0), OnPush
    │               ├── signals-timer.ts        signal(0), OnPush
    │               └── signals-panel.ts        column wrapper, OnPush
    │
    └── shared/                        reusable building blocks (no strategy-specific code)
        ├── ui/                        [scope:shared · type:ui]  Angular presentation pieces
        │   └── src/
        │       ├── index.ts
        │       └── lib/
        │           ├── render-count.ts         the "checked ×N" badge directive (ngDoCheck)
        │           ├── dom-flash.ts            the yellow flash directive (MutationObserver)
        │           └── demo-panel/
        │               ├── demo-panel.ts       column component            <- ❌ BOUNDARY 1
        │               ├── demo-panel.html     column markup (title, chip, description, slot)
        │               └── demo-panel.css      colors per strategy + shared card/badge/button look
        │
        └── util/                      [scope:shared · type:util]  plain TypeScript, NO Angular
            └── src/
                ├── index.ts
                └── lib/
                    ├── counter-source.ts       the "outside world" event source the counters listen to
                    ├── demo-log.ts             colored console.log helper     <- ❌ BOUNDARY 3
                    └── demo-config.ts          runtime switch: log every template check
```

Every library has the same skeleton: `project.json` (name + tags), `eslint.config.mjs`, `tsconfig.json` + `tsconfig.lib.json`, and a `src/index.ts` that is its **public API**. Code outside a library may only import what `index.ts` exports.

## Where is everything?

| I want to...                                                     | Go to                                                                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Present the demo step by step                                    | [DEMO_SCRIPT.md](DEMO_SCRIPT.md)                                                                                                 |
| Look up a CLI command (run, build, lint, graph, generate)        | [COMMANDS.md](COMMANDS.md)                                                                                                       |
| Switch Zone.js on/off                                            | [apps/shell/src/app/app.config.ts](apps/shell/src/app/app.config.ts)                                                             |
| Change the page layout or the big "+1 to all counters" button    | [apps/shell/src/app/app.html](apps/shell/src/app/app.html), [app.ts](apps/shell/src/app/app.ts)                                  |
| See what the global "+1" actually calls                          | `incrementAll()` in [app.ts](apps/shell/src/app/app.ts)                                                                          |
| Change the event source the counters listen to                   | [libs/shared/util/src/lib/counter-source.ts](libs/shared/util/src/lib/counter-source.ts)                                         |
| Change the colored console output                                | [libs/shared/util/src/lib/demo-log.ts](libs/shared/util/src/lib/demo-log.ts)                                                     |
| Change what the "log every template check" checkbox flips        | [libs/shared/util/src/lib/demo-config.ts](libs/shared/util/src/lib/demo-config.ts)                                               |
| Change the `checked ×N` badge                                    | [libs/shared/ui/src/lib/render-count.ts](libs/shared/ui/src/lib/render-count.ts)                                                 |
| Change the yellow flash                                          | [libs/shared/ui/src/lib/dom-flash.ts](libs/shared/ui/src/lib/dom-flash.ts)                                                       |
| Restyle the columns, cards, buttons or colors                    | [libs/shared/ui/src/lib/demo-panel/demo-panel.css](libs/shared/ui/src/lib/demo-panel/demo-panel.css)                             |
| Edit the **Default (Eager)** counter / timer                     | [libs/features/default-cd/src/lib/](libs/features/default-cd/src/lib/)                                                           |
| Edit the **OnPush, no signals** counter / timer (the broken one) | [libs/features/onpush/src/lib/](libs/features/onpush/src/lib/)                                                                   |
| Edit the **OnPush + signals** counter / timer (the fixed one)    | [libs/features/onpush-signals/src/lib/](libs/features/onpush-signals/src/lib/)                                                   |
| Change the module-boundary rules                                 | [eslint.config.mjs](eslint.config.mjs) (`depConstraints`)                                                                        |
| See or change a project's tags                                   | that project's `project.json` (`"tags": [...]`)                                                                                  |
| Change an import alias (`@demo/...`)                             | [tsconfig.base.json](tsconfig.base.json) (`paths`)                                                                               |
| Run only one column / change which columns a build shows         | [apps/shell/project.json](apps/shell/project.json) (`*-only` configurations) and [demo-only.ts](apps/shell/src/app/demo-only.ts) |
| Change build options, budgets or the dev server                  | [apps/shell/project.json](apps/shell/project.json)                                                                               |
| Change lint-target behavior or Nx caching                        | [nx.json](nx.json)                                                                                                               |
| Change npm scripts or dependency versions                        | [package.json](package.json)                                                                                                     |

## Component and directive index

All selectors use the prefix `demo` (enforced by lint).

| Class              | Selector                  | Strategy  | File                                                      |
| ------------------ | ------------------------- | --------- | --------------------------------------------------------- |
| `App`              | `demo-root`               | Eager     | `apps/shell/src/app/app.ts`                               |
| `DefaultCdPanel`   | `demo-default-cd-panel`   | Eager     | `libs/features/default-cd/src/lib/default-cd-panel.ts`    |
| `DefaultCdCounter` | `demo-default-cd-counter` | Eager     | `libs/features/default-cd/src/lib/default-cd-counter.ts`  |
| `DefaultCdTimer`   | `demo-default-cd-timer`   | Eager     | `libs/features/default-cd/src/lib/default-cd-timer.ts`    |
| `OnPushPanel`      | `demo-onpush-panel`       | OnPush    | `libs/features/onpush/src/lib/onpush-panel.ts`            |
| `OnPushCounter`    | `demo-onpush-counter`     | OnPush    | `libs/features/onpush/src/lib/onpush-counter.ts`          |
| `OnPushTimer`      | `demo-onpush-timer`       | OnPush    | `libs/features/onpush/src/lib/onpush-timer.ts`            |
| `SignalsPanel`     | `demo-signals-panel`      | OnPush    | `libs/features/onpush-signals/src/lib/signals-panel.ts`   |
| `SignalsCounter`   | `demo-signals-counter`    | OnPush    | `libs/features/onpush-signals/src/lib/signals-counter.ts` |
| `SignalsTimer`     | `demo-signals-timer`      | OnPush    | `libs/features/onpush-signals/src/lib/signals-timer.ts`   |
| `DemoPanel`        | `demo-panel`              | OnPush    | `libs/shared/ui/src/lib/demo-panel/demo-panel.ts`         |
| `RenderCount`      | `[demoRenderCount]`       | directive | `libs/shared/ui/src/lib/render-count.ts`                  |
| `DomFlash`         | `[demoDomFlash]`          | directive | `libs/shared/ui/src/lib/dom-flash.ts`                     |

Non-Angular exports of `libs/shared/util`: `CounterSource` / `globalCounterSource`, `demoLog`, `DemoScope`, `demoConfig`.

## Projects, tags and import aliases

| Nx project                | Folder                         | Tags                            | Import alias                    |
| ------------------------- | ------------------------------ | ------------------------------- | ------------------------------- |
| `shell`                   | `apps/shell`                   | `scope:shell`, `type:app`       | - (it is the app)               |
| `features-default-cd`     | `libs/features/default-cd`     | `scope:default`, `type:feature` | `@demo/features/default-cd`     |
| `features-onpush`         | `libs/features/onpush`         | `scope:onpush`, `type:feature`  | `@demo/features/onpush`         |
| `features-onpush-signals` | `libs/features/onpush-signals` | `scope:signals`, `type:feature` | `@demo/features/onpush-signals` |
| `shared-ui`               | `libs/shared/ui`               | `scope:shared`, `type:ui`       | `@demo/shared/ui`               |
| `shared-util`             | `libs/shared/util`             | `scope:shared`, `type:util`     | `@demo/shared/util`             |

Two tag families: **`type:`** = which layer, **`scope:`** = which slice of the product.

## Dependency map (who may import whom)

```
                      apps/shell                  (type:app, scope:shell: may see every slice)
              ┌──────────┼───────────┐
              ▼          ▼           ▼
        default-cd    onpush    onpush-signals    (type:feature: three islands, NEVER import each other)
              └──────────┼───────────┘
                         ▼
                    shared/ui                     (type:ui:   may only import util)
                         ▼
                    shared/util                   (type:util: imports nothing; no Angular)
```

Arrows only point **down**. Features and the shell may also import `shared/util` directly (for example `demoLog`). The rules are written in [eslint.config.mjs](eslint.config.mjs) and enforced by `@nx/enforce-module-boundaries`:

- **Layer rule** - `app -> feature -> ui -> util`, never upward.
- **Scope rule** - the three feature libs may use `shared`, never each other.
- **Circular dependency guard** - Nx reports cycles the moment they are written.

## The three strategies

| Library                        | Strategy                                            | Counter / timer state | What you see                                                     |
| ------------------------------ | --------------------------------------------------- | --------------------- | ---------------------------------------------------------------- |
| `libs/features/default-cd`     | `ChangeDetectionStrategy.Eager` (the old _Default_) | plain fields          | everything updates, but the template is re-checked on every pass |
| `libs/features/onpush`         | `OnPush`                                            | plain fields          | **console changes, screen frozen** until you apply a `🔧 FIX`    |
| `libs/features/onpush-signals` | `OnPush`                                            | `signal()`            | updates exactly when the value changes, nothing more             |

> Angular 22 made **OnPush the default**. A component with no `changeDetection` property is OnPush, and the classic behaviour is now opt-in with `Eager` (`Default` is a deprecated alias). Angular's own lint rule `prefer-on-push-component-change-detection` warns about it, so the four Eager components (`App` and the three default-cd components) carry an explained `eslint-disable`.

On screen, every counter and timer shows:

- **`checked ×N`** - how many times Angular ran that component's template (`RenderCount`, via `ngDoCheck`)
- **yellow flash** - the DOM text really changed (`DomFlash`, via `MutationObserver`)
- **console logs** - every tick and event, color-coded per strategy (`demoLog`)

## Marker legend and where each marker lives

Search the code for the marker text, for example `FIX 1`.

| Marker          | Meaning                                                                    | Where                                                                           |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `🔧 FIX 1`      | uncomment: `markForCheck()` in the OnPush timer                            | `libs/features/onpush/src/lib/onpush-timer.ts`                                  |
| `🔧 FIX 2`      | uncomment: `markForCheck()` in the OnPush counter                          | `libs/features/onpush/src/lib/onpush-counter.ts`                                |
| `🔧 FIX 3`      | the modern fix: turn the plain field into a `signal()` (steps in comments) | `onpush-timer.ts` and `onpush-counter.ts` (same folder)                         |
| `💥 BREAK 1`    | swap `Eager` for `OnPush` and watch the Default column freeze              | `libs/features/default-cd/src/lib/default-cd-counter.ts`, `default-cd-timer.ts` |
| `💥 BREAK 2`    | delete the `changeDetection` line (Angular 22 then uses OnPush)            | `libs/features/default-cd/src/lib/default-cd-counter.ts`                        |
| `❌ BOUNDARY 1` | layer rule: `ui` imports a feature - `npx nx lint shared-ui`               | `libs/shared/ui/src/lib/demo-panel/demo-panel.ts`                               |
| `❌ BOUNDARY 2` | scope rule: Default imports OnPush - `npx nx lint features-default-cd`     | `libs/features/default-cd/src/lib/default-cd-panel.ts`                          |
| `❌ BOUNDARY 3` | circular dependency: `util` imports `ui` - `npx nx lint shared-util`       | `libs/shared/util/src/lib/demo-log.ts`                                          |

## Generated folders you can ignore

These appear after installing or building and are git-ignored:

| Folder          | What it is                                |
| --------------- | ----------------------------------------- |
| `node_modules/` | installed npm packages                    |
| `.nx/`          | Nx task cache and project-graph cache     |
| `dist/`         | production build output (`npm run build`) |
| `.angular/`     | Angular build cache                       |
