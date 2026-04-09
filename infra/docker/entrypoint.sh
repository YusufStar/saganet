#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
node -e "
var d = require('./dist/data-source').default;
d.initialize()
  .then(function(ds) {
    // Advisory lock prevents concurrent migrations across containers
    return ds.query('SELECT pg_advisory_lock(42)')
      .then(function() { return ds.runMigrations(); })
      .then(function() { return ds.query('SELECT pg_advisory_unlock(42)'); })
      .then(function() { console.log('[entrypoint] Migrations complete'); });
  })
  .then(function() { process.exit(0); })
  .catch(function(e) { console.error('[entrypoint] Migration failed:', e.message); process.exit(1); });
"

echo "[entrypoint] Starting service..."
exec node dist/main
