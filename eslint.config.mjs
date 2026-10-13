import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      /**
       * MODULE BOUNDARIES - the whole demo in 20 lines.
       * Every project carries two tags (see its project.json):
       *   type:*   -> WHICH LAYER it belongs to   (app > feature > ui > util)
       *   scope:*  -> WHICH SLICE it belongs to   (default | onpush | signals | shared | shell)
       * A project may only import projects that satisfy ALL constraints of ALL its tags.
       *
       * To see a rule fire, uncomment a `❌ BOUNDARY n` import in the code and run `npx nx lint <project>`.
       */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\.base)?\.config\.[cm]?[jt]s$'],
          depConstraints: [
            // ---------- LAYER RULE:  app -> feature -> ui -> util (never upward) ----------
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },

            // ---------- SCOPE RULE: each strategy demo is an island ----------
            // (feature libs may use `shared`, but never each other)
            {
              sourceTag: 'scope:default',
              onlyDependOnLibsWithTags: ['scope:default', 'scope:shared'],
            },
            {
              sourceTag: 'scope:onpush',
              onlyDependOnLibsWithTags: ['scope:onpush', 'scope:shared'],
            },
            {
              sourceTag: 'scope:signals',
              onlyDependOnLibsWithTags: ['scope:signals', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              // the shell is the only project allowed to see every slice
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: [
                'scope:default',
                'scope:onpush',
                'scope:signals',
                'scope:shared',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
