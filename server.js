const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDatabaseClass } = require('./get-db-class');
const DatabaseSync = getDatabaseClass();
const { seedData, initDatabase } = require('./seed-db');

const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'database.sqlite');

// Make sure DB exists
if (!fs.existsSync(dbPath)) {
  seedData();
}

const db = new DatabaseSync(dbPath);
initDatabase(db);

const activeTokens = new Set();

function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function getStoredPasswordHash() {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('admin_password_hash');
  if (!row || !row.value) return hashPassword('admin');
  let val = row.value;
  try {
    const parsed = JSON.parse(val);
    if (typeof parsed === 'string') val = parsed;
  } catch(e) {}
  return String(val).trim();
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || req.headers['x-admin-token'];
  if (token && activeTokens.has(token)) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Admin authentication required', requireAuth: true });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Utility to helper convert DB rows to device structure for client
function getDevicesForClient() {
  const devicesRows = db.prepare('SELECT * FROM devices ORDER BY sort_order ASC, id ASC').all();
  const servicesRows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all();
  const diagRows = db.prepare('SELECT * FROM diagnostics ORDER BY sort_order ASC, id ASC').all();

  const servicesByDev = {};
  servicesRows.forEach(s => {
    const key = `${s.tech}:${s.device_key}`;
    if (!servicesByDev[key]) servicesByDev[key] = {};
    servicesByDev[key][s.service_key] = s.commands_template;
  });

  const diagsByDev = {};
  diagRows.forEach(d => {
    const key = `${d.tech}:${d.device_key}`;
    if (!diagsByDev[key]) diagsByDev[key] = {};
    if (!diagsByDev[key][d.category]) diagsByDev[key][d.category] = [];
    diagsByDev[key][d.category].push({
      id: d.id,
      command: d.command,
      description: d.description
    });
  });

  const devices = { adsl: {}, fttb: {}, gpon: {} };
  const defaultPorts = {};

  devicesRows.forEach(dev => {
    const tech = dev.tech;
    if (!devices[tech]) devices[tech] = {};

    defaultPorts[dev.key] = dev.default_port || '0/1';

    const devKey = `${tech}:${dev.key}`;
    const devSvc = servicesByDev[devKey] || {};
    const devDiags = diagsByDev[devKey] || {};

    devices[tech][dev.key] = {
      id: dev.id,
      key: dev.key,
      label: dev.label,
      tech: dev.tech,
      defaultPort: dev.default_port,
      services: tech === 'fttb' ? {} : devSvc,
      modes: tech === 'fttb' ? devSvc : {},
      diagnostics: devDiags
    };
  });

  const settingsRows = db.prepare('SELECT * FROM app_settings').all();
  const settings = {};
  settingsRows.forEach(row => {
    try { settings[row.key] = JSON.parse(row.value); }
    catch(e) { settings[row.key] = row.value; }
  });

  return { devices, defaultPorts, settings };
}

// REST API Routes

// GET /api/init - Everything needed for main app
app.get('/api/init', (req, res) => {
  try {
    const data = getDevicesForClient();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Authentication API
// -------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Пароль не может быть пустым' });
  }

  const hash = hashPassword(password);
  const storedHash = getStoredPasswordHash();

  if (hash === storedHash) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Неверный пароль администратора' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || req.headers['x-admin-token'];
  if (token) activeTokens.delete(token);
  res.json({ success: true });
});

app.get('/api/admin/check-auth', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || req.headers['x-admin-token'];
  if (token && activeTokens.has(token)) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/admin/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const currPass = String(currentPassword || '').trim();
  const newPass = String(newPassword || '').trim();

  if (!newPass || newPass.length < 3) {
    return res.status(400).json({ error: 'Новый пароль должен содержать не менее 3 символов' });
  }

  const storedHash = getStoredPasswordHash();
  if (hashPassword(currPass) !== storedHash) {
    return res.status(400).json({ error: 'Текущий пароль указан неверно' });
  }

  const newHash = hashPassword(newPass);
  db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)').run('admin_password_hash', newHash);
  res.json({ success: true, message: 'Пароль успешно обновлен!' });
});

// GET /api/admin/devices - Get raw device list
app.get('/api/admin/devices', (req, res) => {
  try {
    const devices = db.prepare('SELECT * FROM devices ORDER BY tech ASC, sort_order ASC, id ASC').all();
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/devices/:id/full - Get full device details with services & diagnostics
app.get('/api/admin/devices/:id/full', (req, res) => {
  try {
    const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const services = db.prepare('SELECT * FROM services WHERE tech = ? AND device_key = ? ORDER BY sort_order ASC, id ASC')
      .all(device.tech, device.key);

    const diagnostics = db.prepare('SELECT * FROM diagnostics WHERE tech = ? AND device_key = ? ORDER BY sort_order ASC, id ASC')
      .all(device.tech, device.key);

    res.json({ device, services, diagnostics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/devices - Create device
app.post('/api/admin/devices', requireAdminAuth, (req, res) => {
  const { tech, key, label, default_port, sort_order } = req.body;
  if (!tech || !key || !label) {
    return res.status(400).json({ error: 'tech, key, and label are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO devices (tech, key, label, default_port, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(tech, key, label, default_port || '0/1', sort_order || 999);
    const newId = Number(result.lastInsertRowid);
    res.json({ success: true, id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/devices/:id - Update device
app.put('/api/admin/devices/:id', requireAdminAuth, (req, res) => {
  const { tech, key, label, default_port, sort_order } = req.body;
  const id = req.params.id;

  try {
    const oldDev = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    if (!oldDev) return res.status(404).json({ error: 'Device not found' });

    // Update devices table
    db.prepare(`
      UPDATE devices
      SET tech = ?, key = ?, label = ?, default_port = ?, sort_order = ?
      WHERE id = ?
    `).run(tech, key, label, default_port || '0/1', sort_order || 0, id);

    // If key or tech changed, update services & diagnostics references
    if (oldDev.key !== key || oldDev.tech !== tech) {
      db.prepare('UPDATE services SET tech = ?, device_key = ? WHERE tech = ? AND device_key = ?')
        .run(tech, key, oldDev.tech, oldDev.key);
      db.prepare('UPDATE diagnostics SET tech = ?, device_key = ? WHERE tech = ? AND device_key = ?')
        .run(tech, key, oldDev.tech, oldDev.key);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/devices/:id - Delete device
app.delete('/api/admin/devices/:id', requireAdminAuth, (req, res) => {
  const id = req.params.id;
  try {
    const dev = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
    if (dev) {
      db.prepare('DELETE FROM services WHERE tech = ? AND device_key = ?').run(dev.tech, dev.key);
      db.prepare('DELETE FROM diagnostics WHERE tech = ? AND device_key = ?').run(dev.tech, dev.key);
      db.prepare('DELETE FROM devices WHERE id = ?').run(id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/services - Create service
app.post('/api/admin/services', requireAdminAuth, (req, res) => {
  const { tech, device_key, service_key, label, commands_template, multicast_template, required_fields, sort_order } = req.body;
  if (!tech || !device_key || !service_key || !label) {
    return res.status(400).json({ error: 'tech, device_key, service_key, and label are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO services (tech, device_key, service_key, label, commands_template, multicast_template, required_fields, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      tech, device_key, service_key, label,
      commands_template || '', multicast_template || '',
      JSON.stringify(required_fields || []), sort_order || 0
    );
    res.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/services/:id - Update service
app.put('/api/admin/services/:id', requireAdminAuth, (req, res) => {
  const { tech, device_key, service_key, label, commands_template, multicast_template, required_fields, sort_order } = req.body;
  const id = req.params.id;

  try {
    db.prepare(`
      UPDATE services
      SET tech = ?, device_key = ?, service_key = ?, label = ?, commands_template = ?, multicast_template = ?, required_fields = ?, sort_order = ?
      WHERE id = ?
    `).run(
      tech, device_key, service_key, label,
      commands_template || '', multicast_template || '',
      JSON.stringify(required_fields || []), sort_order || 0,
      id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/services/:id - Delete service
app.delete('/api/admin/services/:id', requireAdminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/diagnostics - Create diagnostic command
app.post('/api/admin/diagnostics', requireAdminAuth, (req, res) => {
  const { tech, device_key, category, command, description, sort_order } = req.body;
  if (!tech || !device_key || !category || !command) {
    return res.status(400).json({ error: 'tech, device_key, category, and command are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO diagnostics (tech, device_key, category, command, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(tech, device_key, category, command, description || '', sort_order || 0);
    res.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/diagnostics/:id - Update diagnostic command
app.put('/api/admin/diagnostics/:id', requireAdminAuth, (req, res) => {
  const { tech, device_key, category, command, description, sort_order } = req.body;
  const id = req.params.id;

  try {
    db.prepare(`
      UPDATE diagnostics
      SET tech = ?, device_key = ?, category = ?, command = ?, description = ?, sort_order = ?
      WHERE id = ?
    `).run(tech, device_key, category, command, description || '', sort_order || 0, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/diagnostics/:id - Delete diagnostic command
app.delete('/api/admin/diagnostics/:id', requireAdminAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM diagnostics WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Settings API (Profile lists & custom variables)
app.get('/api/admin/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM app_settings').all();
    const settings = {};
    rows.forEach(r => {
      try { settings[r.key] = JSON.parse(r.value); }
      catch(e) { settings[r.key] = r.value; }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
    for (const [key, val] of Object.entries(req.body)) {
      const strVal = typeof val === 'string' ? val : JSON.stringify(val);
      stmt.run(key, strVal);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset DB to initial seed state
app.post('/api/admin/reset-db', requireAdminAuth, (req, res) => {
  try {
    seedData();
    res.json({ success: true, message: 'Database reset to default seed successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export Database as JSON
app.get('/api/admin/export', (req, res) => {
  try {
    const data = {
      devices: db.prepare('SELECT * FROM devices').all(),
      services: db.prepare('SELECT * FROM services').all(),
      diagnostics: db.prepare('SELECT * FROM diagnostics').all(),
      app_settings: db.prepare('SELECT * FROM app_settings').all()
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=gpon_generator_db_backup.json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import Database from JSON
app.post('/api/admin/import', requireAdminAuth, (req, res) => {
  const data = req.body;
  if (!data || !data.devices) {
    return res.status(400).json({ error: 'Invalid backup format' });
  }

  try {
    db.exec('DELETE FROM devices; DELETE FROM services; DELETE FROM diagnostics; DELETE FROM app_settings;');

    if (Array.isArray(data.devices)) {
      const stmt = db.prepare('INSERT INTO devices (id, tech, key, label, default_port, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
      data.devices.forEach(d => stmt.run(d.id, d.tech, d.key, d.label, d.default_port, d.sort_order));
    }
    if (Array.isArray(data.services)) {
      const stmt = db.prepare('INSERT INTO services (id, tech, device_key, service_key, label, commands_template, multicast_template, required_fields, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      data.services.forEach(s => stmt.run(s.id, s.tech, s.device_key, s.service_key, s.label, s.commands_template, s.multicast_template, s.required_fields, s.sort_order));
    }
    if (Array.isArray(data.diagnostics)) {
      const stmt = db.prepare('INSERT INTO diagnostics (id, tech, device_key, category, command, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
      data.diagnostics.forEach(d => stmt.run(d.id, d.tech, d.device_key, d.category, d.command, d.description, d.sort_order));
    }

    res.json({ success: true, message: 'Database imported successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (bound to 0.0.0.0)`);
  console.log(`Admin Panel available at /admin`);
});
