export type DemoColumn = 'default' | 'onpush' | 'signals';

/**
 * BUILD-TIME switch. The value is injected by the Angular builder's `define` option
 * (see `build.options.define` and the `*-only` configurations in apps/shell/project.json),
 * it is not a runtime variable:
 *
 *   'all'                            -> the three columns          nx serve shell                       (port 4200)
 *   'default' | 'onpush' | 'signals' -> just that column           nx serve shell -c onpush-only        (port 4202)
 *
 * Only the shell reads it. The feature libraries never know whether they are shown alone.
 */
declare const DEMO_ONLY: 'all' | DemoColumn;

const COLUMN_TITLES: Record<DemoColumn, string> = {
  default: 'Default (Eager)',
  onpush: 'OnPush - no signals',
  signals: 'OnPush + signals',
};

export const demoOnly = DEMO_ONLY;

/** `true` for the "all" build, or when this column is the one selected. */
export const isColumnShown = (column: DemoColumn): boolean =>
  demoOnly === 'all' || demoOnly === column;

/** Human title and build-configuration name of the single column, `null` in the "all" build. */
export const onlyColumn =
  demoOnly === 'all'
    ? null
    : { title: COLUMN_TITLES[demoOnly], configuration: `${demoOnly}-only` };
