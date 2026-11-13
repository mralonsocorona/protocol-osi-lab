export type Category = "BASE" | "APLICACIÓN" | "SEGURIDAD";
export type LayerNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Step = {
  /** Stable identity inside this synthetic protocol run. */
  eventId: string;
  /** Protocol that generates the operation, which can differ from the displayed scenario. */
  protocol: string;
  name: string;
  operation: string;
  detail: string;
  from: "client" | "router" | "internet" | "server";
  to: "client" | "router" | "internet" | "server";
  /** End-to-end addresses carried by the PDU when they differ from this hop. */
  logicalSource: "client" | "router" | "internet" | "server";
  logicalDestination: "client" | "router" | "internet" | "server";
  /** Device receiving this hop; it is intentionally distinct from an IP destination. */
  nextHop: "client" | "router" | "internet" | "server";
  /** A semantic operation inside the preceding PDU is not a second transmission. */
  animation: "move" | "contained";
  kind: "Negociación" | "Petición" | "Respuesta" | "Alerta";
  /** Layer responsible for this operation; used by the layer-inspection filter. */
  layer: LayerNumber;
  /** Conceptual OSI layers directly involved in the operation. */
  relatedLayers: LayerNumber[];
  /** Layers at which evidence may be observed, subject to encryption and sensor placement. */
  observableLayers: LayerNumber[];
  observabilityNote: string;
  /** Original position in the complete synthetic sequence. */
  simulationRef: { protocolId: string; stepIndex: number };
  info: string;
  size: string;
  fields: Record<string, string>;
  blue: string;
};
export type Protocol = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  layer: LayerNumber;
  transport: string;
  port: string;
  description: string;
  standards: string[];
  osiRationale: string;
  lifecycle: string;
  security: string;
  steps: Step[];
};
const s = (
  name: string,
  detail: string,
  from: Step["from"],
  to: Step["to"],
  kind: Step["kind"],
  layer: LayerNumber,
  info: string,
  size: string,
  fields: Record<string, string>,
  blue: string,
): Step => ({
  eventId: "",
  protocol: "",
  name,
  operation: name,
  detail,
  from,
  to,
  logicalSource: from,
  logicalDestination: to,
  nextHop: to,
  animation: "move",
  kind,
  layer,
  relatedLayers: [layer],
  observableLayers: [layer],
  observabilityNote: "",
  simulationRef: { protocolId: "", stepIndex: -1 },
  info,
  size,
  fields,
  blue,
});

/** Marks the end-to-end IPv4 tuple and the actual forwarding hop separately. */
const forwardedIp = (
  step: Step,
  from: Step["logicalSource"],
  destination: Step["logicalDestination"],
  nextHop: Step["nextHop"],
): Step => ({ ...step, logicalSource: from, logicalDestination: destination, nextHop });

/** A protocol operation carried in a packet that is already represented in the timeline. */
const containedInPreviousPacket = (step: Step): Step => ({
  ...step,
  animation: "contained",
});
const tcp = [
  s("SYN", "El cliente inicia TCP y consume un número de secuencia para SYN.", "client", "server", "Negociación", 4, "52344 → 443 [SYN] Seq=1000", "66 B (estimado)", {
    "TCP flags": "SYN", "Puerto origen": "52344", "Puerto destino": "443", Seq: "1000", "ISN cliente": "1000",
  }, "Muchos SYN sin completar pueden señalar SYN flood; correlaciona tasa, pérdidas y estado del servidor."),
  s("SYN-ACK", "El servidor confirma el SYN del cliente y propone su ISN.", "server", "client", "Negociación", 4, "443 → 52344 [SYN, ACK] Seq=5000 Ack=1001", "66 B (estimado)", {
    "TCP flags": "SYN, ACK", Seq: "5000", Ack: "1001", Ventana: "64240",
  }, "Compara SYN recibidos con SYN-ACK y ACK finales; una captura asimétrica altera la proporción."),
  s("ACK", "El cliente confirma el SYN del servidor y completa el three-way handshake.", "client", "server", "Negociación", 4, "52344 → 443 [ACK] Seq=1001 Ack=5001", "54 B (estimado)", {
    "TCP flags": "ACK", Seq: "1001", Ack: "5001",
  }, "Una conexión establecida no implica que el contenido o la identidad de aplicación sean legítimos."),
  s("Datos del cliente", "El cliente envía 512 bytes; Seq avanza por la longitud de datos.", "client", "server", "Petición", 4, "[PSH, ACK] Seq=1001 Ack=5001 Len=512", "566 B (sin preámbulo)", {
    "TCP flags": "PSH, ACK", Seq: "1001", Ack: "5001", Longitud: "512 bytes",
  }, "El volumen, ritmo, destino y proceso asociado ayudan a investigar anomalías."),
  s("Respuesta del servidor", "El servidor entrega 1024 bytes y confirma los 512 recibidos.", "server", "client", "Respuesta", 4, "[PSH, ACK] Seq=5001 Ack=1513 Len=1024", "1078 B (sin preámbulo)", {
    "TCP flags": "PSH, ACK", Seq: "5001", Ack: "1513", Longitud: "1024 bytes",
  }, "Compara tamaños y frecuencias con la línea base; payload TLS no revela contenido HTTP."),
  s("FIN cliente", "El cliente cierra su dirección de envío; FIN consume un número de secuencia.", "client", "server", "Negociación", 4, "[FIN, ACK] Seq=1513 Ack=6025", "54 B (estimado)", {
    "TCP flags": "FIN, ACK", Seq: "1513", Ack: "6025",
  }, "FIN y RST inesperados pueden indicar cierres abruptos, pero también timeouts o fallos de aplicación."),
  s("ACK servidor", "El servidor confirma el FIN del cliente; su dirección de envío sigue abierta.", "server", "client", "Negociación", 4, "[ACK] Seq=6025 Ack=1514", "54 B (estimado)", {
    "TCP flags": "ACK", Seq: "6025", Ack: "1514",
  }, "Verifica ambos sentidos del cierre; una FIN no cierra automáticamente toda la conexión."),
  s("FIN servidor", "El servidor cierra su dirección de envío.", "server", "client", "Negociación", 4, "[FIN, ACK] Seq=6025 Ack=1514", "54 B (estimado)", {
    "TCP flags": "FIN, ACK", Seq: "6025", Ack: "1514",
  }, "Conserva el contexto de flujo al distinguir cierre ordenado de reinicio o expiración."),
  s("ACK final", "El cliente confirma el FIN del servidor y completa el cierre ordenado.", "client", "server", "Negociación", 4, "[ACK] Seq=1514 Ack=6026", "54 B (estimado)", {
    "TCP flags": "ACK", Seq: "1514", Ack: "6026",
  }, "La secuencia resume un cierre limpio; retransmisiones y estados TIME_WAIT no se modelan aquí."),
];
const dns = [
  s(
    "Consulta DNS",
    "El stub del cliente pregunta al resolvedor configurado en su gateway por el registro A de example.com; la secuencia no muestra la recursión aguas arriba.",
    "client",
    "router",
    "Petición",
    7,
    "Standard query A example.com",
    "86 B",
    {
      "DNS ID": "0x4a21",
      Consulta: "example.com",
      Tipo: "A",
      Transporte: "UDP/53",
      "Puerto origen": "53000",
      "Puerto destino": "53",
      RD: "1 (solicita recursión)",
    },
    "Consultas con subdominios muy largos o entropía elevada pueden sugerir tunneling.",
  ),
  s(
    "Respuesta DNS",
    "El resolvedor del gateway devuelve la dirección IP solicitada.",
    "router",
    "client",
    "Respuesta",
    7,
    "Standard query response A 203.0.113.10",
    "102 B",
    { "DNS ID": "0x4a21", "Respuesta A": "203.0.113.10", TTL: "300 s", RCODE: "NOERROR", RA: "1 (recursión disponible)", "Puerto origen": "53", "Puerto destino": "53000" },
    "Correlaciona consultas y respuestas; vigila NXDOMAIN y dominios recién vistos.",
  ),
];
const http = [
  s(
    "Solicitud HTTP",
    "El navegador solicita la página mediante GET.",
    "client",
    "server",
    "Petición",
    7,
    "GET / HTTP/1.1 Host: example.com",
    "418 B",
    { Método: "GET", Ruta: "/", Host: "example.com", Cifrado: "No" },
    "HTTP sin TLS expone rutas y cabeceras a observadores de la red.",
  ),
  s(
    "Respuesta HTTP",
    "El servidor entrega la página y sus cabeceras.",
    "server",
    "client",
    "Respuesta",
    7,
    "HTTP/1.1 200 OK Content-Type: text/html",
    "1.8 KB",
    { Estado: "200 OK", "Content-Type": "text/html" },
    "Revisa códigos inusuales, redirecciones y cabeceras de seguridad.",
  ),
];
const tls = [
  s(
    "ClientHello",
    "El cliente propone TLS 1.3 y algoritmos criptográficos.",
    "client",
    "server",
    "Negociación",
    6,
    "TLS ClientHello, SNI=example.com",
    "517 B",
    { Versión: "TLS 1.3", SNI: "example.com (si ECH no lo oculta)", "ALPN ofrecidos": "h2, http/1.1" },
    "SNI puede ser visible si no se negocia ECH; valida certificados y usa huellas TLS solo como señal de contexto.",
  ),
  s(
    "ServerHello",
    "El servidor selecciona parámetros y comienza el intercambio de claves.",
    "server",
    "client",
    "Negociación",
    6,
    "TLS ServerHello, key_share",
    "245 B",
    { Versión: "TLS 1.3", Intercambio: "X25519" },
    "Versiones obsoletas o cifrados débiles son hallazgos defensivos.",
  ),
  s(
    "EncryptedExtensions",
    "El servidor confirma parámetros negociados; este y los mensajes posteriores van cifrados tras ServerHello.",
    "server",
    "client",
    "Negociación",
    6,
    "TLS EncryptedExtensions (protegido)",
    "tamaño variable",
    { Protección: "Handshake traffic keys", Mensaje: "EncryptedExtensions", "ALPN seleccionado": "http/1.1 (supuesto del escenario)" },
    "Los mensajes posteriores a ServerHello no son legibles en una captura pasiva sin claves.",
  ),
  s(
    "Certificate",
    "En el modo común con autenticación del servidor, este envía su cadena de certificados.",
    "server",
    "client",
    "Negociación",
    6,
    "TLS Certificate (protegido)",
    "tamaño variable",
    { Rol: "Autenticación del servidor", Protección: "Cifrado tras ServerHello" },
    "La presencia y validación del certificado se verifican en el endpoint; no siempre aparece en reanudación PSK.",
  ),
  s(
    "CertificateVerify",
    "El servidor demuestra posesión de la clave privada y firma el transcript del handshake.",
    "server",
    "client",
    "Negociación",
    6,
    "TLS CertificateVerify (protegido)",
    "tamaño variable",
    { Función: "Autenticación del handshake", Protección: "Cifrado tras ServerHello" },
    "No confundas certificado presentado con validación exitosa del nombre y cadena por el cliente.",
  ),
  s(
    "Server Finished",
    "El servidor autentica el transcript; el cliente verifica el Finished antes de confiar en el handshake.",
    "server",
    "client",
    "Negociación",
    6,
    "TLS Finished (servidor, protegido)",
    "tamaño variable",
    { Estado: "Confirmación criptográfica del servidor", Protección: "Handshake traffic keys" },
    "Un handshake TLS exitoso requiere validación por el par; no se concluye por un solo paquete observado.",
  ),
  s(
    "Client Finished",
    "El cliente verifica el vuelo del servidor y envía su Finished; el handshake de 1-RTT queda completado.",
    "client",
    "server",
    "Negociación",
    6,
    "TLS Finished (cliente, protegido)",
    "tamaño variable",
    { Estado: "Handshake de 1-RTT completado", Protección: "Client handshake traffic keys; application keys después" },
    "Los registros posteriores quedan protegidos; tamaños y tiempos siguen filtrando metadatos.",
  ),
  s(
    "HTTP cifrado",
    "La solicitud HTTP viaja como datos cifrados de aplicación.",
    "client",
    "server",
    "Petición",
    7,
    "TLS Application Data (HTTP GET)",
    "629 B",
    { Aplicación: "HTTPS", Puerto: "443", ALPN: "http/1.1", Contenido: "Cifrado" },
    "Un sensor pasivo no puede leer el contenido sin mecanismos autorizados de descifrado.",
  ),
  s(
    "Respuesta cifrada",
    "El servidor devuelve contenido protegido con TLS.",
    "server",
    "client",
    "Respuesta",
    7,
    "TLS Application Data (HTTP 200)",
    "2.1 KB",
    {
      Aplicación: "HTTPS",
      "Estado HTTP": "200 (conceptual)",
      Contenido: "Cifrado",
    },
    "Analiza certificados, DNS, SNI cuando esté disponible, tamaños y tiempos.",
  ),
];
const udp = [
  s(
    "Datagrama UDP",
    "El cliente envía un datagrama sin establecer conexión.",
    "client",
    "server",
    "Petición",
    4,
    "UDP 53000 → 5000 Len=128",
    "170 B",
    { Origen: "53000", Destino: "5000", Longitud: "128 bytes" },
    "UDP permite spoofing de origen en redes sin filtrado apropiado.",
  ),
  s(
    "Respuesta UDP",
    "El servidor puede responder, pero UDP no garantiza entrega.",
    "server",
    "client",
    "Respuesta",
    4,
    "UDP 5000 → 53000 Len=64",
    "106 B",
    { Origen: "5000", Destino: "53000", Garantía: "Sin entrega garantizada" },
    "Monitorea amplificación y ráfagas anómalas de datagramas.",
  ),
];
const arp = [
  s(
    "ARP Request",
    "El cliente difunde una consulta para encontrar la MAC de su gateway.",
    "client",
    "router",
    "Petición",
    2,
    "Who has 192.168.1.1? Tell 192.168.1.10",
    "60 B",
    {
      "Destino MAC": "ff:ff:ff:ff:ff:ff",
      "IP buscada": "192.168.1.1",
      Operación: "request",
    },
    "ARP spoofing falsifica asociaciones IP-MAC; detecta cambios inesperados.",
  ),
  s(
    "ARP Reply",
    "El router responde con su dirección MAC.",
    "router",
    "client",
    "Respuesta",
    2,
    "192.168.1.1 is at 02:42:ac:11:00:01",
    "60 B",
    { IP: "192.168.1.1", MAC: "02:42:ac:11:00:01", Operación: "reply" },
    "Dynamic ARP Inspection y segmentación pueden mitigar ataques de suplantación.",
  ),
];
const icmp = [
  s(
    "Echo Request",
    "El cliente envía un mensaje ICMP Echo Request.",
    "client",
    "server",
    "Petición",
    3,
    "ICMP Echo Request id=12 seq=1",
    "98 B",
    { Tipo: "8", Código: "0", Secuencia: "1" },
    "Muchos destinos o patrones repetitivos pueden indicar reconocimiento.",
  ),
  s(
    "Echo Reply",
    "El destino responde con ICMP Echo Reply.",
    "server",
    "client",
    "Respuesta",
    3,
    "ICMP Echo Reply id=12 seq=1",
    "98 B",
    { Tipo: "0", Código: "0", Secuencia: "1" },
    "La ausencia de respuesta no demuestra que el host esté apagado.",
  ),
];
const dhcp = [
  s(
    "Discover",
    "Un cliente sin IP busca servidores DHCP mediante broadcast.",
    "client",
    "router",
    "Negociación",
    7,
    "DHCP Discover",
    "342 B",
    {
      Mensaje: "Discover",
      XID: "0x3903f326",
      "Origen IP": "0.0.0.0",
      "Destino IP": "255.255.255.255",
      "BOOTP flags": "Broadcast",
      UDP: "68 → 67",
    },
    "Los servidores DHCP no autorizados pueden distribuir gateways o DNS maliciosos.",
  ),
  s(
    "Offer",
    "El servidor ofrece una dirección disponible.",
    "router",
    "client",
    "Respuesta",
    7,
    "DHCP Offer 192.168.1.10",
    "342 B",
    { XID: "0x3903f326", "IP ofrecida (yiaddr)": "192.168.1.10", "Server ID": "192.168.1.1", Máscara: "255.255.255.0", "BOOTP flags": "Broadcast", UDP: "67 → 68" },
    "Revisa identificadores de servidores y ofertas inesperadas.",
  ),
  s(
    "Request",
    "El cliente solicita formalmente la dirección ofrecida.",
    "client",
    "router",
    "Petición",
    7,
    "DHCP Request 192.168.1.10",
    "342 B",
    { XID: "0x3903f326", "IP solicitada": "192.168.1.10", "Server ID": "192.168.1.1", "BOOTP flags": "Broadcast", UDP: "68 → 67" },
    "Muchos Discover/Request con MAC cambiantes pueden indicar starvation.",
  ),
  s(
    "ACK",
    "El servidor confirma la concesión.",
    "router",
    "client",
    "Respuesta",
    7,
    "DHCP ACK lease=3600",
    "342 B",
    { XID: "0x3903f326", "yiaddr": "192.168.1.10", Lease: "3600 s", Gateway: "192.168.1.1", "BOOTP flags": "Broadcast", UDP: "67 → 68" },
    "Verifica opciones DHCP y concesiones fuera de patrón.",
  ),
];
const ssh = [
  s(
    "Versión del cliente",
    "Tras establecer TCP, el cliente anuncia primero su identificación SSH.",
    "client",
    "server",
    "Negociación",
    7,
    "SSH-2.0-AtlasClient_1.0",
    "28 B",
    { Protocolo: "SSH-2.0", Dirección: "cliente → servidor", "Puerto destino": "22" },
    "La versión del servidor puede ser útil para inventario de exposición.",
  ),
  s(
    "Versión del servidor",
    "El servidor devuelve su identificación antes de negociar algoritmos.",
    "server",
    "client",
    "Negociación",
    7,
    "SSH-2.0-AtlasServer_1.0",
    "28 B",
    { Protocolo: "SSH-2.0", Dirección: "servidor → cliente", "Puerto origen": "22" },
    "Inventaría la implementación expuesta; no demuestra por sí sola una vulnerabilidad.",
  ),
  s(
    "KEXINIT del cliente",
    "El cliente propone algoritmos de intercambio, host key, cifrado e integridad.",
    "client",
    "server",
    "Negociación",
    7,
    "SSH_MSG_KEXINIT",
    "826 B",
    { Intercambio: "curve25519-sha256", Cifrado: "chacha20-poly1305@openssh.com" },
    "Detecta algoritmos débiles y configuraciones heredadas.",
  ),
  s(
    "KEXINIT del servidor",
    "El servidor propone su lista y ambos pares seleccionan algoritmos comunes.",
    "server",
    "client",
    "Negociación",
    7,
    "SSH_MSG_KEXINIT",
    "826 B",
    { Intercambio: "curve25519-sha256", Cifrado: "chacha20-poly1305@openssh.com" },
    "Comprueba que la selección final no caiga a algoritmos heredados.",
  ),
  s(
    "KEX ECDH init",
    "El cliente inicia el intercambio ECDH después de negociar algoritmos.",
    "client",
    "server",
    "Negociación",
    7,
    "SSH_MSG_KEX_ECDH_INIT",
    "96 B",
    { Intercambio: "curve25519-sha256", Estado: "Esperando host key y firma" },
    "El intercambio crea claves de sesión; no autentica aún al usuario.",
  ),
  s(
    "KEX ECDH reply",
    "El servidor prueba posesión de su host key y aporta su valor ECDH y firma.",
    "server",
    "client",
    "Negociación",
    7,
    "SSH_MSG_KEX_ECDH_REPLY",
    "196 B",
    { Contiene: "Host key, valor ECDH y firma", Verificación: "Host key conocida o validada" },
    "Una clave de host inesperada requiere verificación; no debe aceptarse ciegamente.",
  ),
  s(
    "NEWKEYS del cliente",
    "El cliente confirma que usará las claves y algoritmos recién negociados.",
    "client",
    "server",
    "Negociación",
    7,
    "SSH_MSG_NEWKEYS",
    "52 B",
    { Estado: "Activa claves de cliente a servidor" },
    "Desde aquí el contenido SSH queda protegido por las claves de sesión.",
  ),
  s(
    "NEWKEYS del servidor",
    "El servidor confirma sus nuevas claves; los mensajes siguientes se protegen.",
    "server",
    "client",
    "Negociación",
    7,
    "SSH_MSG_NEWKEYS",
    "52 B",
    { Estado: "Activa claves de servidor a cliente" },
    "Una captura pasiva no puede interpretar los mensajes posteriores sin claves autorizadas.",
  ),
  s(
    "Solicitud de servicio",
    "El cliente solicita el servicio ssh-userauth antes de enviar credenciales.",
    "client",
    "server",
    "Petición",
    7,
    "SSH_MSG_SERVICE_REQUEST ssh-userauth (protegido)",
    "tamaño variable",
    { Servicio: "ssh-userauth", Contenido: "Protegido" },
    "Distingue el inicio de autenticación de un intento de autenticación en logs del servidor.",
  ),
  s(
    "Servicio aceptado",
    "El servidor habilita ssh-userauth antes de procesar la autenticación del usuario.",
    "server",
    "client",
    "Respuesta",
    7,
    "SSH_MSG_SERVICE_ACCEPT ssh-userauth (protegido)",
    "tamaño variable",
    { Servicio: "ssh-userauth", Contenido: "Protegido" },
    "El servicio aceptado no equivale a autenticación exitosa.",
  ),
  s(
    "Autenticación por clave pública",
    "El cliente solicita autenticarse por clave pública tras habilitar ssh-userauth.",
    "client",
    "server",
    "Petición",
    7,
    "SSH_MSG_USERAUTH_REQUEST (protegido)",
    "184 B",
    { Método: "publickey", Contenido: "Protegido" },
    "Múltiples fallos de autenticación pueden indicar fuerza bruta.",
  ),
  s(
    "Autenticación exitosa",
    "El servidor acepta al usuario; el cliente ya puede abrir canales.",
    "server",
    "client",
    "Respuesta",
    7,
    "SSH_MSG_USERAUTH_SUCCESS (protegido)",
    "tamaño variable",
    { Estado: "Usuario autenticado", Contenido: "Protegido" },
    "Correlaciona autenticaciones exitosas con identidad, origen y horario.",
  ),
  s(
    "Abrir canal de sesión",
    "El cliente solicita un canal de tipo session una vez autenticado.",
    "client",
    "server",
    "Petición",
    7,
    "SSH_MSG_CHANNEL_OPEN session (protegido)",
    "tamaño variable",
    { Canal: "session", Contenido: "Protegido" },
    "Los canales pueden transportar shell, exec o reenvío; la política debe limitar los autorizados.",
  ),
  s(
    "Canal confirmado",
    "El servidor confirma la apertura del canal de sesión cifrado.",
    "server",
    "client",
    "Respuesta",
    7,
    "SSH_MSG_CHANNEL_OPEN_CONFIRMATION (protegido)",
    "112 B",
    { Canal: "session", Estado: "Abierto", Contenido: "Protegido" },
    "Correlaciona canal, identidad y origen; no presupongas que todo canal implica una shell interactiva.",
  ),
];
const quic = [
  s(
    "QUIC Initial",
    "El cliente envía un paquete QUIC Initial dentro de un datagrama UDP; inicia el establecimiento de transporte.",
    "client",
    "server",
    "Negociación",
    4,
    "UDP/443 · QUIC Initial · DCID/SCID (sintéticos)",
    "1292 B",
    { Transporte: "UDP/443", Paquete: "Initial", Conexión: "IDs de destino/origen" },
    "Compara volumen y destinos UDP; el puerto 443 no demuestra que sea QUIC ni HTTP/3.",
  ),
  containedInPreviousPacket(s(
    "ClientHello QUIC",
    "TLS ClientHello está en un frame CRYPTO del Initial anterior; se inspecciona por separado, pero no se transmite un segundo datagrama.",
    "client",
    "server",
    "Negociación",
    6,
    "QUIC Initial · CRYPTO: TLS ClientHello",
    "incluido en Initial",
    { TLS: "1.3 mediante RFC 9001", Transporte: "QUIC sobre UDP", Protección: "Claves Initial" },
    "Parte del Initial es descifrable por observadores con captura; contenido de streams posterior sigue protegido.",
  )),
  s(
    "Server Initial",
    "El servidor envía un paquete Initial y puede confirmar paquetes recibidos; sus parámetros de transporte viajan después en EncryptedExtensions.",
    "server",
    "client",
    "Negociación",
    4,
    "UDP/443 · QUIC Initial · ACK",
    "1364 B",
    { Paquete: "Initial", ACK: "Incluido", "Parámetros QUIC": "No van en Initial" },
    "Vigila conexiones UDP/443 inesperadas y políticas de salida.",
  ),
  s(
    "ServerHello QUIC",
    "El servidor selecciona parámetros TLS; ServerHello viaja en un frame CRYPTO de paquete Handshake.",
    "server",
    "client",
    "Negociación",
    6,
    "QUIC Handshake · CRYPTO: TLS ServerHello",
    "incluido en Handshake",
    { Protección: "Claves Handshake", Intercambio: "TLS 1.3" },
    "QUIC integra TLS usando CRYPTO frames; no transporta registros TLS convencionales sobre UDP.",
  ),
  s(
    "EncryptedExtensions QUIC",
    "El servidor envía EncryptedExtensions en un frame CRYPTO protegido; aquí anuncia sus parámetros de transporte QUIC.",
    "server",
    "client",
    "Negociación",
    6,
    "QUIC Handshake · CRYPTO: EncryptedExtensions",
    "tamaño variable",
    { Protección: "Server handshake keys", "Parámetros QUIC": "Transport Parameters en EncryptedExtensions" },
    "Los parámetros de transporte no son un frame Initial; pertenecen al handshake TLS transportado por QUIC.",
  ),
  s(
    "Server Finished sobre QUIC",
    "Tras los mensajes protegidos habituales de autenticación del servidor, este completa su vuelo TLS con Finished en un frame CRYPTO de paquete Handshake.",
    "server",
    "client",
    "Negociación",
    6,
    "QUIC Handshake · CRYPTO: Server Finished",
    "tamaño variable",
    { Protección: "Server handshake keys", "Claves de aplicación": "Tras verificar Finished" },
    "En QUIC, la protección de paquetes y el espacio de claves siguen niveles Initial, Handshake y 1-RTT.",
  ),
  s(
    "Client Finished sobre QUIC",
    "El cliente verifica el vuelo del servidor y envía su Finished en un frame CRYPTO de paquete Handshake.",
    "client",
    "server",
    "Negociación",
    6,
    "QUIC Handshake · CRYPTO: Client Finished",
    "tamaño variable",
    { Protección: "Client handshake keys", Estado: "Handshake completo en cliente; habilita 1-RTT" },
    "HTTP/3 solo usa streams de aplicación después de que los pares tengan claves 1-RTT válidas.",
  ),
  s(
    "HANDSHAKE_DONE",
    "Tras verificar el Finished del cliente, el servidor confirma el handshake con un frame HANDSHAKE_DONE protegido con claves 1-RTT.",
    "server",
    "client",
    "Negociación",
    4,
    "QUIC 1-RTT · HANDSHAKE_DONE",
    "tamaño variable",
    { Frame: "HANDSHAKE_DONE", Protección: "Claves de aplicación 1-RTT", Estado: "Handshake confirmado en cliente" },
    "HANDSHAKE_DONE es un frame QUIC de transporte, no un mensaje TLS ni una respuesta HTTP.",
  ),
  s(
    "HTTP/3 Request",
    "La solicitud HTTP/3 viaja por un stream QUIC cifrado.",
    "client",
    "server",
    "Petición",
    7,
    "HTTP/3 HEADERS GET /",
    "450 B",
    { HTTP: "3", "Stream ID": "0", Contenido: "Cifrado" },
    "No asumas que un IDS puede ver cabeceras HTTP/3 sin descifrado.",
  ),
  s(
    "HTTP/3 Response",
    "El servidor entrega una respuesta HTTP/3.",
    "server",
    "client",
    "Respuesta",
    7,
    "HTTP/3 200 + DATA",
    "1.9 KB",
    { HTTP: "3", Estado: "200 (conceptual)" },
    "Relaciona telemetría de endpoints con flujo de red.",
  ),
];
const protocolDefinitions: Omit<Protocol, "standards" | "osiRationale" | "lifecycle" | "security">[] = [
  {
    id: "tcp",
    title: "TCP",
    subtitle: "Transporte fiable y orientado a conexión",
    category: "BASE",
    layer: 4,
    transport: "IP",
    port: "Variable",
    description:
      "TCP establece conexiones, numera bytes, confirma recepciones y retransmite pérdidas.",
    steps: tcp,
  },
  {
    id: "udp",
    title: "UDP",
    subtitle: "Datagramas sin conexión",
    category: "BASE",
    layer: 4,
    transport: "IP",
    port: "Variable",
    description:
      "UDP transporta datagramas con baja sobrecarga, sin garantía de entrega u orden.",
    steps: udp,
  },
  {
    id: "arp",
    title: "ARP",
    subtitle: "Resolución de direcciones IPv4 a MAC",
    category: "BASE",
    layer: 2,
    transport: "Ethernet",
    port: "No aplica",
    description:
      "ARP resuelve la dirección MAC de un vecino en la red local IPv4.",
    steps: arp,
  },
  {
    id: "icmp",
    title: "ICMP",
    subtitle: "Mensajes de control y diagnóstico",
    category: "BASE",
    layer: 3,
    transport: "IP",
    port: "No aplica",
    description: "ICMP informa errores y facilita diagnósticos como ping.",
    steps: icmp,
  },
  {
    id: "ip",
    title: "IPv4",
    subtitle: "Direccionamiento y encaminamiento",
    category: "BASE",
    layer: 3,
    transport: "Enlace",
    port: "No aplica",
    description:
      "IPv4 entrega paquetes entre redes usando direcciones y decisiones de enrutamiento.",
    steps: [
      forwardedIp(s(
        "Envío IP",
        "El cliente construye un paquete IPv4 dirigido al servidor.",
        "client",
        "router",
        "Petición",
        3,
        "IPv4 src=192.168.1.10 dst=203.0.113.10",
        "128 B",
        { Origen: "192.168.1.10", Destino: "203.0.113.10", TTL: "64" },
        "El spoofing IP requiere controles de filtrado de ingreso y egreso.",
      ), "client", "server", "router"),
      forwardedIp(s(
        "Reenvío",
        "El router reduce el TTL y reenvía el paquete hacia su siguiente salto.",
        "router",
        "internet",
        "Petición",
        3,
        "IPv4 forwarded TTL=63",
        "128 B",
        { TTL: "63", "Next hop": "ISP" },
        "Monitorea rutas y flujos anómalos; el TTL cambia en cada router.",
      ), "client", "server", "internet"),
      forwardedIp(s(
        "Entrega",
        "La red encaminada permite alcanzar el destino.",
        "internet",
        "server",
        "Petición",
        3,
        "IPv4 delivered",
        "128 B",
        { Destino: "203.0.113.10" },
        "Los cambios inesperados de ruta pueden afectar seguridad y disponibilidad.",
      ), "client", "server", "server"),
    ],
  },
  {
    id: "dns",
    title: "DNS",
    subtitle: "Sistema de nombres de dominio",
    category: "APLICACIÓN",
    layer: 7,
    transport: "UDP/TCP",
    port: "53",
    description:
      "DNS traduce nombres de dominio a registros como A y AAAA. Esta secuencia simplifica la resolución.",
    steps: dns,
  },
  {
    id: "dhcp",
    title: "DHCP",
    subtitle: "Configuración automática de red",
    category: "APLICACIÓN",
    layer: 7,
    transport: "UDP",
    port: "67/68",
    description:
      "DHCP asigna direcciones IP y parámetros de red mediante Discover, Offer, Request y ACK. Este ejemplo muestra respuestas difundidas mientras el cliente aún no configura su dirección.",
    steps: dhcp,
  },
  {
    id: "http",
    title: "HTTP",
    subtitle: "Transferencia de hipertexto",
    category: "APLICACIÓN",
    layer: 7,
    transport: "TCP",
    port: "80",
    description:
    "HTTP define mensajes de solicitud y respuesta entre cliente y servidor; esta secuencia supone una conexión TCP ya establecida y muestra HTTP/1.1 sin TLS, por lo que el contenido no está cifrado.",
    steps: http,
  },
  {
    id: "https",
    title: "HTTPS",
    subtitle: "HTTP protegido mediante TLS",
    category: "SEGURIDAD",
    layer: 7,
    transport: "TCP + TLS",
    port: "443",
    description:
      "HTTPS protege HTTP con TLS. La capa 6 es una analogía didáctica: TLS no corresponde estrictamente a una capa OSI independiente.",
    steps: [...tcp.slice(0, 3), ...tls],
  },
  {
    id: "tls",
    title: "TLS 1.3",
    subtitle: "Protección criptográfica de sesiones",
    category: "SEGURIDAD",
    layer: 6,
    transport: "TCP (habitual)",
    port: "Depende de aplicación",
    description:
      "TLS proporciona autenticación del servidor, negociación de claves y cifrado autenticado. Su ubicación OSI es aproximada.",
    steps: tls,
  },
  {
    id: "ssh",
    title: "SSH",
    subtitle: "Acceso remoto seguro",
    category: "SEGURIDAD",
    layer: 7,
    transport: "TCP",
    port: "22",
    description:
      "SSH permite autenticación y canales cifrados para administración remota.",
    steps: ssh,
  },
  {
    id: "quic",
    title: "QUIC",
    subtitle: "Transporte moderno para HTTP/3",
    category: "BASE",
    layer: 4,
    transport: "UDP",
    port: "443 (habitual)",
    description:
      "QUIC usa UDP, integra TLS 1.3 y soporta múltiples flujos independientes. Su asignación a OSI es aproximada.",
    steps: quic,
  },
];

const protocolEducation: Record<
  string,
  Pick<Protocol, "standards" | "osiRationale" | "lifecycle" | "security">
> = {
  tcp: {
    standards: ["RFC 9293"],
    osiRationale: "Protocolo de transporte extremo a extremo (L4); IP lo identifica mediante el campo Protocol/Next Header. Los routers de tránsito normalmente reenvían, no terminan TCP.",
    lifecycle: "Apertura habitual SYN → SYN-ACK → ACK; flujo de bytes secuenciado y confirmado; cierre ordenado con FIN/ACK en cada dirección o aborto con RST. Seq/Ack aquí son coherentes para ISN sintéticos; opciones, retransmisiones y tiempos de red no son una captura.",
    security: "SYN flood, escaneo y abuso de servicios son riesgos. Correlaciona flags, tasas, retransmisiones, estados del servidor y flujos; SYN aislados no prueban un ataque. Limita exposición, aplica filtrado y protección DDoS según arquitectura.",
  },
  udp: {
    standards: ["RFC 768"],
    osiRationale: "Transporte L4: puertos multiplexan procesos; UDP aporta datagramas, longitud y checksum, sin establecimiento ni garantía de entrega/orden.",
    lifecycle: "Cada datagrama es independiente; cualquier respuesta es otro datagrama y depende de la aplicación. El checksum UDP es obligatorio en IPv6 y puede ser cero en IPv4 bajo las reglas aplicables.",
    security: "Suplantación y amplificación dependen del servicio y de controles de origen. Investiga tasas, tamaños, puertos y respuesta del servicio con NetFlow/IPFIX, captura y logs; limita servicios expuestos y aplica validación de origen.",
  },
  arp: {
    standards: ["RFC 826"],
    osiRationale: "ARP resuelve una dirección de protocolo IPv4 a una dirección de enlace en el segmento local. Se encapsula directamente en Ethernet, no dentro de IP; relaciona L2/L3 y no equivale a un protocolo IP.",
    lifecycle: "El emisor pregunta por broadcast quién tiene la IPv4 local; el propietario responde con su MAC y los hosts pueden actualizar cachés. Para un destino remoto se resuelve el gateway, no la MAC del servidor remoto.",
    security: "ARP no autentica respuestas: spoofing puede facilitar MITM o denegación. Busca cambios IP-MAC, respuestas gratuitas y duplicados; verifica redundancia e inventario. Dynamic ARP Inspection con DHCP snooping y segmentación mitigan cuando están bien desplegados.",
  },
  icmp: {
    standards: ["RFC 792", "RFC 1122"],
    osiRationale: "ICMPv4 es control asociado a IPv4 (L3), encapsulado en IP y sin puertos TCP/UDP. Echo es solo una de sus funciones; también comunica errores de entrega.",
    lifecycle: "Un Echo Request puede provocar Echo Reply si políticas y host lo permiten. Errores ICMP incluyen parte del paquete original; filtrarlos indiscriminadamente puede romper diagnóstico y Path MTU Discovery.",
    security: "Reconocimiento, inundación o mensajes falsificados son riesgos. Correlaciona tipo/código, origen, tasa y contexto del flujo; un ping sin respuesta no prueba que un host esté caído. Filtra por política sin bloquear señales necesarias.",
  },
  ip: {
    standards: ["RFC 791", "RFC 6864"],
    osiRationale: "IPv4 realiza direccionamiento lógico y entrega de mejor esfuerzo en L3. TCP/UDP aparecen en Protocol; ICMP también se transporta sobre IP. Ethernet cambia por cada salto y no acompaña extremo a extremo.",
    lifecycle: "El host selecciona una ruta y siguiente salto; routers reenvían, reducen TTL y recalculan checksum de cabecera. La fragmentación IPv4 puede ocurrir según DF/MTU; NAT, si existe, modifica campos y checksums.",
    security: "Spoofing, fragmentos evasivos y rutas anómalas requieren contexto. Examina ACL, TTL, fragmentación, rutas y NetFlow; origen inesperado puede ser mala configuración. Aplica filtrado ingress/egress y políticas de fragmentos.",
  },
  dns: {
    standards: ["RFC 1034", "RFC 1035", "RFC 7766"],
    osiRationale: "DNS es protocolo de aplicación L7; comúnmente usa UDP o TCP puerto 53. DNS sobre HTTPS/TLS usa otros transportes, sin cambiar su función de aplicación.",
    lifecycle: "Un stub suele consultar a su resolvedor configurado; este puede contestar desde caché o resolver recursivamente mediante raíz, TLD y autoritativos. El diagrama muestra solo una consulta y respuesta ya resuelta; no representa recursión ni caché.",
    security: "Tunneling, spoofing, abuso de resolvers y respuestas alteradas son riesgos. Correlaciona logs DNS, QNAME, tipo, RCODE, frecuencia y host; longitud/entropía no prueban exfiltración. Restringe resolvers, valida DNSSEC donde aplica y ajusta detección a la línea base.",
  },
  dhcp: {
    standards: ["RFC 2131", "RFC 2132"],
    osiRationale: "DHCPv4 es aplicación L7 sobre UDP/67 servidor y UDP/68 cliente; broadcasts y retransmisión local no lo convierten en L2.",
    lifecycle: "DORA (Discover, Offer, Request, ACK) es el intercambio habitual para obtener una concesión inicial, pero renovación, reuso, relay y selección de servidores producen variantes. La secuencia ilustra DORA simplificado.",
    security: "Rogue DHCP puede anunciar DNS/gateway malicioso y DHCP starvation agota pools. Revisa server identifier, opciones y bindings; compara con inventario y cambios. Usa DHCP snooping, puertos confiables y controles de acceso según topología.",
  },
  http: {
    standards: ["RFC 9110", "RFC 9112"],
    osiRationale: "HTTP define semántica de aplicación L7; la secuencia corresponde a HTTP/1.1 sobre TCP sin TLS. HTTP/2 normalmente usa TLS y HTTP/3 usa QUIC; no son la misma pila.",
    lifecycle: "Un cliente envía request con método, target y campos; servidor devuelve status, campos y contenido. El ejemplo muestra una sola petición/respuesta sintética y no modela persistencia, framing ni negociación completa.",
    security: "Riesgos incluyen abuso de métodos/rutas, cabeceras maliciosas y contenido claro sin TLS. Investiga access logs, status, user-agent y WAF/Suricata con reglas activas; códigos raros no prueban intrusión. Usa TLS y validación en la aplicación.",
  },
  https: {
    standards: ["RFC 9110", "RFC 9112", "RFC 9846"],
    osiRationale: "HTTPS es HTTP protegido por TLS; en esta simulación es HTTP/1.1 sobre TLS 1.3 sobre TCP. Capa 6 es una analogía funcional, no una capa TCP/IP independiente.",
    lifecycle: "Primero hay TCP; luego el handshake TLS 1.3 de autenticación del servidor; después HTTP viaja protegido. La secuencia muestra el intercambio común, sin opciones como reanudación/PSK y con tamaños/flags esquemáticos; HTTP interior no es observable en una captura pasiva sin descifrado autorizado.",
    security: "Certificados mal validados, versiones/políticas débiles y abuso de 0-RTT (no usado aquí) requieren atención. Correlaciona telemetría TLS, endpoint y servidor; SNI puede faltar o estar protegido (ECH). Mantén bibliotecas y certificados actualizados.",
  },
  tls: {
    standards: ["RFC 9846", "RFC 9325"],
    osiRationale: "TLS protege protocolos de aplicación sobre un transporte fiable (habitualmente TCP); se representa entre L4/L7 como función transversal y se relaciona didácticamente con L6. RFC 9846 es la edición actualizada que sustituye RFC 8446.",
    lifecycle: "Se asume que el transporte fiable ya existe. ClientHello ofrece parámetros; ServerHello selecciona y establece claves; el vuelo común del servidor envía EncryptedExtensions, certificado y CertificateVerify; Finished autentica el transcript. Client Finished completa el handshake 1-RTT y siguen registros AEAD. Se omiten reanudación, PSK, 0-RTT y mensajes opcionales.",
    security: "MITM por validación incorrecta, configuración obsoleta y replay de 0-RTT son riesgos. Certificados, versiones y algunos metadatos pueden observarse; el contenido protegido no. Usa telemetría de endpoint/terminador y configuración recomendada por RFC 9325.",
  },
  ssh: {
    standards: ["RFC 4251", "RFC 4252", "RFC 4253", "RFC 4254"],
    osiRationale: "SSH es un protocolo de aplicación L7 con transporte, intercambio de claves, autenticación y canales multiplexados internos. Sus funciones de sesión/cifrado recuerdan L5/L6, sin ser capas independientes.",
    lifecycle: "Tras TCP, ambos pares intercambian identificación y KEXINIT; el cliente inicia ECDH, el servidor entrega host key/valor/firma y ambos envían NEWKEYS. Después se habilita ssh-userauth, se autentica la clave pública y se abre/confirma un canal session. Se omiten fallos, petición de shell/exec, datos, rekey y cierre.",
    security: "Fuerza bruta, claves de host desconocidas y túneles no autorizados son riesgos. Correlaciona logs de autenticación, origen, huella de host y cambios de configuración; aplica llaves protegidas, MFA donde proceda y bastiones con registro.",
  },
  quic: {
    standards: ["RFC 9000", "RFC 9001", "RFC 9114"],
    osiRationale: "QUIC es transporte seguro multiplexado sobre UDP (L4); integra TLS 1.3 mediante CRYPTO frames y HTTP/3 lo usa en L7. La asociación con L5/L6 describe funciones, no capas literales.",
    lifecycle: "Initial transporta TLS ClientHello con protección Initial; el ServerHello y mensajes posteriores usan frames CRYPTO en paquetes Handshake; claves 1-RTT habilitan streams multiplexados de HTTP/3. El diagrama no modela Retry, pérdida, ACK detallados, control de flujo, migración ni tamaños reales.",
    security: "Cifrado reduce visibilidad pasiva; migración de ruta, UDP/443 y abuso de 0-RTT importan. Correlaciona endpoint, DNS, flujos UDP y telemetría QUIC; puerto 443 por sí solo no prueba HTTP/3. Aplica políticas de salida y visibilidad de endpoint.",
  },
};

const layerRelationships: Record<LayerNumber, LayerNumber[]> = {
  1: [1],
  2: [1, 2],
  3: [2, 3],
  4: [3, 4],
  5: [4, 5, 7],
  6: [4, 6],
  7: [4, 7],
};

function operationProtocol(protocolId: string, layer: LayerNumber, fallback: string) {
  if (protocolId === "https") {
    if (layer === 4) return "TCP";
    if (layer === 6) return "TLS 1.3";
    if (layer === 7) return "HTTP";
  }
  if (protocolId === "quic") {
    if (layer === 4) return "QUIC";
    if (layer === 6) return "TLS 1.3 sobre QUIC";
    if (layer === 7) return "HTTP/3";
  }
  if (protocolId === "tls" && layer === 7) return "HTTP dentro de TLS";
  return fallback;
}

function relatedLayers(protocolId: string, step: Pick<Step, "layer" | "name">): LayerNumber[] {
  const layer = step.layer;
  if (protocolId === "arp") return [2, 3];
  if (protocolId === "dhcp" || protocolId === "dns" || protocolId === "http") return [4, 7];
  if (protocolId === "https" || protocolId === "tls" || protocolId === "quic") {
    return layer === 4 ? [3, 4] : layer === 6 ? [4, 6] : [4, 7];
  }
  if (protocolId === "ssh") {
    if (step.name === "Intercambio de versiones") return [4, 7];
    if (step.name === "KEXINIT" || step.name === "Autenticación") return [4, 6, 7];
    return [4, 5, 6, 7];
  }
  return layerRelationships[layer];
}

function observability(layer: LayerNumber): { layers: LayerNumber[]; note: string } {
  if (layer === 1) return { layers: [1], note: "Requiere telemetría del PHY, radio o medio; una captura de paquetes no demuestra por sí sola la calidad de señal." };
  if (layer === 2) return { layers: [2], note: "Visible en una captura del segmento o telemetría de switch; la visibilidad depende del punto de captura y de VLAN/port mirroring." };
  if (layer === 3) return { layers: [2, 3], note: "Una captura puede exponer IP; rutas y descartes requieren además telemetría de routers/firewalls." };
  if (layer === 4) return { layers: [2, 4], note: "Una captura de red suele mostrar cabeceras de transporte; cifrado y offload pueden limitar el detalle." };
  if (layer === 5) return { layers: [5, 7], note: "El estado de sesión suele requerir registros o telemetría del endpoint/aplicación; no se infiere del handshake TCP." };
  if (layer === 6) return { layers: [2, 4, 6], note: "La captura revela algunos metadatos del handshake; el contenido y mensajes protegidos requieren telemetría del extremo o terminador autorizado." };
  return { layers: [2, 4, 7], note: "El mensaje puede verse en el endpoint/log de aplicación; una captura pasiva solo ve contenido cuando no está cifrado o hay descifrado autorizado." };
}

/** Adds only stable, scenario-specific transport fields; it never invents TCP fields for UDP/ICMP/ARP. */
function inspectorFields(protocolId: string, step: Step): Record<string, string> {
  const fields = { ...step.fields };
  const pair = (clientPort: string, serverPort: string) => ({
    "Puerto origen": step.from === "client" ? clientPort : serverPort,
    "Puerto destino": step.from === "client" ? serverPort : clientPort,
  });
  const shouldAddPorts = protocolId === "tcp" || protocolId === "http" || protocolId === "https" || protocolId === "ssh" || protocolId === "quic";
  if (shouldAddPorts) {
    const ports = protocolId === "http"
      ? pair("52344", "80")
      : protocolId === "ssh"
        ? pair("52344", "22")
        : protocolId === "quic"
          ? pair("52345", "443")
          : pair("52344", "443");
    fields["Puerto origen"] ??= ports["Puerto origen"];
    fields["Puerto destino"] ??= ports["Puerto destino"];
  }
  return fields;
}

export const protocols: Protocol[] = protocolDefinitions.map((definition) => {
  const education = protocolEducation[definition.id];
  return {
    ...definition,
    ...education,
    steps: definition.steps.map((step, stepIndex) => {
      const observed = observability(step.layer);
      return {
        ...step,
        eventId: `${definition.id}-${stepIndex + 1}`,
        protocol: operationProtocol(definition.id, step.layer, definition.title),
        operation: step.name,
        relatedLayers: relatedLayers(definition.id, step),
        observableLayers: observed.layers,
        observabilityNote: observed.note,
        simulationRef: { protocolId: definition.id, stepIndex },
        fields: inspectorFields(definition.id, step),
      };
    }),
  };
});

export function eventsForLayer(steps: Step[], layer: LayerNumber) {
  return steps.flatMap((step, sourceIndex) =>
    step.layer === layer ? [{ step, sourceIndex }] : [],
  );
}

export function completeEvents(steps: Step[]) {
  return steps.map((step, sourceIndex) => ({ step, sourceIndex }));
}
export const layers = [
  {
    n: 7,
    name: "Aplicación",
    pdu: "Datos",
    ex: "HTTP, DNS, SSH",
    detail: "Servicios y protocolos utilizados por aplicaciones.",
  },
  {
    n: 6,
    name: "Presentación",
    pdu: "Datos",
    ex: "Cifrado, codificación",
    detail:
      "Representación y transformación de datos. TLS se muestra aquí solo como analogía didáctica.",
  },
  {
    n: 5,
    name: "Sesión",
    pdu: "Datos",
    ex: "Gestión de sesiones",
    detail:
      "Establecimiento y coordinación lógica de sesiones; en TCP/IP estas funciones se distribuyen.",
  },
  {
    n: 4,
    name: "Transporte",
    pdu: "Segmentos / datagramas",
    ex: "TCP, UDP, QUIC",
    detail:
      "Comunicación extremo a extremo, puertos y fiabilidad según el protocolo.",
  },
  {
    n: 3,
    name: "Red",
    pdu: "Paquetes",
    ex: "IPv4, ICMP",
    detail: "Direccionamiento IP y encaminamiento entre redes.",
  },
  {
    n: 2,
    name: "Enlace",
    pdu: "Tramas",
    ex: "Ethernet, ARP",
    detail: "Entrega local mediante tramas y direcciones MAC.",
  },
  {
    n: 1,
    name: "Física",
    pdu: "Bits",
    ex: "Cobre, fibra, radio",
    detail: "Señales físicas que transportan bits por el medio.",
  },
];
