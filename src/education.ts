export type LayerNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Scenario = {
  title: string;
  normal: string;
  anomaly: string;
  evidence: string[];
  problem: string;
  investigation: string[];
  mitigation: string[];
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
      "Convierte bits en señales eléctricas, luz o radio. Es el camino por el que viaja el mensaje, como la carretera de un reparto.",
    process:
      "El transmisor codifica y modula señales; el receptor recupera símbolos y bits. El medio, la distancia y el ruido condicionan la comunicación.",
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
        "Enlace estable a 1 Gb/s, sin cambios de estado ni aumento sostenido de errores.",
      anomaly:
        "El enlace cae 8 veces en 5 minutos y aumenta el contador de errores.",
      evidence: [
        "21:01 link down → up (8 eventos / 5 min)",
        "CRC: 0 → 240; SNR cae respecto a su línea base",
      ],
      problem:
        "Ruido, conectores o transceptores defectuosos pueden degradar disponibilidad. Estos síntomas no demuestran un ataque.",
      investigation: [
        "Correlaciona errores de ambos extremos y cambios físicos recientes.",
        "Compara potencia/SNR con la especificación del medio; prueba un cable conocido.",
      ],
      mitigation: [
        "Sustituye el medio defectuoso y protege el acceso físico.",
        "Monitoriza cambios de enlace y separa cableado de fuentes de interferencia.",
      ],
    },
  },
  {
    n: 2,
    name: "Enlace",
    pdu: "Trama",
    purpose:
      "Entrega datos entre vecinos del mismo enlace. La dirección MAC identifica interfaces locales, como el destinatario dentro de un edificio.",
    process:
      "La NIC forma tramas. Un switch aprende MAC de origen y reenvía según su tabla. Ethernet comprueba errores con FCS; ARP resuelve vecinos IPv4.",
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
    },
  },
  {
    n: 3,
    name: "Red",
    pdu: "Paquete",
    purpose:
      "Lleva paquetes entre redes mediante direcciones lógicas y rutas, como una guía de carreteras entre ciudades.",
    process:
      "El host elige gateway. Cada router consulta una ruta por prefijo, reduce TTL o Hop Limit y construye la trama del siguiente enlace.",
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
    },
  },
  {
    n: 4,
    name: "Transporte",
    pdu: "Segmento TCP / datagrama UDP",
    purpose:
      "Entrega datos a procesos mediante puertos. TCP añade orden y recuperación; UDP envía datagramas sin esas garantías.",
    process:
      "Los extremos multiplexan conversaciones. TCP confirma bytes y regula flujo/congestión; UDP usa una cabecera mínima. QUIC implementa transporte seguro sobre UDP.",
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
    },
  },
  {
    n: 5,
    name: "Sesión",
    pdu: "Datos (contexto de sesión)",
    purpose:
      "Organiza conversaciones: quién participa, cuándo comienza una sesión y cómo se reanuda. Se parece al turno y contexto de una llamada.",
    process:
      "La aplicación mantiene identificadores, estado, expiración y recuperación. Una sesión lógica puede sobrevivir a varias conexiones de transporte.",
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
    },
  },
  {
    n: 6,
    name: "Presentación",
    pdu: "Datos representados / protegidos",
    purpose:
      "Da un formato común a la información: codificar texto, serializar estructuras, comprimir o cifrar. Es el idioma y el sobre del mensaje.",
    process:
      "El emisor transforma datos y el receptor interpreta el mismo formato. TLS protege registros; UTF-8 representa texto y JPEG comprime imágenes.",
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
    },
  },
  {
    n: 7,
    name: "Aplicación",
    pdu: "Mensaje / datos",
    purpose:
      "Define el significado de lo que intercambian las aplicaciones: pedir una página, resolver un nombre o enviar correo.",
    process:
      "Cliente y servicio interpretan mensajes, operaciones y respuestas. HTTP utiliza métodos y estados; DNS consulta registros de nombres.",
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
): Technology => ({ id, name, layers, kind, summary, caveat, simulation });
export const technologies: Technology[] = [
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
    [4, 5, 6],
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
    [6, 7],
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
];
export const relatedTechnologies = (n: number) =>
  technologies.filter((t) => t.layers.some((l) => l === n));
export const protocolLayers = (id: string, fallback: number): number[] =>
  technologies.find((t) => t.id === id)?.layers ?? [fallback];
