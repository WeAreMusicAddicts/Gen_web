const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, 'database.sqlite');

function initDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tech TEXT NOT NULL,
      key TEXT NOT NULL,
      label TEXT NOT NULL,
      default_port TEXT DEFAULT '0/1',
      sort_order INTEGER DEFAULT 0,
      UNIQUE(tech, key)
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tech TEXT NOT NULL,
      device_key TEXT NOT NULL,
      service_key TEXT NOT NULL,
      label TEXT NOT NULL,
      commands_template TEXT NOT NULL,
      multicast_template TEXT DEFAULT '',
      required_fields TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      UNIQUE(tech, device_key, service_key)
    );

    CREATE TABLE IF NOT EXISTS diagnostics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tech TEXT NOT NULL,
      device_key TEXT NOT NULL,
      category TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedData() {
  if (fs.existsSync(dbPath)) {
    try { fs.unlinkSync(dbPath); } catch(e){}
  }

  const db = new DatabaseSync(dbPath);
  initDatabase(db);

  // Load static files
  const context = { window: {} };
  vm.createContext(context);

  ['adsl.js', 'fttb.js', 'gpon.js'].forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf8');
      vm.runInContext(code, context);
    }
  });

  const defaultPorts = {
    huawei: '1/1/1',
    huawei_5616: '0/1',
    electra: '0/1/26',
    iskratel_mwgl0s92: '0/1',
    eltex_ma4000: '1/1/1',
    eltex_ltp: '1/1',
    eltex_2428: '0/1',
    eltex: '1/0/1',
    edgecore_es3526_xa: '1/1',
    edgecore_es3526_m: '1/1',
    alsitek: 'e1',
    alsitek_fttb: 'e1',
    edgecore_es3528_m: '1/1',
    dlink_des3200: '1',
    qtech: '1/0/3',
    huawei_switch: '0/0/1',
    huawei_3328: '0/0/1',
    si3000: '1/1',
    snr: '1/1',
    zyxel_fttb: '1/1',
    zyxel_aam1008: '1'
  };

  class SmartPort extends String {
    split(sep) {
      if (sep === '/') return ['{slot}', '{portNum}'];
      return [this.toString()];
    }
  }

  const sampleVars = {
    port: new SmartPort('{port}'),
    vlan: '{vlan}',
    vpi: '{vpi}',
    vci: '{vci}',
    mcastVlan: '{mcastVlan}',
    ontId: '{ontId}',
    sn: '{sn}',
    ploam: '{ploam}',
    desc: '{desc}',
    accessVlan: '{accessVlan}',
    allowedVlans: '{allowedVlans}',
    nativeVlan: '{nativeVlan}',
    tr069Vlan: '{tr069Vlan}',
    pppoeVlan: '{pppoeVlan}',
    taggedVlan: '{taggedVlan}',
    portType: '{portType}',
    srvProfile: '{srvProfile}',
    lineProfile: '{lineProfile}',
    ontModel: '{ontModel}',
    imsVlan: '{imsVlan}',
    internetVlan: '{internetVlan}',
    iptvVlan: '{iptvVlan}',
    mgmtVlan: '{mgmtVlan}',
    vpnVlan: '{vpnVlan}',
    vpnEnabled: true
  };

  const insertDeviceStmt = db.prepare(`
    INSERT INTO devices (tech, key, label, default_port, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertServiceStmt = db.prepare(`
    INSERT INTO services (tech, device_key, service_key, label, commands_template, multicast_template, required_fields, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDiagStmt = db.prepare(`
    INSERT INTO diagnostics (tech, device_key, category, command, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const techs = {
    adsl: context.window.adslDevices || {},
    fttb: context.window.fttbDevices || {},
    gpon: context.window.gponDevices || {}
  };

  let devOrder = 0;

  for (const [tech, devices] of Object.entries(techs)) {
    for (const [key, dev] of Object.entries(devices)) {
      if (key === 'sib_templates') continue;

      devOrder++;
      const defPort = defaultPorts[key] || (tech === 'gpon' ? '0/1' : (tech === 'adsl' ? '0/1' : '0/1'));
      
      insertDeviceStmt.run(tech, key, dev.label || key, defPort, devOrder);

      // Services / Modes
      const svcs = dev.services || dev.modes || {};
      let svcOrder = 0;
      for (const [sKey, fnOrObj] of Object.entries(svcs)) {
        svcOrder++;
        let tpl = '';
        let mcastTpl = '';
        let label = sKey.toUpperCase();

        if (sKey === 'pppoe') label = 'PPPoE (Интернет)';
        else if (sKey === 'iptv') label = 'IP-TV (Мультисервис)';
        else if (sKey === 'iptv_tf') label = 'IP-TV (ТФ)';
        else if (sKey === 'iptv_ef') label = 'IP-TV (ЕФ)';
        else if (sKey === 'access') label = 'Access Mode';
        else if (sKey === 'trunk') label = 'Trunk Mode';
        else if (sKey === 'trunk_native') label = 'Trunk + Native VLAN';
        else if (sKey === 'dot1v') label = '802.1v Protocol VLAN';
        else if (sKey === 'ims') label = 'IMS / ШПД + ТФ + ТВ';
        else if (sKey === 'vims') label = 'VIMS / Видео + ТФ';

        if (typeof fnOrObj === 'function') {
          const fnStr = fnOrObj.toString();
          try {
            const res = fnOrObj(sampleVars);
            if (Array.isArray(res)) {
              tpl = res.filter(Boolean).join('\n');
            } else if (typeof res === 'string') {
              tpl = res;
            }
          } catch(e) {
            console.warn(`Could not extract template directly for ${tech}->${key}->${sKey}:`, e.message);
          }

          if (fnStr.includes('vpnEnabled ? `service 5 custom`')) {
            tpl = tpl.replace('service 5 custom', '{if vpnEnabled}service 5 custom{/if}')
                     .replace('service 5 custom cvid {vpnVlan}', '{if vpnEnabled}service 5 custom cvid {vpnVlan}{/if}');
          }
          if (fnStr.includes('sn ? `serial "${sn}"`')) {
            tpl = tpl.replace('serial "{sn}"', '{if sn}serial "{sn}"{/if}')
                     .replace('! serial <SN>', '{if !sn}! serial <SN>{/if}');
          }
          if (fnStr.includes('ploam ? `password "${ploam}"`')) {
            tpl = tpl.replace('password "{ploam}"', '{if ploam}password "{ploam}"{/if}')
                     .replace('! password <PLOAM>', '{if !ploam}! password <PLOAM>{/if}');
          }
        } else if (typeof fnOrObj === 'string') {
          tpl = fnOrObj;
        }

        insertServiceStmt.run(tech, key, sKey, label, tpl, mcastTpl, JSON.stringify([]), svcOrder);
      }

      // Diagnostics
      const diags = dev.diagnostics || {};
      let diagOrder = 0;
      for (const [category, items] of Object.entries(diags)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            diagOrder++;
            insertDiagStmt.run(tech, key, category, item.command || '', item.description || '', diagOrder);
          }
        }
      }
    }
  }

  // Seed Default Profile Lists
  const insertSetting = db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
  
  const defaultProfilesAdsl = [
    'base-05', 'base-1', 'base-2', 'base-4', 'base-6',
    'base-8', 'base-10', 'base-12', 'base-14', 'base-16',
    'base-18', 'base-20', 'base-22', 'base-max',
    'base-auto-9', 'base-auto-12'
  ];
  const defaultModulations = ['glite', 'gdmt', 't1413', 'auto', 'adsl2', 'adsl2+'];
  const defaultSpectrums = ['_no_AnnexM', '_AnnexM', '_AnnexA'];

  const defaultProfileLists = [
    {
      id: 'profiles_adsl',
      name: 'Профили ADSL линий',
      token: 'serviceProfile',
      type: 'select',
      items: defaultProfilesAdsl
    },
    {
      id: 'modulations',
      name: 'Модуляции',
      token: 'modulation',
      type: 'select',
      items: defaultModulations
    },
    {
      id: 'prof_name',
      name: 'Имя профиля',
      token: 'PROF-NAME',
      type: 'input',
      items: ['PROF-NAME']
    },
    {
      id: 'prof_index',
      name: 'Индекс профиля',
      token: 'PROF_INDEX',
      type: 'input',
      items: ['PROF-INDEX']
    }
  ];

  const crypto = require('crypto');
  const defaultPassHash = crypto.createHash('sha256').update('admin').digest('hex');

  insertSetting.run('profiles_adsl', JSON.stringify(defaultProfilesAdsl));
  insertSetting.run('modulations', JSON.stringify(defaultModulations));
  insertSetting.run('profiles_spectrum', JSON.stringify(defaultSpectrums));
  insertSetting.run('profile_lists', JSON.stringify(defaultProfileLists));
  insertSetting.run('admin_password_hash', defaultPassHash);

  console.log('Database successfully initialized and seeded!');
  db.close();
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData, initDatabase };
