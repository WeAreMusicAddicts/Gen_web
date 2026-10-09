document.addEventListener('DOMContentLoaded', function () {
    // Global State
    let allDevices = [];
    let currentServices = [];
    let currentDiagnostics = [];
    let activeTechFilter = 'all';
    let currentSelectedDevice = null;
    let editingServiceId = null;

    // Toast notification
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // -------------------------------------------------------------
    // AUTHENTICATION & SECURITY
    // -------------------------------------------------------------
    const authOverlay = document.getElementById('admin-auth-overlay');
    const authError = document.getElementById('auth-error');

    function showAuthOverlay() {
        if (authOverlay) {
            authOverlay.classList.remove('hidden');
            setTimeout(() => document.getElementById('auth-password')?.focus(), 100);
        }
    }

    function hideAuthOverlay() {
        if (authOverlay) authOverlay.classList.add('hidden');
    }

    async function authenticatedFetch(url, options = {}) {
        const token = sessionStorage.getItem('admin_token');
        options.headers = options.headers || {};
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(options.body);
        }

        const res = await fetch(url, options);
        if (res.status === 401) {
            showAuthOverlay();
            throw new Error('Unauthorized');
        }
        return res;
    }

    async function checkAuthStatus() {
        const token = sessionStorage.getItem('admin_token');
        if (!token) {
            showAuthOverlay();
            return false;
        }
        try {
            const res = await fetch('/api/admin/check-auth', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.authenticated) {
                hideAuthOverlay();
                loadDevices();
                return true;
            } else {
                sessionStorage.removeItem('admin_token');
                showAuthOverlay();
                return false;
            }
        } catch (err) {
            showAuthOverlay();
            return false;
        }
    }

    window.handleAdminLogin = async function (e) {
        if (e) e.preventDefault();
        const passInput = document.getElementById('auth-password');
        const password = passInput ? passInput.value.trim() : '';

        if (authError) authError.classList.add('hidden');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();
            if (res.ok && data.token) {
                sessionStorage.setItem('admin_token', data.token);
                hideAuthOverlay();
                if (passInput) passInput.value = '';
                showToast('Успешная авторизация', 'success');
                loadDevices();
            } else {
                if (authError) {
                    authError.textContent = data.error || 'Неверный пароль';
                    authError.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (authError) {
                authError.textContent = 'Ошибка подключения к серверу';
                authError.classList.remove('hidden');
            }
        }
    };

    window.handleAdminLogout = async function () {
        const token = sessionStorage.getItem('admin_token');
        if (token) {
            fetch('/api/admin/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => {});
        }
        sessionStorage.removeItem('admin_token');
        showAuthOverlay();
        showToast('Вы вышли из системы', 'info');
    };

    window.openChangePasswordModal = function () {
        document.getElementById('change-pass-current').value = '';
        document.getElementById('change-pass-new').value = '';
        document.getElementById('change-pass-confirm').value = '';
        document.getElementById('change-pass-error')?.classList.add('hidden');
        openModal('modal-change-password');
    };

    window.submitChangePassword = async function (e) {
        if (e) e.preventDefault();
        const currentPassword = document.getElementById('change-pass-current').value.trim();
        const newPassword = document.getElementById('change-pass-new').value.trim();
        const confirmPassword = document.getElementById('change-pass-confirm').value.trim();
        const errEl = document.getElementById('change-pass-error');

        if (errEl) errEl.classList.add('hidden');

        if (newPassword !== confirmPassword) {
            if (errEl) {
                errEl.textContent = 'Новые пароли не совпадают!';
                errEl.classList.remove('hidden');
            }
            return;
        }

        try {
            const res = await authenticatedFetch('/api/admin/change-password', {
                method: 'POST',
                body: { currentPassword, newPassword }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Пароль успешно изменён', 'success');
                closeModal('modal-change-password');
            } else {
                if (errEl) {
                    errEl.textContent = data.error || 'Ошибка смены пароля';
                    errEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (errEl && err.message !== 'Unauthorized') {
                errEl.textContent = 'Ошибка выполнения запроса';
                errEl.classList.remove('hidden');
            }
        }
    };

    // Navigation Tabs (Main Top Bar)
    const tabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target)?.classList.add('active');

            if (target === 'tab-devices') loadDevices();
            else if (target === 'tab-profiles') loadSettingsTab();
        });
    });

    // Sub-Tabs Inside Device Manager Modal
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabPanels = document.querySelectorAll('.subtab-panel');

    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-subtab');
            subTabBtns.forEach(b => b.classList.remove('active'));
            subTabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target)?.classList.add('active');
        });
    });

    // Modal Control
    function openModal(id) {
        document.getElementById(id)?.classList.add('open');
    }
    function closeModal(id) {
        document.getElementById(id)?.classList.remove('open');
    }
    window.openModal = openModal;
    window.closeModal = closeModal;

    document.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', () => closeModal(el.getAttribute('data-close')));
    });

    // -------------------------------------------------------------
    // TAB 1: DEVICES MANAGEMENT & UNIFIED MANAGER
    // -------------------------------------------------------------
    async function loadDevices() {
        try {
            const res = await authenticatedFetch('/api/admin/devices');
            allDevices = await res.json();
            renderDevicesTable();
        } catch (err) {
            showToast('Ошибка загрузки списка оборудования', 'error');
        }
    }

    function renderDevicesTable() {
        const tbody = document.getElementById('devices-table-body');
        const searchQuery = (document.getElementById('device-search')?.value || '').toLowerCase().trim();

        const filtered = allDevices.filter(dev => {
            const matchTech = activeTechFilter === 'all' || dev.tech === activeTechFilter;
            const matchSearch = !searchQuery ||
                dev.label.toLowerCase().includes(searchQuery) ||
                dev.key.toLowerCase().includes(searchQuery);
            return matchTech && matchSearch;
        });

        tbody.innerHTML = filtered.map(dev => {
            const hasNotes = dev.notes && dev.notes.trim().length > 0;
            const noteBadge = hasNotes ? `<span class="badge-has-notes" title="Есть заметка"><i class="fas fa-sticky-note"></i> Заметка</span>` : '';
            return `
            <tr>
                <td><span class="badge badge-${dev.tech}">${dev.tech.toUpperCase()}</span></td>
                <td><strong>${dev.label}</strong> ${noteBadge}</td>
                <td><code>${dev.key}</code></td>
                <td>${dev.default_port || '0/1'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-manage-device" data-id="${dev.id}">
                        <i class="fas fa-sliders-h"></i> Команды & Диагностика
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary btn-edit-dev" data-id="${dev.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger btn-del-dev" data-id="${dev.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;}).join('');

        // Bind Edit / Delete / Manage
        tbody.querySelectorAll('.btn-edit-dev').forEach(btn => {
            btn.addEventListener('click', () => {
                const dev = allDevices.find(d => d.id == btn.getAttribute('data-id'));
                if (dev) {
                    document.getElementById('modal-device-title').textContent = 'Редактировать оборудование';
                    document.getElementById('dev-id').value = dev.id;
                    document.getElementById('dev-tech').value = dev.tech;
                    document.getElementById('dev-key').value = dev.key;
                    document.getElementById('dev-label').value = dev.label;
                    document.getElementById('dev-default-port').value = dev.default_port || '0/1';
                    if (document.getElementById('dev-notes')) {
                        document.getElementById('dev-notes').value = dev.notes || '';
                    }
                    openModal('modal-device');
                }
            });
        });

        tbody.querySelectorAll('.btn-del-dev').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Вы уверены, что хотите удалить это оборудование и все его команды?')) {
                    const id = btn.getAttribute('data-id');
                    try {
                        const res = await authenticatedFetch(`/api/admin/devices/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            showToast('Оборудование удалено', 'success');
                            loadDevices();
                        }
                    } catch (e) {
                        showToast('Ошибка при удалении', 'error');
                    }
                }
            });
        });

        // Click "Команды & Диагностика" -> Open Unified Manager Modal for device
        tbody.querySelectorAll('.btn-manage-device').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const dev = allDevices.find(d => d.id == id);
                if (dev) {
                    openDeviceManagerModal(dev);
                }
            });
        });
    }

    // Unified Device Manager Modal
    async function openDeviceManagerModal(dev) {
        currentSelectedDevice = dev;
        document.getElementById('mgr-device-title').textContent = `${dev.label} (${dev.key})`;
        
        const badge = document.getElementById('mgr-device-badge');
        badge.className = `badge badge-${dev.tech}`;
        badge.textContent = dev.tech.toUpperCase();

        // Reset to first sub-tab
        document.querySelector('.sub-tab-btn[data-subtab="subtab-services"]')?.click();
        document.getElementById('service-editor-container').style.display = 'none';

        // Fetch full data for this device
        try {
            const res = await authenticatedFetch(`/api/admin/devices/${dev.id}/full`);
            const data = await res.json();
            currentServices = data.services || [];
            currentDiagnostics = data.diagnostics || [];

            // Populate and preview notes
            const notesTextarea = document.getElementById('device-notes-textarea');
            if (notesTextarea) {
                notesTextarea.value = dev.notes || '';
                updateNotesPreview(dev.notes || '');
            }

            renderServicesTable();
            renderDiagnosticsTable();
            openModal('modal-device-manager');
        } catch (e) {
            showToast('Ошибка загрузки данных оборудования', 'error');
        }
    }

    // Devices Search & Tech Filter
    document.getElementById('device-search')?.addEventListener('input', renderDevicesTable);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTechFilter = btn.getAttribute('data-tech');
            renderDevicesTable();
        });
    });

    // Add Device Modal Open
    document.getElementById('btn-add-device')?.addEventListener('click', () => {
        document.getElementById('modal-device-title').textContent = 'Добавить оборудование';
        document.getElementById('form-device').reset();
        document.getElementById('dev-id').value = '';
        openModal('modal-device');
    });

    // Form Save Device
    document.getElementById('form-device')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const id = document.getElementById('dev-id').value;
        const payload = {
            tech: document.getElementById('dev-tech').value,
            key: document.getElementById('dev-key').value.trim(),
            label: document.getElementById('dev-label').value.trim(),
            default_port: document.getElementById('dev-default-port').value.trim() || '0/1',
            notes: document.getElementById('dev-notes') ? document.getElementById('dev-notes').value.trim() : ''
        };

        try {
            const url = id ? `/api/admin/devices/${id}` : '/api/admin/devices';
            const method = id ? 'PUT' : 'POST';
            const res = await authenticatedFetch(url, {
                method,
                body: payload
            });

            if (res.ok) {
                showToast(`Оборудование ${id ? 'обновлено' : 'добавлено'}`, 'success');
                closeModal('modal-device');
                loadDevices();
            } else {
                const err = await res.json();
                showToast(`Ошибка: ${err.error}`, 'error');
            }
        } catch (e) {
            showToast('Ошибка сервера', 'error');
        }
    });

    // -------------------------------------------------------------
    // NOTES & MARKDOWN TOOLBAR & PREVIEW
    // -------------------------------------------------------------
    function updateNotesPreview(markdownText) {
        const preview = document.getElementById('device-notes-preview');
        if (!preview) return;
        if (!markdownText || !markdownText.trim()) {
            preview.innerHTML = '<em style="color: var(--text-muted);">Введите текст слева для предпросмотра</em>';
            return;
        }
        if (window.MarkdownRenderer) {
            preview.innerHTML = window.MarkdownRenderer.render(markdownText);
            window.MarkdownRenderer.bindCopyButtons(preview);
        } else {
            preview.textContent = markdownText;
        }
    }

    const notesTextarea = document.getElementById('device-notes-textarea');
    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => {
            updateNotesPreview(notesTextarea.value);
        });
    }

    function insertMarkdownSnippet(before, after = '', defaultText = '') {
        const textarea = document.getElementById('device-notes-textarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end) || defaultText;
        const replacement = before + selected + after;
        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selected.length;
        updateNotesPreview(textarea.value);
    }

    document.querySelectorAll('.md-tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-md');
            switch (action) {
                case 'bold':
                    insertMarkdownSnippet('**', '**', 'жирный текст');
                    break;
                case 'italic':
                    insertMarkdownSnippet('*', '*', 'курсивный текст');
                    break;
                case 'heading':
                    insertMarkdownSnippet('### ', '\n', 'Заголовок секции');
                    break;
                case 'inline-code':
                    insertMarkdownSnippet('`', '`', 'команда');
                    break;
                case 'code-block':
                    insertMarkdownSnippet('```\n', '\n```\n', 'display version\ndisplay current-configuration');
                    break;
                case 'list':
                    insertMarkdownSnippet('- ', '\n', 'пункт списка');
                    break;
                case 'alert-warn':
                    insertMarkdownSnippet('> ⚠️ **Внимание**: ', '\n', 'Не сохранять без проверки!');
                    break;
                case 'alert-info':
                    insertMarkdownSnippet('> 💡 **Совет**: ', '\n', 'Дефолтный логин root / admin');
                    break;
                case 'table':
                    insertMarkdownSnippet('| Параметр | Значение |\n|---|---|\n| IP | 192.168.1.1 |\n| Порт | 8080 |\n\n');
                    break;
            }
        });
    });

    document.getElementById('btn-save-notes')?.addEventListener('click', async () => {
        if (!currentSelectedDevice) return;
        const notes = document.getElementById('device-notes-textarea')?.value || '';
        try {
            const res = await authenticatedFetch(`/api/admin/devices/${currentSelectedDevice.id}/notes`, {
                method: 'PUT',
                body: { notes }
            });
            if (res.ok) {
                currentSelectedDevice.notes = notes;
                const found = allDevices.find(d => d.id === currentSelectedDevice.id);
                if (found) found.notes = notes;
                renderDevicesTable();
                showToast('Заметка успешно сохранена!', 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Ошибка при сохранении заметки', 'error');
            }
        } catch (err) {
            showToast('Ошибка сети при сохранении заметки', 'error');
        }
    });

    // -------------------------------------------------------------
    // SERVICES & COMMANDS (Inside Manager Modal)
    // -------------------------------------------------------------
    function renderServicesTable() {
        const tbody = document.getElementById('services-table-body');
        tbody.innerHTML = currentServices.map(svc => `
            <tr>
                <td><code>${svc.service_key}</code></td>
                <td><strong>${svc.label}</strong></td>
                <td>${(svc.commands_template || '').split('\n').filter(Boolean).length} команд</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-edit-svc" data-id="${svc.id}"><i class="fas fa-code"></i> Шаблоны команд</button>
                    <button class="btn btn-sm btn-danger btn-del-svc" data-id="${svc.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-edit-svc').forEach(btn => {
            btn.addEventListener('click', () => {
                editingServiceId = btn.getAttribute('data-id');
                const svc = currentServices.find(s => s.id == editingServiceId);
                if (svc) {
                    document.getElementById('editing-service-label').textContent = `${svc.label} (${svc.service_key})`;
                    document.getElementById('editor-template-text').value = svc.commands_template || '';
                    document.getElementById('editor-mcast-text').value = svc.multicast_template || '';
                    document.getElementById('service-editor-container').style.display = 'grid';
                    updateLivePreview();
                }
            });
        });

        tbody.querySelectorAll('.btn-del-svc').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Удалить эту услугу/режим?')) {
                    const id = btn.getAttribute('data-id');
                    try {
                        const res = await authenticatedFetch(`/api/admin/services/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            showToast('Служба удалена', 'success');
                            openDeviceManagerModal(currentSelectedDevice);
                        }
                    } catch (e) {
                        showToast('Ошибка при удалении', 'error');
                    }
                }
            });
        });
    }

    // Service Preset Select Listener & Tech Presets
    const svcPresetSelect = document.getElementById('svc-preset-select');
    const svcKeyInput = document.getElementById('svc-key');
    const svcLabelInput = document.getElementById('svc-label');

    const techPresets = {
        adsl: [
            { key: 'pppoe', label: 'PPPoE (Интернет)' },
            { key: 'iptv', label: 'IP-TV (Мультисервис)' },
            { key: 'iptv_tf', label: 'IP-TV (ТФ)' },
            { key: 'iptv_ef', label: 'IP-TV (ЕФ)' },
            { key: 'custom', label: 'Другое (ввести вручную)...' }
        ],
        fttb: [
            { key: 'access', label: 'Access Mode (Доступ)' },
            { key: 'trunk', label: 'Trunk Mode (Транк)' },
            { key: 'trunk_native', label: 'Trunk + Native VLAN' },
            { key: 'dot1v', label: '802.1v Protocol VLAN' },
            { key: 'custom', label: 'Другое (ввести вручную)...' }
        ],
        gpon: [
            { key: 'ims', label: 'IMS / ШПД + ТФ + ТВ' },
            { key: 'vims', label: 'VIMS / Видео + ТФ' },
            { key: 'pppoe', label: 'PPPoE (Интернет)' },
            { key: 'iptv', label: 'IP-TV (Мультисервис)' },
            { key: 'rf', label: 'RF / КТВ' },
            { key: 'custom', label: 'Другое (ввести вручную)...' }
        ]
    };

    function populatePresetSelectForTech(tech) {
        if (!svcPresetSelect) return;
        const presets = techPresets[tech] || techPresets.adsl;

        svcPresetSelect.innerHTML = presets.map(p => 
            `<option value="${p.key}" data-label="${p.key === 'custom' ? '' : p.label}">${p.label}</option>`
        ).join('');

        updateServicePresetFields();
    }

    function updateServicePresetFields() {
        if (!svcPresetSelect) return;
        const val = svcPresetSelect.value;
        const selectedOpt = svcPresetSelect.options[svcPresetSelect.selectedIndex];
        const dataLabel = selectedOpt ? selectedOpt.getAttribute('data-label') : '';

        if (val === 'custom') {
            svcKeyInput.value = '';
            svcLabelInput.value = '';
            svcKeyInput.focus();
        } else {
            svcKeyInput.value = val;
            svcLabelInput.value = dataLabel || val;
        }
    }

    svcPresetSelect?.addEventListener('change', updateServicePresetFields);

    // Add Service Modal Open
    document.getElementById('btn-add-service')?.addEventListener('click', () => {
        document.getElementById('form-service').reset();
        document.getElementById('svc-id').value = '';
        const tech = currentSelectedDevice ? currentSelectedDevice.tech : 'adsl';
        populatePresetSelectForTech(tech);
        openModal('modal-service');
    });

    document.getElementById('form-service')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentSelectedDevice) return;

        const payload = {
            tech: currentSelectedDevice.tech,
            device_key: currentSelectedDevice.key,
            service_key: document.getElementById('svc-key').value.trim(),
            label: document.getElementById('svc-label').value.trim(),
            commands_template: ''
        };

        try {
            const res = await authenticatedFetch('/api/admin/services', {
                method: 'POST',
                body: payload
            });

            if (res.ok) {
                showToast('Услуга создана', 'success');
                closeModal('modal-service');
                openDeviceManagerModal(currentSelectedDevice);
            } else {
                const err = await res.json();
                showToast(`Ошибка: ${err.error}`, 'error');
            }
        } catch (e) {
            showToast('Ошибка сохранения', 'error');
        }
    });

    // Save Template Edits
    document.getElementById('btn-save-service')?.addEventListener('click', async () => {
        if (!editingServiceId) return;
        const svc = currentServices.find(s => s.id == editingServiceId);
        if (!svc) return;

        const payload = {
            ...svc,
            commands_template: document.getElementById('editor-template-text').value,
            multicast_template: document.getElementById('editor-mcast-text').value
        };

        try {
            const res = await authenticatedFetch(`/api/admin/services/${editingServiceId}`, {
                method: 'PUT',
                body: payload
            });

            if (res.ok) {
                showToast('Шаблон команд успешно сохранен!', 'success');
                openDeviceManagerModal(currentSelectedDevice);
            } else {
                showToast('Ошибка при сохранении', 'error');
            }
        } catch (e) {
            showToast('Ошибка сети', 'error');
        }
    });

    // Insert Placeholders in Editor
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-insert');
            const textarea = document.getElementById('editor-template-text');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            textarea.value = textarea.value.substring(0, start) + code + textarea.value.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + code.length;
            updateLivePreview();
        });
    });

    // Live Preview Engine
    function updateLivePreview() {
        const tpl = document.getElementById('editor-template-text')?.value || '';
        const vars = {
            port: document.getElementById('test-port')?.value || '0/1',
            vlan: document.getElementById('test-vlan')?.value || '100',
            vpi: document.getElementById('test-vpi')?.value || '8',
            vci: document.getElementById('test-vci')?.value || '35',
            mcastVlan: '1000',
            ontId: '0/1',
            sn: '4857544312345678',
            ploam: '12345678',
            desc: 'Client'
        };

        if (window.TemplateEngine) {
            const rendered = window.TemplateEngine.renderTemplate(tpl, vars);
            document.getElementById('service-preview-output').textContent = rendered || '// Вывод пуст';
        }
    }

    ['editor-template-text', 'test-port', 'test-vlan', 'test-vpi', 'test-vci'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateLivePreview);
    });

    // -------------------------------------------------------------
    // DIAGNOSTICS (Inside Manager Modal)
    // -------------------------------------------------------------
    function renderDiagnosticsTable() {
        const tbody = document.getElementById('diagnostics-table-body');
        tbody.innerHTML = currentDiagnostics.map(d => `
            <tr>
                <td><strong>${d.category}</strong></td>
                <td><code style="color: #38bdf8;">${d.command}</code></td>
                <td>${d.description}</td>
                <td>
                    <button class="btn btn-sm btn-secondary btn-edit-diag" data-id="${d.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger btn-del-diag" data-id="${d.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-edit-diag').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const diag = currentDiagnostics.find(d => d.id == id);
                if (diag) {
                    document.getElementById('modal-diag-title').textContent = 'Редактировать диагностику';
                    document.getElementById('diag-id').value = diag.id;
                    document.getElementById('diag-category').value = diag.category;
                    document.getElementById('diag-command').value = diag.command;
                    document.getElementById('diag-description').value = diag.description;
                    updateDiagLivePreview();
                    openModal('modal-diag');
                }
            });
        });

        tbody.querySelectorAll('.btn-del-diag').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Удалить эту команду диагностики?')) {
                    const id = btn.getAttribute('data-id');
                    try {
                        const res = await authenticatedFetch(`/api/admin/diagnostics/${id}`, { method: 'DELETE' });
                        if (res.ok) {
                            showToast('Команда удалена', 'success');
                            openDeviceManagerModal(currentSelectedDevice);
                        }
                    } catch (e) {
                        showToast('Ошибка при удалении', 'error');
                    }
                }
            });
        });
    }

    // Diagnostic Placeholder Chip Insert Listener
    document.querySelectorAll('[data-insert-diag]').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-insert-diag');
            const textarea = document.getElementById('diag-command');
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            textarea.value = textarea.value.substring(0, start) + code + textarea.value.substring(end);
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + code.length;
            updateDiagLivePreview();
        });
    });

    // Diagnostic Live Preview Engine
    function updateDiagLivePreview() {
        const tpl = document.getElementById('diag-command')?.value || '';
        const port = document.getElementById('test-diag-port')?.value || '0/1';
        const parts = port.split('/').filter(Boolean);
        const portType = currentSelectedDevice?.tech === 'fttb' ? 'gigabitethernet' : 'adsl';

        const vars = {
            port,
            vlan: document.getElementById('test-diag-vlan')?.value || '100',
            vpi: '8',
            vci: '35',
            mac: document.getElementById('test-diag-mac')?.value || 'a1b2.c3d4.e5f6',
            sn: document.getElementById('test-diag-sn')?.value || '4857544312345678',
            ploam: '12345678',
            portType,
            spectrumProfile: 'Spectrum1',
            serviceProfile: 'Service1',
            slot: parts[0] || '0',
            portNum: parts[1] || '1',
            gponPort: port,
            frameSlot: parts.length >= 2 ? `${parts[0]}/${parts[1]}` : '0/0',
            ontIdx: parts.length >= 3 ? parts[2] : '1'
        };

        if (window.TemplateEngine) {
            const rendered = window.TemplateEngine.renderTemplate(tpl, vars);
            document.getElementById('diag-preview-output').textContent = rendered || '// Результат подстановки появится здесь';
        }
    }

    ['diag-command', 'test-diag-port', 'test-diag-vlan', 'test-diag-mac', 'test-diag-sn'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateDiagLivePreview);
    });

    document.getElementById('btn-add-diag')?.addEventListener('click', () => {
        document.getElementById('form-diag').reset();
        document.getElementById('diag-id').value = '';
        updateDiagLivePreview();
        openModal('modal-diag');
    });

    document.getElementById('form-diag')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!currentSelectedDevice) return;

        const id = document.getElementById('diag-id').value;
        const payload = {
            tech: currentSelectedDevice.tech,
            device_key: currentSelectedDevice.key,
            category: document.getElementById('diag-category').value.trim(),
            command: document.getElementById('diag-command').value.trim(),
            description: document.getElementById('diag-description').value.trim()
        };

        try {
            const url = id ? `/api/admin/diagnostics/${id}` : '/api/admin/diagnostics';
            const method = id ? 'PUT' : 'POST';
            const res = await authenticatedFetch(url, {
                method,
                body: payload
            });

            if (res.ok) {
                showToast(`Диагностика ${id ? 'обновлена' : 'добавлена'}`, 'success');
                closeModal('modal-diag');
                openDeviceManagerModal(currentSelectedDevice);
            } else {
                showToast('Ошибка сохранения', 'error');
            }
        } catch (e) {
            showToast('Ошибка сервера', 'error');
        }
    });



    // -------------------------------------------------------------
    // PROFILES & CUSTOM VARIABLES MANAGEMENT (Full CRUD)
    // -------------------------------------------------------------
    let profileLists = [];

    const defaultInitialLists = [
        {
            id: 'profiles_adsl',
            name: 'Профили ADSL линий',
            token: 'serviceProfile',
            type: 'select',
            items: ['base-05', 'base-1', 'base-2', 'base-4', 'base-6', 'base-8', 'base-10', 'base-12', 'base-14', 'base-16', 'base-18', 'base-20', 'base-22', 'base-max', 'base-auto-9', 'base-auto-12']
        },
        {
            id: 'modulations',
            name: 'Модуляции',
            token: 'modulation',
            type: 'select',
            items: ['auto', 'adsl2+', 'adsl2', 'gdmt', 'glite', 't1413']
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

    async function loadSettingsTab() {
        try {
            const res = await authenticatedFetch('/api/admin/settings');
            const data = await res.json();
            
            if (Array.isArray(data.profile_lists) && data.profile_lists.length) {
                profileLists = data.profile_lists;
            } else {
                profileLists = JSON.parse(JSON.stringify(defaultInitialLists));
                if (Array.isArray(data.profiles_adsl)) {
                    const mainList = profileLists.find(l => l.id === 'profiles_adsl');
                    if (mainList) mainList.items = data.profiles_adsl;
                }
                if (Array.isArray(data.modulations)) {
                    const mod = profileLists.find(l => l.id === 'modulations');
                    if (mod) mod.items = data.modulations;
                }
            }

            renderProfileListsCards();
        } catch (e) {
            showToast('Ошибка загрузки списков профилей', 'error');
        }
    }

    function renderProfileListsCards() {
        const container = document.getElementById('profile-lists-container');
        if (!container) return;

        container.innerHTML = profileLists.map((list, listIdx) => {
            const isSelect = list.type === 'select';
            return `
                <div class="list-card" style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-sm); position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <h4 style="margin: 0 0 4px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas ${isSelect ? 'fa-tags' : 'fa-font'}"></i> ${list.name}
                            </h4>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <code style="color: var(--accent-blue); font-size: 0.85rem;">{${list.token}}</code>
                                <span class="badge ${isSelect ? 'badge-fttb' : 'badge-adsl'}">${isSelect ? 'Выпадающий список' : 'Поле ввода'}</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-sm btn-secondary btn-edit-list" data-idx="${listIdx}" title="Редактировать список"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger btn-del-list" data-idx="${listIdx}" title="Удалить весь список"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>

                    ${isSelect ? `
                        <div class="tag-cloud" id="tag-cloud-${listIdx}" style="margin: 14px 0; display: flex; flex-wrap: wrap; gap: 6px; max-height: 140px; overflow-y: auto;">
                            ${(list.items || []).map((item, itemIdx) => `
                                <span class="chip-tag" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 14px; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px;">
                                    <code>${item}</code>
                                    <button type="button" class="btn-remove-item" data-list-idx="${listIdx}" data-item-idx="${itemIdx}" style="background: none; border: none; color: var(--text-muted); cursor: pointer;">&times;</button>
                                </span>
                            `).join('')}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="input-new-item-${listIdx}" class="form-control form-control-sm" placeholder="Новое значение...">
                            <button type="button" class="btn btn-primary btn-sm btn-add-item" data-list-idx="${listIdx}"><i class="fas fa-plus"></i></button>
                        </div>
                    ` : `
                        <div style="margin: 14px 0;">
                            <label style="font-size: 0.75rem; color: var(--text-muted);">Текст по умолчанию / Подсказка:</label>
                            <input type="text" class="form-control list-default-input" data-list-idx="${listIdx}" value="${(list.items && list.items[0]) || list.token}">
                        </div>
                    `}
                </div>
            `;
        }).join('');

        // Item deletion
        container.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const listIdx = parseInt(btn.getAttribute('data-list-idx'));
                const itemIdx = parseInt(btn.getAttribute('data-item-idx'));
                profileLists[listIdx].items.splice(itemIdx, 1);
                renderProfileListsCards();
            });
        });

        // Add Item button
        container.querySelectorAll('.btn-add-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const listIdx = parseInt(btn.getAttribute('data-list-idx'));
                const input = document.getElementById(`input-new-item-${listIdx}`);
                const val = input?.value.trim();
                if (val && !profileLists[listIdx].items.includes(val)) {
                    profileLists[listIdx].items.push(val);
                    renderProfileListsCards();
                }
            });
        });

        // Default Input Edit
        container.querySelectorAll('.list-default-input').forEach(inp => {
            inp.addEventListener('input', () => {
                const listIdx = parseInt(inp.getAttribute('data-list-idx'));
                profileLists[listIdx].items = [inp.value.trim() || profileLists[listIdx].token];
            });
        });

        // Edit list metadata
        container.querySelectorAll('.btn-edit-list').forEach(btn => {
            btn.addEventListener('click', () => {
                const listIdx = parseInt(btn.getAttribute('data-idx'));
                const list = profileLists[listIdx];
                document.getElementById('modal-list-title').textContent = 'Редактировать список / переменную';
                document.getElementById('list-id').value = listIdx;
                document.getElementById('list-name').value = list.name;
                document.getElementById('list-token').value = list.token;
                document.getElementById('list-type').value = list.type;
                document.getElementById('list-default-val').value = (list.items && list.items[0]) || '';
                
                document.getElementById('list-default-val-group').style.display = list.type === 'input' ? 'block' : 'none';
                openModal('modal-list');
            });
        });

        // Delete entire list
        container.querySelectorAll('.btn-del-list').forEach(btn => {
            btn.addEventListener('click', () => {
                const listIdx = parseInt(btn.getAttribute('data-idx'));
                if (confirm(`Удалить список "${profileLists[listIdx].name}"?`)) {
                    profileLists.splice(listIdx, 1);
                    renderProfileListsCards();
                }
            });
        });
    }

    // Toggle default value group in modal
    document.getElementById('list-type')?.addEventListener('change', function() {
        document.getElementById('list-default-val-group').style.display = this.value === 'input' ? 'block' : 'none';
    });

    // Create New List Modal Open
    document.getElementById('btn-create-list')?.addEventListener('click', () => {
        document.getElementById('modal-list-title').textContent = 'Создать новый список / переменную';
        document.getElementById('form-list').reset();
        document.getElementById('list-id').value = '';
        document.getElementById('list-default-val-group').style.display = 'none';
        openModal('modal-list');
    });

    // Submit Create/Edit List Form
    document.getElementById('form-list')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const idVal = document.getElementById('list-id').value;
        const name = document.getElementById('list-name').value.trim();
        const token = document.getElementById('list-token').value.trim().replace(/^[{<]/, '').replace(/[}>]$/, '');
        const type = document.getElementById('list-type').value;
        const defaultVal = document.getElementById('list-default-val').value.trim() || token;

        if (idVal !== '') {
            const idx = parseInt(idVal);
            profileLists[idx].name = name;
            profileLists[idx].token = token;
            profileLists[idx].type = type;
            if (type === 'input') {
                profileLists[idx].items = [defaultVal];
            }
        } else {
            profileLists.push({
                id: `custom_${Date.now()}`,
                name,
                token,
                type,
                items: type === 'input' ? [defaultVal] : []
            });
        }

        closeModal('modal-list');
        renderProfileListsCards();
    });

    // Save All Settings Button
    document.getElementById('btn-save-settings')?.addEventListener('click', async () => {
        try {
            const res = await authenticatedFetch('/api/admin/settings', {
                method: 'PUT',
                body: {
                    profile_lists: profileLists,
                    profiles_adsl: (profileLists.find(l => l.token === 'serviceProfile') || {}).items || [],
                    modulations: (profileLists.find(l => l.token === 'modulation') || {}).items || []
                }
            });
            if (res.ok) {
                showToast('Списки профилей и переменных успешно сохранены!', 'success');
            }
        } catch (e) {
            showToast('Ошибка сохранения списков', 'error');
        }
    });

    // -------------------------------------------------------------
    // DATABASE EXPORT / IMPORT / RESET
    // -------------------------------------------------------------
    document.getElementById('btn-export-db')?.addEventListener('click', () => {
        window.location.href = '/api/admin/export';
    });

    document.getElementById('btn-import-db')?.addEventListener('click', () => {
        document.getElementById('import-file-input').click();
    });

    document.getElementById('import-file-input')?.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const json = JSON.parse(e.target.result);
                const res = await authenticatedFetch('/api/admin/import', {
                    method: 'POST',
                    body: json
                });
                if (res.ok) {
                    showToast('База данных успешно импортирована!', 'success');
                    loadDevices();
                } else {
                    showToast('Ошибка импорта файла', 'error');
                }
            } catch (err) {
                showToast('Неверный формат JSON файла', 'error');
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('btn-reset-db')?.addEventListener('click', async () => {
        if (confirm('ВНИМАНИЕ! Это полностью сбросит все созданные вами изменения и восстановит исходные стандартные шаблоны оборудования. Продолжить?')) {
            try {
                const res = await authenticatedFetch('/api/admin/reset-db', { method: 'POST' });
                if (res.ok) {
                    showToast('База данных успешно сброшена!', 'success');
                    loadDevices();
                }
            } catch (e) {
                showToast('Ошибка при сбросе', 'error');
            }
        }
    });

    // Initial load - check authentication
    checkAuthStatus();
});
