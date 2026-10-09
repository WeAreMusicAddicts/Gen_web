const path = require('path');
const crypto = require('crypto');
const { getDatabaseClass } = require('./get-db-class');

const DatabaseSync = getDatabaseClass();
const dbPath = path.join(__dirname, 'database.sqlite');

const newPassword = process.argv[2] || 'admin';
const hash = crypto.createHash('sha256').update(newPassword).digest('hex');

try {
  const db = new DatabaseSync(dbPath);
  db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('admin_password_hash', hash);
  console.log(`\n✅ Пароль администратора успешно изменен на: "${newPassword}"\n`);
  if (typeof db.close === 'function') db.close();
} catch (err) {
  console.error('Ошибка при смене пароля:', err.message);
}
