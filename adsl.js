// ADSL/VDSL: в одном месте и конфиг, и диагностика по каждому устройству.
// Добавление нового устройства: допишите новый ключ в adslDevices.

window.adslDevices = {
  alcatel_7330: {
    label: "Alcatel 7330",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        const pvcPath = `1/1/${slot}/${portNum}:${vpi}:${vci}`;
        return [
          `configure atm no pvc ${pvcPath}`,
          `configure atm pvc ${pvcPath}`,
          `configure bridge port ${pvcPath}`,
          `configure bridge port ${pvcPath} vlan-id ${vlan}`,
          `configure bridge port ${pvcPath} pvid ${vlan}`,
          `configure bridge port ${pvcPath} max-unicast-mac 4`,
          `admin software-mngt shub database save`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        const pvcPath = `1/1/${slot}/${portNum}:${vpi}:${vci}`;
        return [
          `configure atm no pvc ${pvcPath}`,
          `configure atm pvc ${pvcPath}`,
          `configure bridge port ${pvcPath}`,
          `configure bridge port ${pvcPath} vlan-id ${vlan} prior-less-100ms`,
          `configure bridge port ${pvcPath} pvid ${vlan}`,
          `configure bridge port ${pvcPath} max-unicast-mac 4`,
          `configure igmp channel ${pvcPath} perm-pkg-bitmap ff:ff:ff:ff:ff:ff:ff:ff max-num-group 4`,
          `admin software-mngt shub database save`,
        ];
      },
    },
    diagnostics: {
      "Работа с портом": [
        { command: `show xdsl operational-data line 1/1/{port}`, description: "Состояние порта" },
        { command: `show xdsl operational-data near-end line 1/1/{port} detail`, description: "Текущие параметры (DSLAM)" },
        { command: `show xdsl operational-data far-end line 1/1/{port} detail`, description: "Параметры порта (Modem)" },
        { command: `show xdsl linkup-record 1/1/{port} detail`, description: "Параметры порта" },
      ],
      "Работа с профилем": [
        { command: `info configure xdsl line 1/1/{port}`, description: "Просмотр текущего профиля" },
      ],
      "Смена профиля": [
        { command: `configure xdsl line 1/1/{port} spectrum-profile name: {spectrumProfile} service-profile name: {serviceProfile} admin-up`, description: "Сменить профиль" },
      ],
      "Другое": [
        { command: `admin alarm clr-logging`, description: "Очистит историю логов" },
        { command: `show alarm log xdsl misc`, description: "Просмотр логов" },
      ],
      "Работа с VLAN": [
        { command: `show vlan name`, description: "Список VLAN" },
        { command: `info configure bridge port 1/1/{port}:{vpi}:{vci}`, description: "Конфиг PVC" },
      ],
      "Работа с МАС": [
        { command: `show vlan bridge-port-fdb 1/1/{port}:{vpi}:{vci}`, description: "MAC в PVC" },
        { command: `show vlan fdb {vlan}`, description: "MAC во VLAN" },
        { command: `show vlan shub-fdb {vlan}`, description: "MAC во VLAN на всем DSLAM" },
      ],
      "Работа с IGMP": [
        { command: `configure igmp channel 1/1/{port}:{vpi}:{vci} no perm-pkg-bitmap no max-num-group`, description: "Удалить IGMP" },
        { command: `configure igmp system no start\nconfigure igmp system start`, description: "Перезапуск IGMP" },
        { command: `show mcast active-groups 1/1/{port}:{vpi}:{vci}`, description: "Подписки на multicast группы" },
      ],
      "Другое": [
        { command: `admin alarm clr-logging`, description: "Очистит историю логов" },
        { command: `show alarm log xdsl misc`, description: "Просмотр логов" },
      ],
    },
  },

  alcatel_7324: {
    label: "Alcatel 7324",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        const portPath = `${slot}-${portNum}`;
        const pvcPath = `${portPath}-${vpi}/${vci}`;
        return [
          `lcman port pvc delete ${pvcPath}`,
          `lcman port pvc set ${pvcPath} vid=${vlan} llc`,
          `lcman port pvid set ${portPath} ${vlan}`,
          `lcman svlan set ${vlan} ${portPath} fixed untag`,
          `lcman port maccount set ${portPath} 4`,
          `lcman port maccount enable ${portPath}`,
          `config save`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        const portPath = `${slot}-${portNum}`;
        const pvcPath = `${portPath}-${vpi}/${vci}`;
        return [
          `lcman port pvc delete ${pvcPath}`,
          `lcman port pvc set ${pvcPath} vid=${vlan} llc`,
          `lcman port pvid set ${portPath} ${vlan}`,
          `lcman svlan set ${vlan} ${portPath} fixed untag`,
          `lcman port maccount set ${portPath} 4`,
          `lcman port maccount enable ${portPath}`,
          `config save`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `lcman command {slot} linerate {portNum}`, description: "Состояние порта" },
        { command: `lcman command {slot} show ports`, description: "Список портов на SLOT'е" }, { command: `lcman command {slot} list ports`, description: "Все порты на SLOT'е" },
        { command: `lcman port list {slot}`, description: "Порты на SLOT'е" }, ], "Работа с IGMP": [ { command: `switch igmpsnoop show`, description: "Просмотр настроек IGMP" }, { command: `switch igmpsnoop enable`, description: "Включить IGMP" }, ], "Работа с профилями": [ { command: `lcman port set {slot}-{portNum} <PROF_NAME> auto`, description: "Смена профиля" }, { command: `lcman port profile list`, description: "Просмотр доступных профилей" }, { command: `lcman port profile list adsl 8032-adsl`, description: "Просмотр настроек профиля" }, ], "Работа с PVC/VLAN": [ { command: `lcman svlan list`, description: "Список VLAN" }, { command: `lcman port pvc list {slot}`, description: "Список настроенных PVC" }, { command: `lcman port pvc show {slot}`, description: "Список настроенных PVC" }, ], "Работа с MAC": [ { command: `lcman redcom {slot} wddi mac show`, description: "Список MAC на SLOT" }, ], }, }, huawei_5600: { label: "Huawei 5600", services: { pppoe: ({ port, vlan, vpi, vci }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} adsl ${port} vpi ${vpi} vci ${vci} rx-cttr 6 tx-cttr 6`, `return`, ], iptv: ({ port, vlan, vpi, vci, mcastVlan = vlan }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} adsl ${port} vpi ${vpi} vci ${vci} rx-cttr 7 tx-cttr 7`, `btv`, `igmp user add port ${port} adsl ${vpi} ${vci} no-auth max-program 2`, `multicast-vlan ${mcastVlan}`, `igmp multicast-vlan member port ${port} ${vpi} ${vci}`, `return`, ], }, diagnostics: { "Состояние DSLAM": [ { command: `display sysuptime`, description: "Время работы DSLAM" }, { command: `display board 0`, description: "Состояние платы" }, ], "Состояние порта": [ { command: `display interface adsl {port}`, description: "Состояние порта" }, { command: `display line operation port {port}`, description: "Состояние порта" }, { command: `display line operation board {port}`, description: "Состояние порта" }, { command: `display traffic {port}`, description: "Трафик порта" }, ], "Работа с профилями": [ { command: `display adsl line-profile`, description: "Просмотр всех профилей" }, ], "Смена профиля": [ { command: `config\ninterface adsl {slot}\ndeactivate {portNum}\nactivate {portNum} profile-index <PROF_INDEX>\nquit\nreturn`, description: "Смена профиля" }, ], "Работа с VLAN": [ { command: `display vlan desc 1-4093`, description: "Просмотр настроенных VLAN" }, { command: `display vlan all`, description: "Просмотр всех VLAN" }, ], "Работа с PVC": [ { command: `display service-port port {port}`, description: "Просмотр настроенных PVC" }, { command: `config
undo service-port port {port} vpi {vpi} vci {vci}`, description: "Удаление PVC по VPI/VCI" }, { command: `config
undo service-port port {port} vlan {vlan}`, description: "Удаление PVC по VLAN" }, { command: `config\ninterface adsl {slot}\natm-ping {portNum} {vpi} {vci}\nquit\nreturn`, description: "Тест PVC" }, ], "Работа с MAC": [ { command: `display mac-address port {port}`, description: "Просмотр MAC на порту" }, ], "SNMP": [ { command: `undo snmp-agent community com162-RO
undo snmp-agent community inity2016`, description: "Отключение SNMP" }, { command: `snmp-agent community read com162-RO
snmp-agent community read inity2016`, description: "Включение SNMP" }, ], "Работа с multicast": [ { command: `display igmp user port {port}`, description: "Просмотр подписок" }, ], }, }, huawei_5600_vdsl: { label: "Huawei 5600 VDSL", services: { pppoe: ({ port, vlan, vpi, vci }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} vdsl mode atm ${port} vpi ${vpi} vci ${vci} single-service tag-transform default inbound traffic-table index 10 outbound traffic-table index 10`, `return`, ], iptv: ({ port, vlan, vpi, vci, mcastVlan = vlan }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} vdsl mode atm ${port} vpi ${vpi} vci ${vci} single-service tag-transform default inbound traffic-table index 7 outbound traffic-table index 7`, `btv`, `igmp user add service-port *номер порта (INDEX)* no-auth`, `multicast-vlan ${mcastVlan}`, `igmp multicast-vlan member service-port-list *номер порта (INDEX)*`, `return`, ], }, diagnostics: { "Состояние DSLAM": [ { command: `display sysuptime`, description: "Время работы DSLAM" }, { command: `display board 0`, description: "Состояние платы" }, ], "Состояние порта": [ { command: `display interface vdsl {port}`, description: "Состояние порта" }, { command: `display vdsl line operation port {port}`, description: "Состояние линии" }, { command: `display vdsl line operation board {port}`, description: "Состояние линии на плате" }, { command: `display vdsl line operation all`, description: "Состояние всех линий" }, ], "Работа с VLAN": [ { command: `display vlan desc 1-4093`, description: "Просмотр настроенных VLAN" }, { command: `display vlan all`, description: "Просмотр всех VLAN" }, ], "Работа с PVC": [ { command: `display service-port port {port}`, description: "Просмотр настроенных PVC" }, { command: `config
undo service-port port {port} vpi {vpi} vci {vci}`, description: "Удаление PVC по VPI/VCI" }, { command: `config
undo service-port port {port} vlan {vlan}`, description: "Удаление PVC по VLAN" }, ], "Работа с профилями": [ { command: `display vdsl line-profile`, description: "Просмотр профилей линий" }, { command: `display vdsl channel-profile`, description: "Просмотр профилей каналов" }, { command: `display vdsl line-template`, description: "Просмотр шаблонов линий" }, ], "Смена профиля": [ { command: `config\ninterface vdsl {slot}\ndeactivate {portNum}\nactivate {portNum} prof-idx noise-margin <PROF_INDEX_NOISE>\nactivate {portNum} prof-idx ds-rate <PROF_INDEX_DS>\nactivate {portNum}\nreturn`, description: "Смена профиля" }, ], "Текущая конфигурация": [ { command: `display current-configuration port {port}`, description: "Просмотр конфигурации" }, ], "SNMP": [ { command: `undo snmp-agent community com162-RO
undo snmp-agent community inity2016`, description: "Отключение SNMP" }, { command: `snmp-agent community read com162-RO
snmp-agent community read inity2016`, description: "Включение SNMP" }, ], "Работа с multicast": [ { command: `display igmp user port {port}`, description: "Просмотр подписок" }, ], "Перезапуск порта": [ { command: `config\ninterface vdsl {slot}\ndeactivate {portNum}\nactivate {portNum}\nreturn`, description: "Перезапуск порта" }, ], "Поиск INDEX": [ { command: `display service-port port {port} | include " {vlan} common|---|INDEX|ATTR"`, description: "Найти номер порта (INDEX) по сервис-порту" }, ], }, }, huawei_58xx_vdsl: { label: "Huawei 58xx VDSL", services: { pppoe: ({ port, vlan, vpi, vci }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} vdsl mode atm ${port} vpi ${vpi} vci ${vci} single-service tag-transform default inbound traffic-table index 10 outbound traffic-table index 10`, `return`, ], iptv: ({ port, vlan, vpi, vci, mcastVlan = vlan }) => [ `enable`, `undo smart`, `undo interactive`, `config`, `service-port vlan ${vlan} vdsl mode atm ${port} vpi ${vpi} vci ${vci} single-service tag-transform default inbound traffic-table index 7 outbound traffic-table index 7`, `btv`, `igmp user add service-port *номер порта (INDEX)* no-auth`, `multicast-vlan ${mcastVlan}`, `igmp multicast-vlan member service-port-list *номер порта (INDEX)*`, `return`, ], }, diagnostics: { "Состояние DSLAM": [ { command: `display sysuptime`, description: "Время работы DSLAM" }, { command: `display board 0`, description: "Состояние платы" }, ], "Состояние порта": [ { command: `display interface vdsl {port}`, description: "Состояние порта" }, { command: `display vdsl line operation port {port}`, description: "Состояние линии" }, { command: `display vdsl line operation board {port}`, description: "Состояние линии на плате" }, { command: `display vdsl line operation all`, description: "Состояние всех линий" }, ], "Работа с VLAN": [ { command: `display vlan desc 1-4093`, description: "Просмотр настроенных VLAN" }, { command: `display vlan all`, description: "Просмотр всех VLAN" }, ], "Работа с PVC": [ { command: `display service-port port {port}`, description: "Просмотр настроенных PVC" }, ], "Работа с профилями": [ { command: `display xdsl noise-margin-profile`, description: "Просмотр NM профилей" }, { command: `display xdsl data-rate-profile`, description: "Просмотр профилей по скорости DS/US" }, ], "Смена профиля": [ { command: `config\ninterface vdsl {slot}\ndeactivate {portNum}\nactivate {portNum} prof-idx noise-margin <PROF_INDEX_NOISE>\nactivate {portNum} prof-idx ds-rate <PROF_INDEX_DS>\nactivate {portNum}\nreturn`, description: "Смена профиля" }, ], "Текущая конфигурация": [ { command: `display current-configuration port {port}`, description: "Просмотр конфигурации" }, ], "Работа с multicast": [ { command: `display igmp user port {port}`, description: "Просмотр подписок" }, ], "Перезапуск порта": [ { command: `config\ninterface vdsl {slot}\ndeactivate {portNum}\nactivate {portNum}\nreturn`, description: "Перезапуск порта" }, ], "Поиск INDEX": [ { command: `display service-port port {port} | include " {vlan} common|---|INDEX|ATTR"`, description: "Найти номер порта (INDEX) по сервис-порту" }, ], }, }, huawei_5605: { label: "Huawei 5605", services: { pppoe: ({ port, vlan, vpi, vci }) => [ `enable`, `no smart`, `configure terminal`, `pvc adsl ${port} ${vpi} ${vci} lan 0/0 ${vlan} 0 disable 1483b off off 8 8`, `exit`, ], iptv: ({ port, vlan, vpi, vci, mcastVlan = vlan }) => [ `enable`, `no smart`, `pvc adsl ${port} ${vpi} ${vci} lan 0/0 ${vlan} 0 disable 1483b off off 8 8`, `exit`, ], }, diagnostics: { "Состояние DSLAM": [ { command: `display sysuptime`, description: "DSLAM uptime" }, { command: `display board 0`, description: "Board status" }, ], "Состояние порта": [ { command: `configure terminal
show port desc port {port}`, description: "Port description" },
        { command: `configure terminal
interface adsl {slot}
show line status {portNum}`, description: "Line status" },
        { command: `configure terminal
interface adsl {slot}
show line operation {portNum}`, description: "Line params" },
        { command: `configure terminal
interface adsl {slot}
show line operation all`, description: "All lines on board" },
      ],
      "Работа с профилями": [
        { command: `configure terminal
show adsl line-profile all`, description: "All line profiles" },
        { command: `configure terminal
interface adsl {slot}
show line parameter {portNum}`, description: "Profile params" },
      ],
      "Смена профиля": [
        { command: `configure terminal
interface adsl {slot}
deactivate {portNum}
activate {portNum} lineProfileindex <PROF_INDEX>
activate {portNum}`, description: "Change profile" },
      ],
      "Работа с VLAN": [
        { command: `show vlan all`, description: "All VLANs" },
        { command: `show pvc port {port}`, description: "PVC on port" },
      ],
      "Работа с PVC": [ { command: `show pvc port {port}`, description: "Просмотр настроенных PVC" }, ],
      "Работа с MAC": [
        { command: `configure terminal
interface lan 0/0
show mac-table port {port}`, description: "MAC table for port" },
      ],
      "ATM-ping": [
        { command: `configure terminal
interface adsl {slot}
oam loopback {portNum} {vpi} {vci} end-loopback 3`, description: "PVC test via OAM loopback" },
      ],
    },
  },

  zte_c300: {
    label: "ZTE C300",
    services: {
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `configure terminal`,
          `interface vdsl_${slot}/${portNum}`,
          `no shutdown`,
          `switchport mode hybrid`,
          `no switchport default vlan pvc 2`,
          `switchport default vlan ${vlan} pvc 2`,
          `atm pvc 2 vpi ${vpi} vci ${vci}`,
          `pvc 2 enable`,
          `mvlan-translate ${vlan} to untag pvc 2`,
          `exit`,
          `igmp mvlan ${vlan} receive-port vdsl_${slot}/${portNum} pvc 2`,
          `exit`,
          `write`,
        ];
      },
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `configure terminal`,
          `interface vdsl_${slot}/${portNum}`,
          `no shutdown`,
          `switchport mode hybrid`,
          `no switchport default vlan pvc 1`,
          `switchport default vlan ${vlan} pvc 1`,
          `atm pvc 1 vpi ${vpi} vci ${vci}`,
          `pvc 1 enable`,
          `exit`,
          `exit`,
          `write`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `show interface vdsl_{slot}/{portNum}`, description: "нформация об интерфейсе" },
        { command: `show vdsl2 port-status vdsl_{slot}/{portNum}`, description: "Статус VDSL2 порта" },
        { command: `show vdsl2 port-status vdsl_{slot}/1-64`, description: "Статус всех портов на плате" },
      ],
      "Работа с профилями": [
        { command: `show vdsl2 snrmargin-prf`, description: "Просмотр SNR профилей" },
        { command: `show vdsl2 snrmargin-prf <PROF_NAME>`, description: "Просмотр конкретного профиля" },
      ],
      "Смена профиля": [
        { command: `configure terminal
interface vdsl_{slot}/{portNum}
vdsl2 snrmargin-prf <PROF_NAME>`, description: "Смена профиля SNR" },
      ],
      "Работа с VLAN": [
        { command: `show vlan summary`, description: "Сводка по VLAN" },
        { command: `show vlan {vlan}`, description: "Просмотр конкретного VLAN" },
      ],
      "Работа с MAC": [
        { command: `show mac dsl vdsl_{slot}/{portNum}`, description: "MAC на DSL порту" },
        { command: `show mac vlan {vlan}`, description: "MAC во VLAN" },
        { command: `show mac slot {slot}`, description: "MAC на слоте" },
      ],
      "Работа с конфигурацией": [
        { command: `show running-config`, description: "Текущая конфигурация" },
        { command: `show running-config interface vdsl_{slot}/{portNum}`, description: "Конфигурация интерфейса" },
        { command: `write`, description: "Сохранение конфигурации" },
      ],
    },
  },

  zte_9xxx: {
    label: "ZTE ZXDSL-9xxx",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `configure interface adsl ${slot}/${portNum}`,
          `no shutdown`,
          `atm pvc ${vpi}:${vci} PVC1`,
          `pvid ${vlan} pvc PVC1`,
          `exit`,
          `copy running-config startup-config`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `configure interface adsl ${slot}/${portNum}`,
          `no shutdown`,
          `atm pvc ${vpi}:${vci} PVC1`,
          `pvid ${vlan} pvc PVC1`,
          `exit`,
          `copy running-config startup-config`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `show interface {slot}/{portNum}`, description: "нформация об интерфейсе" },
        { command: `show adsl physical {slot}/{portNum}`, description: "Физические параметры" },
        { command: `show adsl status interface {slot}/{portNum}`, description: "Статус ADSL интерфейса" },
        { command: `show adsl status slot {slot}`, description: "Статус всех портов на слоте" },
        { command: `show adsl perf {slot}/{portNum}`, description: "Производительность порта" },
      ],
      "Работа с профилями": [
        { command: `show adsl profile`, description: "Просмотр всех профилей" },
        { command: `show adsl profile DEFVAL.PRF`, description: "Просмотр конкретного профиля" },
      ],
      "Смена профиля": [
        { command: `configure interface adsl {slot}/{portNum}`, description: "Вход в интерфейс" },
        { command: `adsl line-profile <PROF_NAME>`, description: "Установка профиля" },
      ],
      "Работа с VLAN": [
        { command: `show vlan`, description: "Просмотр всех VLAN" },
        { command: `show vlan {vlan}`, description: "Просмотр конкретного VLAN" },
        { command: `show atm pvc interface {slot}/{portNum}`, description: "PVC на интерфейсе" },
      ],
      "Работа с MAC": [
        { command: `show fdb`, description: "Просмотр FDB" },
        { command: `show fdb {slot}/{portNum}`, description: "FDB порта" },
      ],
      "Работа с конфигурацией": [
        { command: `show running-config`, description: "Текущая конфигурация" },
        { command: `copy running-config startup-config`, description: "Сохранение конфигурации" },
      ],
      "Работа с multicast": [
        { command: `show igmp interface {slot}/{portNum}`, description: "IGMP на интерфейсе" },
      ],
    },
  },

  alsitek: {
    label: "Alsitek",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => [
        `interface dsl ${port}`,
        `  mode atm`,
        `  pvc ${vpi}/${vci}`,
        `  encapsulation llc`,
        `  service pppoe`,
        `  vlan ${vlan}`,
        `  no shutdown`,
        `  exit`,
      ],
      iptv: ({ port, vlan, vpi, vci, mcastVlan = vlan }) => [
        `interface dsl ${port}`,
        `  mode atm`,
        `  pvc ${vpi}/${vci}`,
        `  encapsulation llc`,
        `  service bridge`,
        `  vlan ${vlan}`,
        `  igmp snooping enable`,
        `  no shutdown`,
        `  exit`,
      ],
    },
    diagnostics: {
      "Физика порта": [
        { command: `show interface dsl {port}`, description: "нформация о порте DSL" },
        { command: `show interface dsl {port} statistics`, description: "Статистика порта" },
        { command: `show dsl line {port}`, description: "Параметры линии" },
      ],
      "Конфигурация": [
        { command: `show service-port dsl {port}`, description: "Настроенные сервисы" },
        { command: `show running-config interface dsl {port}`, description: "Конфигурация порта" },
      ],
      "MAC-таблица": [
        { command: `show mac-address-table interface dsl {port}`, description: "MAC-адреса на порту" },
      ],
    },
  },

  iskratel: {
    label: "Iskratel MSAN",
    services: {
      iptv: ({ port, vlan, vpi, vci }) => {
        const portNum = port.includes('/') ? port.split('/')[1] : port;
        return [
          `add interface dsl${portNum}:${vpi}_${vci}`,
          `set interface dsl${portNum}:${vpi}_${vci} enable`,
          `set bridge ccx between dsl${portNum}:${vpi}_${vci} fasteth1`,
          `add vlan member interface dsl${portNum}:${vpi}_${vci} vid ${vlan} ingress enable tag remove`,
          `set vlan interface dsl${portNum}:${vpi}_${vci} ingress enable`,
          `set vlan pvid interface dsl${portNum}:${vpi}_${vci} vid ${vlan} mode untagged`,
          `set igmp interface dsl${portNum}:${vpi}_${vci} state member acl mode deny`,
          `set bridge qos queues egress enable interface dsl${portNum}:${vpi}_${vci}`,
        ];
      },
      pppoe: ({ port, vlan, vpi, vci }) => {
        const portNum = port.includes('/') ? port.split('/')[1] : port;
        return [
          `add interface dsl${portNum}:${vpi}_${vci}`,
          `set interface dsl${portNum}:${vpi}_${vci} enable`,
          `set bridge ccx between dsl${portNum}:${vpi}_${vci} fasteth1`,
          `add vlan member interface dsl${portNum}:${vpi}_${vci} vid ${vlan} ingress enable tag remove`,
          `set vlan interface dsl${portNum}:${vpi}_${vci} ingress enable`,
          `set vlan pvid interface dsl${portNum}:${vpi}_${vci} vid ${vlan} mode untagged`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `show interface dsl{portNum}:{vpi}_{vci}`, description: "нформация об интерфейсе" },
        { command: `show dsl port {portNum}`, description: "нформация о DSL порте" },
        { command: `show dsl port`, description: "Список всех DSL портов" },
        { command: `show interface`, description: "Список всех интерфейсов" },
      ],
      "Работа с профилями": [
        { command: `show dsl profile`, description: "Просмотр профилей" },
        { command: `set dsl port {portNum} profile <PROF_INDEX>`, description: "Установка профиля" },
      ],
      "Работа с VLAN": [
        { command: `show vlan`, description: "Просмотр VLAN" },
        { command: `show vlan pvid`, description: "Просмотр PVID" },
        { command: `show vlan member`, description: "Просмотр членов VLAN" },
        { command: `show vlan member vid {vlan}`, description: "Просмотр членов конкретного VLAN" },
      ],
      "Удаление IPTV": [
        {
          command: `del vlan member interface dsl{portNum}:{vpi}_{vci} vid {vlan}\n` +
            `del bridge ccx between dsl{portNum}:{vpi}_{vci} fasteth1\n` +
            `del interface dsl{portNum}:{vpi}_{vci}`,
          description: "Удаление IPTV на порту",
        },
      ],
      "Работа с MAC": [
        { command: `show bridge mactable`, description: "Просмотр MAC-таблицы" },
        { command: `show bridge mactable interface dsl{portNum}:{vpi}_{vci}`, description: "MAC-таблица интерфейса" },
      ],
      "Дополнительные команды": [
        { command: `show system config`, description: "Конфигурация системы" },
        { command: `show stp`, description: "Состояние STP" },
        { command: `show board`, description: "нформация о платах" },
        { command: `show pppoe`, description: "нформация о PPPoE" },
        { command: `show dhcpr`, description: "нформация о DHCP relay" },
        { command: `show system info`, description: "нформация о системе" },
        { command: `show bridge qos status`, description: "Статус QoS" },
        { command: `show time`, description: "Время системы" },
        { command: `show snmp community`, description: "SNMP сообщества" },
        { command: `show atm cac bandwidth`, description: "ATM CAC bandwidth" },
      ],
    },
  },

  iskratel_mwgl0s92: {
    label: "Iskratel MSAN MWGL0S92",
    services: {
      pppoe: ({ port, vlan }) => {
        const [x = '0', y = '1'] = String(port || '0/1').split('/');
        const basePort = `${x}/${y}`;
        return [
          `configure`,
          `interface ${basePort}/1`,
          `pvc 8/35`,
          `vlan participation exclude 1`,
          `vlan participation include ${vlan || '*VLAN*'}`,
          `vlan pvid ${vlan || '*VLAN*'}`,
          `mac access-group ACL-PPPoE in 1`,
          `port-security`,
          `port-security max-dynamic 10`,
          `pppoe state enable-client`,
          `description "PPPoE"`,
        ];
      },
      iptv: ({ port, vlan }) => {
        const [x = '0', y = '1'] = String(port || '0/1').split('/');
        const basePort = `${x}/${y}`;
        return [
          `configure`,
          `interface ${basePort}/3`,
          `pvc 0/34`,
          `vlan participation exclude 1`,
          `vlan participation include ${vlan || '*VLAN*'}`,
          `vlan pvid ${vlan || '*VLAN*'}`,
          `multicast group-limit 2`,
          `port-security`,
          `port-security max-dynamic 10`,
          `qos-profile QoS_IP-TV`,
          `description "IP-TV"`,
        ];
      },
    },
    diagnostics: {
      "Проверка конфигурации порта": [
        { command: `show running-config {port}`, description: "Просмотр конфигурации порта" },
        { command: `show running-config {port} all`, description: "Полная конфигурация порта" },
      ],
      "Проверка PVC": [
        { command: `show running-config {port}/1`, description: "Проверка PVC PPPoE" },
        { command: `show running-config {port}/3`, description: "Проверка PVC IP-TV" },
      ],
      "MAC и VLAN": [
        { command: `show mac-addr-table`, description: "Просмотр MAC-таблицы" },
        { command: `show vlan brief`, description: "Краткий список VLAN" },
      ],
      "Состояние DSL": [
        { command: `show dsl port state {port}`, description: "Состояние DSL-порта" },
      ],
    },
  },

  photel: {
    label: "Photel iAN B1205",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `slot ${slot}`,
          `vlan s-vid ${vlan}`,
          `port interface atm ${portNum}:${vpi}.${vci}`,
          `vlan non-tls-port interface atm ${portNum}:${vpi}.${vci} s-vid ${vlan}`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `slot ${slot}`,
          `vlan s-vid ${vlan}`,
          `igmp enable`,
          `igmp igmp-snooping vid ${vlan} mode transparent`,
          `port interface atm ${portNum}:${vpi}.${vci}`,
          `vlan non-tls-port interface atm ${portNum}:${vpi}.${vci} s-vid ${vlan}`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `slot {slot}`, description: "Вход в слот" },
        { command: `port show line {portNum}`, description: "Просмотр линии" },
        { command: `port show channel dsl {portNum}`, description: "Просмотр канала DSL" },
      ],
      "Работа с профилями": [
        { command: `profile show adsl`, description: "Просмотр ADSL профилей" },
        { command: `profile show sp-adsl`, description: "Просмотр SP-ADSL профилей" },
        { command: `profile show ch-adsl`, description: "Просмотр CH-ADSL профилей" },
        { command: `slot {slot}`, description: "Вход в слот" },
        { command: `port show profile dsl {portNum}`, description: "Просмотр профиля порта" },
      ],
      "Работа с VLAN": [
        { command: `dslam l2 vlan show`, description: "Просмотр VLAN" },
        { command: `slot {slot}`, description: "Вход в слот" },
        { command: `vlan show s-vid`, description: "Просмотр S-VID" },
        { command: `vlan show interface atm {portNum}:{vpi}.{vci}`, description: "VLAN интерфейса" },
        { command: `port show interface`, description: "Просмотр интерфейсов" },
      ],
      "Работа с MAC": [
        { command: `dslam l2 bridge show bridge`, description: "Просмотр bridge" },
        { command: `slot {slot}`, description: "Вход в слот" },
        { command: `bridge show fdb`, description: "Просмотр FDB" },
        { command: `bridge show fdb interface atm {portNum}:{vpi}.{vci}`, description: "FDB интерфейса" },
      ],
      "Работа с multicast": [
        { command: `slot {slot}`, description: "Вход в слот" },
        { command: `igmp show multicast-group`, description: "Просмотр multicast групп" },
        { command: `igmp show multicast-group interface atm {portNum}:{vpi}.{vci}`, description: "Multicast группы интерфейса" },
      ],
    },
  },

  zyxel_5000: {
    label: "Zyxel-5000",
    services: {
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `profile atm set IPTV ubr 300000 0`,
          `multicast igmp enable snooping v2`,
          `multicast igmp mode normal`,
          `port pvc delete ${slot}-${portNum}-${vpi}/${vci}`,
          `port pvc set ${slot}-${portNum}-${vpi}/${vci} DEFVAL llc ${vlan} 5`,
          `port pvc vlan ${slot}-${portNum}-${vpi}/${vci} ${vlan} join untag`,
          `acl maccount set ${slot}-${portNum} 4`,
          `acl maccount enable ${slot}-${portNum}`,
          `acl pktfilter set *-* accept-all`,
          `config save`,
        ];
      },
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `profile atm set IPTV ubr 300000 0`,
          `port pvc delete ${slot}-${portNum}-${vpi}/${vci}`,
          `port pvc set ${slot}-${portNum}-${vpi}/${vci} DEFVAL llc ${vlan} 0`,
          `port pvc vlan ${slot}-${portNum}-${vpi}/${vci} ${vlan} join untag`,
          `acl maccount set ${slot}-${portNum} 4`,
          `acl maccount enable ${slot}-${portNum}`,
          `acl pktfilter set *-* accept-all`,
          `config save`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `port show {slot}`, description: "Просмотр портов на слоте" },
        { command: `port enable {slot}-{portNum}`, description: "Включить порт" },
        { command: `show linerate {slot}-{portNum}`, description: "Просмотр скорости линии" },
        { command: `show linestat {slot}-{portNum}`, description: "Статус, параметры, скорость линии" },
        { command: `show adsl linedata {slot}-{portNum}`, description: "Данные линии ADSL" },
      ],
      "Работа с профилями": [
        { command: `profile adsl show`, description: "Просмотр ADSL профилей" },
        { command: `profile adsl show DEFVAL`, description: "Просмотр конкретного профиля" },
        { command: `port show {slot}-{portNum}`, description: "нформация о порте" },
      ],
      "Смена профиля": [
        { command: `port adsl set {slot}-{portNum} <PROF_NAME> auto`, description: "Установка профиля" },
      ],
      "Работа с VLAN": [
        { command: `vlan show`, description: "Просмотр VLAN" },
        { command: `port pvc show {slot}-{portNum}`, description: "PVC на порту" },
        { command: `port pvc delete {slot}-{portNum}-8/35`, description: "Удаление PVC" },
      ],
      "Работа с MAC": [
        { command: `show mac {slot}-{portNum}`, description: "MAC на порту" },
      ],
      "Работа с multicast": [
        { command: `multicast igmp show`, description: "Просмотр настроек" },
        { command: `multicast igmp enable snooping v2`, description: "Включить" },
        { command: `show igmp group`, description: "Просмотр групп multicast" },
      ],
      "Работа с алармами": [
        { command: `alarm history show`, description: "стория алармов" },
      ],
    },
  },

  zyxel_1000: {
    label: "Zyxel-1000",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const portNum = port.includes('/') ? port.split('/')[1] : port;
        return [
          `adsl vcprofile set IPTV llc ubr 300000 0`,
          `switch mac count enable *`,
          `switch mac count set ${portNum} 4`,
          `switch pktfilter set * none`,
          `adsl pvc delete ${portNum} ${vpi} ${vci}`,
          `adsl pvc set ${portNum} ${vpi} ${vci} ${vlan} 0 DEFVAL`,
          `config save`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const portNum = port.includes('/') ? port.split('/')[1] : port;
        return [
          `adsl vcprofile set IPTV llc ubr 300000 0`,
          `switch mac count enable *`,
          `switch mac count set ${portNum} 4`,
          `switch pktfilter set * none`,
          `switch igmpsnoop enable snooping`,
          `adsl pvc delete ${portNum} ${vpi} ${vci}`,
          `adsl pvc set ${portNum} ${vpi} ${vci} ${vlan} 5 DEFVAL`,
          `config save`,
        ];
      },
    },
    diagnostics: {
      "Состояние порта": [
        { command: `adsl show`, description: "Просмотр ADSL портов" },
        { command: `statistics adsl show`, description: "Статистика всех ADSL портов" },
        { command: `statistics adsl linerate {portNum}`, description: "Скорость линии порта" },
      ],
      "Работа с профилями": [
        { command: `adsl profile show`, description: "Просмотр профилей" },
      ],
      "Смена профиля": [
        { command: `adsl profile map {portNum} {serviceProfile} {modulation}`, description: "Установка профиля" },
      ],
      "Работа с VLAN": [
        { command: `switch vlan show *`, description: "Просмотр VLAN (F:фиксированный X:исключенный U:незарегистрированный)" },
        { command: `statistics vlan`, description: "Статистика VLAN" },
        { command: `adsl pvc show {portNum}`, description: "PVC на порту" },
        { command: `switch vlan set {vlan} {portNum}:X`, description: "Настройка VLAN на порту" },
      ],
      "Работа с MAC": [
        { command: `statistics mac {portNum}`, description: "MAC статистика порта" },
        { command: `statistics mac *`, description: "MAC статистика всех портов" },
      ],
      "Работа с IGMP": [
        { command: `switch igmpsnoop show`, description: "Просмотр настроек" },
        { command: `switch igmpsnoop enable snooping`, description: "Включить" },
        { command: `statistics igmpsnoop group`, description: "Просмотр групп multicast" },
      ],
      "Работа с SRA/DMT": [
        { command: `adsl sra show *`, description: "Просмотр SRA" },
        { command: `adsl sra enable {portNum}`, description: "Включить SRA" },
        { command: `adsl inp {portNum}`, description: "Просмотр INP" },
        { command: `adsl inp {portNum} 2,2`, description: "Настройка DMT 1,1" },
      ],
      "Работа с алармами": [
        { command: `alarm show detail`, description: "Детальные алармы" },
      ],
    },
  },

  zyxel_aam1008: {
    label: "Zyxel-AAM1008",
    services: {
      pppoe: ({ port, vpi, vci }) => [
        `adsl`,
        `set ch ${port} ${vpi} ${vci} 0 0 DEFVAL`,
        `home`,
        `config save`,
      ],
      iptv: () => [
        `! IPTV не поддерживается`,
      ],
    },
    diagnostics: {
      "Работа с портом": [
        { command: `adsl show ports`, description: "Состояние портов" },
        { command: `adsl show port {port}`, description: "Состояние порта" },
        { command: `adsl linerate {port}`, description: "Вторичные параметры" },
      ],
      "Смена профиля": [
        { command: `adsl show profiles`, description: "Просмотр всех профилей" },
        { command: `adsl set port {port} {serviceProfile} auto`, description: "Смена профиля" },
      ],
      "VPI/VCI": [
        { command: `adsl show pvc {port}`, description: "Просмотр информации о VPI/VCI на порту" },
      ],
      "VLAN": [
        { command: `bridge fpvid`, description: "Просмотр VLAN на всех портах" },
      ],
    },
  },

  genew_photel_px90: {
    label: "Genew iAN B1205VE / Photel PX-90V 008",
    services: {
      pppoe: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `slot 1-${slot} ASL port interface atm ${portNum}:${vpi}.${vci} encapsulation llc-bridge`,
          `slot 1-${slot} ASL vlan non-tls-port interface atm ${portNum}:${vpi}.${vci} s-vid ${vlan}`,
          `save config`,
        ];
      },
      iptv: ({ port, vlan, vpi, vci }) => {
        const [slot, portNum] = port.split('/');
        return [
          `slot 1-${slot} ASL port interface atm ${portNum}:${vpi}.${vci}`,
          `slot 1-${slot} ASL vlan non-tls-port interface atm ${portNum}:${vpi}.${vci} s-vid ${vlan}`,
          `slot 1-${slot} ASL igmp enable`,
          `slot 1-${slot} ASL igmp igmp-snooping vid ${vlan} mode transparent`,
          `save config`,
        ];
      },
    },
    diagnostics: {
      "Сохранение и выход": [
        { command: `save config`, description: "Сохранение конфигурации" },
        { command: `exit`, description: "Выход" },
      ],
      "Работа с MAC": [
        { command: `dslam l2 bridge show bridge`, description: "Просмотр всех MAC-адресов" },
        { command: `slot 1-{slot} ASL bridge show fdb`, description: "MAC-адреса с конкретной платы" },
        { command: `slot {slot}\nbridge show fdb s-vid {vlan}`, description: "Поиск MAC по VLAN" },
        { command: `slot 1-{slot} ASL bridge show fdb interface atm {portNum}:{vpi}.{vci}`, description: "MAC-адрес за конкретным PVC" },
      ],
      "Работа с портом": [
        { command: `slot {slot}\nport disable dsl {portNum}\nport enable dsl {portNum}\nexit`, description: "Перезапуск порта" },
        { command: `slot {slot}\nport disable dsl {portNum}\nport profile P dsl {portNum}\nport enable dsl {portNum}\nexit\nsave config`, description: "Смена профиля (P — имя профиля)" },
        { command: `slot 1-{slot} ASL port show line {portNum}`, description: "Состояние порта" },
        { command: `slot 1-{slot} ASL port show rate dsl {portNum}`, description: "Вторичные параметры линии" },
        { command: `slot 1-{slot} ASL port show pm24 port dsl {portNum}`, description: "Ошибки на порту за 24 часа" },
      ],
      "Работа с PVC/VLAN": [
        { command: `slot 1-{slot} ASL vlan show`, description: "Просмотр всех PVC (VPI/VCI) с платы" },
        { command: `dslam l2 vlan show`, description: "Просмотр всех VLAN" },
        { command: `slot 1-{slot} ASL port disable dsl {portNum}\nslot 1-{slot} ASL port no interface atm {portNum}:{vpi}.{vci}\nslot 1-{slot} ASL port enable dsl {portNum}\nsave config`, description: "Удаление PVC" },
      ],
      "Профили": [
        { command: `profile show adsl`, description: "Просмотр списка template профилей" },
        { command: `profile show ch-adsl мя_профиля`, description: "Просмотр канального профиля" },
        { command: `profile show sp-adsl мя_профиля`, description: "Просмотр спектрального профиля" },
      ],
      "Multicast": [
        { command: `slot 1-{slot} ASL igmp show multicast-group vid {vlan}`, description: "Multicast-группы по VLAN" },
        { command: `slot 1-{slot} ASL igmp show source-ip-list`, description: "Список multicast-источников" },
      ],
      "Диагностика DSLAM": [
        { command: `ip show arp`, description: "Просмотр ARP-таблицы" },
        { command: `show slot`, description: "Просмотр списка плат" },
        { command: `show board`, description: "Просмотр списка плат (альтернатива)" },
        { command: `show slot detail`, description: "Подробная информация о платах" },
        { command: `slot 1-{slot} ASL port show interface atm {portNum}:{vpi}.{vci}`, description: "нкапсуляция на порту" },
        { command: `slot 1-{slot} ASL port show interface`, description: "нкапсуляция на всех портах платы" },
        { command: `show running-config type all`, description: "Просмотр конфигурации DSLAM" },
      ],
    },
  },

  opnet_rt1000: {
    label: "Opnet RT-1000",
    services: {
      pppoe: ({ port }) => {
        const [slot, portNum] = port.split('/');
        return [
          `update provision ${slot} ${portNum} xdslpc 11,PPPoE`,
        ];
      },
      iptv: ({ port }) => {
        const [slot, portNum] = port.split('/');
        return [
          `update provision ${slot} ${portNum} xdslpc 12,IPTV`,
        ];
      },
    },
    diagnostics: {
      "Командная строка и выход": [
        { command: `C`, description: "Активация командной строки" },
        { command: `saveconfig`, description: "Сохранение конфигурации" },
        { command: `exit`, description: "Выход" },
        { command: `9`, description: "Выход из DSLAM" },
      ],
      "Работа с портом": [
        { command: `update provision {slot} {portNum} xdslpc 1,0\nupdate provision {slot} {portNum} xdslpc 1,1`, description: "Перезапуск клиентского порта" },
        { command: `update provision {slot} {portNum} xdslpc 4,<PROF_NAME>\nsaveconfig`, description: "Смена профиля (<PROF_NAME> — имя профиля)" },
        { command: `show status {slot} {portNum} adslps`, description: "Вторичные параметры на порту" },
        { command: `show provision {slot} {portNum} xdslpc`, description: "Конфигурация порта" },
        { command: `show status {slot} 0 igmppt {portNum}`, description: "Multicast-группы на порту" },
      ],
      "Работа с MAC": [
        { command: `rmtconsole {slot}\n# login: root / opnet\ndspfdb | grep XX:XX:XX:XX:XX:XX`, description: "Поиск MAC-адреса на плате" },
        { command: `show status {slot} 0 forwardingt {portNum}`, description: "MAC-адрес на порту" },
        { command: `rmtconsole {slot}\n# login: root / opnet\ndspfdb`, description: "Все MAC-адреса на плате" },
      ],
      "Платы и профили": [
        { command: `show plugins`, description: "Список плат" },
        { command: `show profile {slot} 0 atucbp`, description: "Subinterface с VPI/VCI на плате" },
        { command: `show profile {slot} 0 atuclp`, description: "Все профили на плате" },
        { command: `show status {slot} 0 igmpst`, description: "Multicast-группы на плате" },
      ],
      "VLAN и система": [
        { command: `show profile 21 0 8021qvt`, description: "Список VLAN" },
        { command: `show admin utilization`, description: "Утилизация оборудования" },
      ],
    },
  },
  sib_templates: {
    label: "Сибирь: шаблоны (из файла)",
    services: {},
    diagnostics: {},
  },
};





