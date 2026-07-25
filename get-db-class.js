function getDatabaseClass() {
  // 1. Try native node:sqlite (Node.js 22.5.0+)
  try {
    const { DatabaseSync } = require('node:sqlite');
    if (DatabaseSync) return DatabaseSync;
  } catch (e) {}

  // 2. Try better-sqlite3 (standard module on Linux/Render)
  try {
    const BetterSqlite = require('better-sqlite3');
    if (BetterSqlite) return BetterSqlite;
  } catch (e) {}

  throw new Error('No SQLite database driver available. Please use Node.js >= 22.5.0 or install better-sqlite3.');
}

module.exports = { getDatabaseClass };
