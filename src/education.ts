import type { LayerNumber } from "./data";
export type { LayerNumber } from "./data";
export type Scenario = {
  title: string;
  normal: string;
  anomaly: string;
  evidence: string[];
  problem: string;
  investigation: string[];
  mitigation: string[];
  tools: string[];
  falsePositives: string;
  limits: string;
};
export type Lesson = {
  n: LayerNumber;
  name: string;
  pdu: string;
  purpose: string;
  process: string;
  devices: string[];
  observe: string[];
  example: string;
  scope: string;
  topology: string;
  scenario: Scenario;
};
export const lessons: Lesson[] = [
  {
    n: 1,
    name: "Física",
    pdu: "Bits y símbolos",
    purpose:
      "Representa y transmite bits mediante señales eléctricas, ópticas o de radio sobre un medio. Define características físicas y de señalización; no interpreta MAC, IP ni aplicaciones.",
    process:
      "El PHY (transceptor físico) convierte la representación de bits de la capa MAC a símbolos y señales, sincroniza y recupera la señal en recepción. Codificación, modulación, velocidad, alcance y negociación dependen del estándar PHY y del medio.",
    devices: [
      "PHY de la NIC",
      "Cable de cobre",
      "Transceptor óptico",
      "Radio de un access point",
      "Repetidor",
    ],
    observe: [
      "Estado y velocidad del enlace",
      "Potencia óptica y SNR",
      "Errores y desconexiones",
    ],
    example:
      "Un cable dañado puede provocar caídas del enlace aunque la dirección IP sea correcta.",
    scope:
      "Por enlace físico. Cada tramo usa su propio medio; no existe un único cable entre cliente y servidor.",
    topology: "Señales en cada enlace · cobre, fibra o radio",
    scenario: {
      title: "Interferencia y pérdida de señal",
      normal:
        "Una estación Wi-Fi permanece asociada al punto de acceso, con señal y errores de recepción dentro de su línea base.",
      anomaly:
        "La estación pierde y recupera asociación 8 veces en 5 minutos; cae el SNR y aumentan los errores de recepción del radio.",
      evidence: [
        "21:01 station disassociated → associated (8 eventos / 5 min)",
        "Radio RX FCS errors: 0 → 240; SNR: 32 dB → 9 dB",
      ],
      problem:
        "Interferencia, canal congestionado, potencia, antena o driver pueden degradar disponibilidad. Estos síntomas no demuestran interferencia deliberada.",
      investigation: [
        "Correlaciona los eventos del cliente y AP con el canal, ancho, potencia y cambios de radio recientes.",
        "Compara SNR y contadores por estación con otras estaciones y con la línea base del canal; revisa driver y entorno RF.",
      ],
      mitigation: [
        "Corrige el canal o la cobertura según una medición controlada; actualiza firmware/driver si la evidencia lo justifica.",
        "Protege el acceso físico al AP y registra cambios de configuración y eventos de asociación.",
      ],
      tools: ["Contadores PHY/NIC y SNMP", "Diagnóstico de cableado/óptica", "Analizador Wi-Fi para radio"],
      falsePositives: "Errores de contador pueden reiniciarse tras reinicios; interferencia, congestión o negociación de velocidad no implican sabotaje.",
      limits: "Wireshark, Zeek y Suricata observan paquetes, no miden directamente potencia óptica, SNR ni integridad física del medio.",
    },
  },
  {
    n: 2,
    name: "Enlace",
    pdu: "Trama",
    purpose:
      "Entrega datos entre vecinos del mismo enlace. La dirección MAC identifica interfaces locales, como el destinatario dentro de un edificio.",
    process:
      "La MAC forma y procesa tramas; la PHY de Ethernet transmite sus bits como señales. Un switch aprende MAC de origen y reenvía por VLAN según su tabla. FCS detecta corrupción de trama, no autentica al emisor. ARP resuelve IPv4 local directamente sobre el enlace.",
    devices: [
      "NIC",
      "Switch",
      "Bridge",
      "Access point (puente)",
      "Interfaces del router",
    ],
    observe: [
      "MAC origen y destino",
      "EtherType, VLAN y FCS",
      "Tabla MAC y caché ARP",
    ],
    example:
      "Para llegar a un servidor remoto, el cliente envía la trama a la MAC del gateway, no a la MAC del servidor.",
    scope:
      "Por salto de enlace. Un router retira la trama entrante y crea otra para el siguiente enlace.",
    topology: "Trama local → switch → gateway · MAC por enlace",
    scenario: {
      title: "ARP spoofing",
      normal: "192.168.1.1 se asocia de forma estable a 02:42:ac:11:00:01.",
      anomaly: "La IP del gateway aparece de pronto anunciada por otra MAC.",
      evidence: [
        "ARP reply: 192.168.1.1 is-at 02:42:ac:11:00:99",
        "La caché cambia de :01 a :99 sin mantenimiento previsto",
      ],
      problem:
        "ARP no autentica las asociaciones. Una respuesta falsa puede desviar tráfico; un cambio legítimo por redundancia también es posible.",
      investigation: [
        "Compara la MAC con inventario, redundancia y cambios autorizados.",
        "Localiza su puerto de switch y correlaciona respuestas ARP repetidas.",
      ],
      mitigation: [
        "Usa Dynamic ARP Inspection con bindings fiables y DHCP snooping donde proceda.",
        "Segmenta la red y controla acceso a puertos; valida antes de aislar.",
      ],
      tools: ["Wireshark: arp", "tcpdump -e arp", "Tabla MAC/ARP y logs del switch", "Suricata solo con reglas habilitadas y tráfico visible"],
      falsePositives: "Failover de gateway, NIC teaming, cambios de VM o cachés vencidas pueden cambiar IP-MAC legítimamente.",
      limits: "La captura debe estar en el dominio de broadcast correcto. Un IDS no alerta por toda respuesta ARP sin regla, sensor y topología adecuados.",
    },
  },
  {
    n: 3,
    name: "Red",
    pdu: "Paquete",
    purpose:
      "Lleva paquetes entre redes mediante direcciones lógicas y rutas, como una guía de carreteras entre ciudades.",
    process:
      "El host compara el destino con sus prefijos y elige ruta/siguiente salto. Cada router reenvía por tabla de prefijos, reduce TTL IPv4 o Hop Limit IPv6 y crea una nueva trama de enlace. ICMP informa errores y diagnóstico; no usa puertos. IPv6 usa NDP/ICMPv6, no ARP.",
    devices: [
      "Router",
      "Switch de capa 3",
      "Firewall con funciones IP",
      "Hosts con pila IP",
    ],
    observe: [
      "IP origen y destino",
      "TTL / Hop Limit",
      "Rutas, ICMP y fragmentación",
    ],
    example:
      "Un paquete IPv4 con TTL 64 sale del primer router con TTL 63 y una nueva cabecera de enlace.",
    scope:
      "Direccionamiento entre extremos y reenvío por salto. Aquí se supone una ruta sin NAT; con NAT algunas direcciones cambian.",
    topology: "Router: consulta de ruta · TTL 64 → 63",
    scenario: {
      title: "IP spoofing",
      normal:
        "En la interfaz de Internet llegan fuentes coherentes con su zona y rutas.",
      anomaly:
        "Un paquete que entra desde Internet declara origen privado 192.168.1.10.",
      evidence: [
        "Interfaz WAN · src=192.168.1.10 dst=203.0.113.10",
        "Regla de validación de origen: origen inesperado en esta zona",
      ],
      problem:
        "IP no prueba la identidad del remitente. Una fuente imposible para la interfaz sugiere suplantación o configuración errónea.",
      investigation: [
        "Valida interfaz, túneles y rutas antes de concluir suplantación.",
        "Correlaciona flujos, ACL y registros del proveedor.",
      ],
      mitigation: [
        "Aplica filtrado de ingreso y egreso por zona.",
        "Evalúa uRPF según la simetría de rutas y conserva telemetría.",
      ],
      tools: ["Wireshark: ip.src == 192.168.1.10 || ipv6 || icmp", "tcpdump", "Logs ACL/firewall", "NetFlow/IPFIX", "Zeek conn.log con sensor en ruta"],
      falsePositives: "NAT, VPN, relay, redes privadas legítimas o rutas asimétricas pueden explicar direcciones o saltos inesperados.",
      limits: "Un sensor ve solo su segmento; cifrado de túnel y muestreo de flujos limitan atribución. Anomalía de origen no identifica por sí sola al atacante.",
    },
  },
  {
    n: 4,
    name: "Transporte",
    pdu: "Segmento TCP / datagrama UDP",
    purpose:
      "Multiplexa comunicación entre procesos mediante puertos. TCP ofrece un flujo fiable y ordenado con control de flujo/congestión; UDP aporta datagramas mínimos sin garantía de entrega u orden.",
    process:
      "TCP establece estado con SYN, SYN-ACK y ACK, numera bytes, confirma rangos y retransmite pérdidas. UDP lleva puertos, longitud y checksum. QUIC es un transporte sobre UDP que gestiona streams, pérdidas y congestión e integra TLS 1.3; no es simplemente otra cabecera UDP.",
    devices: [
      "Pila de transporte del cliente",
      "Servidor",
      "Firewall con estado",
      "Balanceador que termina conexiones",
    ],
    observe: [
      "Puertos y cinco tuplas",
      "Flags TCP, secuencias y ACK",
      "Retransmisiones, RTT y volúmenes",
    ],
    example:
      "52344 → 443 distingue el proceso cliente del servicio HTTPS. Un puerto no garantiza qué aplicación se está usando.",
    scope:
      "Extremo a extremo. Un router de tránsito no termina TCP; un firewall puede inspeccionar puertos sin ser el extremo.",
    topology: "Puertos 52344 → 443 · transporte entre extremos",
    scenario: {
      title: "SYN flood",
      normal: "La mayoría de los SYN completa SYN → SYN-ACK → ACK.",
      anomaly:
        "Se acumulan conexiones a medio abrir y pocos ACK completan el intercambio.",
      evidence: [
        "Ventana 60 s: 10000 SYN; 120 ACK finales",
        "Servidor: aumento de SYN_RECV y latencia",
      ],
      problem:
        "El agotamiento de recursos de establecimiento puede impedir conexiones legítimas. Una pérdida severa también produce intercambios incompletos.",
      investigation: [
        "Compara tasa y proporción con la línea base y pérdidas de red.",
        "Correlaciona estado del servidor, distribución de fuentes y métricas del servicio.",
      ],
      mitigation: [
        "Habilita SYN cookies y límites adecuados al servicio.",
        "Coordina filtrado y protección DDoS aguas arriba cuando el enlace se satura.",
      ],
      tools: ["Wireshark: tcp.flags.syn == 1 && tcp.flags.ack == 0", "Wireshark: tcp.analysis.retransmission", "tcpdump", "ss/netstat y métricas del servidor", "Suricata con reglas activas", "NetFlow/IPFIX"],
      falsePositives: "Pérdida, RTT alto, balanceadores, NAT o clientes que abandonan conexiones pueden producir SYN incompletos.",
      limits: "Capturas asimétricas o con pérdida distorsionan handshake y retransmisiones; SYN altos no prueban agotamiento malicioso.",
    },
  },
  {
    n: 5,
    name: "Sesión",
    pdu: "Datos (contexto de sesión)",
    purpose:
      "El modelo OSI describe funciones para iniciar, mantener, sincronizar, recuperar y cerrar diálogos lógicos. Es una categoría conceptual; las pilas TCP/IP modernas no implementan una capa 5 general e independiente.",
    process:
      "Aplicaciones, RPC, SMB o protocolos de autenticación mantienen contexto, estado, checkpoints o tokens. Una sesión lógica puede durar más que una conexión TCP, pero TCP handshake/cierre pertenecen a transporte y no demuestran una sesión OSI.",
    devices: [
      "Cliente de aplicación",
      "Servidor de sesiones",
      "Gateway de autenticación",
    ],
    observe: [
      "ID de sesión en registros autorizados",
      "Inicio, renovación y cierre",
      "Identidad, expiración y concurrencia",
    ],
    example:
      "Una sesión SMB mantiene contexto autenticado; una llamada RPC relaciona petición y respuesta.",
    scope:
      "Funciones entre extremos. TCP/IP no tiene una capa de sesión independiente; RPC y SMB son protocolos de aplicación que realizan estas funciones.",
    topology: "Contexto de conversación en cliente y servidor",
    scenario: {
      title: "Abuso de sesiones",
      normal: "Una sesión autenticada tiene renovaciones y orígenes esperados.",
      anomaly:
        "La misma sesión se utiliza simultáneamente desde dos contextos incompatibles.",
      evidence: [
        "session_hash=demo-7 · dos dispositivos en 30 s",
        "Uso de sesión después del cierre registrado",
      ],
      problem:
        "Un token robado o una invalidación incompleta permiten reutilización. VPN o proxies pueden explicar cambios de IP.",
      investigation: [
        "Correlaciona identidad, dispositivo, renovación y cierre en logs de aplicación.",
        "Comprueba proxies y evita registrar tokens completos.",
      ],
      mitigation: [
        "Revoca las sesiones comprometidas y exige nueva autenticación.",
        "Aplica expiración, rotación y controles de cookies; refuerza MFA.",
      ],
      tools: ["Logs de identidad/aplicación", "Wazuh/SIEM con reglas y fuentes conectadas", "Telemetría EDR", "Registros de proxy/VPN"],
      falsePositives: "NAT, roaming, VPN, proxies o renovación de tokens pueden cambiar origen y concurrencia aparentes.",
      limits: "No existe una captura universal de capa 5: se necesita contexto del protocolo de aplicación. No almacenar secretos de sesión en logs.",
    },
  },
  {
    n: 6,
    name: "Presentación",
    pdu: "Datos representados / protegidos",
    purpose:
      "El modelo OSI agrupa representación, conversión de formatos, codificación, compresión y protección criptográfica. En TCP/IP son funciones distribuidas en formatos, bibliotecas y protocolos, no una capa 6 universal.",
    process:
      "El emisor serializa/codifica o comprime; el receptor valida y transforma. TLS cifra y autentica registros como protocolo de seguridad entre aplicación y transporte (o se integra con QUIC); UTF-8 y JPEG son formatos/estándares, no protocolos de red.",
    devices: [
      "Biblioteca criptográfica del cliente",
      "Servidor TLS",
      "Proxy que termina TLS",
      "Serializador de aplicación",
    ],
    observe: [
      "Formato y codificación",
      "Parámetros TLS y certificado",
      "Errores de decodificación y tamaños",
    ],
    example:
      "El texto se codifica en UTF-8 antes de transmitirse. Con TLS, un sensor pasivo ve registros cifrados, no el HTTP interior.",
    scope:
      "Agrupación conceptual OSI. TLS, ASN.1, UTF-8 y JPEG no son todos protocolos de una capa 6 real; estas funciones viven en aplicaciones y bibliotecas.",
    topology: "Formato y protección en los extremos TLS",
    scenario: {
      title: "Configuración criptográfica insegura",
      normal:
        "El servicio negocia versiones permitidas y el cliente valida identidad y cadena del certificado.",
      anomaly:
        "Un servicio heredado acepta TLS 1.0 y presenta un certificado expirado.",
      evidence: [
        "Inventario autorizado: TLS 1.0 aceptado",
        "Validación: certificado fuera de su intervalo de validez",
      ],
      problem:
        "Protocolos obsoletos y fallos de validación debilitan la protección. El cifrado por sí solo no autentica correctamente al servidor.",
      investigation: [
        "Verifica fecha del sistema, hostname, cadena y política criptográfica.",
        "Identifica terminadores TLS y clientes heredados con pruebas autorizadas.",
      ],
      mitigation: [
        "Deshabilita versiones obsoletas y renueva certificados con seguimiento.",
        "Aplica una política actual de TLS y pruebas de compatibilidad; no omitas validación.",
      ],
      tools: ["Wireshark: tls.handshake.type == 1 || tls.record", "OpenSSL s_client y escáner TLS autorizado", "Logs del terminador TLS", "Wazuh/SIEM con fuentes/reglas configuradas para certificados y cambios"],
      falsePositives: "Certificados expirados pueden deberse a reloj incorrecto; inspección corporativa autorizada puede presentar una CA intermedia propia.",
      limits: "Una captura pasiva no revela contenido TLS protegido. ECH puede ocultar SNI; inventarios solo cubren endpoints sondeados.",
    },
  },
  {
    n: 7,
    name: "Aplicación",
    pdu: "Mensaje / datos",
    purpose:
      "Proporciona servicios y semántica de red a los programas: HTTP, DNS, DHCP, correo, administración y compartición de archivos. Es la capa OSI más cercana a las aplicaciones; no equivale a una aplicación gráfica concreta.",
    process:
      "Cliente y servicio interpretan mensajes, operaciones, estados y errores. HTTP utiliza métodos/códigos; DNS consulta registros; DHCP negocia configuración sobre UDP. DNS y DHCP son protocolos de aplicación aunque empleen broadcasts o transportes distintos.",
    devices: [
      "Navegador o cliente",
      "Servidor web / DNS / correo",
      "Proxy de aplicación",
      "WAF",
    ],
    observe: [
      "Métodos, rutas y estados HTTP",
      "Consultas y respuestas DNS",
      "Autenticaciones y logs de servicio",
    ],
    example:
      "DNS resuelve example.com; después HTTP solicita un recurso. Son conversaciones diferentes, no una única función de red.",
    scope:
      "Entre procesos de aplicación. El contenido cifrado requiere telemetría del endpoint o terminación autorizada para inspeccionarse.",
    topology: "Mensajes HTTP / DNS en cliente y servicio",
    scenario: {
      title: "Posible DNS tunneling",
      normal:
        "El cliente consulta nombres habituales con tamaños y frecuencias acordes a su actividad.",
      anomaly:
        "Un equipo consulta repetidamente subdominios muy largos de un dominio recién visto.",
      evidence: [
        "Host demo: 600 consultas/min a *.demo.example",
        "Etiquetas largas, alta diversidad y muchas respuestas NXDOMAIN",
      ],
      problem:
        "DNS puede transportar datos encubiertos. CDN, antivirus y telemetría legítima también generan nombres variados; la entropía no basta.",
      investigation: [
        "Correlaciona longitud, frecuencia, tipos de registro y dominio con la línea base.",
        "Identifica el proceso en el endpoint y revisa respuestas y contexto del dominio.",
      ],
      mitigation: [
        "Restringe resolución a resolvedores autorizados y registra consultas.",
        "Bloquea destinos confirmados e investiga el host; ajusta alertas para reducir falsos positivos.",
      ],
      tools: ["Wireshark: dns.qry.name || http.request", "Zeek dns.log y conn.log con tráfico DNS observable", "Suricata con reglas activas y datasets", "Logs DNS/firewall y SIEM", "Wazuh para logs de endpoints conectados"],
      falsePositives: "CDN, EDR, telemetría y actualizadores pueden producir dominios largos, alta frecuencia o muchos NXDOMAIN.",
      limits: "DoH/DoT/QUIC, TLS y falta de logs reducen visibilidad. Zeek/Suricata requieren tráfico observable, configuración y reglas apropiadas; alertas necesitan triage.",
    },
  },
];
export const lessonFor = (n: number): Lesson =>
  lessons.find((l) => l.n === n) ?? lessons[3];
export type Technology = {
  id: string;
  name: string;
  layers: LayerNumber[];
  kind: "Protocolo" | "Estándar" | "Tecnología" | "Función";
  summary: string;
  caveat: string;
  standards: string[];
  operation: string;
  security: string;
  simulation?: string;
};
const tech = (
  id: string,
  name: string,
  layers: LayerNumber[],
  kind: Technology["kind"],
  summary: string,
  caveat = "",
  simulation?: string,
): Omit<Technology, "standards" | "operation" | "security"> => ({ id, name, layers, kind, summary, caveat, simulation });
const technologyDefinitions: Omit<Technology, "standards" | "operation" | "security">[] = [
  tech(
    "phy",
    "Ethernet PHY",
    [1],
    "Estándar",
    "Codificación, señalización y medios físicos de IEEE 802.3.",
  ),
  tech(
    "100base",
    "100BASE-TX",
    [1],
    "Estándar",
    "Ethernet a 100 Mb/s sobre dos pares de cobre.",
  ),
  tech(
    "1000base",
    "1000BASE-T",
    [1],
    "Estándar",
    "Ethernet a 1 Gb/s sobre cuatro pares de cobre.",
  ),
  tech(
    "fiber",
    "Fibra óptica",
    [1],
    "Tecnología",
    "Guía pulsos de luz; distancia y velocidad dependen del transceptor y estándar.",
  ),
  tech(
    "wifi",
    "Wi-Fi PHY / MAC",
    [1, 2],
    "Estándar",
    "IEEE 802.11 define radio y acceso al medio.",
    "Wi-Fi abarca funciones físicas y de enlace.",
  ),
  tech(
    "ethernet",
    "Ethernet MAC",
    [2],
    "Estándar",
    "Tramas, direcciones MAC y control de acceso al medio.",
  ),
  tech(
    "arp",
    "ARP",
    [2, 3],
    "Protocolo",
    "Resuelve direcciones IPv4 a MAC de vecinos locales.",
    "Relaciona red y enlace; se transporta directamente en tramas, no dentro de IP.",
    "arp",
  ),
  tech(
    "vlan",
    "VLAN 802.1Q",
    [2],
    "Estándar",
    "Etiquetas que distinguen redes lógicas en enlaces Ethernet.",
  ),
  tech(
    "stp",
    "STP",
    [2],
    "Protocolo",
    "Evita bucles en una topología de puentes bloqueando caminos redundantes.",
  ),
  tech(
    "lldp",
    "LLDP",
    [2],
    "Protocolo",
    "Anuncia identidad y capacidades a vecinos de enlace.",
  ),
  tech(
    "ppp",
    "PPP",
    [2],
    "Protocolo",
    "Encapsula protocolos de red en enlaces punto a punto.",
  ),
  tech(
    "ip",
    "IPv4",
    [3],
    "Protocolo",
    "Direcciones de 32 bits y entrega de paquetes de mejor esfuerzo.",
    "",
    "ip",
  ),
  tech(
    "ipv6",
    "IPv6",
    [3],
    "Protocolo",
    "Direcciones de 128 bits; Hop Limit y descubrimiento de vecinos mediante ICMPv6.",
  ),
  tech(
    "ndp",
    "Neighbor Discovery (NDP)",
    [2, 3],
    "Protocolo",
    "ICMPv6 Neighbor Solicitation/Advertisement resuelve vecinos, descubre routers y verifica alcanzabilidad en el enlace IPv6.",
    "No es ARP para IPv6: también cubre Router Discovery, Duplicate Address Detection y Neighbor Unreachability Detection. RFC 4861; seguridad adicional en RFC 3971/9099.",
  ),
  tech(
    "icmp",
    "ICMP",
    [3],
    "Protocolo",
    "Control y diagnóstico de IP; no utiliza puertos TCP/UDP.",
    "",
    "icmp",
  ),
  tech(
    "ipsec",
    "IPsec",
    [3],
    "Tecnología",
    "AH/ESP y asociaciones de seguridad protegen tráfico IP.",
    "La negociación IKE utiliza UDP; el conjunto abarca varios mecanismos.",
  ),
  tech(
    "ospf",
    "OSPF",
    [3],
    "Protocolo",
    "Intercambia estado de enlaces y calcula rutas dentro de un sistema autónomo.",
  ),
  tech(
    "bgp",
    "BGP-4",
    [3, 4, 7],
    "Protocolo",
    "Intercambia alcanzabilidad IP y atributos entre sistemas autónomos mediante sesiones TCP, normalmente puerto 179; la selección de ruta incorpora políticas.",
    "Protocolo de enrutamiento entre dominios (RFC 4271), no protocolo de transporte. RFC 8212 requiere política explícita de importación/exportación para eBGP.",
  ),
  tech(
    "tcp",
    "TCP",
    [4],
    "Protocolo",
    "Flujo fiable y ordenado de bytes con control de flujo y congestión.",
    "",
    "tcp",
  ),
  tech(
    "udp",
    "UDP",
    [4],
    "Protocolo",
    "Datagramas con puertos sin garantizar orden o entrega.",
    "",
    "udp",
  ),
  tech(
    "sctp",
    "SCTP",
    [4],
    "Protocolo",
    "Transporte de mensajes con múltiples flujos y soporte multihoming.",
  ),
  tech(
    "quic",
    "QUIC",
    [4, 6],
    "Protocolo",
    "Transporte seguro multiplexado sobre UDP con TLS 1.3 integrado.",
    "Integra funciones de seguridad y gestión de conexión; no usa registros TLS como TLS sobre TCP.",
    "quic",
  ),
  tech(
    "rpc",
    "RPC",
    [5, 7],
    "Tecnología",
    "Invocación de procedimientos remotos y correlación de llamadas.",
    "Es una familia de mecanismos de aplicación; aquí ilustra coordinación de conversaciones.",
  ),
  tech(
    "smb",
    "Sesiones SMB",
    [5, 7],
    "Protocolo",
    "Contexto autenticado para acceder a recursos compartidos.",
    "SMB es de aplicación; su gestión de sesiones ilustra funciones OSI 5.",
  ),
  tech(
    "tls",
    "TLS 1.3",
    [4, 6, 7],
    "Protocolo",
    "Autentica y cifra intercambios mediante claves y registros protegidos.",
    "Su asociación con presentación es didáctica, no una asignación rígida OSI.",
    "tls",
  ),
  tech(
    "asn1",
    "ASN.1",
    [6],
    "Estándar",
    "Notación de estructuras de datos; BER/DER son reglas de codificación.",
  ),
  tech(
    "utf8",
    "UTF-8",
    [6],
    "Estándar",
    "Codificación de caracteres Unicode en secuencias de bytes.",
    "No es un protocolo de transporte.",
  ),
  tech(
    "jpeg",
    "JPEG",
    [6],
    "Estándar",
    "Compresión y representación de imágenes.",
    "Es un formato y conjunto de técnicas, no un protocolo de red.",
  ),
  tech(
    "http",
    "HTTP",
    [7],
    "Protocolo",
    "Mensajes de petición y respuesta para recursos web.",
    "",
    "http",
  ),
  tech(
    "https",
    "HTTPS",
    [6, 7],
    "Tecnología",
    "HTTP protegido mediante TLS; en HTTP/3 la protección se integra en QUIC.",
    "La simulación muestra HTTP sobre TLS sobre TCP.",
    "https",
  ),
  tech(
    "dns",
    "DNS",
    [7],
    "Protocolo",
    "Consultas de registros de nombres, mediante UDP/TCP y variantes cifradas.",
    "",
    "dns",
  ),
  tech(
    "dhcp",
    "DHCP",
    [7],
    "Protocolo",
    "Distribuye configuración IP; usar broadcast no lo convierte en protocolo de enlace.",
    "",
    "dhcp",
  ),
  tech(
    "ntp",
    "NTPv4",
    [4, 7],
    "Protocolo",
    "Sincroniza relojes mediante intercambios de cuatro timestamps; suele usar UDP/123. La hora coherente permite correlacionar logs y eventos Blue Team.",
    "RFC 5905 con actualizaciones posteriores; NTS (RFC 8915) añade autenticación basada en TLS. Servidores abiertos pueden ser abusados para amplificación; restringe pares y supervisa offsets/stratum.",
  ),
  tech(
    "snmp",
    "SNMPv3",
    [4, 7],
    "Protocolo",
    "Gestiona dispositivos mediante solicitudes/respuestas y notificaciones; normalmente UDP/161 para agentes y UDP/162 para traps/informs.",
    "RFC 3411/3414/3415 definen arquitectura, USM y control de acceso. SNMPv1/v2c usan communities sin protección criptográfica; preferir SNMPv3 authPriv y restringir plano de gestión.",
  ),
  tech(
    "radius",
    "RADIUS",
    [4, 7],
    "Protocolo",
    "Centraliza autenticación, autorización y accounting (AAA) entre NAS y servidor; RADIUS/UDP usa habitualmente 1812 y 1813.",
    "RFC 2865/2866 describen RADIUS tradicional. RFC 9765 define RADIUS/1.1 experimental sobre TLS/DTLS con ALPN; no asumir que despliegues UDP históricos cifran todo el contenido.",
  ),
  tech(
    "smtp",
    "SMTP",
    [7],
    "Protocolo",
    "Envía y retransmite correo electrónico.",
  ),
  tech(
    "imap",
    "IMAP",
    [7],
    "Protocolo",
    "Accede y sincroniza buzones de correo.",
  ),
  tech(
    "ftp",
    "FTP",
    [7],
    "Protocolo",
    "Transfiere archivos con conexiones de control y datos.",
    "FTP básico no cifra el contenido; no confundir con SFTP.",
  ),
  tech(
    "ssh",
    "SSH",
    [5, 6, 7],
    "Protocolo",
    "Administración remota con autenticación y canales protegidos.",
    "Es de aplicación e integra funciones de sesión y cifrado.",
    "ssh",
  ),
  tech(
    "mqtt",
    "MQTT",
    [7],
    "Protocolo",
    "Publicación/suscripción de mensajes mediante un broker.",
  ),
  tech(
    "wireguard",
    "WireGuard",
    [3, 4],
    "Tecnología",
    "Túnel VPN de capa IP que transporta paquetes IP encapsulados en UDP y usa claves públicas para identificar pares.",
    "No tiene RFC de protocolo IETF; consultar la especificación oficial del proyecto. Protege el contenido del túnel, pero claves, AllowedIPs, endpoint y rutas requieren gestión segura.",
  ),
];

const technologyAudit: Record<string, Pick<Technology, "standards" | "operation" | "security">> = {
  phy: { standards: ["IEEE 802.3-2022 (PHYs según medio)"], operation: "El transceptor codifica/modula símbolos en señales y negocia/enmarca parámetros de enlace según el PHY.", security: "La evidencia son contadores de enlace, potencia y estado físico; tampering o interferencia requieren correlación y comprobación física, pues no se ven en una captura IP." },
  "100base": { standards: ["IEEE 802.3 (100BASE-TX)"], operation: "100 Mb/s full duplex usa dos pares de cobre, uno por sentido; longitud y cableado dependen de la especificación y categoría.", security: "Errores, duplex mismatch o desconexiones pueden ser fallas físicas/configuración; verifica ambos extremos y protege tomas y armarios." },
  "1000base": { standards: ["IEEE 802.3 (1000BASE-T)"], operation: "1 Gb/s sobre cuatro pares de cobre balanceado; autonegociación y PHY determinan parámetros del enlace.", security: "CRC/errores y renegociación indican degradación posible, no ataque concluyente; correlaciona NIC y switch y revisa cableado." },
  fiber: { standards: ["IEEE 802.3 PHYs según óptica", "ITU-T G.652 (fibra monomodo cuando aplique)"], operation: "La fibra guía luz; longitud de onda, potencia, conectores y presupuesto óptico dependen de transceptor y clase de enlace.", security: "Revisa pérdida, potencia y cambios de patching. La intrusión física requiere monitoreo de instalaciones; la captura de paquetes no detecta taps de fibra de forma general." },
  wifi: { standards: ["IEEE 802.11 (edición y enmiendas aplicables)"], operation: "La MAC administra asociación/acceso al medio inalámbrico; PHY define radio, canales, modulación y tasas. La operación incluye tramas de gestión, control y datos.", security: "Rogue AP, desautenticación y credenciales débiles requieren captura de radio y controladores WLAN; WPA3/802.1X y monitoreo ayudan, con cobertura dependiente de sensores." },
  ethernet: { standards: ["IEEE 802.3-2022"], operation: "MAC crea tramas con direcciones, longitud/EtherType y FCS; PHY transmite bits/señales. El switch aprende origen y reenvía dentro de una VLAN.", security: "MAC spoofing, VLAN hopping por mala configuración y loops requieren tabla MAC, configuración y telemetría del switch; FCS detecta corrupción, no autenticidad." },
  arp: { standards: ["RFC 826"], operation: "ARP Request broadcast pregunta por un IPv4 vecino; Reply informa su MAC. Se encapsula en Ethernet y solo resuelve el siguiente salto local.", security: "ARP no autentica mapeos. Detecta cambios IP-MAC con captura/tabla ARP y valida failover; Dynamic ARP Inspection necesita bindings confiables." },
  vlan: { standards: ["IEEE 802.1Q"], operation: "El tag identifica VLAN y prioridad en tramas Ethernet; puertos access/trunk y configuración del switch determinan pertenencia y transporte.", security: "Trunks nativos/access mal configurados facilitan exposición; compara VLAN permitidas, cambios y MAC por puerto. Etiqueta no sustituye firewall ni segmentación L3." },
  stp: { standards: ["IEEE 802.1Q (bridged networks/STP family)"], operation: "Puentes intercambian BPDUs, eligen root bridge y bloquean rutas redundantes para evitar ciclos L2; RSTP acelera convergencia.", security: "Un root bridge inesperado o tormenta puede causar indisponibilidad. Correlaciona BPDUs y cambios de topología; BPDU Guard/Root Guard solo en puertos adecuados." },
  lldp: { standards: ["IEEE 802.1AB"], operation: "Anuncia identidad, puerto, capacidades y TTL a vecinos directos; no calcula rutas ni establece sesiones de aplicación.", security: "La información puede revelar inventario/topología. Revisa vecinos nuevos y limita anuncios en puertos no confiables conforme a política." },
  ppp: { standards: ["RFC 1661", "RFC 1662 (HDLC-like framing)"], operation: "LCP establece/configura el enlace y opciones; autenticación es opcional; NCP configura protocolos de red como IP.", security: "PAP expone credenciales si se usa sin túnel; CHAP no reemplaza cifrado moderno. Usa autenticación robusta y protege el enlace." },
  ip: { standards: ["RFC 791", "RFC 6864 (IPv4 ID)"], operation: "Cabecera IPv4 lleva direcciones, Protocol, longitud, fragmentación y TTL; routers reenvían por prefijo y reducen TTL por salto.", security: "Spoofing y fragmentos ambiguos pueden evadir controles. Revisa ACL, fragmentación y flujos; aplica validación de origen sin tratar una anomalía aislada como compromiso." },
  ipv6: { standards: ["RFC 8200", "RFC 4443 (ICMPv6)"] , operation: "Direcciones de 128 bits, Hop Limit y extensiones; routers no fragmentan: el origen adapta tamaño mediante Path MTU Discovery. NDP configura vecinos y descubre routers.", security: "RA spoofing, extension-header evasions y mala filtración requieren logs IPv6 y controles equivalentes a IPv4; no omitas IPv6 en firewall/monitorización." },
  ndp: { standards: ["RFC 4861", "RFC 3971 / RFC 9099 (seguridad y operación IPv6)"] , operation: "ICMPv6 NS/NA resuelve vecinos y verifica alcanzabilidad; RS/RA descubren routers; DAD comprueba direcciones duplicadas.", security: "RA/NA falsos pueden redirigir tráfico. Inspecciona ICMPv6 y configura RA Guard/SEND cuando proceda; bloquear ICMPv6 indiscriminadamente rompe IPv6." },
  icmp: { standards: ["RFC 792 (ICMPv4)", "RFC 4443 (ICMPv6)"] , operation: "Mensajes de error y diagnóstico se encapsulan en IP; Echo es una utilidad, no el propósito completo. No usa puertos.", security: "Barridos y floods son señales contextuales. Correlaciona tipo/código, origen, tasa y motivo; permitir PMTUD y errores necesarios evita fallas operativas." },
  ipsec: { standards: ["RFC 4301 (arquitectura)", "RFC 4303 (ESP)", "RFC 7296 (IKEv2)"] , operation: "Políticas y asociaciones de seguridad aplican ESP/AH en modo transporte o túnel; IKE negocia claves, a menudo UDP/500 y NAT-T UDP/4500.", security: "Malas políticas, claves o pares autorizados amplían acceso; valida SA, identidad, rutas y logs. Un sensor exterior ve metadatos, no payload protegido." },
  ospf: { standards: ["RFC 2328 (OSPFv2)", "RFC 5340 (OSPFv3)"] , operation: "Hello forma adyacencias; routers sincronizan LSDB y ejecutan SPF. OSPF usa IP Protocol 89 directamente, no TCP ni UDP.", security: "Adyacencias/LSA inesperados pueden alterar rutas. Correlaciona vecinos, interfaces y cambios de LSDB; autentica y restringe peers según diseño." },
  bgp: { standards: ["RFC 4271", "RFC 8212 (políticas eBGP)"] , operation: "Peers establecen TCP/179; intercambian OPEN/KEEPALIVE y UPDATE (prefijos/atributos), o NOTIFICATION al terminar. BGP selecciona rutas por política/atributos entre AS; no es OSPF.", security: "Route leak/hijack y sesión no autorizada amenazan alcance. Vigila cambios de prefijos/AS_PATH y logs de peers; aplica filtros de import/export, RPKI donde aplique y gestión de sesión." },
  tcp: { standards: ["RFC 9293"], operation: "SYN/SYN-ACK/ACK abre; números de secuencia cuentan bytes, ACK confirma siguiente byte esperado; FIN cierra direcciones ordenadamente, RST aborta.", security: "SYN floods, escaneo y abuso de servicio se investigan con flags, tasas, retransmisiones y estado endpoint; pérdida y asimetría son falsos positivos posibles." },
  udp: { standards: ["RFC 768"], operation: "Datagrama con puertos, longitud y checksum; no hay handshake ni garantía de entrega, orden o deduplicación. La aplicación define respuestas y recuperación.", security: "Spoofing/amplificación dependen del servicio. Compara solicitud/respuesta, tasas y origen; limita resolvers/servicios y filtra fuentes en bordes." },
  sctp: { standards: ["RFC 9260"], operation: "Transporte de mensajes con streams y multihoming; INIT/INIT-ACK/COOKIE-ECHO/COOKIE-ACK mitigan asignación de estado por SYN simple.", security: "Inspecciona asociaciones, chunks y peers autorizados; reglas firewall/IDS deben decodificar SCTP explícitamente, no asumir TCP." },
  quic: { standards: ["RFC 9000", "RFC 9001", "RFC 9114 (HTTP/3)"] , operation: "QUIC ofrece streams, flow control, pérdida y migración sobre UDP; CRYPTO frames transportan handshake TLS 1.3 y packet protection protege datos/control.", security: "Cifrado limita inspección pasiva y 0-RTT permite replay en ciertas condiciones. Correlaciona endpoint, UDP, DNS y QUIC-aware telemetry; UDP/443 no prueba HTTP/3." },
  rpc: { standards: ["RFC 5531 (ONC RPC; otras familias varían)"] , operation: "Cliente invoca procedimiento remoto; XID correlaciona request/response. Transportes, serialización, autenticación y discovery dependen de la familia RPC.", security: "Exposición de servicios y abuso de métodos requieren inventario y logs de servidor; no aplicar un puerto o formato único a todas las implementaciones RPC." },
  smb: { standards: ["MS-SMB2 (Microsoft Open Specifications)"] , operation: "Negotiate, Session Setup, Tree Connect y Create/Read/Write gestionan dialecto, sesión, recurso y archivos; TCP/445 es común.", security: "Relay, credenciales débiles y lateral movement requieren event logs, firma/cifrado según riesgo y segmentación. La operación de sesión es función de SMB L7, no un protocolo OSI L5 separado." },
  tls: { standards: ["RFC 9846 (TLS 1.3)", "RFC 9325 (uso seguro)"] , operation: "ClientHello/ServerHello negocian; Certificate/CertificateVerify autentican servidor en el modo común; Finished verifica transcript; registros AEAD protegen datos. RFC 8446 fue reemplazado por RFC 9846.", security: "Valida nombre/cadena y política TLS; 0-RTT puede repetirse y el contenido es opaco a sensores pasivos. Usa logs de terminador/endpoint y conserva certificados/versiones." },
  asn1: { standards: ["ITU-T X.680 (ASN.1)", "ITU-T X.690 (BER/CER/DER)"] , operation: "Notación define estructura abstracta; BER/CER/DER definen codificación en bytes. ASN.1 aparece en varios protocolos, no es transporte.", security: "Validadores deben limitar tamaño/profundidad y rechazar codificación malformada; errores de parser pueden ser explotables." },
  utf8: { standards: ["RFC 3629"] , operation: "Codifica puntos de código Unicode en secuencias de bytes de longitud variable; no cifra ni define mensajes de red.", security: "Validación inconsistente y normalización pueden habilitar spoofing o fallos de parsing. Canonicaliza según el protocolo consumidor." },
  jpeg: { standards: ["ISO/IEC 10918-1 (JPEG)"], operation: "Representa/comprime imágenes; codificación y decodificación ocurren en aplicación, no como protocolo de red.", security: "Archivos malformados pueden explotar parsers; usa bibliotecas actualizadas y límites de tamaño/procesamiento." },
  http: { standards: ["RFC 9110 (semántica)", "RFC 9112 (HTTP/1.1)"] , operation: "Request contiene método, target/campos y contenido; response status/campos/contenido. HTTP/1.1 comúnmente usa TCP/80 sin TLS; otros perfiles usan otros transportes.", security: "Revisa métodos, rutas, host, status, auth y errores de parser; logs/WAF requieren reglas y contexto. TLS protege confidencialidad en tránsito." },
  https: { standards: ["RFC 9110", "RFC 9112", "RFC 9846"] , operation: "Composición HTTP más TLS; aquí HTTP/1.1 sobre TLS 1.3 sobre TCP, normalmente 443. HTTP/3 mapea semántica HTTP sobre QUIC.", security: "Verifica TLS en cliente/terminador; una captura pasiva no ve rutas/cabeceras cifradas sin claves autorizadas. Certificado presente no basta si hostname/trust fallan." },
  dns: { standards: ["RFC 1034", "RFC 1035", "RFC 7766 (DNS sobre TCP)"] , operation: "Consulta/respuesta con ID, flags, QNAME, QTYPE y RCODE. Stub pregunta a resolver; caché y recursión pueden evitar consultas autoritativas.", security: "Investiga QNAME, frecuencia, respuesta, NXDOMAIN y host. Tunneling requiere contexto; filtra resolvers y aplica DNSSEC para autenticidad cuando está desplegado." },
  dhcp: { standards: ["RFC 2131", "RFC 2132"] , operation: "DORA es asignación IPv4 inicial común; renovación/rebind/relay y concesiones existentes siguen otros intercambios. UDP/67 servidor y UDP/68 cliente.", security: "Rogue DHCP y starvation se investigan con server-ID, opciones, MAC y bindings; DHCP snooping y puertos confiables mitigan si la topología está configurada." },
  ntp: { standards: ["RFC 5905 (actualizado por RFC 9109/9748/9769)", "RFC 8915 (NTS)"] , operation: "Intercambia timestamps (cliente t1, servidor t2/t3, cliente t4) para estimar offset/delay; UDP/123 es habitual. NTS agrega autenticación TLS más NTP.", security: "Fuentes manipuladas afectan correlación y autenticación; revisa peer, stratum/offset y cambios. Restringe clientes y evita servidores reflectores abiertos." },
  snmp: { standards: ["RFC 3411", "RFC 3414 (USM)", "RFC 3415 (VACM)"] , operation: "Manager consulta GET/GETNEXT/GETBULK/SET a agente; traps/informs informan eventos. UDP/161 consultas y UDP/162 notificaciones son habituales.", security: "SNMPv1/v2c communities son exposición; prefiere v3 authPriv, ACL de gestión y vistas de mínimo privilegio. Traps no autenticados necesitan validación." },
  radius: { standards: ["RFC 2865 (autenticación)", "RFC 2866 (accounting)", "RFC 9765 (RADIUS/1.1 experimental)"] , operation: "NAS envía Access-Request; servidor responde Accept/Reject/Challenge. Accounting usa mensajes separados. UDP/1812 auth y UDP/1813 accounting son habituales.", security: "RADIUS/UDP tradicional no cifra todo el paquete; protege red y shared secrets. RADIUS/1.1 sobre TLS/DTLS requiere negociación explícita y RFC 9765 es Experimental." },
  smtp: { standards: ["RFC 5321", "RFC 6409 (submission)", "RFC 8314 (TLS para correo)"] , operation: "Cliente/relay intercambia EHLO, MAIL FROM, RCPT TO, DATA y respuestas SMTP; 25 relay, 587 submission y 465 TLS implícito son usos comunes.", security: "Abuso de relay, spoofing y phishing requieren logs, SPF/DKIM/DMARC y controles de cola. STARTTLS no significa que el correo almacenado esté cifrado end-to-end." },
  imap: { standards: ["RFC 9051 (IMAP4rev2)", "RFC 8314"] , operation: "Cliente se autentica, selecciona mailbox y emite comandos tagged FETCH/STORE/SEARCH/IDLE; TCP/143 o TLS implícito 993 son comunes.", security: "Credential stuffing y exfiltración de buzón se investigan con auditoría de identidad, IP, comandos/volumen y MFA; limita protocolos heredados." },
  ftp: { standards: ["RFC 959", "RFC 4217 (FTP sobre TLS)"] , operation: "Canal de control normalmente TCP/21 negocia comandos; canal de datos separado puede ser activo o pasivo y variar puertos.", security: "FTP clásico expone credenciales/datos y canales dinámicos; restringe o reemplaza por SFTP (SSH) o FTPS (FTP+TLS), que son tecnologías distintas." },
  ssh: { standards: ["RFC 4251", "RFC 4252", "RFC 4253", "RFC 4254"] , operation: "Identificación, KEXINIT/intercambio de claves, autenticación y canales multiplexados; TCP/22 es habitual.", security: "Fuerza bruta, host keys desconocidas y túneles no autorizados requieren logs y control de claves; limita origen, usa llaves protegidas/MFA y bastiones." },
  mqtt: { standards: ["OASIS MQTT Version 5.0"] , operation: "Cliente conecta al broker; CONNECT/CONNACK, SUBSCRIBE/PUBLISH y QoS controlan pub/sub. TCP/1883 y TLS/8883 son asignaciones habituales.", security: "ACL débiles exponen mensajes/dispositivos. Revisa identidad, topic, broker logs y TLS; una publicación inusual requiere validar función del dispositivo." },
  wireguard: { standards: ["Especificación oficial WireGuard (sin RFC IETF)"] , operation: "Handshake autenticado por claves públicas y transporte UDP; AllowedIPs dirige tráfico del peer a rutas criptográficas.", security: "Clave privada expuesta, AllowedIPs amplios y peers olvidados amplían acceso. Revisa configuración/rutas y logs del host; el túnel cifra el payload, no oculta todos los metadatos." },
};

export const technologies: Technology[] = technologyDefinitions.map((definition) => ({
  ...definition,
  ...technologyAudit[definition.id],
}));

export const relatedTechnologies = (n: number) =>
  technologies.filter((t) => t.layers.some((l) => l === n));
export const protocolLayers = (id: string, fallback: number): number[] =>
  technologies.find((t) => t.id === id)?.layers ?? [fallback];
