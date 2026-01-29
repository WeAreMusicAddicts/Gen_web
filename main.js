// GPON Generator - Main Entry Point (Refactored)
// Использует ES6 модули для лучшей организации кода

// Глобальная переменная devices (из внешних
// файлов adsl.js, fttb.js, gpon.js)
window.devices = window.devices || {
    adsl: window.adslDevices || {},
    fttb: window.fttbDevices || {},
    gpon: window.gponDevices || {}
};

document.addEventListener('DOMContentLoaded', async function() {
    // Элементы интерфейса
    const configOutput = document.getElementById('config-output');
    const diagOutput = document.getElementById('diagnostics-output');

    // Проверка загрузки устройств
    function checkDevicesLoaded() {
        const missing = [];
        if (!Object.keys(window.devices.adsl).length) missing.push('ADSL');
        if (!Object.keys(window.devices.fttb).length) missing.push('FTTB');
        if (!Object.keys(window.devices.gpon).length) missing.push('GPON');
        
        if (missing.length > 0) {
            console.warn(`Не загружены конфигурации для: ${missing.join(', ')}`);
            if (configOutput) {
                configOutput.textContent = `// Внимание: не загружены конфигурации для ${missing.join(', ')}. Проверьте наличие файлов adsl.js, fttb.js, gpon.js`;
            }
            return false;
        }
        return true;
    }

    // Проверка загрузки устройств
    if (!checkDevicesLoaded()) {
        return;
    }

    // Элементы интерфейса
    const tabBtns = document.querySelectorAll('.tab-btn');
    const techForms = document.querySelectorAll('.tech-form');

    // Автозаполнение портов для разных
// типов оборудования
    const defaultPorts = {
        // Huawei
        huawei: '1/1/1',
        // Уральский филиал
        eltex_ma4000: '1/1/1',
        eltex_ltp: '1/1',
        // FTTB
        eltex_2428: '0/1',
        eltex: '1/0/1',
        edgecore_es3526_xa: '1/1',
        edgecore_es3526_m: '1/1',
        alsitek: 'e1',
        alsitek_fttb: 'e1',
        edgecore_es3528_m: '1/1',
        dlink_des3200: '1',
        huawei_switch: '0/0/1',
        huawei_3328: '0/0/1',
        si3000: '1/1',
        snr: '1/1',
        zyxel_fttb: '1/1',
        // Сибирские филиалы - все используют 4/2/11
        eltex_ma4000_af_csm: '4/2/11',
        eltex_ma4000_af_esm: '4/2/11',
        eltex_ma4000_gaf_esm_v1: '4/2/11',
        eltex_ma4000_gaf_esm_v2: '4/2/11',
        eltex_ma4000_gaf_esm_v3: '4/2/11',
        eltex_ma4000_nsk_csm: '4/2/11',
        eltex_ma4000_nsk_esm_ipiptv: '4/2/11',
        eltex_ma4000_nsk_esm: '4/2/11',
        eltex_ltp_nsk_esm: '1/1',
        eltex_ltp_nsk_csm: '1/1',
        eltex_ma4000_nsk_ntu1: '4/2/11',
        eltex_ma4000_nsk_eos: '4/2/11',
        eltex_ma4000_kem_csm: '4/2/11',
        eltex_ma4000_kem_esm: '4/2/11',
        eltex_ma4000_omsk_csm: '4/2/11',
        eltex_ma4000_omsk_esm: '4/2/11',
        eltex_ma4000_tomsk_csm: '4/2/11',
        eltex_ma4000_tomsk_esm: '4/2/11',
        eltex_ma4000_buryatia_csm: '4/2/11',
        eltex_ma4000_buryatia_esm: '4/2/11',
        eltex_ma4000_zab_csm: '4/2/11',
        eltex_ma4000_zab_esm: '4/2/11',
        eltex_ma4000_irk_csm: '4/2/11',
        eltex_ma4000_irk_esm: '4/2/11',
        eltex_ma4000_kras_csm: '4/2/11',
        eltex_ma4000_kras_esm: '4/2/11',
        eltex_ma4000_kras_hak_esm: '4/2/11',
    };

    const huaweiAdslDevices = new Set([
        'huawei_5600',
        'huawei_5600_vdsl',
        'huawei_58xx_vdsl',
        'huawei_5605',
    ]);

    function normalizeHuaweiAdslPort(port, device) {
        if (!port || !huaweiAdslDevices.has(device)) {
            return port;
        }
        const parts = String(port).split('/').filter(Boolean);
        if (parts.length === 2) {
            return `0/${parts[0]}/${parts[1]}`;
        }
        return port;
    }

    // Функция очистки вывода конфига
    function clearConfigOutput() {
        configOutput.textContent = '// Выберите технологию, заполните поля и нажмите "Сгенерировать"';
        diagOutput.innerHTML = '';
    }

    // Переключение тех
// нологий
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tech = btn.getAttribute('data-tech');
            // Очищаем конфиг при смене вкладки
            clearConfigOutput();
            // Активируем нужную вкладку
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Показываем нужную форму
            techForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tech}-form`) {
                    form.classList.add('active');
                }
            });
            // Обновляем диагностику с учетом выбранного устройства
            updateDiagnosticsForTech(tech);
        });
    });

    // Генерация конфига для ADSL
    document.getElementById('generate-adsl').addEventListener('click', () => {
        // Валидация перед генерацией
        if (!validateBeforeGenerate('adsl')) {
            showNotification('Исправьте ошибки в поляхперед генерацией конфига', 'error');
            return;
        }
        
        const device = document.getElementById('adsl-device').value;
        const service = document.getElementById('adsl-service').value === 'pppoe' ? 'pppoe' : 'iptv';
        const rawPort = document.getElementById('adsl-port').value.trim() || '0/1';
        const port = normalizeHuaweiAdslPort(rawPort, device);
        const vpiVciRaw = document.getElementById('adsl-vpivci').value.trim() || '0/35';
        const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
        const vlan = document.getElementById('adsl-vlan').value.trim() || '101';
        const mcastVlanInput = document.getElementById('adsl-mcast-vlan');
        const mcastVlanRaw = mcastVlanInput?.value.trim() || '';
        const mcastVlan = mcastVlanRaw || vlan;

        if (device === 'sib_templates') {
            const tplId = document.getElementById('adsl-sib-template')?.value;
            const tpl = window.sibAdslTemplates?.find(t => t.id === tplId);
            if (!tpl) {
                showNotification('Шаблон Сибирь не выбран', 'error');
                return;
            }
            const parts = port.split('/').filter(Boolean);
            const slot = parts[0] || '0';
            const portNum = parts[parts.length - 1] || port;
            const data = {
                port,
                slot,
                portNum,
                portShort: portNum,
                vpi,
                vci,
                vlan,
                label: vlan,
                mcastVlan: '26',
            };
            Object.assign(data, readExtraFields('adsl-sib-extra-fields', extractTemplateTokens(tpl.text || '')));
            configOutput.textContent = applyTemplate(tpl.text, data).trim();
            updateDiagnostics('adsl', device, port, vlan);
            return;
        }

        let commands = [];

        // Проверяем, существует ли устройство и его сервисы
        if (devices.adsl[device]?.services?.[service]) {
            commands = commands.concat(devices.adsl[device].services[service]({ port, vlan, vpi, vci, mcastVlan }));
        } else {
            commands.push(`! Шаблон для ${device} (${service}) не найден.`);
            commands.push(`! Проверьте базу команд или используйте общий шаблон:`);
            commands.push(`interface dsl ${port}`);
            commands.push(`  pvc ${vpi}/${vci}`);
            commands.push(`  service ${service} vlan ${vlan}`);
            commands.push(`  no shutdown`);
        }

        configOutput.textContent = commands.join('\n');
        updateDiagnostics('adsl', device, port, vlan);
    });

    // Динамические поля для FTTB режимов
    document.getElementById('fttb-mode').addEventListener('change', function() {
        const container = document.getElementById('fttb-vlan-fields');
        const mode = this.value;
        let html = '';

        if (mode === 'access') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-access-vlan">Access VLAN</label>
                        <input type="number" id="fttb-access-vlan" class="form-input" placeholder="100" value="100">
                    </div>
                </div>
            `;
        } else if (mode === 'trunk') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-trunk-vlans">Allowed VLANs</label>
                        <input type="text" id="fttb-trunk-vlans" class="form-input" placeholder="100,200,300" value="100,200,300">
                    </div>
                </div>
            `;
        } else if (mode === 'trunk_native') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-trunk-vlans">Allowed VLANs</label>
                        <input type="text" id="fttb-trunk-vlans" class="form-input" placeholder="100,200,300" value="100,200,300">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-native-vlan">Native VLAN</label>
                        <input type="number" id="fttb-native-vlan" class="form-input" placeholder="1" value="1">
                    </div>
                </div>
            `;
        } else if (mode === 'dot1v') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-tr069-vlan">TR-069 VLAN</label>
                        <input type="number" id="fttb-tr069-vlan" class="form-input" placeholder="700" value="700">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-pppoe-vlan">PPPoE VLAN</label>
                        <input type="number" id="fttb-pppoe-vlan" class="form-input" placeholder="101" value="101">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-tagged-vlan">Tagged VLAN</label>
                        <input type="number" id="fttb-tagged-vlan" class="form-input" placeholder="102" value="102">
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        // Повторно инициализируем обработчики валидации для новых
// полей
        setTimeout(initValidationHandlers, 50);
    });

    // Генерация конфига для FTTB
    document.getElementById('generate-fttb').addEventListener('click', () => {
        const device = document.getElementById('fttb-device').value;
        const portType = document.getElementById('fttb-port-type').value === 'ge' ? 'gigabitethernet' : 'fastethernet';
        const port = document.getElementById('fttb-port').value.trim() || '1/0/1';
        const mode = document.getElementById('fttb-mode').value;
        const description = document.getElementById('fttb-description').value || 'Client';
        
        let vlan, commands = [];
        const dev = devices.fttb[device];

        if (device === 'sib_templates') {
            const branchId = document.getElementById('fttb-sib-branch')?.value;
            const equipId = document.getElementById('fttb-sib-equipment')?.value;
            const variantId = document.getElementById('fttb-sib-variant')?.value;
            const branch = window.sibFttbCatalog?.branches?.find(b => b.id === branchId);
            const equip = branch?.equipment?.find(e => e.id === equipId);
            const variant = equip?.variants?.find(v => v.id === variantId);
            if (!variant) {
                showNotification('Конфигурация Сибирь не выбрана', 'error');
                return;
            }
            const data = {
                portType,
                port,
                desc: description,
                description,
            };
            const templateTokens = extractTemplateTokens(variant.text || '');
            const extraTokens = getFttbExtraTokens(variant.text || '', templateTokens);
            Object.assign(data, readExtraFields('fttb-sib-extra-fields', extraTokens));
            const rendered = normalizeFttbTemplateOutput(variant, data, portType, port, description, branch?.notes);
            configOutput.textContent = rendered;
            updateDiagnostics('fttb', device, { portType, port }, vlan);
            return;
        }
        
        if (mode === 'access') {
            vlan = document.getElementById('fttb-access-vlan')?.value || '100';
            if (dev?.modes?.access) {
                commands = commands.concat(dev.modes.access({ portType, port, accessVlan: vlan, desc: description }));
            } else {
                commands.push(`interface ${portType} ${port}`);
                commands.push(`  switchport mode access`);
                commands.push(`  switchport access vlan ${vlan}`);
                commands.push(`  description "${description}"`);
                commands.push(`  no shutdown`);
                commands.push(`  exit`);
            }
        } else if (mode === 'trunk') {
            vlan = document.getElementById('fttb-trunk-vlans')?.value || '100,200,300';
            if (dev?.modes?.trunk) {
                commands = commands.concat(dev.modes.trunk({ portType, port, allowedVlans: vlan, desc: description }));
            } else {
                commands.push(`interface ${portType} ${port}`);
                commands.push(`  switchport mode trunk`);
                commands.push(`  switchport trunk allowed vlan ${vlan}`);
                commands.push(`  description "${description}"`);
                commands.push(`  no shutdown`);
                commands.push(`  exit`);
            }
        } else if (mode === 'trunk_native') {
            vlan = document.getElementById('fttb-trunk-vlans')?.value || '100,200,300';
            const nativeVlan = document.getElementById('fttb-native-vlan')?.value || '1';
            if (dev?.modes?.trunk_native) {
                commands = commands.concat(dev.modes.trunk_native({ portType, port, allowedVlans: vlan, nativeVlan, desc: description }));
            } else {
                commands.push(`interface ${portType} ${port}`);
                commands.push(`  switchport mode trunk`);
                commands.push(`  switchport trunk native vlan ${nativeVlan}`);
                commands.push(`  switchport trunk allowed vlan ${vlan}`);
                commands.push(`  description "${description}"`);
                commands.push(`  no shutdown`);
                commands.push(`  exit`);
            }
        } else if (mode === 'dot1v') {
            const tr069Vlan = document.getElementById('fttb-tr069-vlan')?.value || '700';
            const pppoeVlan = document.getElementById('fttb-pppoe-vlan')?.value || '101';
            const taggedVlan = document.getElementById('fttb-tagged-vlan')?.value || '102';
            vlan = taggedVlan;
            if (dev?.modes?.dot1v) {
                commands = commands.concat(dev.modes.dot1v({ portType, port, tr069Vlan, pppoeVlan, taggedVlan, desc: description }));
            } else {
                commands.push(`! Dot1v/QinQ шаблон отсутствует для ${device}`);
            }
        } else {
            commands.push(`! Режим ${mode} не реализован, используйте стандартную настройку`);
        }

        configOutput.textContent = commands.join('\n');
        updateDiagnostics('fttb', device, { portType, port }, vlan);
    });

    // Генерация конфига для GPON
    document.getElementById('generate-gpon').addEventListener('click', () => {
        // Валидация перед генерацией
        if (!validateBeforeGenerate('gpon')) {
            showNotification('Исправьте ошибки в поляхперед генерацией конфига', 'error');
            return;
        }
        
        // Определяем текущее устройство (из основного или из выбора филиала)
        let device = document.getElementById('gpon-device').value;
        const branchConfigSelect = document.getElementById('gpon-branch-config');
        if (device === 'sib' && branchConfigSelect && branchConfigSelect.value) {
            device = branchConfigSelect.value;
        }

        const service = document.getElementById('gpon-service').value;
        const ontField = document.getElementById('gpon-ont').value.trim() || '4/2/11';
        const sn = document.getElementById('gpon-sn').value.trim();
        const ploam = document.getElementById('gpon-ploam').value.trim();
        const cvid = document.getElementById('gpon-cvid')?.value.trim() || '107';
        const svid = document.getElementById('gpon-svid')?.value.trim() || '1647';

        const isLtpDevice = device === 'eltex_ltp' || device.startsWith('eltex_ltp_');
        const ontParts = ontField.split('/');
        const [slot = '4', ponPort = '2', ontIdx = '11'] = ontParts;
        const frame = '0';
        const ontIdHuawei = `${frame}/${slot}/${ponPort} ${ontIdx || '11'}`;
        const ontIdEltex = isLtpDevice ? `${slot}/${ponPort}` : `${slot}/${ponPort}/${ontIdx || '11'}`;

        let commands = [];

        if (device === 'huawei') {
            const pppoeVlan = document.getElementById('gpon-vlan-pppoe').value.trim() || '3501';
            const iptvVlan = document.getElementById('gpon-vlan-iptv').value.trim() || '3521';
            const voipVlan = document.getElementById('gpon-vlan-voip').value.trim() || '3541';
            const lineProfile = document.getElementById('gpon-line-profile').value.trim() || '3';
            const srvProfile = document.getElementById('gpon-srv-profile').value.trim() || '3';
            const doDelete = document.getElementById('gpon-action-delete').checked;
            const doActivate = document.getElementById('gpon-action-activate').checked;
            const doPPPoE = document.getElementById('gpon-action-pppoe').checked;
            const doIPTV = document.getElementById('gpon-action-iptv').checked;
            const doVoIP = document.getElementById('gpon-action-voip').checked;

            const gponPort = `${frame}/${slot}/${ponPort}`;

            if (doDelete) {
                commands.push('! Удаление существующей ONT и сервис-портов');
                commands.push('en');
                commands.push('undo smart');
                commands.push('undo interactive');
                commands.push('config');
                commands.push(`undo service-port port ${gponPort} ont ${ontIdx}`);
                commands.push(`interface gpon ${frame}/${slot}`);
                commands.push(`ont delete ${ponPort} ${ontIdx}`);
                commands.push('return');
                commands.push('');
            }

            if (doActivate) {
                commands.push('! Активация ONT');
                commands.push('en');
                commands.push('undo smart');
                commands.push('undo interactive');
                commands.push('config');
                commands.push(`interface gpon ${frame}/${slot}`);
                const pwd = ploam || '1112223334';
                commands.push(`ont add ${ponPort} ${ontIdx} password-auth "${pwd}" always-on omci ont-lineprofile-id ${lineProfile} ont-srvprofile-id ${srvProfile} desc "ONT-${ontIdHuawei}"`);
                commands.push(`ont ipconfig ${ponPort} ${ontIdx} dhcp vlan 69 priority 7`);
                commands.push('quit');

                if (doPPPoE) {
                    commands.push(`service-port vlan ${pppoeVlan} gpon ${gponPort} ont ${ontIdx} gemport 0 multi-service user-vlan 20 user-encap pppoe tag-transform translate`);
                }
                if (doVoIP) {
                    commands.push(`service-port vlan ${voipVlan} gpon ${gponPort} ont ${ontIdx} gemport 2 multi-service user-vlan 30 tag-transform translate inbound traffic-table index 9 outbound traffic-table index 9`);
                }
                if (doIPTV) {
                    commands.push(`service-port vlan ${iptvVlan} gpon ${gponPort} ont ${ontIdx} gemport 1 multi-service user-vlan 40 tag-transform translate inbound traffic-table index 7 outbound traffic-table index 7`);
                    commands.push('');
                    commands.push('############### ВНИМАНИЕ ###############');
                    commands.push('# Далее необходимо найти индекс сервис-порта для IPTV:');
                    commands.push(`# display service-port port ${gponPort} ont ${ontIdx} gemport 1`);
                    commands.push('# Замените *СЕРВИС ПОРТ (INDEX)* в командахниже на найденный индекс (2 места)');
                    commands.push('btv');
                    commands.push('igmp user add service-port *СЕРВИС ПОРТ (INDEX)* no-auth max-program 8');
                    commands.push(`multicast-vlan ${iptvVlan}`);
                    commands.push('igmp multicast-vlan member service-port *СЕРВИС ПОРТ (INDEX)*');
                    commands.push('quit');
                }

                commands.push('return');
            } else {
                if (doPPPoE) {
                    commands.push('! Только PPPoE');
                    commands.push('en');
                    commands.push('undo smart');
                    commands.push('undo interactive');
                    commands.push('config');
                    commands.push(`service-port vlan ${pppoeVlan} gpon ${gponPort} ont ${ontIdx} gemport 0 multi-service user-vlan 20 user-encap pppoe tag-transform translate`);
                    commands.push('return');
                }
                if (doIPTV) {
                    commands.push('');
                    commands.push('! Только IPTV');
                    commands.push('en');
                    commands.push('undo smart');
                    commands.push('undo interactive');
                    commands.push('config');
                    commands.push(`service-port vlan ${iptvVlan} gpon ${gponPort} ont ${ontIdx} gemport 1 multi-service user-vlan 40 tag-transform translate inbound traffic-table index 7 outbound traffic-table index 7`);
                    commands.push('');
                    commands.push('############### ВНИМАНИЕ ###############');
                    commands.push(`# display service-port port ${gponPort} ont ${ontIdx} gemport 1`);
                    commands.push('# Замените *СЕРВИС ПОРТ (INDEX)* в командахниже на найденный индекс (2 места)');
                    commands.push('btv');
                    commands.push('igmp user add service-port *СЕРВИС ПОРТ (INDEX)* no-auth max-program 8');
                    commands.push(`multicast-vlan ${iptvVlan}`);
                    commands.push('igmp multicast-vlan member service-port *СЕРВИС ПОРТ (INDEX)*');
                    commands.push('quit');
                    commands.push('return');
                }
                if (doVoIP) {
                    commands.push('');
                    commands.push('! Только VoIP');
                    commands.push('en');
                    commands.push('undo smart');
                    commands.push('undo interactive');
                    commands.push('config');
                    commands.push(`service-port vlan ${voipVlan} gpon ${gponPort} ont ${ontIdx} gemport 2 multi-service user-vlan 30 tag-transform translate inbound traffic-table index 9 outbound traffic-table index 9`);
                    commands.push('return');
                }
            }
        } else if (device === 'eltex_ma4000' || device === 'eltex_ltp') {
            // Уральский филиал - используем IMS/vIMS
            if (devices.gpon[device]?.services?.[service]) {
                commands = commands.concat(
                    devices.gpon[device].services[service]({
                        ontId: ontIdEltex,
                        sn: sn || '5452535225153E7C',
                        ploam,
                    })
                );
            } else {
                commands.push(`! Шаблон для ${device} (${service}) не найден.`);
            }
        } else if (devices.gpon[device]) {
            // Сибирские филиалы - используем SN из поля и cvid/svid для CSM
            if (devices.gpon[device]?.services?.default) {
                commands = commands.concat(
                    devices.gpon[device].services.default({
                        ontId: ontIdEltex,
                        sn: sn || '5452535225153E7C',
                        cvid,
                        svid,
                    })
                );
            } else {
                commands.push(`! Шаблон для ${device} не найден.`);
            }
        } else {
            commands.push(`! Устройство ${device} не найдено.`);
        }

        configOutput.textContent = commands.join('\n');
        updateDiagnostics('gpon', device, device === 'huawei' ? ontIdHuawei : ontIdEltex);
    });

    // Обновление диагностики с группировкой и пояснениями
    function updateDiagnostics(tech, device = null, portInfo = null, vlan = null) {
        // Получаем диагностику устройства или используем пустой объект
        const deviceDiag = (device && devices[tech]?.[device]?.diagnostics) ? devices[tech][device].diagnostics : null;
        
        if (!deviceDiag) {
            diagOutput.innerHTML = '<div class="diag-empty">Команды диагностики для данного устройства в разработке</div>';
            return;
        }

        // Заменяем плейсх
// олдеры в командах

        const replacePlaceholders = (cmd) => {
            let out = cmd;
            if (tech === 'fttb') {
                const pt = portInfo?.portType || '{portType}';
                const p = portInfo?.port || '{port}';
                out = out.replace(/{portType}/g, pt).replace(/{port}/g, p);
            } else if (tech === 'adsl') {
                // Для Alcatel 7324 сначала обрабатываем специфичные плейсх
// олдеры
                if (device === 'alcatel_7324' && portInfo) {
                    const [slot, portNum] = portInfo.split('/');
                    if (slot && portNum) {
                        out = out.replace(/{slot}/g, slot);
                        out = out.replace(/{portNum}/g, portNum);
                        // Общий {port} заменяем на полный формат только если не был заменен выше
                        out = out.replace(/{port}/g, `${slot}-${portNum}`);
                    } else {
                        out = out.replace(/{slot}/g, '{slot}').replace(/{portNum}/g, '{portNum}');
                        out = out.replace(/{port}/g, portInfo || '{port}');
                    }
                }
                // Для Alcatel 7330 нужны vpi и vci
                else if (device === 'alcatel_7330' && portInfo) {
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    // Заменяем плейсх
// олдеры для Alcatel 7330
                    out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                    out = out.replace(/{spectrumProfile}/g, '_no_AnnexM').replace(/{serviceProfile}/g, 'base-12');
                    // Формат порта для Alcatel: 1/1/SLOT/PORT (порт прих
// одит как SLOT/PORT)
                    out = out.replace(/1\/1\/\{port\}/g, `1/1/${portInfo}`);
                    // Также заменяем формат с VPI:VCI
                    out = out.replace(/\{port\}:\{vpi\}:\{vci\}/g, `${portInfo}:${vpi}:${vci}`);
                    // Общий {port}
                    out = out.replace(/{port}/g, portInfo || '{port}');
                }
                // Для Huawei 5605 нужны slot и portNum отдельно
                else if (device === 'huawei_5605' && portInfo) {
                    const parts = String(portInfo).split('/').filter(Boolean);
                    const portNum = parts.length ? parts[parts.length - 1] : '';
                    const slot = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    if (slot && portNum) {
                        out = out.replace(/{slot}/g, slot);
                        out = out.replace(/{portNum}/g, portNum);
                        out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                        out = out.replace(/{port}/g, portInfo);
                    } else {
                        out = out.replace(/{slot}/g, '{slot}').replace(/{portNum}/g, '{portNum}');
                        out = out.replace(/{port}/g, portInfo || '{port}');
                    }
                }
                // Для других
// Huawei устройств нужны vpi и vci для диагностики
                else if ((device === 'huawei_5600' || device === 'huawei_5600_vdsl' || device === 'huawei_58xx_vdsl') && portInfo) {
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    // Заменяем vpi и vci
                    out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                    const parts = String(portInfo).split('/').filter(Boolean);
                    const portNum = parts.length ? parts[parts.length - 1] : '';
                    const slot = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                    if (slot && portNum) {
                        out = out.replace(/{slot}/g, slot);
                        out = out.replace(/{portNum}/g, portNum);
                    }
                    // Для Huawei формат порта в командах

                    // может быть 0/4/63 (SLOT/SUBSLOT/PORT)
                    // В форме у нас только SLOT/PORT, поэтому использовуем как есть
                    // Если в команде нужен формат 0/4/63, пользователь должен ввестить его в поле порта
                    const portStr = portInfo || '{port}';
                    out = out.replace(/{port}/g, portStr);
                }
                // Для Iskratel MSAN и Zyxel 1000 нужен только номер порта (без слота)
                else if ((device === 'iskratel' || device === 'zyxel_1000') && portInfo) {
                    const portNum = portInfo.includes('/') ? portInfo.split('/')[1] : portInfo;
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    out = out.replace(/{portNum}/g, portNum);
                    out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                    out = out.replace(/{port}/g, portNum);
                }
                // Для Photel, ZTE C300, ZTE 9xxx, Zyxel 5000 нужны slot и portNum
                else if ((device === 'photel' || device === 'genew_photel_px90' || device === 'opnet_rt1000' || device === 'zte_c300' || device === 'zte_9xxx' || device === 'zyxel_5000') && portInfo) {
                    const [slot, portNum] = portInfo.split('/');
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    if (slot && portNum) {
                        out = out.replace(/{slot}/g, slot);
                        out = out.replace(/{portNum}/g, portNum);
                        out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                        out = out.replace(/{port}/g, portInfo);
                    } else {
                        out = out.replace(/{slot}/g, '{slot}').replace(/{portNum}/g, '{portNum}');
                        out = out.replace(/{port}/g, portInfo || '{port}');
                    }
                }
                // Для остальных
// устройств ADSL - обрабатываем vpi/vci если они есть в команде
                else if (portInfo) {
                    const portStr = portInfo || '{port}';
                    out = out.replace(/{port}/g, portStr);
                    // Если в команде есть плейсх
// олдеры vpi/vci, заменяем их

                    if (out.includes('{vpi}') || out.includes('{vci}')) {
                        const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                        const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                        out = out.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
                    }
                }
                out = out.replace(/{ontId}/g, portInfo || '{ontId}');
            } else if (tech === 'gpon') {
                if (device === 'huawei' && portInfo) {
                    let frame = '0';
                    let slot = '';
                    let ponPort = '';
                    let ontIdx = '';
                    const raw = String(portInfo).trim();
                    if (raw.includes(' ')) {
                        const [portPart, ontPart] = raw.split(/\s+/);
                        ontIdx = ontPart || '';
                        const parts = portPart.split('/').filter(Boolean);
                        if (parts.length === 3) {
                            frame = parts[0] || '0';
                            slot = parts[1] || '';
                            ponPort = parts[2] || '';
                        } else if (parts.length === 2) {
                            slot = parts[0] || '';
                            ponPort = parts[1] || '';
                        }
                    } else {
                        const parts = raw.split('/').filter(Boolean);
                        if (parts.length === 4) {
                            frame = parts[0] || '0';
                            slot = parts[1] || '';
                            ponPort = parts[2] || '';
                            ontIdx = parts[3] || '';
                        } else if (parts.length === 3) {
                            slot = parts[0] || '';
                            ponPort = parts[1] || '';
                            ontIdx = parts[2] || '';
                        } else if (parts.length === 2) {
                            slot = parts[0] || '';
                            ponPort = parts[1] || '';
                        }
                    }
                    const gponPort = slot && ponPort ? `${frame}/${slot}/${ponPort}` : '';
                    const frameSlot = slot ? `${frame}/${slot}` : '';
                    out = out.replace(/{frame}/g, frame);
                    out = out.replace(/{slot}/g, slot);
                    out = out.replace(/{ponPort}/g, ponPort);
                    out = out.replace(/{ontIdx}/g, ontIdx);
                    out = out.replace(/{gponPort}/g, gponPort);
                    out = out.replace(/{frameSlot}/g, frameSlot);
                }
                out = out.replace(/{port}/g, portInfo || '{port}').replace(/{ontId}/g, portInfo || '{ontId}');
            } else {
                out = out.replace(/{port}/g, portInfo || '{port}').replace(/{ontId}/g, portInfo || '{ontId}');
            }
            out = out.replace(/{vlan}/g, vlan || '{vlan}');
            return out;
        };

        // Формируем HTML с группами
        let html = '';
        for (const [groupName, commands] of Object.entries(deviceDiag)) {
            html += `<div class="diag-group">`;
            html += `<div class="diag-group-header"><i class="fas fa-folder"></i> ${groupName}</div>`;
            html += `<div class="diag-group-content">`;
            
            commands.forEach(({ command, description }) => {
                let finalCommand = replacePlaceholders(command);
                let profileSelectHtml = '';
                let modulationSelectHtml = '';
                let dataCommand = escapeHtml(finalCommand);

                // Устройства с выбором профиля
                const devicesWithProfile = ['alcatel_7330', 'zyxel_5000', 'zyxel_1000', 'alcatel_7324'];

                // Добавляем выпадающий список профилей для устройств с {serviceProfile}
                if (command.includes('{serviceProfile}') && devicesWithProfile.includes(device)) {
                    const profiles = device === 'zyxel_1000' ? zyxel1000Profiles : alcatel7330Profiles;
                    const defaultProfile = device === 'zyxel_1000' ? 'base-auto-9' : 'base-8';
                    profileSelectHtml = `
                        <select class="diag-profile-select" onchange="updateAdslProfileCommand(this)">
                            ${profiles.map(p => `<option value="${p}" ${p === defaultProfile ? 'selected' : ''}>${p}</option>`).join('')}
                        </select>
                    `;
                    if (device === 'zyxel_1000' && command.includes('{modulation}')) {
                        modulationSelectHtml = `
                            <select class="diag-profile-select diag-modulation-select" onchange="updateAdslProfileCommand(this)">
                                ${zyxel1000Modulations.map(m => `<option value="${m}" ${m === 'auto' ? 'selected' : ''}>${m}</option>`).join('')}
                            </select>
                        `;
                    }
                    // Убираем текст подсказки для команд с профилями
                    description = '';
                    // Сох
// раняем оригинальную команду с плейсх
// олдером в data-original
                    dataCommand = escapeHtml(command);
                    // Заменяем плейсх
// олдер на профиль по умолчанию
                    finalCommand = finalCommand.replace(/{serviceProfile}/g, defaultProfile);
                    finalCommand = finalCommand.replace(/{modulation}/g, 'auto');
                } else if (command.includes('{spectrumProfile}') || command.includes('{serviceProfile}')) {
                    const spectrumProfile = command.includes('{spectrumProfile}') ? '_no_AnnexM' : '';
                    const serviceProfile = command.includes('{serviceProfile}') ? 'base-12' : '';
                    finalCommand = finalCommand
                        .replace(/{spectrumProfile}/g, spectrumProfile)
                        .replace(/{serviceProfile}/g, serviceProfile);
                    description += ' (spectrum-profile: ' + spectrumProfile + ', service-profile: ' + serviceProfile + ')';
                }
                const safeCommand = escapeHtml(finalCommand);
                html += `
                    <div class="diag-command">
                        <div class="diag-command-row">
                            <div class="diag-command-text" data-command="${dataCommand}" data-original="${escapeHtml(command)}" onclick="copyCommandFromElement(this)" title="Кликните для копирования">${safeCommand}</div>
                            ${profileSelectHtml}
                            ${modulationSelectHtml}
                            <div class="diag-command-desc" title="Пояснение">${escapeHtml(description)}</div>
                            <button class="diag-copy-btn" onclick="copyCommandFromElement(this.parentElement.querySelector('.diag-command-text'))" title="Копировать команду">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }

        diagOutput.innerHTML = html;
    }

    function updateDiagnosticsForTech(tech) {
        let device = null, portInfo = null, vlan = null;
        
        if (tech === 'adsl') {
            device = document.getElementById('adsl-device').value;
            portInfo = document.getElementById('adsl-port').value || '0/1';
            portInfo = normalizeHuaweiAdslPort(portInfo, device);
            vlan = document.getElementById('adsl-vlan').value || '101';
        } else if (tech === 'fttb') {
            device = document.getElementById('fttb-device').value;
            const portType = document.getElementById('fttb-port-type').value === 'ge' ? 'gigabitethernet' : 'fastethernet';
            portInfo = { portType, port: (document.getElementById('fttb-port').value || '1/0/1') };
            vlan = document.getElementById('fttb-access-vlan')?.value || '100';
        } else if (tech === 'gpon') {
            device = document.getElementById('gpon-device').value;
            const branchConfigSelect = document.getElementById('gpon-branch-config');
            // Если выбран сибирский филиал, используем конкретную конфигурацию
            if (device === 'sib' && branchConfigSelect && branchConfigSelect.value) {
                device = branchConfigSelect.value;
            }
            portInfo = document.getElementById('gpon-ont').value || '';
            updateDiagnostics('gpon', device, portInfo, vlan);
            return;
        }

        updateDiagnostics(tech, device, portInfo, vlan);
    }
        
    // Обработчики изменения устройства для обновления диагностики и автозаполнения порта
    document.getElementById('adsl-device').addEventListener('change', function() {
        // Автозаполнение порта
        const portInput = document.getElementById('adsl-port');
        const serviceGroup = document.getElementById('adsl-service-group');
        const tplGroup = document.getElementById('adsl-sib-template-group');
        const extraGroup = document.getElementById('adsl-sib-extra-group');
        const mcastGroup = document.getElementById('adsl-mcast-vlan-group');
        if (this.value === 'sib_templates') {
            serviceGroup?.classList.add('hidden');
            tplGroup?.classList.remove('hidden');
            mcastGroup?.classList.add('hidden');
        } else {
            serviceGroup?.classList.remove('hidden');
            tplGroup?.classList.add('hidden');
            extraGroup?.classList.add('hidden');
            if (huaweiAdslDevices.has(this.value)) {
                mcastGroup?.classList.remove('hidden');
            } else {
                mcastGroup?.classList.add('hidden');
            }
        }
        if (defaultPorts[this.value]) {
            portInput.value = defaultPorts[this.value];
        }
        // Очищаем конфиг при смене оборудования
        clearConfigOutput();
        const port = normalizeHuaweiAdslPort(portInput.value, this.value);
        const vlan = document.getElementById('adsl-vlan').value || '101';
        updateDiagnostics('adsl', this.value, port, vlan);
    });

    document.getElementById('fttb-device').addEventListener('change', function() {
        // Автозаполнение порта
        const portInput = document.getElementById('fttb-port');
        const portTypeGroup = document.getElementById('fttb-port-type-group');
        const modeGroup = document.getElementById('fttb-mode-group');
        const vlanFields = document.getElementById('fttb-vlan-fields');
        const branchGroup = document.getElementById('fttb-sib-branch-group');
        const equipmentGroup = document.getElementById('fttb-sib-equipment-group');
        const variantGroup = document.getElementById('fttb-sib-variant-group');
        if (this.value === 'sib_templates') {
            modeGroup?.classList.add('hidden');
            vlanFields?.classList.add('hidden');
            branchGroup?.classList.remove('hidden');
            equipmentGroup?.classList.remove('hidden');
            variantGroup?.classList.remove('hidden');
            document.getElementById('fttb-sib-branch')?.dispatchEvent(new Event('change'));
        } else {
            modeGroup?.classList.remove('hidden');
            vlanFields?.classList.remove('hidden');
            branchGroup?.classList.add('hidden');
            equipmentGroup?.classList.add('hidden');
            variantGroup?.classList.add('hidden');
            document.getElementById('fttb-sib-extra-group')?.classList.add('hidden');
        }
        const showPortType = this.value.startsWith('eltex') || this.value === 'huawei_switch' || this.value === 'huawei_3328';
        if (!showPortType) {
            portTypeGroup?.classList.add('hidden');
        } else {
            portTypeGroup?.classList.remove('hidden');
        }
        if (defaultPorts[this.value]) {
            portInput.value = defaultPorts[this.value];
        }
        // Очищаем конфиг при смене оборудования
        clearConfigOutput();
        const portType = document.getElementById('fttb-port-type').value === 'ge' ? 'gigabitethernet' : 'fastethernet';
        const port = portInput.value;
        const vlan = document.getElementById('fttb-access-vlan')?.value || '100';
        updateDiagnostics('fttb', this.value, { portType, port }, vlan);
    });

    // Очищаем конфиг при смене типа порта в FTTB
    document.getElementById('fttb-port-type').addEventListener('change', function() {
        clearConfigOutput();
    });

    // Карта конфигураций для каждого филиала
    const sibConfigs = {
        af: [
            { value: 'eltex_ma4000_af_csm', text: 'CSM' },
            { value: 'eltex_ma4000_af_esm', text: 'ESM' },
        ],
        gaf: [
            { value: 'eltex_ma4000_gaf_esm_v1', text: 'ESM В1' },
            { value: 'eltex_ma4000_gaf_esm_v2', text: 'ESM В2' },
            { value: 'eltex_ma4000_gaf_esm_v3', text: 'ESM В3' },
        ],
        nsk: [
            { value: 'eltex_ma4000_nsk_csm', text: 'CSM' },
            { value: 'eltex_ma4000_nsk_esm', text: 'ESM' },
            { value: 'eltex_ma4000_nsk_esm_ipiptv', text: 'ESM (INT+IPTV+SIP)' },
            { value: 'eltex_ltp_nsk_esm', text: 'ESM (LTP8-16N)' },
            { value: 'eltex_ltp_nsk_csm', text: 'CSM (LTP8-16N)' },
            { value: 'eltex_ma4000_nsk_ntu1', text: 'NTU-1' },
            { value: 'eltex_ma4000_nsk_eos', text: 'Бывший Оператор ЕОС' },
        ],
        kem: [
            { value: 'eltex_ma4000_kem_csm', text: 'CSM' },
            { value: 'eltex_ma4000_kem_esm', text: 'ESM' },
        ],
        omsk: [
            { value: 'eltex_ma4000_omsk_csm', text: 'CSM' },
            { value: 'eltex_ma4000_omsk_esm', text: 'ESM' },
        ],
        tomsk: [
            { value: 'eltex_ma4000_tomsk_csm', text: 'CSM' },
            { value: 'eltex_ma4000_tomsk_esm', text: 'ESM' },
        ],
        buryatia: [
            { value: 'eltex_ma4000_buryatia_csm', text: 'CSM' },
            { value: 'eltex_ma4000_buryatia_esm', text: 'ESM' },
        ],
        zab: [
            { value: 'eltex_ma4000_zab_csm', text: 'CSM' },
            { value: 'eltex_ma4000_zab_esm', text: 'ESM' },
        ],
        irk: [
            { value: 'eltex_ma4000_irk_csm', text: 'CSM' },
            { value: 'eltex_ma4000_irk_esm', text: 'ESM' },
        ],
        kras: [
            { value: 'eltex_ma4000_kras_csm', text: 'CSM' },
            { value: 'eltex_ma4000_kras_esm', text: 'ESM' },
            { value: 'eltex_ma4000_kras_hak_esm', text: 'ESM Хакасия' },
        ],
    };

    // Проверка типа конфигурации (CSM или ESM)
    function isCsmConfig(deviceValue) {
        return deviceValue && deviceValue.includes('_csm');
    }

    // Список профилей для Alcatel 7330
    const alcatel7330Profiles = [
        'base-05', 'base-1', 'base-2', 'base-4', 'base-6',
        'base-8', 'base-10', 'base-12', 'base-14', 'base-16',
        'base-18', 'base-20', 'base-22', 'base-max'
    ];
    const zyxel1000Profiles = [
        'base-05', 'base-1', 'base-2', 'base-4', 'base-6',
        'base-8', 'base-10', 'base-12', 'base-14', 'base-16',
        'base-18', 'base-20', 'base-22', 'base-max',
        'base-auto-9', 'base-auto-12'
    ];
    const zyxel1000Modulations = ['glite', 'gdmt', 't1413', 'auto', 'adsl2', 'adsl2+'];

    document.getElementById('gpon-device').addEventListener('change', function() {
        const sibBranchGroup = document.getElementById('sib-branch-group');
        const sibConfigGroup = document.getElementById('sib-config-group');
        const gponBranchSelect = document.getElementById('gpon-branch');
        const gponBranchConfigSelect = document.getElementById('gpon-branch-config');

        if (this.value === 'sib') {
            // Показываем выбор филиала
            if (sibBranchGroup) sibBranchGroup.classList.remove('hidden');
            if (sibConfigGroup) sibConfigGroup.classList.add('hidden');
            // Сбрасываем выбор
            gponBranchConfigSelect.innerHTML = '<option value="">-- Выберите конфигурацию --</option>';
        } else {
            // Скрываем выбор филиала
            if (sibBranchGroup) sibBranchGroup.classList.add('hidden');
            if (sibConfigGroup) sibConfigGroup.classList.add('hidden');
        }

        // Автозаполнение порта
        const ontInput = document.getElementById('gpon-ont');
        if (this.value === 'huawei') {
            ontInput.value = '1/1/1';
        } else if (this.value === 'eltex_ltp') {
            ontInput.value = '1/1';
        } else {
            ontInput.value = '4/2/11';
        }
        clearConfigOutput();

        updateGponFields(this.value);
        updateDiagnostics('gpon', this.value, ontInput.value);
    });

    // Обработчик выбора филиала
    document.getElementById('gpon-branch').addEventListener('change', function() {
        const sibConfigGroup = document.getElementById('sib-config-group');
        const gponBranchConfigSelect = document.getElementById('gpon-branch-config');
        const branch = this.value;
        const ontInput = document.getElementById('gpon-ont');

        // Очищаем конфиг
        clearConfigOutput();

            if (branch && sibConfigs[branch]) {
                // Заполняем список конфигураций
                gponBranchConfigSelect.innerHTML = '<option value="">-- Выберите конфигурацию --</option>';
                sibConfigs[branch].forEach(config => {
                    const option = document.createElement('option');
                    option.value = config.value;
                    option.textContent = config.text;
                    gponBranchConfigSelect.appendChild(option);
                });
                if (sibConfigGroup) sibConfigGroup.classList.remove('hidden');
                // Устанавливаем порт для Сибири
                ontInput.value = '4/2/11';
                // Скрываем Huawei-поля, показываем Eltex-поля (без IMS/vIMS)
                updateGponFields('sib');
            } else {
                if (sibConfigGroup) sibConfigGroup.classList.add('hidden');
                // Возвращаем Huawei-поля
                updateGponFields('huawei');
                ontInput.value = '1/1/1';
            }
    });

    // Обработчик выбора конфигурации филиала
    document.getElementById('gpon-branch-config').addEventListener('change', function() {
        const selectedValue = this.value;
        const ontInput = document.getElementById('gpon-ont');

        clearConfigOutput();

        if (selectedValue) {
            ontInput.value = selectedValue.startsWith('eltex_ltp_') ? '1/1' : '4/2/11';
        }

        updateGponFields(selectedValue);
        updateDiagnostics('gpon', selectedValue, ontInput.value);
    });

    // Функция обновления полей GPON
    function updateGponFields(deviceValue) {
        const gponForm = document.getElementById('gpon-form');
        const eltexFields = document.getElementById('gpon-eltex-fields');
        const huaweiFields = document.getElementById('gpon-huawei-fields');
        const huaweiActions = document.getElementById('gpon-huawei-actions');
        const gponService = document.getElementById('gpon-service').parentElement;
        const csmFields = document.getElementById('gpon-csm-fields');

        // По умолчанию скрываем всё
        gponForm?.classList.remove('gpon-ural');
        gponForm?.classList.remove('gpon-sib');
        gponForm?.classList.remove('gpon-ltp');
        eltexFields.classList.add('hidden');
        huaweiFields.classList.add('hidden');
        huaweiActions.classList.add('hidden');
        gponService.classList.add('hidden');
        csmFields.classList.add('hidden');

        if (!deviceValue) return;

        if (deviceValue === 'huawei') {
            // Huawei - показываем Huawei-поля
            huaweiFields.classList.remove('hidden');
            huaweiActions.classList.remove('hidden');
        } else if (deviceValue === 'eltex_ma4000' || deviceValue === 'eltex_ltp') {
            // Урал - показываем Eltex-поля (SN/PLOAM + IMS/vIMS), скрываем cvid/svid
            gponForm?.classList.add('gpon-ural');
            if (deviceValue === 'eltex_ltp') gponForm?.classList.add('gpon-ltp');
            eltexFields.classList.remove('hidden');
            gponService.classList.remove('hidden');
        } else if (deviceValue === 'sib') {
            // Сибирь - выбран филиал, но не выбрана конфигурация
            // Показываем Eltex-поля БЕЗ IMS/vIMS
            gponForm?.classList.add('gpon-sib');
            eltexFields.classList.remove('hidden');
        } else if (deviceValue.startsWith('eltex_')) {
            // Сибирь - конкретная конфигурация Eltex
            gponForm?.classList.add('gpon-sib');
            if (deviceValue.startsWith('eltex_ltp_')) gponForm?.classList.add('gpon-ltp');
            eltexFields.classList.remove('hidden');
            // Показываем cvid/svid только для CSM
            if (isCsmConfig(deviceValue)) {
                csmFields.classList.remove('hidden');
            }
        }
    }

    // Копирование конфига в буфер обмена
    document.getElementById('copy-all').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Конфиг скопирован в буфер обмена!');
        }).catch(() => {
            showNotification('Ошибка копирования. Попробуйте выделить текст вручную.', 'error');
        });
    });

    // Копирование для ADSL
    document.getElementById('copy-adsl').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Конфиг ADSL скопирован!');
        });
    });

    // Копирование для FTTB
    document.getElementById('copy-fttb').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Конфиг FTTB скопирован!');
        });
    });

    // Копирование для GPON
    document.getElementById('copy-gpon').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Конфиг GPON скопирован!');
        });
    });

    // Сброс формы ADSL
    document.getElementById('reset-adsl').addEventListener('click', () => {
        document.getElementById('adsl-device').selectedIndex = 0;
        document.getElementById('adsl-service').selectedIndex = 0;
        document.getElementById('adsl-port').value = '0/1';
        document.getElementById('adsl-vpivci').value = '0/35';
        document.getElementById('adsl-vlan').value = '101';
        const adslMcastVlan = document.getElementById('adsl-mcast-vlan');
        if (adslMcastVlan) adslMcastVlan.value = '';
        configOutput.textContent = '// Выберите технологию, заполните поля и нажмите "Сгенерировать"';
        updateDiagnostics('adsl', 'alcatel_7330', '0/1', '101');
    });

    // Сброс формы FTTB
    document.getElementById('reset-fttb').addEventListener('click', () => {
        document.getElementById('fttb-device').selectedIndex = 0;
        document.getElementById('fttb-port-type').selectedIndex = 0;
        document.getElementById('fttb-mode').selectedIndex = 0;
        document.getElementById('fttb-port').value = '1/0/1';
        document.getElementById('fttb-description').value = '';
        document.getElementById('fttb-mode').dispatchEvent(new Event('change'));
        configOutput.textContent = '// Выберите технологию, заполните поля и нажмите "Сгенерировать"';
        updateDiagnostics('fttb', 'eltex_2428', { portType: 'gigabitethernet', port: '1/0/1' }, '100');
    });

    // Сброс формы GPON
    document.getElementById('reset-gpon').addEventListener('click', () => {
        document.getElementById('gpon-device').selectedIndex = 0;
        document.getElementById('gpon-service').selectedIndex = 0;
        document.getElementById('gpon-ont').value = '';
        document.getElementById('gpon-vlan').value = '500';
        document.getElementById('gpon-sn').value = '';
        document.getElementById('gpon-ploam').value = '';
        document.getElementById('gpon-cvid').value = '107';
        document.getElementById('gpon-svid').value = '1647';
        // Сбрасываем видимость полей для Huawei через функцию
        updateGponFields('huawei');
        configOutput.textContent = '// Выберите технологию, заполните поля и нажмите "Сгенерировать"';
        updateDiagnostics('gpon', 'huawei', '1/1/1');
    });

    // Очистка вывода
    document.getElementById('clear-output').addEventListener('click', () => {
        configOutput.textContent = '// Выберите технологию, заполните поля и нажмите "Сгенерировать"';
        diagOutput.innerHTML = '';
    });

    // Вспомогательные функции
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function applyTemplate(text, data) {
        if (!text) return '';
        return text.replace(/{(\w+)}/g, (match, key) => {
            if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined && data[key] !== null && data[key] !== '') {
                return data[key];
            }
            return match;
        });
    }

    function extractTemplateTokens(text) {
        const tokens = new Set();
        if (!text) return [];
        const re = /{(\w+)}/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            tokens.add(m[1]);
        }
        return Array.from(tokens);
    }

    function buildExtraFields(containerId, tokens, defaults) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!tokens.length) return;
        tokens.forEach((token) => {
            const field = document.createElement('div');
            field.className = 'vlan-field';
            const label = document.createElement('label');
            label.textContent = defaults[token]?.label || token;
            label.setAttribute('for', `${containerId}-${token}`);
            const input = document.createElement('input');
            input.className = 'form-input';
            input.id = `${containerId}-${token}`;
            input.value = defaults[token]?.value || '';
            input.placeholder = defaults[token]?.placeholder || '';
            field.appendChild(label);
            field.appendChild(input);
            container.appendChild(field);
        });
    }

    function readExtraFields(containerId, tokens) {
        const data = {};
        tokens.forEach((token) => {
            const input = document.getElementById(`${containerId}-${token}`);
            if (input && input.value !== '') data[token] = input.value;
        });
        return data;
    }

    function replaceInterfaceLine(text, portType, port) {
        if (!text) return text;
        const lines = text.split(/\r?\n/);
        const out = lines.map(line => {
            const trimmed = line.trim();
            if (/^interface\s+/i.test(trimmed)) {
                return `interface ${portType} ${port}`;
            }
            return line;
        });
        return out.join('\n');
    }

    function applyFttbVlanOverrides(text, allowedVlans, pvidVlan, mcastVlan) {
        if (!text) return text;
        let out = text;
        if (allowedVlans) {
            // Avoid matching line breaks so we don't eat the next command.
            const vlanListPattern = '([0-9,;\\t -]+)';
            out = out.replace(new RegExp(`(switchport\\s+trunk\\s+allowed\\s+vlan\\s+add\\s+)${vlanListPattern}`, 'gi'), `$1${allowedVlans}`);
            out = out.replace(new RegExp(`(switchport\\s+trunk\\s+allowed\\s+vlan\\s+)${vlanListPattern}`, 'gi'), `$1${allowedVlans}`);
            out = out.replace(new RegExp(`(switchport\\s+hybrid\\s+allowed\\s+vlan\\s+)${vlanListPattern}(\\s+(?:untag|tag|untagged|tagged))?`, 'gi'), `$1${allowedVlans}$3`);
            out = out.replace(new RegExp(`(switchport\\s+general\\s+allowed\\s+vlan\\s+add\\s+)${vlanListPattern}(\\s+untagged)?`, 'gi'), `$1${allowedVlans}$3`);
            out = out.replace(new RegExp(`(port\\s+hybrid\\s+tagged\\s+vlan\\s+)${vlanListPattern}`, 'gi'), `$1${allowedVlans}`);
            out = out.replace(new RegExp(`(port\\s+trunk\\s+allow-pass\\s+vlan\\s+)${vlanListPattern}`, 'gi'), `$1${allowedVlans}`);
        }
        if (pvidVlan) {
            out = out.replace(/(switchport\s+trunk\s+native\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(switchport\s+hybrid\s+native\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(switchport\s+general\s+pvid\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(port\s+hybrid\s+pvid\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(port\s+trunk\s+pvid\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(port\s+default\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(pvid\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(port\s+hybrid\s+untagged\s+vlan\s+)([\d\s-]+)/gi, `$1${pvidVlan}`);
            out = out.replace(/(switchport\s+general\s+allowed\s+vlan\s+add\s+)(\d+)(\s+untagged)/gi, `$1${pvidVlan}$3`);
            out = out.replace(/(switchport\s+access\s+vlan\s+)(\d+)/gi, `$1${pvidVlan}`);
        }
        if (mcastVlan) {
            out = out.replace(/(switchport\s+association\s+multicast-vlan\s+)(\d+)/gi, `$1${mcastVlan}`);
            out = out.replace(/(switchport\s+multicast-tv\s+vlan\s+)(\d+)/gi, `$1${mcastVlan}`);
            out = out.replace(/(multicast-vlan\s+)(\d+)/gi, `$1${mcastVlan}`);
        }
        return out;
    }

    function normalizeFttbTemplateOutput(template, data, portType, port, description, branchNotes) {
        if (!template) return '';
        const lines = template.text.split(/\r?\n/).filter(l => l.trim() !== '');
        let headerLines = [];
        let bodyLines = lines.slice();
        if (lines.length >= 2 && !/^(interface|switchport|port|bridge|configure|vlan|pppoe|storm-control|spanning-tree)/i.test(lines[0].trim())) {
            headerLines.push(lines[0]);
            if (!/^(interface|switchport|port|bridge|configure|vlan|pppoe|storm-control|spanning-tree)/i.test(lines[1].trim())) {
                headerLines.push(lines[1]);
                bodyLines = lines.slice(2);
            } else {
                bodyLines = lines.slice(1);
            }
        }
        let body = bodyLines.join('\n');
        body = applyTemplate(body, data).trim();
        body = replaceInterfaceLine(body, portType, port);
        body = applyFttbVlanOverrides(body, data.allowedVlans, data.pvidVlan, data.mcastVlan);
        if (description) {
            body = body.replace(/(^|\n)\s*description\s+.*$/gim, `$1description ${description}`);
            body = body.replace(/(^|\n)\s*description\s+"[^"]*"\s*$/gim, `$1description "${description}"`);
        }
        const comments = [];
        if (headerLines.length) comments.push(...headerLines.map(l => `! ${l}`));
        if (branchNotes?.length) comments.push(...branchNotes.map(n => `! ${n}`));
        if (template.notes?.length) comments.push(...template.notes.map(n => `! ${n}`));
        return [...comments, body].filter(Boolean).join('\n');
    }

    function isConfigTemplate(text) {
        if (!text) return false;
        return /(^|\n)\s*(interface|switchport|bridge|configure|shutdown|no shutdown|ip |storm-control|loopback-detection)\b/i.test(text);
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function getFttbExtraTokens(templateText, tokens = []) {
        const raw = templateText || '';
        // Normalize NBSP and collapse whitespace so regexes work reliably.
        const text = raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
        const extra = new Set(tokens);

        if (/(switchport\s+trunk\s+allowed\s+vlan|switchport\s+hybrid\s+allowed\s+vlan|switchport\s+general\s+allowed\s+vlan|port\s+hybrid\s+tagged\s+vlan|allow-pass\s+vlan)/i.test(text)) {
            extra.add('allowedVlans');
        }
        if (/(pvid\s+vlan|native\s+vlan|access\s+vlan|untagged\s+vlan)/i.test(text)) {
            extra.add('pvidVlan');
        }
        if (/(multicast-vlan|multicast-tv|mcast\\b)/i.test(text)) {
            extra.add('mcastVlan');
        }

        return Array.from(extra);
    }

    function initSibTemplateSelects() {
        const adslSelect = document.getElementById('adsl-sib-template');
        if (adslSelect && window.sibAdslTemplates) {
            adslSelect.innerHTML = '';
            window.sibAdslTemplates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.label;
                adslSelect.appendChild(opt);
            });
        }

        const branchSelect = document.getElementById('fttb-sib-branch');
        const equipmentSelect = document.getElementById('fttb-sib-equipment');
        const variantSelect = document.getElementById('fttb-sib-variant');

        const catalog = window.sibFttbCatalog;
        if (branchSelect && catalog?.branches?.length) {
            branchSelect.innerHTML = '';
            catalog.branches.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.id;
                opt.textContent = b.name;
                branchSelect.appendChild(opt);
            });
        }

        const adslExtraGroup = document.getElementById('adsl-sib-extra-group');
        const fttbExtraGroup = document.getElementById('fttb-sib-extra-group');

        const adslDefaults = {
            label: { label: 'Label', placeholder: '4041' },
            mcastVlan: { label: 'Multicast VLAN', placeholder: '26', value: '26' },
            servicePort: { label: 'Service-port', placeholder: '178' },
            cvid: { label: 'CVID', placeholder: '3509' },
            svid: { label: 'SVID', placeholder: '2702' },
        };
        const fttbDefaults = {
            allowedVlans: { label: 'Allowed VLANs', placeholder: '4040,4093' },
            pvidVlan: { label: 'PVID VLAN', placeholder: '1503' },
            mcastVlan: { label: 'Multicast VLAN', placeholder: '26' },
        };

        const updateAdslExtra = () => {
            const tplId = adslSelect?.value;
            const tpl = window.sibAdslTemplates?.find(t => t.id === tplId);
            const tokens = extractTemplateTokens(tpl?.text || '').filter(t => !['port', 'vpi', 'vci', 'vlan', 'portNum', 'portShort', 'slot'].includes(t));
            if (tokens.length) {
                adslExtraGroup?.classList.remove('hidden');
                const vlanValue = document.getElementById('adsl-vlan')?.value || '';
                if (vlanValue) adslDefaults.label.value = vlanValue;
                buildExtraFields('adsl-sib-extra-fields', tokens, adslDefaults);
            } else {
                adslExtraGroup?.classList.add('hidden');
            }
        };

        const updateEquipment = () => {
            const branchId = branchSelect?.value;
            const branch = catalog?.branches?.find(b => b.id === branchId);
            if (!equipmentSelect || !branch) return;
            equipmentSelect.innerHTML = '';
            branch.equipment.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.name;
                equipmentSelect.appendChild(opt);
            });
            updateVariants();
        };

        const updateVariants = () => {
            const branchId = branchSelect?.value;
            const branch = catalog?.branches?.find(b => b.id === branchId);
            const equipId = equipmentSelect?.value;
            const equip = branch?.equipment?.find(e => e.id === equipId);
            if (!variantSelect || !equip) return;
            variantSelect.innerHTML = '';
            equip.variants.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = v.label;
                variantSelect.appendChild(opt);
            });
            updateFttbExtra();
        };

        const updateFttbExtra = () => {
            const fttbDevice = document.getElementById('fttb-device')?.value;
            if (fttbDevice !== 'sib_templates') {
                fttbExtraGroup?.classList.add('hidden');
                return;
            }
            const branchId = branchSelect?.value;
            const branch = catalog?.branches?.find(b => b.id === branchId);
            const equipId = equipmentSelect?.value;
            const equip = branch?.equipment?.find(e => e.id === equipId);
            const variant = equip?.variants?.find(v => v.id === variantSelect?.value);
            const tokens = extractTemplateTokens(variant?.text || '');
            const extraTokens = getFttbExtraTokens(variant?.text || '', tokens);
            if (extraTokens.length) {
                fttbExtraGroup?.classList.remove('hidden');
                buildExtraFields('fttb-sib-extra-fields', extraTokens, fttbDefaults);
            } else {
                fttbExtraGroup?.classList.add('hidden');
            }
        };

        branchSelect?.addEventListener('change', updateEquipment);
        equipmentSelect?.addEventListener('change', updateVariants);
        variantSelect?.addEventListener('change', updateFttbExtra);

        updateAdslExtra();
        if (branchSelect && catalog?.branches?.length) {
            updateEquipment();
        }
    }

    // Глобальная функция для копирования команд диагностики
    window.copyCommandFromElement = function(element) {
        const command = element.getAttribute('data-command');
        if (command) {
            navigator.clipboard.writeText(command).then(() => {
                showNotification('Команда скопирована!');
            }).catch(() => {
                showNotification('Ошибка копирования', 'error');
            });
        }
    };

    // Обновление команды профиля/модуляции при изменении выпадающих списков
    window.updateAdslProfileCommand = function(selectElement) {
        const diagCommand = selectElement.closest('.diag-command');
        if (diagCommand) {
            const commandText = diagCommand.querySelector('.diag-command-text');
            const profileSelect = diagCommand.querySelector('.diag-profile-select');
            const modulationSelect = diagCommand.querySelector('.diag-modulation-select');
            const selectedProfile = profileSelect ? profileSelect.value : '';
            const selectedModulation = modulationSelect ? modulationSelect.value : 'auto';
            // Всегда используем оригинальную команду с плейсх
// олдерами
            const originalCommand = commandText.getAttribute('data-original') || commandText.getAttribute('data-command');

            // Обрабатываем плейсх
// олдеры как в replacePlaceholders
            let newCommand = originalCommand;
            const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
            const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
            const portInfo = document.getElementById('adsl-port')?.value || '0/1';
            const portNum = portInfo.includes('/') ? portInfo.split('/')[1] : portInfo;

            // Заменяем все плейсх
// олдеры
            if (selectedProfile) {
                newCommand = newCommand.replace(/{serviceProfile}/g, selectedProfile);
            }
            newCommand = newCommand.replace(/{modulation}/g, selectedModulation);
            newCommand = newCommand.replace(/{spectrumProfile}/g, '_no_AnnexM');
            newCommand = newCommand.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
            newCommand = newCommand.replace(/1\/1\/\{port\}/g, `1/1/${portInfo}`);
            newCommand = newCommand.replace(/\{port\}:\{vpi\}:\{vci\}/g, `${portInfo}:${vpi}:${vci}`);
            newCommand = newCommand.replace(/{portNum}/g, portNum);
            newCommand = newCommand.replace(/{port}/g, portInfo);

            commandText.textContent = newCommand;
            // Обновляем data-command для копирования
            commandText.setAttribute('data-command', newCommand);
        }
    };
    window.updateAlcatel7330Profile = window.updateAdslProfileCommand;

    // Enter в любом поле активной формы => Сгенерировать конфиг
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.closest('.tech-form.active')) return;
        if (target.tagName === 'TEXTAREA') return;
        e.preventDefault();

        const active = document.querySelector('.tech-form.active');
        if (!active) return;
        if (active.id === 'adsl-form') document.getElementById('generate-adsl')?.click();
        if (active.id === 'fttb-form') document.getElementById('generate-fttb')?.click();
        if (active.id === 'gpon-form') document.getElementById('generate-gpon')?.click();
    });

    // Инициализация обработчиков валидации для динамически созданных
// полей
    function initValidationHandlers() {
        // ADSL поля
        const adslPort = document.getElementById('adsl-port');
        const adslVpiVci = document.getElementById('adsl-vpivci');
        const adslVlan = document.getElementById('adsl-vlan');
        const adslMcastVlan = document.getElementById('adsl-mcast-vlan');

        if (adslPort) {
            adslPort.addEventListener('blur', function() {
                const device = document.getElementById('adsl-device')?.value;
                const result = validateAdslPort(this.value, device);
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        if (adslVpiVci) {
            adslVpiVci.addEventListener('blur', function() {
                const result = validateSlashPair(this.value, 'VPI/VCI');
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        if (adslVlan) {
            adslVlan.addEventListener('blur', function() {
                const result = validateNumber(this.value, 'VLAN ID', 1, 4094);
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }
        if (adslMcastVlan) {
            adslMcastVlan.addEventListener('blur', function() {
                if (!this.value || !this.value.trim()) {
                    showFieldValid(this);
                    return;
                }
                const result = validateNumber(this.value, 'Multicast VLAN', 1, 4094);
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        // FTTB порт
        const fttbPort = document.getElementById('fttb-port');
        if (fttbPort) {
            fttbPort.addEventListener('blur', function() {
                const device = document.getElementById('fttb-device')?.value;
                const result = validateFttbPort(this.value, device);
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        // Динамические FTTB VLAN поля
        const accessVlan = document.getElementById('fttb-access-vlan');
        const trunkVlans = document.getElementById('fttb-trunk-vlans');
        const nativeVlan = document.getElementById('fttb-native-vlan');
        const tr069Vlan = document.getElementById('fttb-tr069-vlan');
        const pppoeVlan = document.getElementById('fttb-pppoe-vlan');
        const taggedVlan = document.getElementById('fttb-tagged-vlan');

        // Инициализация обработчиков для существующих
// полей
        [accessVlan, nativeVlan, tr069Vlan, pppoeVlan, taggedVlan].forEach(field => {
            if (field) {
                field.addEventListener('blur', function() {
                    const fieldName = this.previousElementSibling?.textContent || 'VLAN';
                    const result = validateNumber(this.value, fieldName, 1, 4094);
                    if (result.valid) {
                        showFieldValid(this);
                    } else {
                        showFieldError(this, result.error);
                    }
                });
            }
        });

        if (trunkVlans) {
            trunkVlans.addEventListener('blur', function() {
                const result = validateVlanList(this.value, 'Allowed VLANs');
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        // GPON поля
        const gponOnt = document.getElementById('gpon-ont');
        const gponVlan = document.getElementById('gpon-vlan');

        if (gponOnt) {
            gponOnt.addEventListener('blur', function() {
                const result = validatePort(this.value, 'ONT ID');
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }

        if (gponVlan) {
            gponVlan.addEventListener('blur', function() {
                const result = validateNumber(this.value, 'VLAN', 1, 4094);
                if (result.valid) {
                    showFieldValid(this);
                } else {
                    showFieldError(this, result.error);
                }
            });
        }
    }

    // Функции валидации
    function validateSlashPair(value, fieldName) {
        if (!value || !value.trim()) {
            return { valid: false, error: `${fieldName} не может быть пустым` };
        }
        const parts = value.trim().split('/');
        if (parts.length !== 2) {
            return { valid: false, error: `${fieldName} должен быть в формате: число/число (например: 0/35)` };
        }
        const [first, second] = parts.map(v => v.trim());
        if (!/^\d+$/.test(first) || !/^\d+$/.test(second)) {
            return { valid: false, error: `${fieldName} должен содержать только числа` };
        }
        return { valid: true, values: [first, second] };
    }

    function validateNumber(value, fieldName, min = 1, max = 4094) {
        if (!value || !value.trim()) {
            return { valid: false, error: `${fieldName} не может быть пустым` };
        }
        const num = parseInt(value.trim(), 10);
        if (isNaN(num)) {
            return { valid: false, error: `${fieldName} должен быть числом` };
        }
        if (num < min || num > max) {
            return { valid: false, error: `${fieldName} должен быть от ${min} до ${max}` };
        }
        return { valid: true, value: num };
    }

    function validateVlanList(value, fieldName) {
        if (!value || !value.trim()) {
            return { valid: false, error: `${fieldName} не может быть пустым` };
        }
        const vlans = value.split(',').map(v => v.trim()).filter(v => v);
        for (const vlan of vlans) {
            if (vlan.includes('-')) {
                // Диапазон VLAN
                const [start, end] = vlan.split('-').map(v => v.trim());
                if (!/^\d+$/.test(start) || !/^\d+$/.test(end)) {
                    return { valid: false, error: `${fieldName}: диапазон должен содержать только числа` };
                }
                if (parseInt(start) > parseInt(end)) {
                    return { valid: false, error: `${fieldName}: начало диапазона больше конца` };
                }
            } else {
                if (!/^\d+$/.test(vlan)) {
                    return { valid: false, error: `${fieldName}: "${vlan}" не является числом` };
                }
            }
        }
        return { valid: true, value: value.trim() };
    }
    function validateFttbPort(value, device) {
        if (!value || !value.trim()) {
            return { valid: false, error: 'Порт не может быть пустым' };
        }
        const trimmed = value.trim();
        const slashPair = /^\d+\/\d+$/;
        const triple = /^\d+\/\d+\/\d+$/;
        const singleNumber = /^\d+$/;
        const alsitekPattern = /^(e\d+|\d+\/e\d+)$/i;

        const tripleDevices = new Set(['eltex', 'huawei_switch', 'huawei_3328']);
        const pairDevices = new Set([
            'eltex_2428',
            'edgecore_es3526_xa',
            'edgecore_es3526_m',
            'edgecore_es3528_m',
            'si3000',
            'snr',
            'zyxel_fttb',
        ]);
        const singleDevices = new Set([
            'dlink_des3200',
        ]);
        const alsitekDevices = new Set(['alsitek', 'alsitek_fttb']);

        if (tripleDevices.has(device)) {
            if (!triple.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть в формате X/Y/Z (например: 0/0/1)' };
            }
            return { valid: true, value: trimmed };
        }

        if (pairDevices.has(device)) {
            if (!slashPair.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть в формате X/Y (например: 1/1)' };
            }
            return { valid: true, value: trimmed };
        }

        if (singleDevices.has(device)) {
            if (!singleNumber.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть числом (например: 1)' };
            }
            return { valid: true, value: trimmed };
        }

        if (alsitekDevices.has(device)) {
            if (!alsitekPattern.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть в формате e1 или 1/e1' };
            }
            return { valid: true, value: trimmed };
        }

        return validatePort(trimmed, 'Порт');
    }

    function validateAdslPort(value, device) {
        if (!value || !value.trim()) {
            return { valid: false, error: 'Порт не может быть пустым' };
        }
        const trimmed = value.trim();
        const slashPair = /^\d+\/\d+$/;
        const singleNumber = /^\d+$/;
        const slashPairDevices = new Set([
            'alcatel_7330',
            'alcatel_7324',
            'huawei_5600',
            'huawei_5600_vdsl',
            'huawei_58xx_vdsl',
            'huawei_5605',
            'photel',
            'genew_photel_px90',
            'opnet_rt1000',
            'zte_c300',
            'zte_9xxx',
            'zyxel_5000',
        ]);
        const singleDevices = new Set(['iskratel', 'zyxel_1000']);

        if (singleDevices.has(device)) {
            if (!singleNumber.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть числом (например: 1)' };
            }
            return { valid: true, value: trimmed };
        }

        if (slashPairDevices.has(device)) {
            if (!slashPair.test(trimmed)) {
                return { valid: false, error: 'Порт должен быть в формате X/Y (например: 1/1)' };
            }
            return { valid: true, value: trimmed };
        }

        const parts = trimmed.split('/');
        if (parts.length === 2 && parts.every(p => /^\d+$/.test(p))) {
            return { valid: true, value: trimmed };
        }
        if (singleNumber.test(trimmed)) {
            return { valid: true, value: trimmed };
        }
        return { valid: false, error: 'Порт должен быть в формате X/Y или числом' };
    }

    function validatePort(value, fieldName) {
        if (!value || !value.trim()) {
            return { valid: false, error: `${fieldName} не может быть пустым` };
        }
        // Формат может быть: 0/1, 1/0/1, 0/1/1:1
        const portPattern = /^[\d\/:]+$/;
        if (!portPattern.test(value.trim())) {
            return { valid: false, error: `${fieldName} должен содержать только числа, слэши и двоеточия` };
        }
        return { valid: true, value: value.trim() };
    }

    function showFieldError(input, message) {
        if (!input) return;
        
        input.classList.add('error');
        input.classList.remove('valid');
        
        // Удаляем старое сообщение об ошибке
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Добавляем новое сообщение
        if (message) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            input.parentElement.appendChild(errorMsg);
        }
    }

    function showFieldValid(input) {
        if (!input) return;
        
        input.classList.remove('error');
        input.classList.add('valid');
        
        // Удаляем сообщение об ошибке
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Валидация при генерации конфига
    function validateBeforeGenerate(tech) {
        let isValid = true;
        
        if (tech === 'adsl') {
            const adslPort = document.getElementById('adsl-port');
            const adslVpiVci = document.getElementById('adsl-vpivci');
            const adslVlan = document.getElementById('adsl-vlan');
            
            if (adslPort && adslVpiVci && adslVlan) {
                const device = document.getElementById('adsl-device')?.value;
                const portResult = validateAdslPort(adslPort.value, device);
                const vpiVciResult = validateSlashPair(adslVpiVci.value, 'VPI/VCI');
                const vlanResult = validateNumber(adslVlan.value, 'VLAN ID', 1, 4094);
                const adslMcastVlan = document.getElementById('adsl-mcast-vlan');
                
                if (!portResult.valid) {
                    showFieldError(adslPort, portResult.error);
                    isValid = false;
                }
                if (!vpiVciResult.valid) {
                    showFieldError(adslVpiVci, vpiVciResult.error);
                    isValid = false;
                }
                if (!vlanResult.valid) {
                    showFieldError(adslVlan, vlanResult.error);
                    isValid = false;
                }
                if (huaweiAdslDevices.has(device) && adslMcastVlan && adslMcastVlan.value.trim()) {
                    const mcastResult = validateNumber(adslMcastVlan.value, 'Multicast VLAN', 1, 4094);
                    if (!mcastResult.valid) {
                        showFieldError(adslMcastVlan, mcastResult.error);
                        isValid = false;
                    }
                }
            }
        } else if (tech === 'fttb') {
            const fttbDevice = document.getElementById('fttb-device')?.value;
            const fttbPort = document.getElementById('fttb-port');
            if (fttbPort) {
                const portResult = validateFttbPort(fttbPort.value, fttbDevice);
                if (!portResult.valid) {
                    showFieldError(fttbPort, portResult.error);
                    isValid = false;
                }
            }
            if (fttbDevice === 'sib_templates') {
                return isValid;
            }
            
            const mode = document.getElementById('fttb-mode').value;
            if (mode === 'access') {
                const accessVlan = document.getElementById('fttb-access-vlan');
                if (accessVlan) {
                    const result = validateNumber(accessVlan.value, 'Access VLAN', 1, 4094);
                    if (!result.valid) {
                        showFieldError(accessVlan, result.error);
                        isValid = false;
                    }
                }
            } else if (mode === 'trunk' || mode === 'trunk_native') {
                const trunkVlans = document.getElementById('fttb-trunk-vlans');
                if (trunkVlans) {
                    const result = validateVlanList(trunkVlans.value, 'Allowed VLANs');
                    if (!result.valid) {
                        showFieldError(trunkVlans, result.error);
                        isValid = false;
                    }
                }
                if (mode === 'trunk_native') {
                    const nativeVlan = document.getElementById('fttb-native-vlan');
                    if (nativeVlan) {
                        const result = validateNumber(nativeVlan.value, 'Native VLAN', 1, 4094);
                        if (!result.valid) {
                            showFieldError(nativeVlan, result.error);
                            isValid = false;
                        }
                    }
                }
            } else if (mode === 'dot1v') {
                const tr069Vlan = document.getElementById('fttb-tr069-vlan');
                const pppoeVlan = document.getElementById('fttb-pppoe-vlan');
                const taggedVlan = document.getElementById('fttb-tagged-vlan');
                
                if (tr069Vlan) {
                    const result = validateNumber(tr069Vlan.value, 'TR-069 VLAN', 1, 4094);
                    if (!result.valid) {
                        showFieldError(tr069Vlan, result.error);
                        isValid = false;
                    }
                }
                if (pppoeVlan) {
                    const result = validateNumber(pppoeVlan.value, 'PPPoE VLAN', 1, 4094);
                    if (!result.valid) {
                        showFieldError(pppoeVlan, result.error);
                        isValid = false;
                    }
                }
                if (taggedVlan) {
                    const result = validateNumber(taggedVlan.value, 'Tagged VLAN', 1, 4094);
                    if (!result.valid) {
                        showFieldError(taggedVlan, result.error);
                        isValid = false;
                    }
                }
            }
        } else if (tech === 'gpon') {
            const gponOnt = document.getElementById('gpon-ont');
            if (gponOnt) {
                const value = gponOnt.value.trim();
                if (!value) {
                    showFieldError(gponOnt, 'GPON ID не может быть пустым');
                    isValid = false;
                } else {
                    let device = document.getElementById('gpon-device')?.value || '';
                    const branchConfigSelect = document.getElementById('gpon-branch-config');
                    if (device === 'sib' && branchConfigSelect && branchConfigSelect.value) {
                        device = branchConfigSelect.value;
                    }
                    const isLtpDevice = device === 'eltex_ltp' || device.startsWith('eltex_ltp_');
                    const parts = value.split('/');
                    const expectedParts = isLtpDevice ? 2 : 3;
                    if (parts.length !== expectedParts) {
                        showFieldError(
                            gponOnt,
                            isLtpDevice ? 'Формат: x/y (например: 1/2)' : 'Формат: x/y/z (например: 6/7/34)'
                        );
                        isValid = false;
                    } else {
                        const allNumeric = parts.every(p => /^\d+$/.test(p.trim()));
                        if (!allNumeric) {
                            showFieldError(
                                gponOnt,
                                isLtpDevice ? 'Все части GPON ID должны быть числами (x/y)' : 'Все части GPON ID должны быть числами (x/y/z)'
                            );
                            isValid = false;
                        } else {
                            showFieldValid(gponOnt);
                        }
                    }
                }
            }
        }
        
        return isValid;
    }

    // Обработка подсказки VPI/VCI - теперь работает через CSS hover

    // Инициализация
    checkDevicesLoaded(); // Проверяем загрузку устройств
    document.getElementById('fttb-mode')?.dispatchEvent(new Event('change'));
    initValidationHandlers(); // Инициализация обработчиков валидации
    initSibTemplateSelects();
    const adslDeviceInit = document.getElementById('adsl-device');
    const adslServiceGroup = document.getElementById('adsl-service-group');
    const adslTplGroup = document.getElementById('adsl-sib-template-group');
    const adslMcastGroup = document.getElementById('adsl-mcast-vlan-group');
    if (adslDeviceInit?.value === 'sib_templates') {
        adslServiceGroup?.classList.add('hidden');
        adslTplGroup?.classList.remove('hidden');
        adslMcastGroup?.classList.add('hidden');
    } else if (adslDeviceInit?.value) {
        if (huaweiAdslDevices.has(adslDeviceInit.value)) {
            adslMcastGroup?.classList.remove('hidden');
        } else {
            adslMcastGroup?.classList.add('hidden');
        }
    }
    const fttbDeviceInit = document.getElementById('fttb-device');
    const fttbModeGroup = document.getElementById('fttb-mode-group');
    const fttbVlanFields = document.getElementById('fttb-vlan-fields');
    const fttbBranchGroup = document.getElementById('fttb-sib-branch-group');
    const fttbEquipmentGroup = document.getElementById('fttb-sib-equipment-group');
    const fttbVariantGroup = document.getElementById('fttb-sib-variant-group');
    if (fttbDeviceInit?.value === 'sib_templates') {
        fttbModeGroup?.classList.add('hidden');
        fttbVlanFields?.classList.add('hidden');
        fttbBranchGroup?.classList.remove('hidden');
        fttbEquipmentGroup?.classList.remove('hidden');
        fttbVariantGroup?.classList.remove('hidden');
        document.getElementById('fttb-sib-branch')?.dispatchEvent(new Event('change'));
    }
    
    // Инициализация видимости полей GPON (Huawei по умолчанию)
    updateGponFields('huawei');

    // Начальная инициализация диагностики
    if (Object.keys(devices.adsl).length > 0) {
        updateDiagnostics('adsl', 'alcatel_7330', '0/1', '101');
    } else {
        diagOutput.innerHTML = '<div class="diag-empty">Файл конфигурации ADSL не загружен. Проверьте наличие adsl.js</div>';
    }
});
