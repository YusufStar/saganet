import * as fs from 'fs';
import * as path from 'path';

function getMigrationFiles(): string[] {
  const appsDir = path.join(__dirname, '../../../../apps');
  const files: string[] = [];

  try {
    const services = fs.readdirSync(appsDir);
    for (const service of services) {
      const migrationsDir = path.join(appsDir, service, 'src', 'migrations');
      if (fs.existsSync(migrationsDir)) {
        const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
        files.push(...migrations.map((m) => path.join(migrationsDir, m)));
      }
    }
  } catch {
    // If running from dist, skip
  }

  return files;
}

describe('Migration idempotency', () => {
  const migrationFiles = getMigrationFiles();

  it('finds migration files across services', () => {
    expect(migrationFiles.length).toBeGreaterThan(0);
  });

  migrationFiles.forEach((filePath) => {
    const fileName = path.basename(filePath);

    it(`${fileName} has a reversible down() method or documented no-op`, () => {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract down() method body
      const downMatch = content.match(/async down\s*\([\s\S]*?\{([\s\S]*)\}\s*$/);
      if (!downMatch) return;

      const downBody = downMatch[1];

      // down() should contain teardown logic OR a comment explaining why it's empty
      const hasTeardown =
        downBody.includes('DROP') ||
        downBody.includes('dropTable') ||
        downBody.includes('dropIndex') ||
        downBody.includes('dropColumn') ||
        downBody.includes('// shared') ||
        downBody.includes('// no-op') ||
        downBody.includes('do not drop');

      expect(hasTeardown).toBe(true);
    });

    it(`${fileName} exports a class with up() and down() methods`, () => {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toMatch(/async up\s*\(/);
      expect(content).toMatch(/async down\s*\(/);
    });
  });
});
