/**
 * Chaos Mode — simulates infrastructure failures via Toxiproxy API.
 *
 * Usage:
 *   npx tsx scripts/chaos.ts              # random chaos (60s cycles)
 *   npx tsx scripts/chaos.ts latency      # add latency to all proxies
 *   npx tsx scripts/chaos.ts timeout      # add timeout to random proxy
 *   npx tsx scripts/chaos.ts reset        # remove all toxics
 */

const TOXIPROXY_API = process.env.TOXIPROXY_API ?? 'http://localhost:8474';

const PROXIES = ['postgres', 'redis', 'kafka'];

// ─── Toxiproxy API helpers ──────────────────────────────────────────────────────

async function api(path: string, method = 'GET', body?: object): Promise<unknown> {
  const res = await fetch(`${TOXIPROXY_API}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Toxiproxy API ${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function addToxic(proxy: string, toxic: object): Promise<void> {
  await api(`/proxies/${proxy}/toxics`, 'POST', toxic);
}

async function removeToxics(proxy: string): Promise<void> {
  const toxics = (await api(`/proxies/${proxy}/toxics`)) as Array<{ name: string }>;
  for (const t of toxics) {
    await api(`/proxies/${proxy}/toxics/${t.name}`, 'DELETE');
  }
}

async function resetAll(): Promise<void> {
  for (const p of PROXIES) {
    await removeToxics(p);
  }
  console.log('All toxics removed.');
}

// ─── Chaos scenarios ────────────────────────────────────────────────────────────

async function addLatency(proxy: string, latencyMs = 2000, jitter = 500): Promise<void> {
  await addToxic(proxy, {
    name: `${proxy}_latency`,
    type: 'latency',
    attributes: { latency: latencyMs, jitter },
  });
  console.log(`[CHAOS] ${proxy}: +${latencyMs}ms latency (jitter: ${jitter}ms)`);
}

async function addTimeout(proxy: string, timeoutMs = 5000): Promise<void> {
  await addToxic(proxy, {
    name: `${proxy}_timeout`,
    type: 'timeout',
    attributes: { timeout: timeoutMs },
  });
  console.log(`[CHAOS] ${proxy}: connection timeout after ${timeoutMs}ms`);
}

async function addSlowClose(proxy: string, delayMs = 3000): Promise<void> {
  await addToxic(proxy, {
    name: `${proxy}_slow_close`,
    type: 'slow_close',
    attributes: { delay: delayMs },
  });
  console.log(`[CHAOS] ${proxy}: slow close ${delayMs}ms`);
}

async function addBandwidthLimit(proxy: string, kbPerSec = 1): Promise<void> {
  await addToxic(proxy, {
    name: `${proxy}_bandwidth`,
    type: 'bandwidth',
    attributes: { rate: kbPerSec },
  });
  console.log(`[CHAOS] ${proxy}: bandwidth limited to ${kbPerSec}KB/s`);
}

// ─── Random chaos loop ──────────────────────────────────────────────────────────

const SCENARIOS = [
  async () => { const p = randomProxy(); await addLatency(p); },
  async () => { const p = randomProxy(); await addTimeout(p); },
  async () => { const p = randomProxy(); await addSlowClose(p); },
  async () => { const p = randomProxy(); await addBandwidthLimit(p); },
];

function randomProxy(): string {
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

async function randomChaos(): Promise<void> {
  console.log('\n🔥 CHAOS MODE — Starting random failure injection...\n');
  console.log('Press Ctrl+C to stop and reset.\n');

  process.on('SIGINT', async () => {
    console.log('\n\nStopping chaos mode...');
    await resetAll();
    process.exit(0);
  });

  while (true) {
    // Reset previous toxics
    await resetAll();

    // Pick 1-2 random scenarios
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      try {
        await scenario();
      } catch (err) {
        console.error(`[CHAOS] Failed to inject:`, (err as Error).message);
      }
    }

    // Let the chaos run for 30-90 seconds
    const duration = 30_000 + Math.random() * 60_000;
    console.log(`[CHAOS] Holding for ${Math.round(duration / 1000)}s...\n`);
    await new Promise((r) => setTimeout(r, duration));
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const cmd = process.argv[2];

  switch (cmd) {
    case 'latency':
      for (const p of PROXIES) await addLatency(p);
      break;
    case 'timeout':
      await addTimeout(randomProxy());
      break;
    case 'reset':
      await resetAll();
      break;
    default:
      await randomChaos();
  }
}

main().catch((err) => {
  console.error('Chaos script failed:', err.message);
  process.exit(1);
});
