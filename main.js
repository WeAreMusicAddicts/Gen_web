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
    const mcastSection = document.getElementById('mcast-output-section');
    const mcastOutput = document.getElementById('config-output-mcast');
    const diagnosticsState = {
        html: '',
        key: '',
        timerId: 0,
    };

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
        huawei_5616: '0/1',
        electra: '0/1/26',
        iskratel_mwgl0s92: '0/1',
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
        qtech: '1/0/3',
        huawei_switch: '0/0/1',
        huawei_3328: '0/0/1',
        si3000: '1/1',
        snr: '1/1',
        zyxel_fttb: '1/1',
        zyxel_aam1008: '1',
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
        'huawei_5616',
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
        diagnosticsState.html = '';
        diagnosticsState.key = '';
        if (mcastSection) mcastSection.classList.add('hidden');
        if (mcastOutput) mcastOutput.textContent = '';
    }

    function setConfigOutput(mainText, multicastText, options = {}) {
        const showMulticast = options.showMulticast === true;
        configOutput.textContent = mainText || '';
        if (!mcastSection || !mcastOutput) return;
        if (showMulticast) {
            mcastSection.classList.remove('hidden');
            mcastOutput.textContent = multicastText || '';
        } else {
            mcastSection.classList.add('hidden');
            mcastOutput.textContent = '';
        }
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
            setConfigOutput(applyTemplate(tpl.text, data).trim(), '', { showMulticast: false });
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

        setConfigOutput(commands.join('\n'), '', { showMulticast: false });
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
                        <label for="fttb-access-vlan">Access VLAN <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="number" id="fttb-access-vlan" class="form-input" placeholder="100" value="100">
                    </div>
                </div>
            `;
        } else if (mode === 'trunk') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-trunk-vlans">Allowed VLANs <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="text" id="fttb-trunk-vlans" class="form-input" placeholder="100,200,300" value="100,200,300">
                    </div>
                </div>
            `;
        } else if (mode === 'trunk_native') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-trunk-vlans">Allowed VLANs <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="text" id="fttb-trunk-vlans" class="form-input" placeholder="100,200,300" value="100,200,300">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-native-vlan">Native VLAN <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="number" id="fttb-native-vlan" class="form-input" placeholder="1" value="1">
                    </div>
                </div>
            `;
        } else if (mode === 'dot1v') {
            html = `
                <div class="vlan-input-group vlan-input-group-row">
                    <div class="vlan-field">
                        <label for="fttb-tr069-vlan">TR-069 VLAN <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="number" id="fttb-tr069-vlan" class="form-input" placeholder="700" value="700">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-pppoe-vlan">PPPoE VLAN <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="number" id="fttb-pppoe-vlan" class="form-input" placeholder="101" value="101">
                    </div>
                    <div class="vlan-field">
                        <label for="fttb-tagged-vlan">Tagged VLAN <a class="vlan-anchor" href="#diagnostics-section" title="К командам диагностики VLAN"><i class="fas fa-link"></i></a></label>
                        <input type="number" id="fttb-tagged-vlan" class="form-input" placeholder="102" value="102">
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        // Повторно инициализируем обработчики валидации для новых
// полей
        initValidationHandlers(container);
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

        setConfigOutput(commands.join('\n'), '', { showMulticast: false });
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
        const {
            device,
            service,
            ontField,
            sn,
            ploam,
            gponDescription,
            lteMac,
            lteMacCompact,
            lteDescription,
            cvid,
            svid,
            eltexVpnEnabled,
            eltexVpnVlan,
            isSibBranch,
            ontParts,
            slot,
            ponPort,
            ontIdx,
            frame,
            ontIdHuawei,
            ontIdEltex,
        } = getGponFormState();

        let commands = [];
        let multicastCommands = [];
        let showMulticastBlock = false;
        let useBlocksOutput = false;

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
            const iptvServicePortIndex = document.getElementById('gpon-iptv-sp-index')?.value.trim();
            const igmpMemberUserIndex = document.getElementById('gpon-iptv-igmp-index')?.value.trim();
            const doVoIP = document.getElementById('gpon-action-voip').checked;

            useBlocksOutput = true;
            showMulticastBlock = doIPTV;

            const gponPort = `${frame}/${slot}/${ponPort}`;
            const addHuaweiMulticast = () => {
                multicastCommands.push('btv');
                const igmpIndex = igmpMemberUserIndex || iptvServicePortIndex || '*СЕРВИС ПОРТ (INDEX)*';
                multicastCommands.push(`igmp user add service-port ${igmpIndex} no-auth max-program 8`);
                multicastCommands.push(`multicast-vlan ${iptvVlan}`);
                multicastCommands.push(`igmp multicast-vlan member service-port ${igmpIndex}`);
                multicastCommands.push('quit');
                multicastCommands.push('return');
            };

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
                const description = gponDescription || `ONT-${ontIdHuawei}`;
                let authType = 'password-auth';
                let authValue = '1112223334';
                if (ploam) {
                    authType = 'password-auth';
                    authValue = ploam;
                } else if (sn) {
                    authType = 'sn-auth';
                    authValue = sn;
                }
                commands.push(`ont add ${ponPort} ${ontIdx} ${authType} "${authValue}" always-on omci ont-lineprofile-id ${lineProfile} ont-srvprofile-id ${srvProfile} desc "${description}"`);
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
                    commands.push(`display service-port port ${gponPort} ont ${ontIdx} gemport 1`);
                    addHuaweiMulticast();
                } else {
                    commands.push('return');
                }
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
                    commands.push(`display service-port port ${gponPort} ont ${ontIdx} gemport 1`);
                    addHuaweiMulticast();
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
        } else if (device === 'eltex_lte_8x' || device === 'eltex_lte_4x') {
            if (devices.gpon[device]?.services?.default) {
                commands = commands.concat(
                    devices.gpon[device].services.default({
                        ontId: ontField,
                        mac: lteMac || 'xx:xx:xx:xx:xx:xx',
                        macCompact: lteMacCompact || 'xxxxxxxxxxxx',
                        description: lteDescription || 'xxxxxxxx_yyyyyyyy',
                    })
                );
            } else {
                commands.push(`! Шаблон для ${device} не найден.`);
            }
        } else if (device === 'electra') {
            const electraSn = document.getElementById('gpon-electra-sn')?.value.trim();
            const electraDesc = document.getElementById('gpon-electra-description')?.value.trim();
            const electraMac = document.getElementById('gpon-electra-mac')?.value.trim();
            const tr069Vlan = document.getElementById('gpon-electra-tr069-vlan')?.value.trim() || '760';
            const sVlan = document.getElementById('gpon-electra-svlan')?.value.trim() || '2460';
            const cVlan = document.getElementById('gpon-electra-cvlan')?.value.trim() || '196';
            const multicastVlan = document.getElementById('gpon-electra-mcast-vlan')?.value.trim() || '26';
            const igmpIndex = document.getElementById('gpon-electra-igmp-index')?.value.trim() || '12';

            useBlocksOutput = true;
            showMulticastBlock = true;

            const selectedElectraAction = document.querySelector('input[name="gpon-electra-action"]:checked')?.value || 'activate';
            const doDelete = selectedElectraAction === 'delete';
            const doReplace = selectedElectraAction === 'replace';
            const doActivate = selectedElectraAction === 'activate';

            const slot = ontParts[0] || '0';
            const ponPort = ontParts[1] || '1';
            const ontIdx = ontParts[2] || '1';
            const frameSlot = `0/${slot}`;
            const gponPortElectra = `0/${slot}/${ponPort}`;
            const serial = electraSn || sn || '415457541820650F';
            const description = electraDesc || gponDescription || '272004002965';

            if (doDelete || doReplace || doActivate) {
                commands.push('enable');
            }

            if (doDelete) {
                commands.push('config');
                commands.push(`interface gpon ${frameSlot}`);
                commands.push(`ont delete ${ponPort} ${ontIdx}`);
                commands.push('exit');
                commands.push('exit');
                commands.push('save');
                commands.push('');
            }

            if (doReplace) {
                commands.push('config');
                commands.push(`interface gpon ${frameSlot}`);
                commands.push(`ont modify ${ponPort} ${ontIdx} auth-type sn-auth ${serial}`);
                commands.push('exit');
                commands.push('exit');
                commands.push('save');
                commands.push('');
            }

            if (doActivate) {
                commands.push('config');
                commands.push(`interface gpon ${frameSlot}`);
                commands.push(`ont add ${ponPort} ${ontIdx} sn-auth ${serial} ont-lineprofile-name CSM ont-srvprofile-name CSM`);
                commands.push(`ont description ${ponPort} ${ontIdx} ${description}`);
                commands.push(`ont tr069-profile ${ponPort} ${ontIdx} ont-tr069profile-id 3`);
                commands.push(`service-port autoindex vlan ${sVlan} gpon ${frameSlot} port ${ponPort} ont ${ontIdx} gemport 2 multi-service user-vlan 10 tag-action translate-and-add inner-vlan ${cVlan} inner-priority 0`);
                commands.push(`service-port autoindex vlan ${tr069Vlan} gpon ${frameSlot} port ${ponPort} ont ${ontIdx} gemport 1 multi-service user-vlan 4094 tag-action translate-and-add inner-vlan 4094 inner-priority 0`);
                commands.push(`igmp user add user-index autoindex pon ${gponPortElectra} ont ${ontIdx} no-auth max-program 32`);
                commands.push(`show current-config include pon ${gponPortElectra} ont ${ontIdx} no-auth max-program 32`);
                multicastCommands.push(`multicast-vlan ${multicastVlan}`);
                multicastCommands.push(`igmp member user-index ${igmpIndex}`);
                multicastCommands.push('exit');
                multicastCommands.push('exit');
                multicastCommands.push('save');
                if (electraMac) {
                    multicastCommands.push('');
                    multicastCommands.push(`! MAC ONT: ${electraMac}`);
                }
            }
        } else if (!isSibBranch && (device === 'eltex_ma4000' || device === 'eltex_ltp')) {
            // Уральский филиал - используем IMS/vIMS
            if (devices.gpon[device]?.services?.[service]) {
                commands = commands.concat(
                    devices.gpon[device].services[service]({
                        ontId: ontIdEltex,
                        sn: sn || '5452535225153E7C',
                        ploam,
                        vpnEnabled: !!eltexVpnEnabled,
                        vpnVlan: eltexVpnVlan,
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

        if (useBlocksOutput) {
            setConfigOutput(commands.join('\n'), multicastCommands.join('\n'), { showMulticast: showMulticastBlock });
        } else {
            setConfigOutput(commands.join('\n'), '', { showMulticast: false });
        }
        updateDiagnostics('gpon', device, device === 'huawei' ? ontIdHuawei : ontIdEltex);
    });

    // Обновление диагностики с группировкой и пояснениями
    function setDiagnosticsHtml(html, key = '') {
        if (diagnosticsState.key === key && diagnosticsState.html === html) {
            return;
        }
        diagOutput.innerHTML = html;
        diagnosticsState.html = html;
        diagnosticsState.key = key;
    }

    function getDiagnosticsCacheKey(tech, device, portInfo, vlan) {
        const payload = { tech, device, portInfo, vlan };
        if (tech === 'adsl') {
            payload.vpiVci = document.getElementById('adsl-vpivci')?.value.trim() || '';
        } else if (tech === 'gpon') {
            payload.electraMac = document.getElementById('gpon-electra-mac')?.value.trim() || '';
            payload.electraSn = document.getElementById('gpon-electra-sn')?.value.trim() || '';
            payload.electraSvlan = document.getElementById('gpon-electra-svlan')?.value.trim() || '';
            payload.lteMac = normalizeMacAddress(document.getElementById('gpon-lte-mac')?.value.trim());
        }
        return JSON.stringify(payload);
    }

    function scheduleDiagnosticsUpdate(tech, device = null, portInfo = null, vlan = null) {
        if (diagnosticsState.timerId) {
            clearTimeout(diagnosticsState.timerId);
        }
        diagnosticsState.timerId = window.setTimeout(() => {
            diagnosticsState.timerId = 0;
            updateDiagnostics(tech, device, portInfo, vlan);
        }, 16);
    }

    function updateDiagnostics(tech, device = null, portInfo = null, vlan = null) {
        // Получаем диагностику устройства или используем пустой объект
        const deviceDiag = (device && devices[tech]?.[device]?.diagnostics) ? devices[tech][device].diagnostics : null;
        const cacheKey = getDiagnosticsCacheKey(tech, device, portInfo, vlan);
        
        if (!deviceDiag) {
            setDiagnosticsHtml('<div class="diag-empty">Команды диагностики для данного устройства в разработке</div>', cacheKey);
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
                else if (device === 'huawei_5616' && portInfo) {
                    const parts = String(portInfo).split('/').filter(Boolean);
                    const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
                    const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
                    const slot = parts.length === 3 ? parts[1] : (parts[0] || '');
                    const portNum = parts.length === 3 ? parts[2] : (parts[1] || '');
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
                } else if ((device === 'eltex_lte_8x' || device === 'eltex_lte_4x')) {
                    const mac = normalizeMacAddress(document.getElementById('gpon-lte-mac')?.value.trim()) || '{mac}';
                    out = out.replace(/{mac}/g, mac);
                } else if (device === 'electra' && portInfo) {
                    const parts = String(portInfo).split('/').filter(Boolean);
                    const slot = parts[0] || '';
                    const ponPort = parts[1] || '';
                    const ontIdx = parts[2] || '';
                    const frame = '0';
                    const frameSlot = slot ? `${frame}/${slot}` : '';
                    const gponPort = slot && ponPort ? `${frame}/${slot}/${ponPort}` : '';
                    const mac = document.getElementById('gpon-electra-mac')?.value.trim() || '{mac}';
                    const sn = document.getElementById('gpon-electra-sn')?.value.trim() || '{sn}';
                    const svlan = document.getElementById('gpon-electra-svlan')?.value.trim() || '{svlan}';
                    out = out.replace(/{frame}/g, frame);
                    out = out.replace(/{slot}/g, slot);
                    out = out.replace(/{ponPort}/g, ponPort);
                    out = out.replace(/{ontIdx}/g, ontIdx);
                    out = out.replace(/{gponPort}/g, gponPort);
                    out = out.replace(/{frameSlot}/g, frameSlot);
                    out = out.replace(/{mac}/g, mac);
                    out = out.replace(/{sn}/g, sn);
                    out = out.replace(/{svlan}/g, svlan);
                }
                if (portInfo) {
                    const parts = String(portInfo).split('/').filter(Boolean);
                    const slot = parts[0] || '';
                    const ponPort = parts[1] || '';
                    const ontIdx = parts[2] || '';
                    out = out.replace(/{slot}/g, slot);
                    out = out.replace(/{ponPort}/g, ponPort);
                    out = out.replace(/{ontIdx}/g, ontIdx);
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
                const originalCommandWithTokens = finalCommand;
                let profileSelectHtml = '';
                let modulationSelectHtml = '';
                let profileInputHtml = '';
                let profileInputBlock = '';
                let portSpeedSelectHtml = '';
                let dataCommand = escapeHtml(finalCommand);
                let dataOriginal = escapeHtml(originalCommandWithTokens);

                // Устройства с выбором профиля
                const devicesWithProfile = ['alcatel_7330', 'zyxel_5000', 'zyxel_1000', 'zyxel_aam1008', 'alcatel_7324'];

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
                    if (command.includes('{spectrumProfile}')) {
                        profileInputHtml += `
                            <input type="text" class="diag-profile-input" data-token="{spectrumProfile}" value="${spectrumProfile}" placeholder="PROF-NAME" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-NAME">
                        `;
                    }
                    if (command.includes('{serviceProfile}')) {
                        profileInputHtml += `
                            <input type="text" class="diag-profile-input" data-token="{serviceProfile}" value="${serviceProfile}" placeholder="PROF-NAME" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-NAME">
                        `;
                    }
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand
                        .replace(/{spectrumProfile}/g, spectrumProfile)
                        .replace(/{serviceProfile}/g, serviceProfile);
                }

                if (command.includes('{portSpeed}')) {
                    portSpeedSelectHtml = `
                        <select class="diag-profile-select diag-port-speed-select" onchange="updateDiagPortSpeedCommand(this)">
                            <option value="auto" selected>auto</option>
                            <option value="1000_full">1000_full</option>
                            <option value="100_full">100_full</option>
                            <option value="100_half">100_half</option>
                            <option value="10_full">10_full</option>
                            <option value="10_half">10_half</option>
                        </select>
                    `;
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand.replace(/{portSpeed}/g, 'auto');
                    dataCommand = escapeHtml(finalCommand);
                }

                if (command.includes('<PROF_NAME>')) {
                    const defaultProfileName = 'PROF-NAME';
                    profileInputHtml += `
                        <input type="text" class="diag-profile-input" data-token="<PROF_NAME>" value="${defaultProfileName}" placeholder="PROF-NAME" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-NAME">
                    `;
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand.replace(/<PROF_NAME>/g, defaultProfileName);
                    dataCommand = escapeHtml(finalCommand);
                }

                if (command.includes('<PROF_INDEX>')) {
                    const defaultProfileId = 'PROF-INDEX';
                    profileInputHtml += `
                        <input type="text" class="diag-profile-input" data-token="<PROF_INDEX>" value="${defaultProfileId}" placeholder="PROF-INDEX" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-INDEX" inputmode="numeric">
                    `;
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand.replace(/<PROF_INDEX>/g, defaultProfileId);
                    dataCommand = escapeHtml(finalCommand);
                }

                if (command.includes('<PROF_INDEX_NOISE>')) {
                    const defaultProfileId = 'PROF-INDEX';
                    profileInputHtml += `
                        <div class="diag-profile-row">
                            <span class="diag-profile-label">NM-PROF:</span>
                            <input type="text" class="diag-profile-input" data-token="<PROF_INDEX_NOISE>" value="${defaultProfileId}" placeholder="PROF-INDEX" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-INDEX (noise-margin)" inputmode="numeric">
                        </div>
                    `;
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand.replace(/<PROF_INDEX_NOISE>/g, defaultProfileId);
                    dataCommand = escapeHtml(finalCommand);
                    description = '';
                }

                if (command.includes('<PROF_INDEX_DS>')) {
                    const defaultProfileId = 'PROF-INDEX';
                    profileInputHtml += `
                        <div class="diag-profile-row">
                            <span class="diag-profile-label">DS-PROF:</span>
                            <input type="text" class="diag-profile-input" data-token="<PROF_INDEX_DS>" value="${defaultProfileId}" placeholder="PROF-INDEX" onfocus="selectDiagProfileInput(this)" oninput="updateDiagProfileTokenCommand(this)" title="PROF-INDEX (ds-rate)" inputmode="numeric">
                        </div>
                    `;
                    dataOriginal = escapeHtml(originalCommandWithTokens);
                    finalCommand = finalCommand.replace(/<PROF_INDEX_DS>/g, defaultProfileId);
                    dataCommand = escapeHtml(finalCommand);
                    description = '';
                }

                if (profileInputHtml) {
                    profileInputBlock = `<div class="diag-profile-stack">${profileInputHtml}</div>`;
                }

                const safeCommand = escapeHtml(finalCommand);
                html += `
                    <div class="diag-command">
                        <div class="diag-command-row">
                            <div class="diag-command-text" data-command="${dataCommand}" data-original="${dataOriginal}" onclick="copyCommandFromElement(this)" title="Кликните для копирования">${safeCommand}</div>
                            ${profileSelectHtml}
                            ${modulationSelectHtml}
                            ${profileInputBlock}
                            ${portSpeedSelectHtml}
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

        setDiagnosticsHtml(html, cacheKey);
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
            device = getGponEffectiveDevice();
            portInfo = document.getElementById('gpon-ont').value || '';
            scheduleDiagnosticsUpdate('gpon', device, portInfo, vlan);
            return;
        }

        scheduleDiagnosticsUpdate(tech, device, portInfo, vlan);
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
        scheduleDiagnosticsUpdate('adsl', this.value, port, vlan);
    });

    document.getElementById('fttb-device').addEventListener('change', function() {
        // Автозаполнение порта
        const portInput = document.getElementById('fttb-port');
        const portTypeGroup = document.getElementById('fttb-port-type-group');
        const modeGroup = document.getElementById('fttb-mode-group');
        const vlanFields = document.getElementById('fttb-vlan-fields');
        const modeSelect = document.getElementById('fttb-mode');
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
        if (modeSelect) {
            const dot1vOption = modeSelect.querySelector('option[value="dot1v"]');
            const supportsDot1v = !!devices?.fttb?.[this.value]?.modes?.dot1v;
            if (dot1vOption) dot1vOption.disabled = !supportsDot1v;
            if (!supportsDot1v && modeSelect.value === 'dot1v') {
                modeSelect.value = 'access';
            }
            modeSelect.dispatchEvent(new Event('change'));
        }
        // Очищаем конфиг при смене оборудования
        clearConfigOutput();
        const portType = document.getElementById('fttb-port-type').value === 'ge' ? 'gigabitethernet' : 'fastethernet';
        const port = portInput.value;
        const vlan = document.getElementById('fttb-access-vlan')?.value || '100';
        scheduleDiagnosticsUpdate('fttb', this.value, { portType, port }, vlan);
    });

    // Очищаем конфиг при смене типа порта в FTTB
    document.getElementById('fttb-port-type').addEventListener('change', function() {
        clearConfigOutput();
    });

    // Карта конфигураций для каждого филиала
    // Siberia config map by OLT type
    const sibConfigs = {
        ma4000: {
            af: [
                { value: 'eltex_ma4000_af_csm', text: 'CSM' },
                { value: 'eltex_ma4000_af_esm', text: 'ESM' },
            ],
            gaf: [
                { value: 'eltex_ma4000_gaf_esm_v1', text: 'ESM \u04121' },
                { value: 'eltex_ma4000_gaf_esm_v2', text: 'ESM \u04122' },
                { value: 'eltex_ma4000_gaf_esm_v3', text: 'ESM \u04123' },
            ],
            nsk: [
                { value: 'eltex_ma4000_nsk_csm', text: 'CSM' },
                { value: 'eltex_ma4000_nsk_esm', text: 'ESM' },
                { value: 'eltex_ma4000_nsk_esm_ipiptv', text: 'ESM (INT+IPTV+SIP)' },
                { value: 'eltex_ma4000_nsk_ntu1', text: 'NTU-1' },
                { value: 'eltex_ma4000_nsk_eos', text: '\u0411\u044b\u0432\u0448\u0438\u0439 \u041e\u043f\u0435\u0440\u0430\u0442\u043e\u0440 \u0415\u041e\u0421' },
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
                { value: 'eltex_ma4000_kras_hak_esm', text: 'ESM \u0425\u0430\u043a\u0430\u0441\u0438\u044f' },
            ],
        },
        ltp: {
            nsk: [
                { value: 'eltex_ltp_nsk_esm', text: 'ESM (LTP8-16N)' },
                { value: 'eltex_ltp_nsk_csm', text: 'CSM (LTP8-16N)' },
            ],
        },
    };

    function getSibConfigList(deviceValue, branch) {
        if (!branch || branch === 'ural') return [];
        if (deviceValue !== 'eltex_ma4000' && deviceValue !== 'eltex_ltp') return [];
        const key = deviceValue === 'eltex_ltp' ? 'ltp' : 'ma4000';
        return sibConfigs[key]?.[branch] || [];
    }

    function getGponEffectiveDevice() {
        const deviceValue = document.getElementById('gpon-device')?.value || '';
        const branchValue = document.getElementById('gpon-branch')?.value || 'ural';
        const configValue = document.getElementById('gpon-branch-config')?.value || '';
        return resolveGponDevice(deviceValue, branchValue, configValue);
    }

    function resolveGponDevice(deviceValue, branchValue = 'ural', branchConfigValue = '') {
        if (deviceValue === 'eltex_lte') {
            return document.getElementById('gpon-lte-model')?.value || 'eltex_lte_8x';
        }
        if (branchValue !== 'ural' && branchConfigValue) {
            return branchConfigValue;
        }
        return deviceValue;
    }

    function normalizeMacAddress(value) {
        const hex = String(value || '')
            .replace(/[^0-9a-fA-F]/g, '')
            .slice(0, 12)
            .toLowerCase();
        return hex.match(/.{1,2}/g)?.join(':') || '';
    }

    function getMacCompact(value) {
        return String(value || '')
            .replace(/[^0-9a-fA-F]/g, '')
            .slice(0, 12)
            .toLowerCase();
    }

    function getGponFormState() {
        const branchValue = document.getElementById('gpon-branch')?.value || 'ural';
        const branchConfigValue = document.getElementById('gpon-branch-config')?.value || '';
        const deviceValue = document.getElementById('gpon-device')?.value || '';
        const device = resolveGponDevice(deviceValue, branchValue, branchConfigValue);
        const service = document.getElementById('gpon-service')?.value || 'ims';
        const ontField = document.getElementById('gpon-ont')?.value.trim() || '4/2/11';
        const sn = document.getElementById('gpon-sn')?.value.trim() || '';
        const ploam = document.getElementById('gpon-ploam')?.value.trim() || '';
        const gponDescription = document.getElementById('gpon-description')?.value.trim() || '';
        const lteMac = normalizeMacAddress(document.getElementById('gpon-lte-mac')?.value.trim());
        const lteMacCompact = getMacCompact(lteMac);
        const lteDescription = document.getElementById('gpon-lte-description')?.value.trim() || '';
        const cvid = document.getElementById('gpon-cvid')?.value.trim() || '107';
        const svid = document.getElementById('gpon-svid')?.value.trim() || '1647';
        const eltexVpnEnabled = document.getElementById('gpon-eltex-vpn')?.checked;
        const eltexVpnVlan = document.getElementById('gpon-eltex-vpn-vlan')?.value.trim() || '';
        const isSibBranch = branchValue !== 'ural';
        const isLtpDevice = device === 'eltex_ltp' || device.startsWith('eltex_ltp_');
        const ontParts = ontField.split('/');
        const [slot = '4', ponPort = '2', ontIdx = '11'] = ontParts;
        const frame = '0';
        const ontIdHuawei = `${frame}/${slot}/${ponPort} ${ontIdx || '11'}`;
        const ontIdEltex = isLtpDevice ? `${slot}/${ponPort}` : `${slot}/${ponPort}/${ontIdx || '11'}`;

        return {
            branchValue,
            branchConfigValue,
            deviceValue,
            device,
            service,
            ontField,
            sn,
            ploam,
            gponDescription,
            lteMac,
            lteMacCompact,
            lteDescription,
            cvid,
            svid,
            eltexVpnEnabled,
            eltexVpnVlan,
            isSibBranch,
            isLtpDevice,
            ontParts,
            slot,
            ponPort,
            ontIdx,
            frame,
            ontIdHuawei,
            ontIdEltex,
        };
    }

    function setDefaultGponOnt(deviceValue) {
        const ontInput = document.getElementById('gpon-ont');
        if (!ontInput) return;
        if (deviceValue === 'huawei') {
            ontInput.value = '1/1/1';
        } else if (deviceValue === 'electra') {
            ontInput.value = '0/1/26';
        } else if (deviceValue === 'eltex_lte_8x') {
            ontInput.value = '';
        } else if (deviceValue === 'eltex_lte_4x') {
            ontInput.value = '1/1';
        } else if (deviceValue === 'eltex_ltp' || deviceValue.startsWith('eltex_ltp_')) {
            ontInput.value = '1/1';
        } else {
            ontInput.value = '4/2/11';
        }
    }

    function syncGponBranchAvailability() {
        const gponBranchSelect = document.getElementById('gpon-branch');
        const gponDeviceSelect = document.getElementById('gpon-device');
        if (!gponBranchSelect || !gponDeviceSelect) return;
        if (gponDeviceSelect.value === 'huawei' || gponDeviceSelect.value === 'electra' || gponDeviceSelect.value === 'eltex_lte') {
            gponBranchSelect.value = 'ural';
            gponBranchSelect.disabled = true;
        } else {
            gponBranchSelect.disabled = false;
        }
    }

    function updateGponBranchOptions() {
        const gponBranchSelect = document.getElementById('gpon-branch');
        const gponDeviceSelect = document.getElementById('gpon-device');
        if (!gponBranchSelect || !gponDeviceSelect) return;

        const deviceValue = gponDeviceSelect.value;
        const ma4000Branches = Object.keys(sibConfigs.ma4000 || {});
        const ltpBranches = Object.keys(sibConfigs.ltp || {});
        const available = new Set(
            deviceValue === 'eltex_ltp' ? ltpBranches : deviceValue === 'eltex_ma4000' ? ma4000Branches : []
        );

        Array.from(gponBranchSelect.options).forEach((opt) => {
            if (opt.value === 'ural') {
                opt.disabled = false;
                opt.hidden = false;
                return;
            }
            if (deviceValue === 'huawei' || deviceValue === 'electra' || deviceValue === 'eltex_lte') {
                opt.disabled = true;
                opt.hidden = true;
                return;
            }
            if (deviceValue === 'eltex_ltp' || deviceValue === 'eltex_ma4000') {
                const isAvailable = available.has(opt.value);
                opt.disabled = !isAvailable;
                opt.hidden = !isAvailable;
                return;
            }
            opt.disabled = true;
            opt.hidden = true;
        });

        if (gponBranchSelect.selectedOptions.length && gponBranchSelect.selectedOptions[0].disabled) {
            gponBranchSelect.value = 'ural';
        }
    }

    function updateGponBranchConfigOptions() {
        const gponDeviceSelect = document.getElementById('gpon-device');
        const gponBranchSelect = document.getElementById('gpon-branch');
        const configGroup = document.getElementById('gpon-config-group');
        const configSelect = document.getElementById('gpon-branch-config');
        if (!gponDeviceSelect || !gponBranchSelect || !configGroup || !configSelect) return;

        if (gponBranchSelect.value === 'ural' || gponDeviceSelect.value === 'huawei') {
            configGroup.classList.add('hidden');
            configSelect.innerHTML = '<option value="">-- \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044e --</option>';
            configSelect.value = '';
            return;
        }

        const configs = getSibConfigList(gponDeviceSelect.value, gponBranchSelect.value);
        configSelect.innerHTML = '';

        if (configs.length) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044e --';
            configSelect.appendChild(option);
            configs.forEach(config => {
                const opt = document.createElement('option');
                opt.value = config.value;
                opt.textContent = config.text;
                configSelect.appendChild(opt);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- \u041d\u0435\u0442 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0439 \u0434\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f --';
            option.disabled = true;
            option.selected = true;
            configSelect.appendChild(option);
        }

        configGroup.classList.remove('hidden');
    }

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
        const gponBranchSelect = document.getElementById('gpon-branch');
        const ontInput = document.getElementById('gpon-ont');

        if ((this.value === 'huawei' || this.value === 'electra' || this.value === 'eltex_lte') && gponBranchSelect) {
            gponBranchSelect.value = 'ural';
        }

        syncGponBranchAvailability();
        updateGponBranchOptions();
        updateGponBranchConfigOptions();

        const effectiveDevice = getGponEffectiveDevice();
        setDefaultGponOnt(effectiveDevice);
        clearConfigOutput();

        updateGponFields();
        scheduleDiagnosticsUpdate('gpon', effectiveDevice, ontInput.value);
    });

    const gponLteModelSelect = document.getElementById('gpon-lte-model');
    if (gponLteModelSelect) {
        gponLteModelSelect.addEventListener('change', function() {
            const ontInput = document.getElementById('gpon-ont');
            setDefaultGponOnt(this.value);
            updateGponFields();
            scheduleDiagnosticsUpdate('gpon', this.value, ontInput?.value || '');
        });
    }

    const gponLteMacField = document.getElementById('gpon-lte-mac');
    if (gponLteMacField) {
        gponLteMacField.addEventListener('input', function() {
            const normalized = normalizeMacAddress(this.value);
            if (this.value !== normalized) this.value = normalized;
            if (document.getElementById('gpon-device')?.value === 'eltex_lte') {
                scheduleDiagnosticsUpdate('gpon', getGponEffectiveDevice(), document.getElementById('gpon-ont')?.value || '');
            }
        });
    }

    const gponLteDescriptionField = document.getElementById('gpon-lte-description');
    if (gponLteDescriptionField) {
        gponLteDescriptionField.addEventListener('input', () => {
            if (document.getElementById('gpon-device')?.value === 'eltex_lte') {
                scheduleDiagnosticsUpdate('gpon', getGponEffectiveDevice(), document.getElementById('gpon-ont')?.value || '');
            }
        });
    }

    const eltexVpnCheckbox = document.getElementById('gpon-eltex-vpn');
    const eltexVpnVlanField = document.getElementById('gpon-eltex-vpn-vlan-field');
    if (eltexVpnCheckbox && eltexVpnVlanField) {
        const toggleEltexVpnField = () => {
            eltexVpnVlanField.classList.toggle('hidden', !eltexVpnCheckbox.checked);
        };
        eltexVpnCheckbox.addEventListener('change', toggleEltexVpnField);
        toggleEltexVpnField();
    }

    // Обработчик выбора филиала
    document.getElementById('gpon-branch').addEventListener('change', function() {
        const gponDeviceSelect = document.getElementById('gpon-device');
        const ontInput = document.getElementById('gpon-ont');

        clearConfigOutput();

        if (gponDeviceSelect?.value === 'huawei' && this.value !== 'ural') {
            gponDeviceSelect.value = 'eltex_ma4000';
        }

        syncGponBranchAvailability();
        updateGponBranchOptions();
        updateGponBranchConfigOptions();

        const effectiveDevice = getGponEffectiveDevice();
        setDefaultGponOnt(effectiveDevice);

        updateGponFields();
        scheduleDiagnosticsUpdate('gpon', effectiveDevice, ontInput.value);
    });

    // Обработчик выбора конфигурации филиала
    document.getElementById('gpon-branch-config').addEventListener('change', function() {
        const ontInput = document.getElementById('gpon-ont');
        const selectedValue = this.value;

        clearConfigOutput();

        if (selectedValue) {
            setDefaultGponOnt(selectedValue);
        } else {
            setDefaultGponOnt(getGponEffectiveDevice());
        }

        updateGponFields();
        scheduleDiagnosticsUpdate('gpon', getGponEffectiveDevice(), ontInput.value);
    });

    // Обновление диагностики Electra при вводе MAC/SN/SVLAN
    ['gpon-electra-mac', 'gpon-electra-sn', 'gpon-electra-svlan'].forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.addEventListener('input', () => {
            if (getGponEffectiveDevice() !== 'electra') return;
            const ontInput = document.getElementById('gpon-ont');
            scheduleDiagnosticsUpdate('gpon', 'electra', ontInput?.value || '');
        });
    });

    // Функция обновления полей GPON
    function updateGponFields() {
        const gponForm = document.getElementById('gpon-form');
        const gponOntInput = document.getElementById('gpon-ont');
        const gponOntGroup = gponOntInput?.closest('.form-group');
        const gponOntLabel = document.querySelector('label[for="gpon-ont"]');
        const eltexFields = document.getElementById('gpon-eltex-fields');
        const lteFields = document.getElementById('gpon-lte-fields');
        const eltexVpnRow = document.getElementById('gpon-eltex-vpn-row');
        const eltexVpnVlanField = document.getElementById('gpon-eltex-vpn-vlan-field');
        const eltexVpnCheckbox = document.getElementById('gpon-eltex-vpn');
        const huaweiFields = document.getElementById('gpon-huawei-fields');
        const huaweiIgmp = document.getElementById('gpon-huawei-igmp');
        const huaweiActions = document.getElementById('gpon-huawei-actions');
        const electraFields = document.getElementById('gpon-electra-fields');
        const electraActions = document.getElementById('gpon-electra-actions');
        const gponBranchGroup = document.getElementById('gpon-branch-group');
        const gponConfigGroup = document.getElementById('gpon-config-group');
        const gponService = document.getElementById('gpon-service').parentElement;
        const csmFields = document.getElementById('gpon-csm-fields');
        const deviceValue = document.getElementById('gpon-device')?.value || '';
        const branchValue = document.getElementById('gpon-branch')?.value || 'ural';
        const configValue = document.getElementById('gpon-branch-config')?.value || '';
        const isSibBranch = branchValue !== 'ural';
        const effectiveDevice = resolveGponDevice(deviceValue, branchValue, configValue);

        // Hide all by default
        gponForm?.classList.remove('gpon-ural');
        gponForm?.classList.remove('gpon-sib');
        gponForm?.classList.remove('gpon-ltp');
        gponForm?.classList.remove('gpon-electra');
        gponForm?.classList.remove('gpon-lte');
        gponForm?.classList.remove('gpon-eltex-hide-desc');
        if (gponOntGroup) gponOntGroup.classList.remove('hidden');
        if (gponOntLabel) gponOntLabel.innerHTML = '<i class="fas fa-hashtag"></i> GPON ID (x/y/z)';
        if (gponOntInput) gponOntInput.placeholder = 'например: 1/1/1';
        eltexFields.classList.add('hidden');
        if (lteFields) lteFields.classList.add('hidden');
        if (eltexVpnRow) eltexVpnRow.classList.add('hidden');
        if (eltexVpnVlanField) eltexVpnVlanField.classList.add('hidden');
        huaweiFields.classList.add('hidden');
        huaweiIgmp.classList.add('hidden');
        huaweiActions.classList.add('hidden');
        electraFields.classList.add('hidden');
        electraActions.classList.add('hidden');
        gponService.classList.add('hidden');
        csmFields.classList.add('hidden');

        if (!effectiveDevice) return;

        if (effectiveDevice === 'huawei') {
            // Huawei - show Huawei fields
            huaweiFields.classList.remove('hidden');
            huaweiIgmp.classList.remove('hidden');
            huaweiActions.classList.remove('hidden');
            if (gponBranchGroup) gponBranchGroup.classList.remove('hidden');
            return;
        }

        if (effectiveDevice === 'electra') {
            // Electra - show Electra fields/actions
            gponForm?.classList.add('gpon-ural');
            gponForm?.classList.add('gpon-electra');
            electraFields.classList.remove('hidden');
            electraActions.classList.remove('hidden');
            if (gponBranchGroup) gponBranchGroup.classList.add('hidden');
            if (gponConfigGroup) gponConfigGroup.classList.add('hidden');
            return;
        }

        if (effectiveDevice === 'eltex_lte_8x' || effectiveDevice === 'eltex_lte_4x') {
            gponForm?.classList.add('gpon-ural');
            gponForm?.classList.add('gpon-lte');
            lteFields?.classList.remove('hidden');
            if (gponBranchGroup) gponBranchGroup.classList.add('hidden');
            if (gponConfigGroup) gponConfigGroup.classList.add('hidden');
            if (effectiveDevice === 'eltex_lte_8x') {
                gponOntGroup?.classList.add('hidden');
            } else {
                if (gponOntLabel) gponOntLabel.innerHTML = '<i class="fas fa-hashtag"></i> GPON ID (x/y)';
                if (gponOntInput) gponOntInput.placeholder = 'например: 1/1';
            }
            return;
        }

        if (!isSibBranch) {
            // Ural - show Eltex fields (SN/PLOAM + IMS/vIMS)
            gponForm?.classList.add('gpon-ural');
            if (effectiveDevice === 'eltex_ltp') gponForm?.classList.add('gpon-ltp');
            if (effectiveDevice === 'eltex_ma4000' || effectiveDevice === 'eltex_ltp') {
                gponForm?.classList.add('gpon-eltex-hide-desc');
            }
            eltexFields.classList.remove('hidden');
            if (eltexVpnRow && (effectiveDevice === 'eltex_ma4000' || effectiveDevice === 'eltex_ltp')) {
                eltexVpnRow.classList.remove('hidden');
                if (eltexVpnCheckbox?.checked) eltexVpnVlanField?.classList.remove('hidden');
            }
            gponService.classList.remove('hidden');
            if (gponBranchGroup) gponBranchGroup.classList.remove('hidden');
            return;
        }

        // Siberia - show Eltex fields without IMS/vIMS
        gponForm?.classList.add('gpon-sib');
        if (effectiveDevice.startsWith('eltex_ltp')) gponForm?.classList.add('gpon-ltp');
        eltexFields.classList.remove('hidden');
        if (configValue && isCsmConfig(effectiveDevice)) {
            csmFields.classList.remove('hidden');
        }
        if (gponBranchGroup) gponBranchGroup.classList.remove('hidden');
    }

    // Копирование конфига в буфер обмена
    function prepareClipboardText(text) {
        const normalized = String(text || '').replace(/\r?\n/g, '\r\n').trimEnd();
        return normalized ? `${normalized}\r\n` : '';
    }

    document.getElementById('copy-all').addEventListener('click', () => {
        let text = configOutput.textContent || '';
        if (mcastSection && !mcastSection.classList.contains('hidden')) {
            const mcastText = mcastOutput?.textContent || '';
            if (mcastText.trim()) {
                text = `${text.trimEnd()}\n\n! ===== МУЛЬТИКАСТ =====\n${mcastText}`;
            }
        }
        navigator.clipboard.writeText(prepareClipboardText(text)).then(() => {
            showNotification('Конфиг скопирован в буфер обмена!');
        }).catch(() => {
            showNotification('Ошибка копирования. Попробуйте выделить текст вручную.', 'error');
        });
    });

    // Копирование для ADSL
    document.getElementById('copy-adsl').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(prepareClipboardText(text)).then(() => {
            showNotification('Конфиг ADSL скопирован!');
        });
    });

    // Копирование для FTTB
    document.getElementById('copy-fttb').addEventListener('click', () => {
        const text = configOutput.textContent;
        navigator.clipboard.writeText(prepareClipboardText(text)).then(() => {
            showNotification('Конфиг FTTB скопирован!');
        });
    });

    // Копирование для GPON
    document.getElementById('copy-gpon').addEventListener('click', () => {
        let text = configOutput.textContent || '';
        if (mcastSection && !mcastSection.classList.contains('hidden')) {
            const mcastText = mcastOutput?.textContent || '';
            if (mcastText.trim()) {
                text = `${text.trimEnd()}\n\n! ===== МУЛЬТИКАСТ =====\n${mcastText}`;
            }
        }
        navigator.clipboard.writeText(prepareClipboardText(text)).then(() => {
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
        clearConfigOutput();
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
        clearConfigOutput();
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
        const iptvSpIndex = document.getElementById('gpon-iptv-sp-index');
        if (iptvSpIndex) iptvSpIndex.value = '';
        const igmpUserIndex = document.getElementById('gpon-iptv-igmp-index');
        if (igmpUserIndex) igmpUserIndex.value = '';
        document.getElementById('gpon-description').value = '';
        document.getElementById('gpon-cvid').value = '107';
        document.getElementById('gpon-svid').value = '1647';
        const eltexVpnCheckbox = document.getElementById('gpon-eltex-vpn');
        const eltexVpnVlan = document.getElementById('gpon-eltex-vpn-vlan');
        const eltexVpnVlanField = document.getElementById('gpon-eltex-vpn-vlan-field');
        if (eltexVpnCheckbox) eltexVpnCheckbox.checked = false;
        if (eltexVpnVlan) eltexVpnVlan.value = '';
        if (eltexVpnVlanField) eltexVpnVlanField.classList.add('hidden');
        const lteModelField = document.getElementById('gpon-lte-model');
        const lteMacField = document.getElementById('gpon-lte-mac');
        const lteDescriptionField = document.getElementById('gpon-lte-description');
        if (lteModelField) lteModelField.value = 'eltex_lte_8x';
        if (lteMacField) lteMacField.value = '';
        if (lteDescriptionField) lteDescriptionField.value = '';
        const electraSnField = document.getElementById('gpon-electra-sn');
        const electraDescField = document.getElementById('gpon-electra-description');
        const electraMacField = document.getElementById('gpon-electra-mac');
        const electraTr069Field = document.getElementById('gpon-electra-tr069-vlan');
        const electraSvlanField = document.getElementById('gpon-electra-svlan');
        const electraCvlanField = document.getElementById('gpon-electra-cvlan');
        const electraMcastField = document.getElementById('gpon-electra-mcast-vlan');
        const electraIgmpField = document.getElementById('gpon-electra-igmp-index');
        if (electraSnField) electraSnField.value = '';
        if (electraDescField) electraDescField.value = '';
        if (electraMacField) electraMacField.value = '';
        if (electraTr069Field) electraTr069Field.value = '760';
        if (electraSvlanField) electraSvlanField.value = '2460';
        if (electraCvlanField) electraCvlanField.value = '196';
        if (electraMcastField) electraMcastField.value = '26';
        if (electraIgmpField) electraIgmpField.value = '12';
        const electraActivate = document.getElementById('gpon-electra-action-activate');
        if (electraActivate) electraActivate.checked = true;
        const gponBranchSelect = document.getElementById('gpon-branch');
        const gponBranchConfigSelect = document.getElementById('gpon-branch-config');
        if (gponBranchSelect) gponBranchSelect.value = 'ural';
        if (gponBranchConfigSelect) gponBranchConfigSelect.value = '';

        syncGponBranchAvailability();
        updateGponBranchOptions();
        updateGponBranchConfigOptions();
        setDefaultGponOnt('huawei');
        updateGponFields();

        clearConfigOutput();
        updateDiagnostics('gpon', 'huawei', '1/1/1');
    });

    // Очистка вывода
    document.getElementById('clear-output').addEventListener('click', () => {
        clearConfigOutput();
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
            navigator.clipboard.writeText(prepareClipboardText(command)).then(() => {
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

    window.selectDiagProfileInput = function(inputElement) {
        if (!inputElement) return;
        inputElement.select();
    };

    window.updateDiagProfileTokenCommand = function(inputElement) {
        const diagCommand = inputElement.closest('.diag-command');
        if (!diagCommand) return;
        const commandText = diagCommand.querySelector('.diag-command-text');
        if (!commandText) return;

        const originalCommand = commandText.getAttribute('data-original') || commandText.getAttribute('data-command') || '';
        let newCommand = originalCommand;

        const inputs = diagCommand.querySelectorAll('.diag-profile-input');
        inputs.forEach(input => {
            const token = input.getAttribute('data-token');
            if (!token) return;
            const value = input.value || '';
            newCommand = newCommand.split(token).join(value);
        });

        const vpiVciRaw = document.getElementById('adsl-vpivci')?.value.trim() || '0/35';
        const [vpi = '0', vci = '35'] = vpiVciRaw.split('/').map(v => v.trim());
        const portInfo = document.getElementById('adsl-port')?.value || '0/1';
        const portNum = portInfo.includes('/') ? portInfo.split('/')[1] : portInfo;

        newCommand = newCommand.replace(/{vpi}/g, vpi).replace(/{vci}/g, vci);
        newCommand = newCommand.replace(/1\/1\/\{port\}/g, `1/1/${portInfo}`);
        newCommand = newCommand.replace(/\{port\}:\{vpi\}:\{vci\}/g, `${portInfo}:${vpi}:${vci}`);
        newCommand = newCommand.replace(/{portNum}/g, portNum);
        newCommand = newCommand.replace(/{port}/g, portInfo);

        commandText.textContent = newCommand;
        commandText.setAttribute('data-command', newCommand);
    };

    window.updateDiagPortSpeedCommand = function(selectElement) {
        const diagCommand = selectElement.closest('.diag-command');
        if (!diagCommand) return;
        const commandText = diagCommand.querySelector('.diag-command-text');
        if (!commandText) return;
        const originalCommand = commandText.getAttribute('data-original') || commandText.getAttribute('data-command') || '';
        const selectedSpeed = selectElement.value || 'auto';
        const newCommand = originalCommand.replace(/{portSpeed}/g, selectedSpeed);
        commandText.textContent = newCommand;
        commandText.setAttribute('data-command', newCommand);
    };

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
    function bindBlurValidation(input, validator) {
        if (!input || input.dataset.validationBound === 'true') return;
        input.dataset.validationBound = 'true';
        input.addEventListener('blur', function() {
            const result = validator(this);
            if (result.valid) {
                showFieldValid(this);
            } else {
                showFieldError(this, result.error);
            }
        });
    }

    function getScopedElement(scope, selector) {
        if (!scope) return null;
        if (typeof scope.getElementById === 'function' && selector.startsWith('#')) {
            return scope.getElementById(selector.slice(1));
        }
        return scope.querySelector(selector);
    }

    function initValidationHandlers(scope = document) {
        // ADSL поля
        const adslPort = getScopedElement(scope, '#adsl-port');
        const adslVpiVci = getScopedElement(scope, '#adsl-vpivci');
        const adslVlan = getScopedElement(scope, '#adsl-vlan');
        const adslMcastVlan = getScopedElement(scope, '#adsl-mcast-vlan');

        bindBlurValidation(adslPort, (input) => validateAdslPort(input.value, document.getElementById('adsl-device')?.value));

        bindBlurValidation(adslVpiVci, (input) => validateSlashPair(input.value, 'VPI/VCI'));

        bindBlurValidation(adslVlan, (input) => validateNumber(input.value, 'VLAN ID', 1, 4094));
        bindBlurValidation(adslMcastVlan, (input) => {
            if (!input.value || !input.value.trim()) {
                return { valid: true };
            }
            return validateNumber(input.value, 'Multicast VLAN', 1, 4094);
        });

        // FTTB порт
        const fttbPort = getScopedElement(scope, '#fttb-port');
        bindBlurValidation(fttbPort, (input) => validateFttbPort(input.value, document.getElementById('fttb-device')?.value));

        // Динамические FTTB VLAN поля
        const accessVlan = getScopedElement(scope, '#fttb-access-vlan');
        const trunkVlans = getScopedElement(scope, '#fttb-trunk-vlans');
        const nativeVlan = getScopedElement(scope, '#fttb-native-vlan');
        const tr069Vlan = getScopedElement(scope, '#fttb-tr069-vlan');
        const pppoeVlan = getScopedElement(scope, '#fttb-pppoe-vlan');
        const taggedVlan = getScopedElement(scope, '#fttb-tagged-vlan');

        // Инициализация обработчиков для существующих
// полей
        [accessVlan, nativeVlan, tr069Vlan, pppoeVlan, taggedVlan].forEach(field => {
            bindBlurValidation(field, (input) => {
                const fieldName = input.previousElementSibling?.textContent || 'VLAN';
                return validateNumber(input.value, fieldName, 1, 4094);
            });
        });

        bindBlurValidation(trunkVlans, (input) => validateVlanList(input.value, 'Allowed VLANs'));

        // GPON поля
        const gponOnt = getScopedElement(scope, '#gpon-ont');
        const gponVlan = getScopedElement(scope, '#gpon-vlan');

        bindBlurValidation(gponOnt, (input) => validatePort(input.value, 'ONT ID'));
        bindBlurValidation(gponVlan, (input) => validateNumber(input.value, 'VLAN', 1, 4094));
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
            'huawei_5616',
            'huawei_5600_vdsl',
            'huawei_58xx_vdsl',
            'huawei_5605',
            'iskratel_mwgl0s92',
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
                if (device === 'iskratel_mwgl0s92') {
                    return { valid: false, error: 'Порт должен быть в формате slot/port (например: 0/1)' };
                }
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
            const { device: gponDevice, branchValue, branchConfigValue } = getGponFormState();
            let lteDevice = gponDevice;
            if (lteDevice === 'eltex_lte_8x' || lteDevice === 'eltex_lte_4x') {
                const lteMacField = document.getElementById('gpon-lte-mac');
                const lteDescriptionField = document.getElementById('gpon-lte-description');
                const normalizedMac = normalizeMacAddress(lteMacField?.value || '');

                if (!lteMacField?.value.trim() || getMacCompact(normalizedMac).length !== 12) {
                    showFieldError(lteMacField, 'MAC должен содержать 12 шестнадцатеричных символов');
                    isValid = false;
                } else {
                    lteMacField.value = normalizedMac;
                    showFieldValid(lteMacField);
                }

                if (!lteDescriptionField?.value.trim()) {
                    showFieldError(lteDescriptionField, 'Описание не может быть пустым');
                    isValid = false;
                } else {
                    showFieldValid(lteDescriptionField);
                }

                if (lteDevice === 'eltex_lte_8x') {
                    if (gponOnt) showFieldValid(gponOnt);
                    return isValid;
                }
            }
            if (gponOnt) {
                const value = gponOnt.value.trim();
                if (!value) {
                    showFieldError(gponOnt, 'GPON ID не может быть пустым');
                    isValid = false;
                } else {
                    let device = gponDevice;
                    const branchConfigSelect = document.getElementById('gpon-branch-config');

                    if (branchValue !== 'ural' && device !== 'eltex_lte_8x' && device !== 'eltex_lte_4x') {
                        if (!branchConfigValue) {
                            showFieldError(branchConfigSelect, '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044e \u0434\u043b\u044f \u0444\u0438\u043b\u0438\u0430\u043b\u0430');
                            isValid = false;
                        } else {
                            showFieldValid(branchConfigSelect);
                        }
                    }

                    const isLtpDevice = device === 'eltex_ltp' || device.startsWith('eltex_ltp_');
                    const isLte4xDevice = device === 'eltex_lte_4x';
                    const parts = value.split('/');
                    const expectedParts = (isLtpDevice || isLte4xDevice) ? 2 : 3;
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
    const fttbModeSelect = document.getElementById('fttb-mode');
    if (fttbDeviceInit?.value === 'sib_templates') {
        fttbModeGroup?.classList.add('hidden');
        fttbVlanFields?.classList.add('hidden');
        fttbBranchGroup?.classList.remove('hidden');
        fttbEquipmentGroup?.classList.remove('hidden');
        fttbVariantGroup?.classList.remove('hidden');
        document.getElementById('fttb-sib-branch')?.dispatchEvent(new Event('change'));
    }
    if (fttbDeviceInit && fttbModeSelect) {
        const dot1vOption = fttbModeSelect.querySelector('option[value="dot1v"]');
        const supportsDot1v = !!devices?.fttb?.[fttbDeviceInit.value]?.modes?.dot1v;
        if (dot1vOption) dot1vOption.disabled = !supportsDot1v;
        if (!supportsDot1v && fttbModeSelect.value === 'dot1v') {
            fttbModeSelect.value = 'access';
        }
        fttbModeSelect.dispatchEvent(new Event('change'));
    }
    
    // Инициализация видимости полей GPON (Huawei по умолчанию)
    syncGponBranchAvailability();
    updateGponBranchOptions();
    updateGponBranchConfigOptions();
    setDefaultGponOnt(getGponEffectiveDevice());
    updateGponFields();

    // Начальная инициализация диагностики
    if (Object.keys(devices.adsl).length > 0) {
        updateDiagnostics('adsl', 'alcatel_7330', '0/1', '101');
    } else {
        diagOutput.innerHTML = '<div class="diag-empty">Файл конфигурации ADSL не загружен. Проверьте наличие adsl.js</div>';
    }
});
