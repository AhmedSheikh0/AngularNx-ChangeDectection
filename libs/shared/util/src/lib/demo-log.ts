// ❌ BOUNDARY 3 - circular dependency
//    `shared-ui` already imports `shared-util`. Uncomment the next line and util would import
//    ui back -> the two libs depend on each other and can no longer be built, tested or
//    published independently. Run:
//      npx nx lint shared-util
//    Expect: Circular dependency between "shared-util" and "shared-ui" detected
//    (the layer rule would reject this import too, but the cycle is reported first).
// import { DemoPanel } from '@demo/shared/ui';

export type DemoScope = 'source' | 'default' | 'onpush' | 'signals';

const COLORS: Record<DemoScope, string> = {
  source: '#495057',
  default: '#e8590c',
  onpush: '#1c7ed6',
  signals: '#2f9e44',
};

/**
 * Colored, labeled console.log. Open DevTools (F12) while presenting:
 * the console shows the values changing even when the screen does not.
 */
export function demoLog(scope: DemoScope, message: string): void {
  const badge = `background:${COLORS[scope]};color:#fff;padding:1px 6px;border-radius:3px;font-weight:600`;
  console.log(`%c${scope.padEnd(7)}%c ${message}`, badge, 'color:inherit');
}
