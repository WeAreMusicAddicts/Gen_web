// Auto-generated Siberia templates from Команды_управления_Сибирь_12_20251.xlsx
window.sibAdslTemplates = [
  {
    id: 'alcatel_pvc_inet',
    label: 'ALCATEL: PVC Интернет (пример)',
    text: `
configure atm pvc {port}:{vpi}:{vci} no admin-down
configure bridge port {port}:{vpi}:{vci}
vlan-id {vlan}
pvid {vlan}
max-unicast-mac 8
configure igmp channel {port}:{vpi}:{vci} max-num-group 5
default-priority 0
exit all
`,
  },
  {
    id: 'alcatel_pvc_iptv',
    label: 'ALCATEL: PVC IPTV (пример)',
    text: `
configure atm pvc {port}:{vpi}:{vci} no admin-down
configure bridge port {port}:{vpi}:{vci}
vlan-id {vlan}
pvid {vlan}
max-unicast-mac 16
configure igmp channel {port}:{vpi}:{vci} max-num-group 5
default-priority 5
exit all
`,
  },
  {
    id: 'huawei_ma5600_inet',
    label: 'Huawei MA5600: Интернет PVC + Label',
    text: `
service-port vlan {vlan} adsl {port} vpi {vpi} vci {vci} rx-cttr 6 tx-cttr 6
stacking label {port} vpi {vpi} vci {vci} {label}
`,
  },
  {
    id: 'huawei_ma5600_iptv_v1',
    label: 'Huawei MA5600: IPTV IGMP (вариант 1)',
    text: `
btv
igmp user add port {port} adsl {vpi} {vci} no-auth max-program 5
multicast-vlan {mcastVlan}
igmp multicast-vlan member port {port} {vpi} {vci}
quit
`,
  },
  {
    id: 'huawei_ma5600_iptv_v2',
    label: 'Huawei MA5600: IPTV IGMP (вариант 2, service-port)',
    text: `
btv
igmp user add service-port {servicePort} no-auth quickleave immediate globalleave enable
multicast-vlan {mcastVlan}
igmp multicast-vlan member service-port {servicePort}
quit
`,
  },
  {
    id: 'huawei_ma5300_iptv',
    label: 'Huawei MA5300: IPTV bind profile',
    text: `
en
conf t
int adsl {port}
igmp-proxy user bind profile index IPTV_full
exit
`,
  },
  {
    id: 'mxa_inet_pvc',
    label: 'MXA-DSL: Интернет PVC',
    text: `
enpu set unicast entry p{portShort} atm/{vpi}/{vci} untag/0/{cvid}/{svid}
`,
  },
  {
    id: 'mxa_iptv_multicast',
    label: 'MXA-DSL: Включить мультикаст на порту',
    text: `
enpu set multicast service p{portShort} ena
`,
  },
  {
    id: 'zte_msan_vdsl_show',
    label: 'ZTE MSAN/VDSL: Просмотр конфига порта',
    text: `
show running-config interface vdsl_{port}
show interface vdsl_{port}
show mac dsl vdsl_{port}
`,
  },
];

window.sibFttbCatalog = {
  "branches": [
    {
      "id": "branch",
      "name": "Новосибирский Филиал (НФ)",
      "notes": [],
      "equipment": [
        {
          "id": "eltex_switch_mes1124",
          "name": "Eltex switch (MES1124) Город",
          "variants": [
            {
              "id": "eltex_switch_mes1124_1",
              "label": "Город — ШПД+ИПТВ, Trunk",
              "text": "Eltex switch (MES1124) Город\nШПД+ИПТВ, Trunk\ninterface fastethernet 1/0/3\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 4040,4093\nswitchport trunk native vlan 1503\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription 351002002595\nstorm-control broadcast enable\nstorm-control multicast enable\nport security mode max-addresses\nport security MAX 10\nspanning-tree bpdu filtering\nservice-acl input IGMP-1\nno lldp transmit\nno lldp receive\nswitchport protected GigabitEthernet 1/0/1\npppoe intermediate-agent\npppoe intermediate-agent vendor-tag strip\nqos tail-drop profile 1",
              "notes": [
                "vlan: ШПД-1503, IPTV-4093, TR-069-4040"
              ]
            },
            {
              "id": "eltex_switch_mes1124_2",
              "label": "Город — Только ИПТВ, Trunk",
              "text": "Eltex switch (MES1124) Город\nТолько ИПТВ, Trunk\ninterface fastethernet 1/0/3\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 4040,1503\nswitchport trunk native vlan 4093\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription 351002002595\nstorm-control broadcast enable\nstorm-control multicast enable\nport security mode max-addresses\nport security MAX 10\nspanning-tree bpdu filtering\nservice-acl input IGMP-1\nno lldp transmit\nno lldp receive\nswitchport protected GigabitEthernet 1/0/1\npppoe intermediate-agent\npppoe intermediate-agent vendor-tag strip\nqos tail-drop profile 1",
              "notes": [
                "vlan: IPTV-4093, TR-069-4040"
              ]
            },
            {
              "id": "eltex_switch_mes1124_3",
              "label": "Город — порты General",
              "text": "порты General\n\"interface gigabitethernet 0/8\ndescription \"\"351002002250\"\"\ndcs agent-circuit-identifier \"\"/%a7/%p/%c\"\"\nstorm-control broadcast level kbps 64\nstorm-control multicast level kbps 16\nip access-group 1001 in\nip access-group 1002 in\nloopback-detection enable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040,4093\nswitchport general allowed vlan add 1608 untagged\nswitchport general pvid 1608\nswitchport port-security mac-limit 10\nswitchport port-security mode max-addresses\nno lldp transmit\nno lldp receive\nqos trust dscp\nport-isolation add  te 0/1\"",
              "notes": [
                "vlan: IPTV-4093, TR-069-4040"
              ]
            },
            {
              "id": "eltex_switch_mes1124_4",
              "label": "Город — порты General",
              "text": "порты General\n\"interface gigabitethernet 0/8\ndescription \"\"351002002250\"\"\ndcs agent-circuit-identifier \"\"/%a7/%p/%c\"\"\nstorm-control broadcast level kbps 64\nstorm-control multicast level kbps 16\nip access-group 1001 in\nip access-group 1002 in\nloopback-detection enable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040,1608\nswitchport general allowed vlan add 4093 untagged\nswitchport general pvid 4093\nswitchport port-security mac-limit 10\nswitchport port-security mode max-addresses\nno lldp transmit\nno lldp receive\nqos trust dscp\nport-isolation add  te 0/1\"",
              "notes": [
                "vlan: IPTV-4093, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "d_link_des_3200_28a1",
          "name": "D-LINK DES 3200-28A1",
          "variants": [
            {
              "id": "d_link_des_3200_28a1_1",
              "label": "ШПД+ИПТВ",
              "text": "D-LINK DES 3200-28A1\nШПД+ИПТВ\nVLAN ID  Untagged  Tagged  Forbidden  Dynamic\n-------        --------      ------      ---------       -------\n507                  X             -                 -                -\n4040                 -             X                 -                -\n4093                 -             X                 -                -",
              "notes": [
                "vlan: ШПД-507, IPTV-4093, TR-069-4040"
              ]
            },
            {
              "id": "d_link_des_3200_28a1_2",
              "label": "только ИПТВ",
              "text": "только ИПТВ\nVLAN ID  Untagged  Tagged  Forbidden  Dynamic\n-------        --------      ------      ---------       -------\n4093                 X             -               -                     -\n4040                  -             X               -                     -",
              "notes": [
                "vlan: IPTV-4093, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "qtech_2800",
          "name": "QTECH 2800 Город",
          "variants": [
            {
              "id": "qtech_2800_1",
              "label": "Город — ШПД+ИПТВ",
              "text": "QTECH 2800 Город\nШПД+ИПТВ\nInterface Ethernet1/2\ndescription 221002000196\nstorm-control broadcast 64\nlldp disable\nswitchport mode trunk\nswitchport trunk allowed vlan 4040;4093\nswitchport trunk native vlan 1202\npppoe intermediate-agent\nloopback-detection control shutdown\nigmp snooping drop query\nip dhcp snooping binding user-control max-user 10\nip dhcp snooping action shutdown",
              "notes": [
                "vlan: ШПД-1202, IPTV-4093, TR-069-4040"
              ]
            },
            {
              "id": "qtech_2800_2",
              "label": "Город — только ИПТВ",
              "text": "только ИПТВ\nInterface Ethernet1/2\ndescription 221002000196\nstorm-control broadcast 64\nlldp disable\nswitchport mode trunk\nswitchport trunk allowed vlan 4040\nswitchport trunk native vlan 4093\npppoe intermediate-agent\nloopback-detection control shutdown\nigmp snooping drop query\nip dhcp snooping binding user-control max-user 10\nip dhcp snooping action shutdown",
              "notes": [
                "vlan: IPTV-4093, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "d_link_des_3200_28a1",
          "name": "D-LINK DES 3200-28A1 область",
          "variants": [
            {
              "id": "d_link_des_3200_28a1_1",
              "label": "Конфигурация",
              "text": "D-LINK DES 3200-28A1 область\nVLAN ID  Untagged  Tagged  Forbidden  Dynamic\n-------      --------       ------     ---------       -------\n26                 X              -                    -               -\n100                X              -                    -               -\n4040                 -              X                   -               -",
              "notes": [
                "vlan: ШПД-100, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "eltex_switch_mes1124",
          "name": "Eltex switch (MES1124) Область",
          "variants": [
            {
              "id": "eltex_switch_mes1124_1",
              "label": "Область — ШПД+ИПТВ, только ИПТВ",
              "text": "Eltex switch (MES1124) Область\nШПД+ИПТВ, только ИПТВ\nip source-guard\nloopback-detection enable\nswitchport mode general\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 100 untagged\nswitchport protected-port\nstorm-control broadcast enable\nstorm-control broadcast level kbps 64\nstorm-control multicast enable\nstorm-control multicast level kbps 64\nstorm-control unknown-unicast enable\nstorm-control unknown-unicast level kbps 64\nstorm-control broadcast shutdown\nport security mode max-addresses\nport security max 10\nno lldp transmit\nno lldp receive\nswitchport general multicast-tv vlan 26\nswitchport general pvid 100\npppoe intermediate-agent\npppoe intermediate-agent vendor-tag strip\nqos tail-drop profile 1",
              "notes": [
                "vlan: ШПД-100, Mcast-26, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "qtech_2800",
          "name": "QTECH 2800 Область",
          "variants": [
            {
              "id": "qtech_2800_1",
              "label": "Область — ШПД+IPTV, только ИПТВ",
              "text": "QTECH 2800 Область\nШПД+IPTV, только ИПТВ\nstorm-control broadcast 64\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 100 untag\nswitchport hybrid allowed vlan 4040 tag\nswitchport hybrid native vlan 100\nswitchport association multicast-vlan 26\npppoe intermediate-agent\nloopback-detection specified-vlan 100\nloopback-detection control shutdown\nigmp snooping drop query\nip dhcp snooping binding user-control max-user 10\nip dhcp snooping action shutdown",
              "notes": [
                "vlan: ШПД-100, TR-069-4040"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Красноярский Филиал (КрФ)",
      "notes": [
        "Важно. влан(имя) мультикаста может быть и Mcast , обязательно проверять какое VLAN Name  прописано для данного комутатора!!!!              \nПроверить можно вот этой командой на всех D-LINK DES \"show igmp_snooping multicast_vlan\""
      ],
      "equipment": [
        {
          "id": "raisecom_iscom2624g_4ge_ac",
          "name": "Raisecom ISCOM2624G-4GE-AC",
          "variants": [
            {
              "id": "raisecom_iscom2624g_4ge_ac_1",
              "label": "ШПД + ИПТВ",
              "text": "Raisecom ISCOM2624G-4GE-AC\nШПД + ИПТВ\ndescription Inet+IPTV\nswitchport trunk native vlan 572\nswitchport trunk allowed vlan 15-16,4040 confirm\nswitchport trunk untagged vlan 15 confirm\nswitchport mode trunk\nfilter ingress access-list 3000\nswitchport protect\nspanning-tree disable\nspanning-tree rootguard enable\nloopback-detection detect-vlanlist 572\nlldp disable\npppoeagent enable\npppoeagent circuit-id 172.31.165.199::1\nswitchport vlan-mapping egress 15 translate 16\nswitchport port-security maximum 5\nigmp mvr\nigmp mvr user-vlan 16",
              "notes": [
                "vlan: ШПД-572, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "raisecom_iscom2624g_4ge_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ndescription IPTV_stb\nswitchport access vlan 16\nswitchport access egress-allowed vlan 15 confirm\nmls qos trust dscp\nfilter ingress access-list 3000\nswitchport protect\nspanning-tree disable\nspanning-tree rootguard enable\nloopback-detection detect-vlanlist 572\nlldp disable\npppoeagent enable\npppoeagent circuit-id 172.31.165.199::1\nswitchport port-security maximum 5",
              "notes": [
                "vlan: IPTV-16, Mcast-15"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes2308",
          "name": "Eltex MES2308",
          "variants": [
            {
              "id": "eltex_mes2308_1",
              "label": "ШПД + ИПТВ",
              "text": "Eltex MES2308\nШПД + ИПТВ\ndescription INET+TV\nbridge multicast unregistered filtering\nport security max 5\nport security mode max-addresses\nport security discard\nspanning-tree disable\nspanning-tree bpdu filtering\nswitchport mode trunk\nswitchport trunk allowed vlan add 16,4040\nswitchport trunk native vlan 3663\nswitchport trunk multicast-tv vlan 15 tagged\nswitchport protected-port\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nselective-qinq list egress override_vlan 16 ingress_vlan 15\npppoe intermediate-agent",
              "notes": [
                "vlan: ШПД-3663, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "eltex_mes2308_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ndcs agent-circuit-identifier \"%a431::%p\"\ndcs remote-agent-identifier \"%a431::%p\"\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 16 untagged\nswitchport general pvid 16\nswitchport multicast-tv vlan 15\nswitchport protected\nselective-qinq list egress override-vlan 16 ingress-vlan 15",
              "notes": [
                "vlan: IPTV-16, Mcast-15, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes_1124",
          "name": "ELTEX MES 1124",
          "variants": [
            {
              "id": "eltex_mes_1124_1",
              "label": "ШПД + ИПТВ",
              "text": "ELTEX MES 1124\nШПД + ИПТВ\ninterface fastethernet 1/0/10\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 16,4040\nswitchport trunk native vlan 751\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription Inet+STB\nport security mode max-addresses\nport security discard\nport security MAX 5\nservice-acl input MAC TCP/UDP_ports\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nswitchport trunk multicast-tv vlan 15 tagged\nselective-qinq list egress override_vlan 16 ingress_vlan 15\npppoe intermediate-agent",
              "notes": [
                "vlan: ШПД-751, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "eltex_mes_1124_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ninterface fastethernet 1/0/22\nloopback-detection enable\nswitchport access vlan 16\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription STB\nport security mode max-addresses\nport security discard\nport security MAX 5\nservice-acl input MAC TCP/UDP_ports\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nswitchport access multicast-tv vlan 15\npppoe intermediate-agent",
              "notes": [
                "vlan: IPTV-16, Mcast-15"
              ]
            }
          ]
        },
        {
          "id": "qtech_qsw_2800_28t_ac",
          "name": "Qtech QSW-2800-28T-AC",
          "variants": [
            {
              "id": "qtech_qsw_2800_28t_ac_1",
              "label": "ШПД + ИПТВ",
              "text": "Qtech QSW-2800-28T-AC\nШПД + ИПТВ\ndescription INET+IPTV(pc)\nswitchport mode trunk\nswitchport trunk allowed vlan 16;15;4040\nswitchport trunk native vlan 1378\nswitchport association multicast-vlan 15 out-tag 16\npppoe intermediate-agent\npppoe intermediate-agent circuit-id 10.101.33.64::3\nloopback-detection control shutdown\nigmp snooping drop query\nswitchport mac-address dynamic maximum 5",
              "notes": [
                "vlan: ШПД-1378, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "qtech_qsw_2800_28t_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\nswitchport mode trunk\nswitchport trunk allowed vlan 4040\nswitchport trunk native vlan 16\nswitchport association multicast-vlan 15\npppoe intermediate-agent\npppoe intermediate-agent circuit-id 10.101.33.64::3",
              "notes": [
                "vlan: IPTV-16, Mcast-15, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "huawei_s2328p_ei_ac",
          "name": "Huawei  S2328P-EI-AC",
          "variants": [
            {
              "id": "huawei_s2328p_ei_ac_1",
              "label": "ШПД + ИПТВ",
              "text": "Huawei  S2328P-EI-AC\nШПД + ИПТВ\ninterface Ethernet0/0/14\nport hybrid pvid vlan 1056\nundo port hybrid vlan 1\nport hybrid tagged vlan 16 15 4040\nport hybrid untagged vlan 1056\nloopback-detect enable\nstp disable\nundo lldp enable\nport-isolate enable group 1\nbroadcast-suppression 10",
              "notes": [
                "vlan: ШПД-1056, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "huawei_s2328p_ei_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ninterface Ethernet0/0/14\nport hybrid pvid vlan 16\nundo port hybrid vlan 1\nport hybrid tagged vlan 4040\nport hybrid untagged vlan 16 15\nloopback-detect enable\nstp disable\nundo lldp enable\nport-isolate enable group 1\nbroadcast-suppression 10",
              "notes": [
                "vlan: IPTV-16, Mcast-15, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "dlink_des_1210_10_me",
          "name": "DLink DES-1210-10/ME",
          "variants": [
            {
              "id": "dlink_des_1210_10_me_1",
              "label": "ШПД + ИПТВ",
              "text": "DLink DES-1210-10/ME\nШПД + ИПТВ\nPort 1\nVLAN ID  Untagged  Tagged  Forbidden\n-------          --------           ------      ---------     -------\n15                    -                     X                -              -\n16                    -                     X                -              -\n211                 X                     -                -              -\n4040                -                    X                -              -",
              "notes": [
                "vlan: ШПД-211, IPTV-16, Mcast-15, TR-069-4040"
              ]
            },
            {
              "id": "dlink_des_1210_10_me_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\nPort 1\nVLAN ID  Untagged  Tagged  Forbidden\n-------          --------           ------      ---------     -------\n15                    X                     -                -              -\n16                    X                     -                -              -\n4040                -                     X                -              -",
              "notes": [
                "vlan: IPTV-16, Mcast-15, TR-069-4040"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Красноярский Филиал (Хакасия)",
      "notes": [],
      "equipment": [
        {
          "id": "raisecom_iscom2624g_4ge_ac",
          "name": "Raisecom ISCOM2624G-4GE-AC",
          "variants": [
            {
              "id": "raisecom_iscom2624g_4ge_ac_1",
              "label": "ШПД + ИПТВ",
              "text": "Raisecom ISCOM2624G-4GE-AC\nШПД + ИПТВ\ndescription Inet+IPTV\nswitchport trunk native vlan 572\nswitchport trunk allowed vlan 2000-1101,4040 confirm\nswitchport trunk untagged vlan 2000 confirm\nswitchport mode trunk\nfilter ingress access-list 3000\nswitchport protect\nspanning-tree disable\nspanning-tree rootguard enable\nloopback-detection detect-vlanlist 572\nlldp disable\npppoeagent enable\npppoeagent circuit-id 172.31.165.199::1\nswitchport vlan-mapping egress 2000 translate 1101\nswitchport port-security maximum 5\nigmp mvr\nigmp mvr user-vlan 1101",
              "notes": [
                "vlan: ШПД-572, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "raisecom_iscom2624g_4ge_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ndescription IPTV_stb\nswitchport access vlan 1101\nswitchport access egress-allowed vlan 2000 confirm\nmls qos trust dscp\nfilter ingress access-list 3000\nswitchport protect\nspanning-tree disable\nspanning-tree rootguard enable\nloopback-detection detect-vlanlist 572\nlldp disable\npppoeagent enable\npppoeagent circuit-id 172.31.165.199::1\nswitchport port-security maximum 5",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes2308",
          "name": "Eltex MES2308",
          "variants": [
            {
              "id": "eltex_mes2308_1",
              "label": "ШПД + ТВ",
              "text": "Eltex MES2308\nШПД + ТВ\ndescription INET+TV\nbridge multicast unregistered filtering\nport security max 5\nport security mode max-addresses\nport security discard\nspanning-tree disable\nspanning-tree bpdu filtering\nswitchport mode trunk\nswitchport trunk allowed vlan add 1101,4040\nswitchport trunk native vlan 3663\nswitchport trunk multicast-tv vlan 2000 tagged\nswitchport protected-port\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nselective-qinq list egress override_vlan 1101 ingress_vlan 2000\npppoe intermediate-agent",
              "notes": [
                "vlan: ШПД-3663, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "eltex_mes2308_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ndcs agent-circuit-identifier \"%a431::%p\"\ndcs remote-agent-identifier \"%a431::%p\"\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 1101 untagged\nswitchport general pvid 1101\nswitchport multicast-tv vlan 2000\nswitchport protected\nselective-qinq list egress override-vlan 1101 ingress-vlan 2000",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes_1124",
          "name": "ELTEX MES 1124",
          "variants": [
            {
              "id": "eltex_mes_1124_1",
              "label": "ШПД + ТВ",
              "text": "ELTEX MES 1124\nШПД + ТВ\ninterface fastethernet 1/0/10\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 1101,4040\nswitchport trunk native vlan 751\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription Inet+STB\nport security mode max-addresses\nport security discard\nport security MAX 5\nservice-acl input MAC TCP/UDP_ports\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nswitchport trunk multicast-tv vlan 2000 tagged\nselective-qinq list egress override_vlan 1101 ingress_vlan 2000\npppoe intermediate-agent",
              "notes": [
                "vlan: ШПД-751, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "eltex_mes_1124_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ninterface fastethernet 1/0/22\nloopback-detection enable\nswitchport access vlan 1101\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription STB\nport security mode max-addresses\nport security discard\nport security MAX 5\nservice-acl input MAC TCP/UDP_ports\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\nswitchport access multicast-tv vlan 2000\npppoe intermediate-agent",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000"
              ]
            }
          ]
        },
        {
          "id": "qtech_qsw_2800_28t_ac",
          "name": "Qtech QSW-2800-28T-AC",
          "variants": [
            {
              "id": "qtech_qsw_2800_28t_ac_1",
              "label": "ШПД + ИПТВ",
              "text": "Qtech QSW-2800-28T-AC\nШПД + ИПТВ\ndescription INET+IPTV(pc)\nswitchport mode trunk\nswitchport trunk allowed vlan 1101;2000;4040\nswitchport trunk native vlan 1378\nswitchport association multicast-vlan 2000 out-tag 1101\npppoe intermediate-agent\npppoe intermediate-agent circuit-id 10.101.33.64::3\nloopback-detection control shutdown\nigmp snooping drop query\nswitchport mac-address dynamic maximum 5",
              "notes": [
                "vlan: ШПД-1378, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "qtech_qsw_2800_28t_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\nswitchport mode trunk\nswitchport trunk allowed vlan 4040\nswitchport trunk native vlan 1101\nswitchport association multicast-vlan 2000\npppoe intermediate-agent\npppoe intermediate-agent circuit-id 10.101.33.64::3",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "dlink_des_1210_10_me",
          "name": "DLink DES-1210-10/ME",
          "variants": [
            {
              "id": "dlink_des_1210_10_me_1",
              "label": "ШПД + ТВ",
              "text": "DLink DES-1210-10/ME\nШПД + ТВ\nPort 1\nVLAN ID  Untagged  Tagged  Forbidden\n-------          --------           ------      ---------     -------\n2000                 -                    X                -              -\n1101                 -                    X                -              -\n2411                 X                   -                -              -\n4040                 -                    X                -              -",
              "notes": [
                "vlan: ШПД-2411, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "dlink_des_1210_10_me_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\nPort 1\nVLAN ID  Untagged  Tagged  Forbidden\n-------          --------           ------      ---------     -------\n2000                 Х                   -                -              -\n1101                 Х                   -                -              -\n4040                 -                   X                -              -",
              "notes": []
            },
            {
              "id": "dlink_des_1210_10_me_3",
              "label": "Важно. влан(имя) мультикаста может быть и Mcast , обязательно проверять какое VLAN Name  прописано для данного комутатора!!!!",
              "text": "Важно. влан(имя) мультикаста может быть и Mcast , обязательно проверять какое VLAN Name  прописано для данного комутатора!!!!\nПроверить можно вот этой командой на всех DLINKAh \"show igmp_snooping multicast_vlan\"",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "huawei_s2328p_ei_ac",
          "name": "Huawei  S2328P-EI-AC",
          "variants": [
            {
              "id": "huawei_s2328p_ei_ac_1",
              "label": "ШПД+ ИПТВ",
              "text": "Huawei  S2328P-EI-AC\nШПД+ ИПТВ\ninterface Ethernet0/0/14\nport hybrid pvid vlan 1056\nundo port hybrid vlan 1\nport hybrid tagged vlan 1101 2000 4040\nport hybrid untagged vlan 1056\nloopback-detect enable\nstp disable\nundo lldp enable\nport-isolate enable group 1\nbroadcast-suppression 10",
              "notes": [
                "vlan: ШПД-1056, IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            },
            {
              "id": "huawei_s2328p_ei_ac_2",
              "label": "Только ИПТВ",
              "text": "Только ИПТВ\ninterface Ethernet0/0/14\nport hybrid pvid vlan 1101\nundo port hybrid vlan 1\nport hybrid tagged vlan 4040\nport hybrid untagged vlan 1101 2000\nloopback-detect enable\nstp disable\nundo lldp enable\nport-isolate enable group 1\nbroadcast-suppression 10",
              "notes": [
                "vlan:IPTV-1101, Mcast-2000, TR-069-4040"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Томский Филиал",
      "notes": [
        "ВАЖНО: В Томском РФ на IPTV указывается только мультикаст 800 ,на всех коммутах без исключения"
      ],
      "equipment": [
        {
          "id": "huawei_s2328p",
          "name": "Huawei S2328P",
          "variants": [
            {
              "id": "huawei_s2328p_1",
              "label": "ШПД+IPTV, только ТВ",
              "text": "Huawei S2328P\nШПД+IPTV, только ТВ\ninterface Ethernet0/0/7\nport hybrid pvid vlan 3390\nundo port hybrid vlan 1\nport hybrid tagged vlan 4040\nport hybrid untagged vlan 800 3390\nloopback-detect recovery-time 255\nloopback-detect enable\nigmp-snooping group-limit 10 vlan 3390\nport-security enable\nport-security protect-action protect\nport-security max-mac-num 10\nport-security aging-time 5\nport-isolate enable group 1\nbroadcast-suppression 1\nПри наличии данных строчек в конфурации порта, мультикаста не будет:\n\"igmp-snooping group-policy 3000 version 2 vlan 800\n\"igmp-snooping group-policy 3000 version 2 vlan 3390",
              "notes": [
                "vlan: ШПД-3390, Mcast-800, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes_1124",
          "name": "Eltex MES-1124",
          "variants": [
            {
              "id": "eltex_mes_1124_1",
              "label": "ШПД+IPTV, только ТВ",
              "text": "Eltex MES-1124\nШПД+IPTV, только ТВ\ninterface fastethernet 1/0/2\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 4040\nswitchport trunk native vlan 547\nswitchport protected-port\nswitchport community 2\nbridge multicast unregistered filtering\ndescription 3825902593\nstorm-control broadcast enable\nstorm-control broadcast level kbps 120\nstorm-control multicast enable\nstorm-control multicast level kbps 120\nstorm-control unknown-unicast enable\nstorm-control unknown-unicast level kbps 120\nport security mode max-addresses\nport security discard\nport security MAX 10\nswitchport forbidden default-vlan\nswitchport trunk multicast-tv vlan 800\npppoe intermediate-agent\npppoe intermediate-agent format-type circuit-id 10.139.198.58:2\nmulticast snooping add iptv_free\nmulticast snooping add iptv_full\nmulticast snooping max-groups 10",
              "notes": [
                "vlan: ШПД-547, Mcast-800, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "eltex_mes2428",
          "name": "Eltex MES2428",
          "variants": [
            {
              "id": "eltex_mes2428_1",
              "label": "ШПД+IPTV, только ТВ",
              "text": "Eltex MES2428\nШПД+IPTV, только ТВ\ninterface gigabitethernet 0/7\ndcs agent-circuit-identifier \"%a287:%i\"\nstorm-control dlf level kbps 128\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 128\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 128\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree portfast\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 639 untagged\nswitchport general pvid 639\nswitchport multicast-tv vlan 800\nswitchport port-security mac-limit 10\nswitchport port-security mode max-addresses\nip igmp snooping leavemode exp-hosttrack\nip igmp snooping limit groups 10\nport-isolation add  gi 0/28",
              "notes": [
                "vlan: ШПД-639, Mcast-800, TR-069-4040"
              ]
            },
            {
              "id": "eltex_mes2428_2",
              "label": "ШПД+IPTV, только ТВ",
              "text": "ШПД+IPTV, только ТВ\ninterface gigabitethernet 0/5\ndescription \"3822081800\"\ndcs agent-circuit-identifier \"10.139.204.160:%i\"\nstorm-control dlf level kbps 128\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 128\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 128\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree portfast\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 639 untagged\nswitchport general pvid 639\nswitchport multicast-tv vlan 800\nswitchport port-security mac-limit 10\nswitchport port-security mode max-addresses\nip igmp snooping leavemode exp-hosttrack\nip igmp snooping limit groups 10\nip igmp snooping filter-profileId 777\nport-isolation add  gi 0/28",
              "notes": [
                "vlan: ШПД-639, Mcast-800, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "d_link_des_1210",
          "name": "D-LINK DES 1210",
          "variants": [
            {
              "id": "d_link_des_1210_1",
              "label": "ШПД+ИПТВ, только IPTV",
              "text": "D-LINK DES 1210\nШПД+ИПТВ, только IPTV\nVLAN ID  Untagged  Tagged  Forbidden\n-------        --------      ------      ---------\n776                  X                -                 -\n800                  X                -\n4040                 -               X                -",
              "notes": [
                "vlan: ШПД-776, Mcast-800, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "huawei_s2328p_ei_ac",
          "name": "Huawei S2328P-EI AC",
          "variants": [
            {
              "id": "huawei_s2328p_ei_ac_1",
              "label": "ШПД+IPTV, только ТВ",
              "text": "Huawei S2328P-EI AC\nШПД+IPTV, только ТВ\ninterface Ethernet0/0/3\nport hybrid pvid vlan 3200\nundo port hybrid vlan 1\nport hybrid tagged vlan 4040\nport hybrid untagged vlan 800 3200\nloopback-detect recovery-time 255\nloopback-detect enable\nigmp-snooping group-limit 10 vlan 3200\nigmp-snooping group-policy 3000 version 2 vlan 3200\nport-security enable\nport-security protect-action protect\nport-security max-mac-num 10\nport-security aging-time 5\nport-isolate enable group 1\nbroadcast-suppression 1",
              "notes": [
                "vlan: ШПД-3200, Mcast-800, TR-069-4040"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Алтайский Филиал (АФ)",
      "notes": [],
      "equipment": [
        {
          "id": "eltex_mes2428",
          "name": "Eltex MES2428",
          "variants": [
            {
              "id": "eltex_mes2428_1",
              "label": "ШПД + ИПТВ а также ТВ без роутера (так как сервисная модель CSM)",
              "text": "Eltex MES2428\nШПД + ИПТВ а также ТВ без роутера (так как сервисная модель CSM)\ninterface gigabitethernet 0/1\ndcs agent-circuit-identifier \"%M::%i\"\ndcs remote-agent-identifier \"10.50.128.174::%i\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 3003,4040\nswitchport general allowed vlan add 3340 untagged\nswitchport general pvid 3340\nswitchport multicast-tv vlan 3001\nqos trust dscp",
              "notes": []
            }
          ]
        },
        {
          "id": "eltex_mes1124",
          "name": "Eltex MES1124",
          "variants": [
            {
              "id": "eltex_mes1124_1",
              "label": "ШПД + ИПТВ а также ТВ без роутера (так как сервисная модель CSM)",
              "text": "Eltex MES1124\nШПД + ИПТВ а также ТВ без роутера (так как сервисная модель CSM)\ninterface gigabitethernet 0/4\ndcs agent-circuit-identifier \"%M::%i\"\ndcs remote-agent-identifier \"10.50.55.227::%i\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 3003,4040\nswitchport general allowed vlan add 2064 untagged\nswitchport general pvid 2064\nswitchport multicast-tv vlan 3001\nno lldp transmit\nno lldp receive\nqos trust dscp",
              "notes": []
            }
          ]
        },
        {
          "id": "d_link_des_3200_26",
          "name": "D-LINK DES-3200-26",
          "variants": [
            {
              "id": "d_link_des_3200_26_1",
              "label": "ШПД+ИПТВ",
              "text": "D-LINK DES-3200-26\nШПД+ИПТВ\nVLAN ID  Untagged  Tagged  Forbidden\n-------        --------      ------      ---------\n2949                  X                -                 -\n3003                  -                Х\n4040                 -                 X                -",
              "notes": []
            }
          ]
        },
        {
          "id": "d_link_des_1210_28",
          "name": "D-LINK DES-1210-28",
          "variants": [
            {
              "id": "d_link_des_1210_28_1",
              "label": "ШПД+ИПТВ",
              "text": "D-LINK DES-1210-28\nШПД+ИПТВ\nVLAN ID  Untagged  Tagged  Forbidden\n-------        --------      ------      ---------\n1245                 X                -                 -\n3001                 X                -                 -\n3003                 -                X\n4040                 -                X                -",
              "notes": []
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Иркутский Филиал (ИФ)",
      "notes": [],
      "equipment": [
        {
          "id": "equipment",
          "name": "Без устройства",
          "variants": [
            {
              "id": "_1",
              "label": "MES1124",
              "text": "MES1124\nШПД+ИПТВ\ninterface fastethernet 1/0/20\nswitchport mode trunk\nswitchport trunk allowed vlan add 5\nswitchport trunk native vlan 1032\nswitchport protected-port\nstorm-control broadcast enable\nstorm-control broadcast level kbps 100\nstorm-control multicast enable\nstorm-control multicast level kbps 100\nstorm-control unknown-unicast enable\nstorm-control unknown-unicast level kbps 100\nport security mode max-addresses\nport security MAX 16\nport security discard\nno lldp transmit\nno lldp receive\npppoe intermediate-agent\nexit\n!",
              "notes": [
                "vlan:ШПД-1032, IPTV-5 "
              ]
            },
            {
              "id": "_2",
              "label": "MES24xx",
              "text": "MES24xx\nШПД+IPTV\ninterface gigabitethernet 0/8\nstorm-control dlf level kbps 256\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 256\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 256\nstorm-control multicast action shutdown\nloopback-detection enable\nno lldp transmit\nno lldp receive\nswitchport general allowed vlan add 5\nswitchport general allowed vlan add 115 untagged\nswitchport general pvid 115\nswitchport protected\nswitchport port-security enable\nswitchport port-security mac-limit 16\nswitchport port-security mode max-addresses",
              "notes": [
                "vlan:ШПД-115, IPTV-5 "
              ]
            },
            {
              "id": "_3",
              "label": "MES23xx",
              "text": "MES23xx\nШПД+IPTV\ninterface gigabitethernet1/0/8\nstorm-control broadcast kbps 100\nstorm-control unicast kbps 100\nstorm-control multicast kbps 100\nport security max 16\nport security mode max-addresses\nport security discard\nswitchport protected-port\nno lldp transmit\nno lldp receive\nswitchport mode trunk\nswitchport trunk allowed vlan add 5\nswitchport trunk native vlan 115\npppoe intermediate-agent",
              "notes": [
                "vlan:ШПД-115, IPTV-5 "
              ]
            },
            {
              "id": "_4",
              "label": "MES1124",
              "text": "MES1124\nтолько IPTV\ninterface fastethernet 1/0/20\nswitchport mode trunk\nswitchport trunk native vlan 5\nswitchport protected-port\nstorm-control broadcast enable\nstorm-control broadcast level kbps 100\nstorm-control multicast enable\nstorm-control multicast level kbps 100\nstorm-control unknown-unicast enable\nstorm-control unknown-unicast level kbps 100\nport security mode max-addresses\nport security MAX 16\nport security discard\nno lldp transmit\nno lldp receive\npppoe intermediate-agent\nexit\n!",
              "notes": [
                "vlan:IPTV-5 "
              ]
            },
            {
              "id": "_5",
              "label": "MES24xx",
              "text": "MES24xx\nтолько IPTV\ninterface gigabitethernet 0/8\nstorm-control dlf level kbps 256\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 256\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 256\nstorm-control multicast action shutdown\nloopback-detection enable\nno lldp transmit\nno lldp receive\nswitchport general allowed vlan add 5 untagged\nswitchport general pvid 5\nswitchport protected\nswitchport port-security enable\nswitchport port-security mac-limit 16\nswitchport port-security mode max-addresses",
              "notes": [
                "vlan:IPTV-5 "
              ]
            },
            {
              "id": "_6",
              "label": "MES23xx",
              "text": "MES23xx\nтолько IPTV\ninterface gigabitethernet1/0/8\nstorm-control broadcast kbps 100\nstorm-control unicast kbps 100\nstorm-control multicast kbps 100\nport security max 16\nport security mode max-addresses\nport security discard\nswitchport protected-port\nno lldp transmit\nno lldp receive\nswitchport mode trunk\nswitchport trunk allowed vlan add 5\nswitchport trunk native vlan 5\npppoe intermediate-agent",
              "notes": [
                "vlan:IPTV-5 "
              ]
            }
          ]
        },
        {
          "id": "huawei_vrp_5_70",
          "name": "Huawei.VRP 5.70",
          "variants": [
            {
              "id": "huawei_vrp_5_70_1",
              "label": "ШПД+IPTV",
              "text": "Huawei.VRP 5.70\nШПД+IPTV\ninterface Ethernet0/0/5\ndescription -- Port 5 --\nport hybrid pvid vlan 1042\nundo port hybrid vlan 1\nport hybrid tagged vlan 5 4040\nport hybrid untagged vlan 1042\nmac-limit maximum 16\nloopback-detect enable\nstp loop-protection\nstp bpdu-filter enable\ntraffic-limit inbound acl 4010 rule 0 cir 64 cbs 8192\nport-isolate enable group 1\nunicast-suppression 2\nmulticast-suppression 2\nbroadcast-suppression 2",
              "notes": [
                "vlan:ШПД-1042, IPTV-5, TR-069-4040 "
              ]
            },
            {
              "id": "huawei_vrp_5_70_2",
              "label": "только IPTV",
              "text": "Huawei.VRP 5.70\nтолько IPTV\ninterface Ethernet0/0/5\ndescription -- Port 5 --\nport hybrid pvid vlan 5\nundo port hybrid vlan 1\nport hybrid untagged vlan 5\nmac-limit maximum 16\nloopback-detect enable\nstp loop-protection\nstp bpdu-filter enable\ntraffic-limit inbound acl 4010 rule 0 cir 64 cbs 8192\nport-isolate enable group 1\nunicast-suppression 2\nmulticast-suppression 2\nbroadcast-suppression 2",
              "notes": [
                "vlan:IPTV-5 "
              ]
            }
          ]
        },
        {
          "id": "d_link_des_3526",
          "name": "D-Link DES-3526",
          "variants": [
            {
              "id": "d_link_des_3526_1",
              "label": "ШПД+IPTV",
              "text": "D-Link DES-3526\nШПД+IPTV\nPort 6\nVLANID    Untaged    Tagged    Forbidden\n------                -------    ------    ---------\n5                             -             X           -\n1034                     X              -           -\n4040                      -              X           -\n------    -------    ------    ---------",
              "notes": [
                "vlan:ШПД-1034, IPTV-5, TR-069-4040 "
              ]
            },
            {
              "id": "d_link_des_3526_2",
              "label": "только IPTV",
              "text": "D-Link DES-3526\nтолько IPTV\nPort 6\nVLANID    Untaged    Tagged    Forbidden\n------                -------    ------        ---------\n5                             X             -           -\n4040                      -              X           -\n------                 ------    ---------",
              "notes": [
                "vlan:IPTV-5 "
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Бурятский Филиал (БФЛ)",
      "notes": [],
      "equipment": [
        {
          "id": "huawei_s2328",
          "name": "Huawei s2328",
          "variants": [
            {
              "id": "huawei_s2328_1",
              "label": "ШПД+IPTV",
              "text": "Huawei s2328\nШПД+IPTV\ninterface Ethernet 0/0/1\nundo port hybrid pvid vlan\nundo port hybrid vlan 2817\nport hybrid pvid vlan 2800\nport hybrid untagged vlan 2800\nport hybrid tagged vlan 2817",
              "notes": [
                "vlan:ШПД-2800, IPTV-2817 "
              ]
            },
            {
              "id": "huawei_s2328_2",
              "label": "только IPTV",
              "text": "Huawei s2328\nтолько IPTV\ninterface Ethernet 0/0/1\nundo port hybrid pvid vlan\nport hybrid pvid vlan 2817\nport hybrid untagged vlan 2817",
              "notes": [
                "vlan:IPTV-2817 "
              ]
            },
            {
              "id": "huawei_s2328_3",
              "label": "ШПД+IPTV",
              "text": "Huawei s2328\nШПД+IPTV\ninterface Ethernet0/0/2\nport hybrid pvid vlan 3350\nport hybrid tagged vlan 2160 4040\nport hybrid untagged vlan 3350\nport-isolate enable group 1",
              "notes": [
                "vlan:ШПД-3350, IPTV-2160, TR-069-4040 "
              ]
            },
            {
              "id": "huawei_s2328_4",
              "label": "ШПД+IPTV",
              "text": "Huawei s2328\nШПД+IPTV\ninterface Ethernet0/0/2\nport hybrid pvid vlan 2160\nport hybrid untagged vlan 2160\nport-isolate enable group 1",
              "notes": [
                "vlan:IPTV-2160"
              ]
            }
          ]
        },
        {
          "id": "mes_1124_1124",
          "name": "MES 1124, 1124М",
          "variants": [
            {
              "id": "mes_1124_1124_1",
              "label": "ШПД+IPTV",
              "text": "MES 1124, 1124М\nШПД+IPTV\ninterface FastEthernet 1/0/11\nswitchport mode trunk\nswitchport trunk native vlan 3001\nswitchport trunk allowed vlan add 4040,2121\nspanning-tree disable\nspanning-tree bpdu filtering\npppoe intermediate-agent\nswitchport protected-port\nbridge multicast unregistered filtering\nstorm-control broadcast enable\nstorm-control broadcast level kbps 128\nstorm-control multicast enable\nstorm-control multicast level kbps 128\nspanning-tree portfast\nservice-acl input KPI_IPTV\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan",
              "notes": [
                "vlan:ШПД-3001, IPTV-2121, TR-069-4040 "
              ]
            }
          ]
        },
        {
          "id": "iscom2128",
          "name": "ISCOM2128",
          "variants": [
            {
              "id": "iscom2128_1",
              "label": "ШПД+IPTV",
              "text": "ISCOM2128\nШПД+IPTV\ninterface port 19\nswitchport trunk native vlan 2812\nswitchport trunk allowed vlan 2101,4040\nswitchport mode trunk\nmvr type receiver\nmvr immediate\npppoeagent enable\npppoeagent remote-id format ascii\nquit",
              "notes": [
                "vlan:ШПД-2812, IPTV-2121, TR-069-4040 "
              ]
            },
            {
              "id": "iscom2128_2",
              "label": "только IPTV",
              "text": "ISCOM2128\nтолько IPTV\ninterface port 19\nswitchport trunk native vlan 2101\nswitchport mode trunk\nmvr type receiver\nmvr immediate\npppoeagent enable\npppoeagent remote-id format ascii\nquit",
              "notes": [
                "vlan:IPTV-2121, TR-069-4040 "
              ]
            }
          ]
        },
        {
          "id": "d_link_3200",
          "name": "D-Link 3200",
          "variants": [
            {
              "id": "d_link_3200_1",
              "label": "ШПД+IPTV",
              "text": "D-Link 3200\nШПД+IPTV\nPort 5\nVLANID    Untaged    Tagged    Forbidden\n------      -------            ------       ---------\n2116            -                   X                    -\n3204           X         -           -\n4040            -                   X                    -\n------       -------           ------       ---------",
              "notes": [
                "vlan:ШПД-3204, IPTV-2116, TR-069-4040 "
              ]
            },
            {
              "id": "d_link_3200_2",
              "label": "только IPTV",
              "text": "D-Link 3200\nтолько IPTV\nPort 5\nVLANID    Untaged    Tagged    Forbidden\n------      -------            ------       ---------\n2116            X                  -                    -\n4040            -                   X                    -\n------       -------           ------       ---------",
              "notes": [
                "vlan:IPTV-2116, TR-069-4040 "
              ]
            }
          ]
        },
        {
          "id": "mes_1124_1124m",
          "name": "Mes 1124, 1124M",
          "variants": [
            {
              "id": "mes_1124_1124m_1",
              "label": "только IPTV",
              "text": "Mes 1124, 1124M\nтолько IPTV\ninterface FastEthernet 1/0/11\nswitchport mode trunk\nswitchport trunk native vlan 2121\nspanning-tree disable\nspanning-tree bpdu filtering\npppoe intermediate-agent\nswitchport protected-port\nbridge multicast unregistered filtering\nstorm-control broadcast enable\nstorm-control broadcast level kbps 128\nstorm-control multicast enable\nstorm-control multicast level kbps 128\nspanning-tree portfast\nservice-acl input KPI_IPTV\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan",
              "notes": [
                "vlan:IPTV-2121"
              ]
            },
            {
              "id": "mes_1124_1124m_2",
              "label": "вариант 2",
              "text": "вариант 2\nШПД+IPTV, только IPTV\ninterface FastEthernet 1/0/11\nswitchport mode general\nswitchport general pvid 3001\nswitchport general allowed vlan add 3001 untagged\nswitchport general multicast-tv vlan 84\nspanning-tree disable\nspanning-tree bpdu filtering\nswitchport protected-port\nbridge multicast unregistered filtering\nstorm-control broadcast enable\nstorm-control broadcast level kbps 128\nstorm-control multicast enable\nstorm-control multicast level kbps 128\nspanning-tree portfast\nno lldp transmit\nno lldp receive\npppoe intermediate-agent\nswitchport forbidden default-vlan",
              "notes": [
                "vlan:ШПД-3001, Mcast-84"
              ]
            }
          ]
        },
        {
          "id": "d_link_des_3200",
          "name": "D-link DES-3200",
          "variants": [
            {
              "id": "d_link_des_3200_1",
              "label": "ШПД+IPTV",
              "text": "D-link DES-3200\nШПД+IPTV\nPort 17\nVLAN ID  Untagged  Tagged  Forbidden\n-------           --------       ------      ---------\n2169                    -               X                -\n3104                    X               -                -\n4040                     -              X                -",
              "notes": [
                "vlan:ШПД-3104, IPTV-2169, TR-069-4040 "
              ]
            },
            {
              "id": "d_link_des_3200_2",
              "label": "только IPTV",
              "text": "D-link DES-3200\nтолько IPTV\nPort 17\nVLAN ID  Untagged  Tagged  Forbidden\n-------           --------       ------      ---------\n2169                    X               -                -\n4040                     -              X                -",
              "notes": [
                "vlan:IPTV-2169, TR-069-4040 "
              ]
            }
          ]
        },
        {
          "id": "mes_24",
          "name": "MES 24хх",
          "variants": [
            {
              "id": "mes_24_1",
              "label": "ШПД+IPTV",
              "text": "MES 24хх\nШПД+IPTV\ninterface gigabitethernet 0/17\ndescription \"809514\"\ndcs agent-circuit-identifier \"%a17::%i\"\ndcs remote-agent-identifier \"#\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 2160,4040\nswitchport general allowed vlan add 3350 untagged\nswitchport general pvid 3350\nswitchport protected",
              "notes": [
                "vlan:ШПД-3350, IPTV-2160, TR-069-4040 "
              ]
            },
            {
              "id": "mes_24_2",
              "label": "только IPTV",
              "text": "MES 24хх\nтолько IPTV\ninterface gigabitethernet 0/17\ndescription \"809514\"\ndcs agent-circuit-identifier \"%a17::%i\"\ndcs remote-agent-identifier \"#\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 2160 untagged\nswitchport general pvid 2160\nswitchport protected",
              "notes": [
                "vlan:IPTV-2160"
              ]
            }
          ]
        },
        {
          "id": "mes_1124",
          "name": "MES 1124",
          "variants": [
            {
              "id": "mes_1124_1",
              "label": "ШПД+IPTV",
              "text": "MES 1124\nШПД+IPTV\ninterface fastethernet 1/0/2\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 2160,4040\nswitchport trunk native vlan 3350\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription enable\nstorm-control broadcast enable\nstorm-control multicast enable\nstorm-control unknown-unicast enable\nstorm-control broadcast logging\nstorm-control broadcast shutdown\nspanning-tree disable\nspanning-tree bpdu filtering\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\npppoe intermediate-agent\nexit",
              "notes": [
                "vlan:ШПД-3350, IPTV-2160, TR-069-4040 "
              ]
            },
            {
              "id": "mes_1124_2",
              "label": "только IPTV",
              "text": "MES 1124\nтолько IPTV\ninterface fastethernet 1/0/2\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk native vlan 2160\nswitchport protected-port\nbridge multicast unregistered filtering\ndescription enable\nstorm-control broadcast enable\nstorm-control multicast enable\nstorm-control unknown-unicast enable\nstorm-control broadcast logging\nstorm-control broadcast shutdown\nspanning-tree disable\nspanning-tree bpdu filtering\nno lldp transmit\nno lldp receive\nswitchport forbidden default-vlan\npppoe intermediate-agent\nexit",
              "notes": [
                "vlan:IPTV-2160 "
              ]
            }
          ]
        },
        {
          "id": "iscom_2128",
          "name": "ISCOM 2128",
          "variants": [
            {
              "id": "iscom_2128_1",
              "label": "ШПД+IPTV",
              "text": "ISCOM 2128\nШПД+IPTV\ninterface port 3\nswitchport trunk native vlan 3350\nswitchport trunk allowed vlan 2160,4040 confirm\nswitchport mode trunk\nswitchport protect\nmvr type receiver\nmvr immediate\npppoeagent enable\npppoeagent remote-id client-mac\npppoeagent remote-id format ascii",
              "notes": [
                "vlan:ШПД-3350, IPTV-2160, TR-069-4040 "
              ]
            },
            {
              "id": "iscom_2128_2",
              "label": "только IPTV",
              "text": "ISCOM 2128\nтолько IPTV\ninterface port 3\nswitchport trunk native vlan 2160\nswitchport mode trunk\nswitchport protect\nmvr type receiver\nmvr immediate\npppoeagent enable\npppoeagent remote-id client-mac\npppoeagent remote-id format ascii",
              "notes": [
                "vlan:IPTV-2160"
              ]
            }
          ]
        },
        {
          "id": "iscom26xx",
          "name": "ISCOM26xx",
          "variants": [
            {
              "id": "iscom26xx_1",
              "label": "ШПД+IPTV",
              "text": "ISCOM26xx\nШПД+IPTV\ninterface gigaethernet 1/1/1\ndescription \"PPPoE + IPTV\"\nswitchport trunk native vlan 3350\nswitchport trunk allowed vlan 2160,4040 confirm\nswitchport mode trunk\nip dhcp snooping information option vlan-list 2160,4040\nno ip dhcp snooping\nip dhcp snooping vlan 2160,4040",
              "notes": [
                "vlan:ШПД-3350, IPTV-2160, TR-069-4040 "
              ]
            },
            {
              "id": "iscom26xx_2",
              "label": "только IPTV",
              "text": "ISCOM26xx\nтолько IPTV\ninterface gigaethernet 1/1/1\ndescription \"PPPoE + IPTV\"\nswitchport trunk native vlan 2160\nswitchport mode trunk\nip dhcp snooping information option vlan-list 2160\nno ip dhcp snooping\nip dhcp snooping vlan 2160",
              "notes": [
                "vlan:IPTV-2160"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Кемеровский Филиал (КмФ)",
      "notes": [],
      "equipment": [
        {
          "id": "mes_1124",
          "name": "MES 1124",
          "variants": [
            {
              "id": "mes_1124_1",
              "label": "ШПД+IPTV",
              "text": "MES 1124\nШПД+IPTV\ninterface fastethernet 1/0/2\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk allowed vlan add 662,4040\nswitchport trunk native vlan 134\nswitchport protected-port\nbridge multicast unregistered filtering\nspanning-tree disable\nspanning-tree portfast\nspanning-tree bpdu filtering\nswitchport forbidden default-vlan\nswitchport trunk multicast-tv vlan 802\npppoe intermediate-agent\nexit",
              "notes": [
                "vlan:ШПД-134, IPTV-662, TR-069-4040, Mcast-802 "
              ]
            },
            {
              "id": "mes_1124_2",
              "label": "только IPTV",
              "text": "MES 1124\nтолько IPTV\ninterface fastethernet 1/0/2\nloopback-detection enable\nswitchport mode trunk\nswitchport trunk native vlan 662\nswitchport protected-port\nbridge multicast unregistered filtering\nspanning-tree disable\nspanning-tree portfast\nspanning-tree bpdu filtering\nswitchport forbidden default-vlan\nswitchport trunk multicast-tv vlan 802\npppoe intermediate-agent\nexit",
              "notes": [
                "vlan:IPTV-662, Mcast-802"
              ]
            }
          ]
        },
        {
          "id": "mes_24",
          "name": "MES 24хх",
          "variants": [
            {
              "id": "mes_24_1",
              "label": "ШПД+IPTV",
              "text": "MES 24хх\nШПД+IPTV\ninterface gigabitethernet 0/7\ndescription \"661100580\"\ndcs agent-circuit-identifier \"::%i\"\ndcs remote-agent-identifier \"10.42.216.108::%p\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree portfast\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 672,4040\nswitchport general allowed vlan add 167 untagged\nswitchport general pvid 167\nswitchport multicast-tv vlan 842\nswitchport protected",
              "notes": [
                "vlan:ШПД-167, IPTV-672, TR-069-4040, Mcast-842 "
              ]
            },
            {
              "id": "mes_24_2",
              "label": "только IPTV",
              "text": "MES 24хх\nтолько IPTV\ninterface gigabitethernet 0/9\ndescription \"65354\"\ndcs agent-circuit-identifier \"%M::%i\"\ndcs remote-agent-identifier \"10.42.188.53::%p\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast level kbps 64\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree portfast\nspanning-tree disable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 18 untagged\nswitchport general pvid 18\nswitchport multicast-tv vlan 802\nswitchport protected",
              "notes": [
                "vlan:IPTV-18, Mcast-802 "
              ]
            }
          ]
        },
        {
          "id": "huawei_s2328",
          "name": "Huawei s2328",
          "variants": [
            {
              "id": "huawei_s2328_1",
              "label": "ШПД+IPTV",
              "text": "Huawei s2328\nШПД+IPTV\ninterface Ethernet0/0/19\ndescription 641102223\nport hybrid pvid vlan 101\nport hybrid tagged vlan 658 4040\nport hybrid untagged vlan 101 800\nmac-limit maximum 5\nloopback-detect recovery-time 60\nloopback-detect enable\nstp disable\nstp bpdu-filter enable\nport-isolate enable group 1",
              "notes": [
                "vlan:ШПД-101, IPTV-658, TR-069-4040, Mcast-800 "
              ]
            },
            {
              "id": "huawei_s2328_2",
              "label": "только IPTV",
              "text": "Huawei s2328\nтолько IPTV\ninterface Ethernet0/0/19\ndescription 641102223\nport hybrid pvid vlan 658\nport hybrid untagged vlan 658 800\nmac-limit maximum 5\nloopback-detect recovery-time 60\nloopback-detect enable\nstp disable\nstp bpdu-filter enable\nport-isolate enable group 1",
              "notes": [
                "vlan:IPTV-658, Mcast-800 "
              ]
            }
          ]
        },
        {
          "id": "qtech_2800",
          "name": "Qtech 2800",
          "variants": [
            {
              "id": "qtech_2800_1",
              "label": "ШПД+IPTV",
              "text": "Qtech 2800\nШПД+IPTV\nInterface Ethernet1/0/18\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 1299;4040 tag\nswitchport hybrid allowed vlan 2033 untag\nswitchport hybrid native vlan 2033\nswitchport association multicast-vlan 1297\npppoe intermediate-agent\nloopback-detection specified-vlan 1299;2033;4040\nloopback-detection control shutdown\nloopback-detection send packet number 2",
              "notes": [
                "vlan:ШПД-2033, IPTV-1299, TR-069-4040, Mcast-1297 "
              ]
            },
            {
              "id": "qtech_2800_2",
              "label": "только IPTV",
              "text": "Qtech 2800\nтолько IPTV\nInterface Ethernet1/0/18\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 1299 untag\nswitchport hybrid native vlan 1299\nswitchport association multicast-vlan 1297\npppoe intermediate-agent\nloopback-detection specified-vlan 1299;2033\nloopback-detection control shutdown\nloopback-detection send packet number 2",
              "notes": [
                "vlan:IPTV-1299, Mcast-1297 "
              ]
            }
          ]
        },
        {
          "id": "snr_s2940",
          "name": "SNR S2940",
          "variants": [
            {
              "id": "snr_s2940_1",
              "label": "ШПД+ТВ",
              "text": "SNR S2940\nШПД+ТВ\nInterface Ethernet1/4\ndescription 661100907\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 601 tag\nswitchport hybrid allowed vlan 101;800 untag\nswitchport hybrid native vlan 101\nswitchport association multicast-vlan 800\npppoe intermediate-agent\nigmp snooping drop query",
              "notes": [
                "vlan:ШПД-101, IPTV-601, Mcast-800 "
              ]
            }
          ]
        },
        {
          "id": "raisecom_2110",
          "name": "raisecom 2110",
          "variants": [
            {
              "id": "raisecom_2110_1",
              "label": "ШПД+ТВ",
              "text": "raisecom 2110\nШПД+ТВ\ninterface port 5\nswitchport trunk native vlan 860\nswitchport trunk allowed vlan 672,4040\nswitchport trunk untagged vlan 860\nswitchport mode trunk\nmac-address-table threshold 5\nswitchport protect\nip igmp filter 1\nip igmp max-groups action replace\nmvr type receiver\nmvr immediate\nlldp disable\npppoeagent enable\nswitchport port-security maximum 5",
              "notes": [
                "vlan:ШПД-860, IPTV-672, TR-069-4040"
              ]
            },
            {
              "id": "raisecom_2110_2",
              "label": "только ТВ",
              "text": "raisecom 2110\nтолько ТВ\ninterface port 5\nswitchport trunk native vlan 672\nswitchport trunk untagged vlan 672\nswitchport mode trunk\nmac-address-table threshold 5\nswitchport protect\nip igmp filter 1\nip igmp max-groups action replace\nmvr type receiver\nmvr immediate\nlldp disable\npppoeagent enable\nswitchport port-security maximum 5",
              "notes": [
                "vlan:IPTV-672"
              ]
            }
          ]
        },
        {
          "id": "d_link_des_3200",
          "name": "D-link DES-3200",
          "variants": [
            {
              "id": "d_link_des_3200_1",
              "label": "ШПД+IPTV",
              "text": "D-link DES-3200\nШПД+IPTV\nPort 17\nVLAN ID  Untagged  Tagged  Forbidden\n-------           --------       ------      ---------\n672                    -               X                -\n110                    X               -                -\n4040                   -              X                -",
              "notes": [
                "vlan:ШПД-110, IPTV-672, TR-069-4040"
              ]
            },
            {
              "id": "d_link_des_3200_2",
              "label": "только IPTV",
              "text": "D-link DES-3200\nтолько IPTV\nPort 17\nVLAN ID  Untagged  Tagged  Forbidden\n-------           --------       ------      ---------\n672                    X               -                -\n4040                   -              X                -",
              "notes": [
                "vlan:IPTV-672, TR-069-4040"
              ]
            }
          ]
        },
        {
          "id": "snr_s2950",
          "name": "SNR S2950",
          "variants": [
            {
              "id": "snr_s2950_1",
              "label": "только IPTV",
              "text": "SNR S2950\nтолько IPTV\nInterface Ethernet1/4\ndescription 661100907\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 601;800 untag\nswitchport hybrid native vlan 601\nswitchport association multicast-vlan 800\npppoe intermediate-agent\nigmp snooping drop query",
              "notes": [
                "vlan:IPTV-601, Mcast-800 "
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "branch",
      "name": "Омский Филиал (ОФ)",
      "notes": [
        "ВАЖНО: В Омске на IPTV указывается только мультикаст 999 ,на всех коммутах без исключения"
      ],
      "equipment": [
        {
          "id": "mes_1124",
          "name": "MES 1124",
          "variants": [
            {
              "id": "mes_1124_1",
              "label": "ШПД +ТВ, только IPTV",
              "text": "MES 1124\nШПД +ТВ, только IPTV\ninterface gigabitethernet 0/8\ndcs remote-agent-identifier \"%a8::%i\"\nstorm-control dlf level kbps 64\nstorm-control dlf action shutdown\nstorm-control broadcast level kbps 64\nstorm-control broadcast action shutdown\nstorm-control multicast action shutdown\nloopback-detection enable\nspanning-tree bpdu-receive disabled\nspanning-tree bpdu-transmit disabled\nswitchport general allowed vlan add 4040\nswitchport general allowed vlan add 1509 untagged\nswitchport general pvid 1509\nswitchport multicast-tv vlan 999\nswitchport protected\nno lldp transmit\nno lldp receive",
              "notes": [
                "vlan:ШПД-1509,TR-069-4040, Mcast-999 "
              ]
            }
          ]
        },
        {
          "id": "alstec_24",
          "name": "Alstec 24хх",
          "variants": [
            {
              "id": "alstec_24_1",
              "label": "ШПД+ТВ, только IPTV",
              "text": "Alstec 24хх\nШПД+ТВ, только IPTV\nvlan pvid 1923\nvlan participation exclude 1\nvlan participation include 999,1923,4040\nvlan tagging 4040\nspanning-tree bpdufilter\nswitchport protected 0\nstorm-control broadcast kbps 64\nstorm-control multicast kbps 64\nstorm-control unicast kbps 64\nloopback-detection\nset igmp\nset igmp fast-leave\nexit",
              "notes": [
                "vlan:ШПД-1923,TR-069-4040, Mcast-999 "
              ]
            }
          ]
        },
        {
          "id": "qtech_2800",
          "name": "Qtech 2800",
          "variants": [
            {
              "id": "qtech_2800_1",
              "label": "ШПД+ТВ, только IPTV",
              "text": "Qtech 2800\nШПД+ТВ, только IPTV\nstorm-control broadcast 64\nstorm-control multicast 64\nstorm-control unicast 64\nlldp disable\nswitchport mode hybrid\nswitchport hybrid allowed vlan 4040 tag\nswitchport hybrid allowed vlan 1716 untag\nswitchport hybrid native vlan 1716\nswitchport association multicast-vlan 999\npppoe intermediate-agent\npppoe intermediate-agent remote-id 10.55.81.73::4\nloopback-detection specified-vlan 1716\nloopback-detection control shutdown\nigmp snooping drop query",
              "notes": [
                "vlan:ШПД-1716,TR-069-4040, Mcast-999 "
              ]
            }
          ]
        },
        {
          "id": "mes_23xx",
          "name": "MES 23xx",
          "variants": [
            {
              "id": "mes_23xx_1",
              "label": "ШПД+IPTV, только IPTV",
              "text": "MES 23xx\nШПД+IPTV, только IPTV\ninterface gigabitethernet 1/0/1\npower inline never\nswitchport mode trunk\nswitchport trunk allowed vlan add 4040\nswitchport protected-port\nswitchport trunk native vlan 1716\nstorm-control broadcast kbps 64 trap\nstorm-control unicast   kbps 64 trap\nstorm-control multicast kbps 64 trap\npppoe intermediate-agent\nloopback-detection enable\nswitchport trunk multicast-tv vlan 999\nbridge multicast unregistered filtering\nspanning-tree disable\nspanning-tree bpdu filtering\nno lldp transmit\nno lldp receive\nexit",
              "notes": [
                "vlan:ШПД-1716,TR-069-4040, Mcast-999 "
              ]
            }
          ]
        }
      ]
    }
  ]
};