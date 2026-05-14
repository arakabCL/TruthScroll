const API_TIMEOUT_MS = 2500;

function withTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  return fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  }).finally(() => window.clearTimeout(timeout));
}

export async function syncProgress(progress) {
  const response = await withTimeout('/api/progress', {
    method: 'POST',
    body: JSON.stringify({
      playerId: 'local-player',
      progress,
    }),
  });

  if (!response.ok) {
    throw new Error(`Progress sync failed with ${response.status}`);
  }

  return response.json();
}
