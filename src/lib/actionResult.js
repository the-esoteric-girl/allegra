export function ok(data = null) {
  return { ok: true, data, error: null };
}

export function fail(error, data = null) {
  return { ok: false, data, error };
}

