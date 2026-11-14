import type { AcademyLayer } from "./academy";

export type AcademyReference = { title: string; url: string; note: string };

export const chapterRecaps: Record<AcademyLayer, string[]> = {
  1: [
    "La PHY convierte bits en señales y símbolos sobre un enlace concreto; cada tramo tiene su propio medio.",
    "Una portadora activa no demuestra calidad: compara errores, señal, velocidad y eventos en ambos extremos.",
    "La evidencia física requiere NIC, switch, óptica o telemetría de radio; una captura IP no mide el medio.",
  ],
  2: [
    "Una trama llega al siguiente vecino; un router termina el enlace y vuelve a encapsular el paquete.",
    "El switch aprende MAC de origen por VLAN. ARP resuelve el siguiente salto IPv4 en el enlace y no autentica la respuesta.",
    "Un cambio de MAC, una trama etiquetada o una respuesta ARP aislada son señales para validar con inventario, topología y configuración.",
  ],
  3: [
    "IP entrega paquetes de mejor esfuerzo entre redes mediante prefijos, rutas, siguiente salto y política.",
    "Los routers decrementan TTL/Hop Limit y renuevan la trama de enlace; IPv6 usa NDP/ICMPv6 y no permite fragmentación en routers.",
    "Una ausencia de ICMP o un origen extraño no prueba compromiso: considera filtrado, NAT, ruta asimétrica y punto de observación.",
  ],
  4: [
    "TCP entrega un flujo de bytes ordenado; UDP conserva datagramas sin garantizar entrega u orden.",
    "Los puertos multiplexan procesos, pero no identifican por sí solos el servicio ni su seguridad.",
    "QUIC implementa streams, pérdida, congestión y TLS sobre UDP; un SYN incompleto requiere contexto de red y servidor.",
  ],
  5: [
    "La sesión OSI describe diálogo, estado y recuperación como funciones conceptuales, no un encabezado universal.",
    "Una sesión de aplicación puede sobrevivir a varias conexiones; socket, token, autenticación y autorización son conceptos distintos.",
    "Investiga inicio, renovación y revocación con logs y tiempos correlacionados; nunca registres tokens sin protección.",
  ],
  6: [
    "Codificar, serializar, comprimir y cifrar son transformaciones diferentes; Base64 no aporta confidencialidad.",
    "TLS autentica el extremo servidor habitual y protege datos del canal, pero no hace confiable el contenido ni oculta todos los metadatos.",
    "La clasificación de TLS en OSI varía; en tráfico cifrado combina metadatos de red con datos del endpoint o terminador autorizado.",
  ],
  7: [
    "La aplicación define la semántica de solicitudes y respuestas; el modelo TCP/IP agrupa aquí funciones OSI de sesión y presentación.",
    "DNS admite UDP y TCP; HTTP/3 usa QUIC sobre UDP, mientras HTTP/1.1 y HTTP/2 suelen usar TCP.",
    "Correlaciona DNS, proxy, aplicación y endpoint. Una consulta larga o un código HTTP aislado no confirma una intrusión.",
  ],
};

export const chapterReferences: Record<AcademyLayer, AcademyReference[]> = {
  1: [
    { title: "IEEE 802.3-2022 — Ethernet", url: "https://standards.ieee.org/ieee/802.3/10422/", note: "Estándar y PHY Ethernet; la ficha de IEEE muestra estado y enmiendas." },
    { title: "IEEE 802.11-2024 — Wireless LAN MAC and PHY", url: "https://standards.ieee.org/ieee/802.11/10548/", note: "Edición activa de MAC y PHY WLAN; revisar enmiendas posteriores y capacidades desplegadas." },
    { title: "Linux ethtool netlink documentation", url: "https://docs.kernel.org/networking/ethtool-netlink.html", note: "Interfaz de consulta/configuración expuesta por drivers compatibles." },
  ],
  2: [
    { title: "RFC 826 — ARP", url: "https://www.rfc-editor.org/rfc/rfc826.html", note: "Resolución de protocolo de red a dirección de hardware en redes de enlace." },
    { title: "IEEE 802.1Q-2022 — Bridged Networks and VLANs", url: "https://standards.ieee.org/ieee/802.1q/10323/", note: "Puentes, VLAN, operación y protocolos de redes conmutadas." },
    { title: "RFC 4861 — Neighbor Discovery for IPv6", url: "https://www.rfc-editor.org/rfc/rfc4861.html", note: "Descubrimiento de vecinos y routers para IPv6 mediante ICMPv6." },
  ],
  3: [
    { title: "RFC 791 — Internet Protocol (IPv4)", url: "https://www.rfc-editor.org/rfc/rfc791.html", note: "Formato y operación base de IPv4; consultar actualizaciones asociadas." },
    { title: "RFC 8200 — Internet Protocol, Version 6 (IPv6)", url: "https://www.rfc-editor.org/rfc/rfc8200.html", note: "Especificación base de IPv6 y manejo de paquetes; RFC 9673 actualiza las opciones Hop-by-Hop." },
    { title: "RFC 4443 — ICMPv6", url: "https://www.rfc-editor.org/rfc/rfc4443.html", note: "Mensajes de error e información para IPv6." },
    { title: "RFC 2827 — Network Ingress Filtering", url: "https://www.rfc-editor.org/rfc/rfc2827.html", note: "Recomendaciones de filtrado de origen para reducir spoofing (BCP 38)." },
  ],
  4: [
    { title: "RFC 9293 — Transmission Control Protocol", url: "https://www.rfc-editor.org/rfc/rfc9293.html", note: "Especificación vigente de TCP." },
    { title: "RFC 768 — User Datagram Protocol", url: "https://www.rfc-editor.org/rfc/rfc768.html", note: "Especificación base UDP." },
    { title: "RFC 9868 — Transport Options for UDP", url: "https://www.rfc-editor.org/rfc/rfc9868.html", note: "Actualiza RFC 768 para definir la sintaxis y semántica de opciones UDP." },
    { title: "RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport", url: "https://www.rfc-editor.org/rfc/rfc9000.html", note: "Streams, conexión, pérdida y congestión de QUIC." },
    { title: "RFC 9114 — HTTP/3", url: "https://www.rfc-editor.org/rfc/rfc9114.html", note: "Mapeo de semántica HTTP sobre QUIC." },
  ],
  5: [
    { title: "ISO/IEC 7498-1:1994 — OSI Basic Reference Model", url: "https://www.iso.org/standard/20269.html", note: "El modelo organiza funciones y estándares; no es una especificación de implementación universal." },
    { title: "RFC 1122 — Requirements for Internet Hosts: Communication Layers", url: "https://www.rfc-editor.org/rfc/rfc1122.html", note: "Arquitectura y requisitos del conjunto de protocolos de Internet." },
    { title: "RFC 6265 — HTTP State Management Mechanism", url: "https://www.rfc-editor.org/rfc/rfc6265.html", note: "Cookies y estado de aplicación; no equivalen a una sesión TCP." },
  ],
  6: [
    { title: "RFC 9846 — TLS 1.3", url: "https://www.rfc-editor.org/rfc/rfc9846.html", note: "Actualiza y obsoleta RFC 8446; describe autenticación, confidencialidad y límites del canal." },
    { title: "RFC 9525 — Service Identity in TLS", url: "https://www.rfc-editor.org/rfc/rfc9525.html", note: "Define la verificación de identidad del servicio y coincidencia de nombres para TLS." },
    { title: "RFC 5280 — Internet X.509 PKI Certificate and CRL Profile", url: "https://www.rfc-editor.org/rfc/rfc5280.html", note: "Perfil de certificados y listas de revocación X.509." },
    { title: "RFC 3629 — UTF-8", url: "https://www.rfc-editor.org/rfc/rfc3629.html", note: "Codificación de caracteres Unicode en bytes." },
    { title: "RFC 9001 — Using TLS to Secure QUIC", url: "https://www.rfc-editor.org/rfc/rfc9001.html", note: "Integración de TLS 1.3 con QUIC; no usa el framing TLS sobre TCP convencional." },
    { title: "RFC 8996 — Deprecating TLS 1.0 and TLS 1.1", url: "https://www.rfc-editor.org/rfc/rfc8996.html", note: "Mejor práctica que depreca TLS 1.0 y TLS 1.1." },
  ],
  7: [
    { title: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://www.rfc-editor.org/rfc/rfc1034.html", note: "Conceptos y arquitectura DNS." },
    { title: "RFC 1035 — Domain Names: Implementation and Specification", url: "https://www.rfc-editor.org/rfc/rfc1035.html", note: "Formato y operación de DNS; leer junto con sus extensiones actuales." },
    { title: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110.html", note: "Semántica común de HTTP independiente de su versión de transporte." },
    { title: "RFC 8415 — DHCPv6", url: "https://www.rfc-editor.org/rfc/rfc8415.html", note: "Configuración dinámica de hosts mediante DHCPv6." },
    { title: "RFC 4251 — SSH Protocol Architecture", url: "https://www.rfc-editor.org/rfc/rfc4251.html", note: "Arquitectura de SSH y servicios de transporte, autenticación y conexión." },
  ],
};
