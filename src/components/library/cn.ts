/**
 * cn — minimal class-name joiner ported from the SEIHouse UI repo
 * (`packages/seihouse-ui/src/styles/cn.ts`).
 *
 * The SEIHouse original composes `clsx` + `tailwind-merge`. This app does not
 * carry those dependencies, so this port keeps the same call signature and
 * conditional handling without the extra packages. It does NOT de-duplicate
 * conflicting Tailwind utilities: when a caller passes `className`, it is
 * appended last so later utilities win by CSS ordering. Prefer adding a
 * variant to LibraryButton over overriding its classes from a page.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: unknown };

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(' ');
}
