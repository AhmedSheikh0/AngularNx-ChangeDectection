# Command reference

Every command you need to run, inspect, check and extend this workspace. Run them from the project root (`angular-cd-demo/`). They work in Git Bash, PowerShell and macOS/Linux shells unless a section says otherwise.

> **Verified** on this workspace (Nx 23.2, Angular 22, Node 24) unless marked **(not run here)**.

## Contents

1. [Cheat sheet](#cheat-sheet)
2. [Setup](#setup)
3. [Run the app](#run-the-app)
4. [Build](#build)
5. [Lint and module boundaries](#lint-and-module-boundaries)
6. [Inspect the workspace (graph, projects)](#inspect-the-workspace)
7. [Formatting](#formatting)
8. [Cache and cleanup](#cache-and-cleanup)
9. [Generate new code](#generate-new-code)
10. [Git, restore point and `affected`](#git-restore-point-and-affected)
11. [Troubleshooting](#troubleshooting)

## Cheat sheet

| I want to...                         | Command                                                        |
| ------------------------------------ | -------------------------------------------------------------- |
| Start the demo (all three columns)   | `npm start`                                                    |
| Start ONE column only (own port)     | `npm run start:onpush` (also `start:default`, `start:signals`) |
| Lint everything (boundary rules)     | `npm run lint`                                                 |
| Production build                     | `npm run build`                                                |
| See the project graph                | `npm run graph`                                                |
| Lint one project                     | `npx nx lint shared-ui`                                        |
| Serve the production build           | `npx nx serve-static shell`                                    |
| Check formatting                     | `npx nx format:check`                                          |
| Clear Nx caches                      | `npx nx reset`                                                 |
| Undo all live edits (after git init) | `git checkout .`                                               |

## Setup

```bash
npm install                 # install dependencies (first time, or after pulling)
npx nx --version            # confirm Nx is available: Local: v23.2.0
```

Requirements: Node.js `^22.22.3`, `^24.15.0` or `>=26` (Angular 22's requirement; tested on 24.16) and npm. Nx is a local dependency, so always call it through `npx nx ...` (or an npm script). There is no global install to maintain.

## Run the app

Only the `shell` project is runnable (the libraries are consumed by it). A library can never be served by itself, but the shell can be built to show **one column only**: see [One column only](#one-column-only-several-servers-at-once) below.

| Command                                         | What it does                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `npm start`                                     | Dev server with live reload on <http://localhost:4200>              |
| `npx nx serve shell`                            | Same as above, called directly                                      |
| `npx nx serve shell --port=4300`                | Dev server on another port                                          |
| `npx nx serve shell --open`                     | Dev server, and open the browser automatically                      |
| `npx nx serve shell --configuration=production` | Dev server running the optimized production config                  |
| `npx nx serve-static shell`                     | Builds production, then serves the static files (default port 4200) |
| `npx nx serve-static shell --port=4300`         | Same, on another port                                               |

Stop any of them with `Ctrl+C`.

### One column only (several servers at once)

The same `shell` app can be built to show a single column. These are build configurations in `apps/shell/project.json`, each with its own default port, so **all four can run side by side**:

| Command                 | Port | Shows                    |
| ----------------------- | ---- | ------------------------ |
| `npm start`             | 4200 | all three columns        |
| `npm run start:default` | 4201 | Default (Eager) only     |
| `npm run start:onpush`  | 4202 | OnPush, no signals, only |
| `npm run start:signals` | 4203 | OnPush + signals, only   |

Without npm: `npx nx serve shell -c default-only`, `-c onpush-only` or `-c signals-only`. Add `--port=NNNN` to override the port.

Use one terminal per server, for example:

```bash
# terminal 1: everything
npm start

# terminal 2: just the OnPush column
npm run start:onpush
```

Good to know:

- **How it works:** each configuration sets `define: { DEMO_ONLY: "'onpush'" }` (build time). `apps/shell/src/app/demo-only.ts` reads it and the shell template renders only that column. The libraries never know.
- **The hidden columns are never created**, so their timers do not run and cannot trigger change detection for the visible one. Example: the Default column's `checked` badge grows about 1 per second on port 4201 instead of about 3 per second on port 4200.
- **The other feature libs are still imported in code.** They are in the bundle but never instantiated, so `nx graph` and lint are unchanged.
- **These are development-style builds** (unoptimized, with source maps), so Angular's dev-mode checks stay on.
- The page shows a yellow banner and the browser tab title names the column, so side-by-side windows are easy to tell apart.
- All servers read the same files: uncomment a `🔧 FIX` and every open page reloads.

Presenting? Use `npm start`: saving a file reloads the page, which is what the live `FIX` and `BREAK` steps rely on. Open the browser console with `F12`.

## Build

| Command                                          | What it does                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `npm run build`                                  | Production build of `shell` into `dist/apps/shell`                                                 |
| `npx nx build shell`                             | Same (production is the default configuration)                                                     |
| `npx nx build shell --configuration=development` | Unminified build with source maps                                                                  |
| `npx nx run shell:build:development`             | Same, in the long `project:target:configuration` form                                              |
| `npx nx build shell --skip-nx-cache`             | Force a real rebuild (ignore the Nx cache)                                                         |
| `npx nx build shell -c onpush-only`              | Single-column build into `dist/apps/shell-onpush-only` (also `-c default-only`, `-c signals-only`) |
| `npx nx run-many -t build`                       | Build every project that has a build target (only `shell`)                                         |

## Lint and module boundaries

Linting is also where the **module-boundary rules** run (`@nx/enforce-module-boundaries`, configured in `eslint.config.mjs`).

| Command                                            | What it does                                                   |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `npm run lint`                                     | Lint all 6 projects                                            |
| `npx nx run-many -t lint`                          | Same, called directly                                          |
| `npx nx run-many -t lint -p shared-ui shared-util` | Lint only the listed projects                                  |
| `npx nx run-many -t lint --skip-nx-cache`          | Lint everything, ignoring cached results                       |
| `npx nx lint <project>`                            | Lint one project (names below)                                 |
| `npx nx run shell:lint`                            | Same, in the `project:target` form                             |
| `npx nx lint <project> --fix`                      | Auto-fix what ESLint can fix (it will not fix boundary errors) |

### Project names

| Project name              | Folder                         |
| ------------------------- | ------------------------------ |
| `shell`                   | `apps/shell`                   |
| `features-default-cd`     | `libs/features/default-cd`     |
| `features-onpush`         | `libs/features/onpush`         |
| `features-onpush-signals` | `libs/features/onpush-signals` |
| `shared-ui`               | `libs/shared/ui`               |
| `shared-util`             | `libs/shared/util`             |

### Module-boundary demo (uncomment the `❌ BOUNDARY n` import first)

| Demo | Command                           | Expected error                                                                  |
| ---- | --------------------------------- | ------------------------------------------------------------------------------- |
| 1    | `npx nx lint shared-ui`           | `Circular dependency between "shared-ui" and "features-default-cd" detected`    |
| 2    | `npx nx lint features-default-cd` | `A project tagged with "scope:default" can only depend on libs tagged with ...` |
| 3    | `npx nx lint shared-util`         | `Circular dependency between "shared-util" and "shared-ui" detected`            |

Re-comment the line afterwards and run `npm run lint`: it must be green again. Details are in [DEMO_SCRIPT.md](DEMO_SCRIPT.md), Act 8.

## Inspect the workspace

| Command                                        | What it does                                       |
| ---------------------------------------------- | -------------------------------------------------- |
| `npm run graph`                                | Open the interactive project graph in the browser  |
| `npx nx graph --focus=shared-ui`               | Graph focused on one project                       |
| `npx nx graph --file=graph.json`               | Write the graph to a JSON file (no browser)        |
| `npx nx graph --print`                         | Print the graph as JSON to the terminal            |
| `npx nx show projects`                         | List all project names                             |
| `npx nx show projects --projects "features-*"` | List projects matching a pattern                   |
| `npx nx show projects --with-target build`     | List projects that have a given target             |
| `npx nx show project shell`                    | Show one project's targets, tags and configuration |
| `npx nx show project shell --web`              | Same, in the browser                               |
| `npx nx list`                                  | List installed Nx plugins                          |

The graph should show: `shell` -> the three feature libs and `shared-util`; every feature -> `shared-ui` and `shared-util`; `shared-ui` -> `shared-util`; nothing points up.

## Formatting

| Command                          | What it does                                             |
| -------------------------------- | -------------------------------------------------------- |
| `npx nx format:check`            | Fail if any file is not Prettier-formatted (exit code 1) |
| `npx nx format:write`            | Reformat all files in place                              |
| `npx prettier --check .`         | Same check, using Prettier directly                      |
| `npx prettier --write libs apps` | Reformat only the source folders                         |

## Cache and cleanup

Nx caches task results, so repeating a task with unchanged files is instant. If results ever look stale:

```bash
npx nx reset                # clear the Nx task cache and project-graph cache
```

Remove generated build output (Git Bash / macOS / Linux):

```bash
rm -rf dist .angular
```

PowerShell:

```powershell
Remove-Item -Recurse -Force dist, .angular -ErrorAction SilentlyContinue
```

Full reinstall if `node_modules` is ever in a bad state:

```bash
rm -rf node_modules && npm install
```

## Generate new code

Always add `--dry-run` first: it prints what would be created or changed and touches nothing.

### New feature library

```bash
npx nx g @nx/angular:library libs/features/example \
  --name=features-example \
  --importPath=@demo/features/example \
  --prefix=demo --standalone --skipModule \
  --unitTestRunner=none --linter=eslint \
  --tags="scope:example,type:feature" \
  --dry-run --no-interactive
```

Remove `--dry-run` to create it. It adds `libs/features/example/`, the `@demo/features/example` alias in `tsconfig.base.json`, and the tags. For a new `scope:` you must also add a matching `scope:example` block to `depConstraints` in `eslint.config.mjs`, or the new lib will not be restricted. PowerShell: put the command on one line (replace the `\` line breaks with spaces).

### New framework-free utility library

```bash
npx nx g @nx/js:library libs/shared/example --name=shared-example --importPath=@demo/shared/example --bundler=none --unitTestRunner=none --linter=eslint --useProjectJson --tags="scope:shared,type:util" --dry-run --no-interactive
```

### New component inside an existing library

```bash
npx nx g @nx/angular:component libs/features/onpush/src/lib/extra/extra --skip-tests --dry-run --no-interactive
```

Remember to export it from that library's `src/index.ts` if other projects need it. Angular 22 components are OnPush unless you set `changeDetection`.

> **Do not name a library folder `tmp`.** `.gitignore` ignores `tmp`, and Nx respects `.gitignore`, so such a project is silently invisible.

## Git, restore point and `affected`

This folder is **not** a git repository yet. Create a baseline so you can undo every live edit during a demo:

```bash
git init -b main
git add -A
git commit -m "demo baseline"
```

| Command                                                    | What it does                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `git checkout .`                                           | Discard all uncommitted edits (resets every FIX / BREAK / BOUNDARY) |
| `git status`                                               | See what you changed during the demo                                |
| `npx nx affected -t lint` **(not run here)**               | Lint only projects affected by changes since `main`                 |
| `npx nx affected -t lint --uncommitted` **(not run here)** | Lint only projects touched by your uncommitted edits                |

`nx affected` needs a git repository with a `main` branch. Without one it stops with `Could not access 'main'`.

## Troubleshooting

| Symptom                                      | Fix                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Port 4200 is already in use`                | Use another port: `npx nx serve shell --port=4300`, or free the port (below)           |
| A stopped server still answers on its port   | Find and stop the leftover process (below)                                             |
| Lint result looks stale or wrong             | `npx nx reset`, then `npx nx run-many -t lint --skip-nx-cache`                         |
| `Cannot find project '...'`                  | Check the name with `npx nx show projects`; avoid folders named `tmp`                  |
| `nx affected` says `Could not access 'main'` | Not a git repo yet: see the git section above                                          |
| `npm warn allow-scripts ...` during install  | Harmless here: build, serve and lint all work. It only reports skipped install scripts |
| A `.ts` change did nothing in the browser    | Check the terminal running `npm start` for a compile error                             |

Free a port on Windows (PowerShell):

```powershell
Get-NetTCPConnection -LocalPort 4200 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID-from-above>
```

Free a port on macOS/Linux:

```bash
lsof -ti :4200 | xargs kill
```
