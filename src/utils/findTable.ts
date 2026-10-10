const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

export interface FindTableResult {
  rows: unknown[] | null;
  available: string[];
}

export const findTable = (payload: unknown, keys: string[]): FindTableResult => {
  const found: Record<string, unknown[]> = {};

  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      if (node.length === 0 || isObj(node[0])) found[path] = node;
      return;
    }
    if (isObj(node)) {
      Object.entries(node).forEach(([k, v]) => walk(v, path ? `${path}.${k}` : k));
    }
  };

  walk(payload, "");

  for (const key of keys) {
    const match = Object.keys(found).find((p) => p === key || p.endsWith(`.${key}`));
    if (match !== undefined) return { rows: found[match], available: Object.keys(found) };
  }

  return { rows: null, available: Object.keys(found) };
};