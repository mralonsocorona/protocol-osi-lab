# Auditoría académica de Atlas OSI Academia

**Fecha de auditoría:** 2026-11-14<br />
**Commit base auditado:** `4caf111` (`main`, estado previo a esta entrega).<br />
**Alcance de la revalidación:** árbol de trabajo de esta entrega. `npm run typecheck`, `npm run build` y la suite Playwright (38 pruebas) se ejecutaron antes de preparar el commit; no se hizo push ni despliegue.

## Revisión de cobertura y cambios de esta entrega

El registro [`trazabilidad-academica.md`](./trazabilidad-academica.md) enumera las 224 preguntas de capítulo e integrales, los conceptos enlazados, sus secciones de prerrequisito, la respuesta explicada y los distractores. Se regenera con `node scripts/generate-academic-trace.mjs`. Las 210 preguntas por capítulo tienen un `conceptIds` no vacío y uno o más `prerequisiteSectionIds`; la evaluación integral enlaza sus conceptos a las secciones del curso. La validación comprueba que IDs, definiciones, referencias internas y secciones existen y que las preguntas de capítulo no dependen de un concepto cuya única sección declarada sea posterior al examen.

En esta revisión se ampliaron los contenidos que sustentan preguntas sobre `SYN_RECV`/SYN flood, PHY y repetidores, estados `LOWER_UP`, CRC/FCS y RTT, DHCP snooping/DAI/802.1X/RADIUS, NetFlow/IPFIX, BGP/RPKI/ROA/uRPF, TLS/SNI/ECH, DNS/NXDOMAIN, estados HTTP, RPC, Base64, UTF-8 y `file(1)`. Se agregaron fichas con definiciones sencillas y técnicas, ejemplos, capas, relaciones, secciones y referencias. Las anotaciones en texto usan botones semánticos controlados; la búsqueda global reconoce siglas y sinónimos sin red ni backend.

Se revisaron manualmente los casos de `SYN_RECV`, el contraste entre RTT/retransmisiones y una hipótesis de flood, la interpretación de ARP spoofing frente a failover, el alcance de DNS tunneling, la diferencia entre PHY y capa física OSI, y las referencias MITRE/NIST mostradas. Las pruebas estructurales no prueban por sí solas exactitud académica, plausibilidad de todos los distractores ni ausencia universal de ambigüedad. La tabla conserva el enunciado y distractores para facilitar esa revisión editorial; la revisión semántica exhaustiva de cada alternativa sigue siendo una limitación pendiente y no se presenta como certificada por automatización.

**Integraciones contrastadas en fuentes oficiales:** MITRE ATT&CK `T1557.002` (ARP Cache Poisoning, versión 1.1 consultada) y `T1071.004` (DNS, versión 1.4 consultada); mapeos condicionales por escenario con evidencia y límites. NIST CSF 2.0 usa sus seis funciones, sin categorías no verificadas ni declaración de cumplimiento. NIST SP 800-61 Rev. 3 se cita en estado final (abril de 2025), que sustituye Rev. 2. Se añadieron verificaciones estructurales que restringen los IDs y la taxonomía del marco.

**Resultado de operación:** build de producción correcto; 38/38 pruebas Playwright aprobadas, incluidas navegación, búsqueda y definiciones con teclado, vista móvil estrecha, evaluación y repaso, rutas `/` y `/capas`, preferencias/marcadores y acceso local al diccionario tras cargar offline. El service worker mantiene scope `/capas` y precache estático; las referencias externas requieren conexión.

## Alcance y método

Se revisaron `src/academy.ts` (lecciones), `src/education.ts` (casos y catálogo técnico), `src/Academy.tsx`, banco y motor de evaluaciones, estado local, manifest, service worker, configuración Vite/Nginx y pruebas. Se contrastaron afirmaciones de protocolo con RFC Editor, ISO e IEEE SA, y el uso/alcance de herramientas con documentación de sus proyectos.

El curso distingue estándares de modelos pedagógicos. Las capas OSI sirven para organizar funciones: ISO/IEC 7498-1 no pretende especificar una implementación concreta. Los casos que muestran métricas, direcciones o logs están etiquetados como **escenarios sintéticos**; sus valores no son capturas ni incidentes reales. La telemetría y alertas descritas dependen de cobertura del sensor, configuración, reglas, fuentes de eventos y retención. Una anomalía inicia una hipótesis, no demuestra compromiso.

## Hallazgos por capa

| Capa | Hallazgo académico | Tratamiento y límites |
|---|---|---|
| **1. Física** | Se separan bits, símbolos, PHY, MAC, medio y tasa útil. Se aclara que un `link up` no prueba integridad física; la captura de paquetes no mide SNR ni potencia óptica. | Se precisó el caso para que describa asociación Wi-Fi, caída de SNR y errores RX del radio, con investigación de canal, potencia, driver y línea base. Las cifras son sintéticas; el dato aislado no diferencia interferencia, cobertura, defecto o acción deliberada. IEEE 802.3 y 802.11 contienen las familias de PHY pertinentes; la ficha enlazada de 802.11 se actualizó a la edición 2024 activa al auditar. |
| **2. Enlace** | Ethernet distingue MAC, EtherType, carga y FCS; los switches aprenden origen por VLAN. ARP se trata como resolución de IPv4 en el enlace: se enseña junto con L2 por encapsulación, sin afirmar que sea un mecanismo puro de L2. IPv6 usa Neighbor Discovery sobre ICMPv6. | Se conserva la distinción entre MAC, IP y puerto; FCS detecta corrupción accidental, no autentica. El caso ARP exige comprobar failover, inventario, MAC teaming/VM y cambios aprobados; una alerta IDS requiere sensor/regla adecuados. VLAN no se presenta como frontera de seguridad suficiente. |
| **3. Red** | IPv4/IPv6 ofrecen entrega de mejor esfuerzo; se describen prefijos, coincidencia de ruta, siguiente salto, TTL/Hop Limit e ICMP. IPv4 puede fragmentarse según DF/MTU; los routers IPv6 no fragmentan y el origen usa Path MTU Discovery. | Se explica que NDP reemplaza ARP para IPv6 e ICMPv6 cumple funciones esenciales. `ping`/`traceroute` dependen de filtrado, respuestas y método; un salto sin respuesta no demuestra pérdida de tránsito. El caso de spoofing correlaciona interfaz, túneles, rutas, ACL y proveedor antes de atribuir intención. RFC 9673 actualiza los procedimientos de opciones Hop-by-Hop de RFC 8200; no cambia la explicación introductoria de reenvío. |
| **4. Transporte** | TCP se explica como flujo fiable y ordenado de bytes con secuencia, ACK, retransmisión, flujo y congestión; UDP como datagramas sin garantías de entrega/orden. Se diferencian puertos de identidad de aplicación y SYN del establecimiento completo de una aplicación. | QUIC se clasifica como transporte multiplexado y seguro sobre UDP; HTTP/3 usa QUIC, mientras HTTP/1.1 y HTTP/2 suelen usar TCP. Se añadió RFC 9868 como actualización de UDP Options a la referencia base RFC 768. Un `SYN_RECV` o volumen de SYN, por sí solo, no demuestra un flood: pérdida, RTT, NAT, balanceador y captura asimétrica son alternativas. |
| **5. Sesión** | Se define la capa como funciones de diálogo, estado, sincronización y recuperación conceptuales; no se inventa un encabezado ni una capa universal de TCP/IP. Se separan sesión de aplicación, socket TCP, identidad y autorización. | El escenario de token/session hash es demostrativo y sintético. La investigación requiere logs del servicio/IdP/proxy, renovación y revocación; NAT, roaming, VPN y proxies pueden explicar cambios de origen. No se recomienda escribir tokens completos a logs. |
| **6. Presentación** | Codificación, serialización, compresión, hashing y cifrado se distinguen. TLS se trata como función de protección común, no como asignación OSI universal. La revisión contrastó TLS 1.3 con RFC 9846, publicado en julio de 2026, que reemplaza RFC 8446; también consultó RFC 9001 para TLS en QUIC. | Se precisó autenticación del servidor y autenticación opcional del cliente según modo/configuración; se añadió verificación de identidad del servicio conforme a RFC 9525. Un observador no ve el HTTP interior cifrado; metadatos, logs del endpoint y terminador TLS autorizado tienen límites y riesgos distintos. El caso de TLS 1.0/certificado expirado considera reloj incorrecto y proxy corporativo autorizado; RFC 8996 depreca TLS 1.0 y 1.1. |
| **7. Aplicación** | Se relacionan DNS, HTTP, SSH, DHCP y servicios con mensajes y transportes reales. DNS puede usar UDP o TCP; HTTP/3 conserva semántica HTTP sobre QUIC/UDP. SFTP se identifica como subsistema de SSH, no como FTP con TLS. | La detección de DNS tunneling se presenta como hipótesis basada en volumen, longitud, diversidad y proceso de origen, con CDN, EDR, actualizadores y NXDOMAIN legítimos como alternativas. DoH/DoT/QUIC y sensores fuera del camino limitan visibilidad. Zeek, Suricata y Wazuh requieren tráfico/logs disponibles y configuración; no se les atribuye detección automática universal. |

## Correcciones y ampliaciones de esta entrega

- Se corrigió la referencia de TLS 1.3 de RFC 8446 a RFC 9846 y se añadió orientación de identidad del servicio de RFC 9525.
- Se documentó la actualización UDP Options de RFC 9868 y se actualizó la ficha de IEEE 802.11 a la edición activa 802.11-2024.
- Se incorporaron resúmenes técnicos y referencias primarias por capítulo, además de los siete casos sintéticos con evidencia, pasos de investigación, alternativas, mitigación y límites.
- Se incorporó el lector con preferencias locales, posición, marcador y restauración de lectura. El cuestionario usa 30 preguntas originales por capa, diez por intento, cuatro Blue Team y cobertura de las siete categorías; admite selección múltiple y evita repetir dentro de un ciclo de tres intentos. La evaluación integral selecciona 25 preguntas y mezcla las siete capas.
- La integridad se valida mediante pruebas: unicidad de IDs y enunciados, respuestas válidas, explicaciones, referencias internas, conteos por capa/categoría y ponderación Blue Team. Estas pruebas validan estructura y flujo; no sustituyen una revisión humana de cada argumento.

## Referencias contrastadas

**Modelo, Ethernet y WLAN**

- [ISO/IEC 7498-1:1994 — Basic Reference Model](https://www.iso.org/standard/20269.html): vigente como modelo de referencia; no es especificación de implementación.
- [IEEE 802.3-2022 — Ethernet](https://standards.ieee.org/ieee/802.3/10422/) y [IEEE 802.1Q-2022 — Bridges and Bridged Networks](https://standards.ieee.org/ieee/802.1q/10323/).
- [IEEE 802.11-2024 — WLAN MAC and PHY](https://standards.ieee.org/ieee/802.11/10548/); la ficha de IEEE la marca activa y lista enmiendas posteriores.

**RFC del IETF**

- [RFC 826 ARP](https://www.rfc-editor.org/rfc/rfc826.html), [RFC 4861 Neighbor Discovery](https://www.rfc-editor.org/rfc/rfc4861.html), [RFC 791 IPv4](https://www.rfc-editor.org/rfc/rfc791.html), [RFC 8200 IPv6](https://www.rfc-editor.org/rfc/rfc8200.html), [RFC 9673](https://www.rfc-editor.org/rfc/rfc9673.html), [RFC 4443 ICMPv6](https://www.rfc-editor.org/rfc/rfc4443.html).
- [RFC 9293 TCP](https://www.rfc-editor.org/rfc/rfc9293.html), [RFC 768 UDP](https://www.rfc-editor.org/rfc/rfc768.html), [RFC 9868 UDP Options](https://www.rfc-editor.org/rfc/rfc9868.html), [RFC 9000 QUIC](https://www.rfc-editor.org/rfc/rfc9000.html), [RFC 9001 TLS in QUIC](https://www.rfc-editor.org/rfc/rfc9001.html), [RFC 9114 HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html).
- [RFC 1122 Internet host requirements](https://www.rfc-editor.org/rfc/rfc1122.html), [RFC 1034 DNS concepts](https://www.rfc-editor.org/rfc/rfc1034.html), [RFC 1035 DNS specification](https://www.rfc-editor.org/rfc/rfc1035.html), [RFC 9110 HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 8415 DHCPv6](https://www.rfc-editor.org/rfc/rfc8415.html), [RFC 4251 SSH](https://www.rfc-editor.org/rfc/rfc4251.html).
- [RFC 9846 TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846.html), [RFC 9525 service identity](https://www.rfc-editor.org/rfc/rfc9525.html), [RFC 5280 X.509 PKI](https://www.rfc-editor.org/rfc/rfc5280.html), [RFC 8996 deprecation of TLS 1.0/1.1](https://www.rfc-editor.org/rfc/rfc8996.html), [RFC 3629 UTF-8](https://www.rfc-editor.org/rfc/rfc3629.html).

**Documentación de herramientas y preparación**

- [Wireshark display filters](https://www.wireshark.org/docs/wsug_html_chunked/ChWorkBuildDisplayFilterSection.html): filtros operan sobre protocolos/campos disecados que estén en la captura.
- [Nmap Reference Guide](https://nmap.org/book/man.html): los estados de puerto expresan lo que permiten inferir las sondas; `filtered` no confirma un servicio abierto o cerrado.
- [Linux `ip(8)`](https://man7.org/linux/man-pages/man8/ip.8.html) y [kernel ethtool netlink](https://docs.kernel.org/networking/ethtool-netlink.html): comandos/telemetría dependen del sistema, privilegios, driver y versión.
- [Zeek common logs](https://docs.zeek.org/en/current/reference/logs/index.html), [Suricata EVE JSON](https://docs.suricata.io/en/latest/output/eve/eve-json-output.html), [Wazuh log data collection](https://documentation.wazuh.com/current/user-manual/capabilities/log-data-collection/index.html): necesitan sensores, fuentes y configuración pertinentes.
- [INE eJPT — dominios y objetivos publicados](https://ine.com/security/certifications/ejpt-certification): referencia de alcance consultada el 2026-11-14.

## Riesgos de ambigüedad y conceptos pendientes

- ARP se ubica cerca de la frontera enlace/red; TLS, QUIC y sesiones de aplicación atraviesan límites que un modelo de siete capas separa. El lector conserva esa ambigüedad explícita y evita imponer una única clasificación como verdad de implementación.
- Las referencias a RFC base no enumeran todas sus extensiones, erratas, perfiles, enmiendas IEEE ni diferencias entre vendors. La ficha 802.11-2024 ya lista enmiendas posteriores; deben revisarse antes de una actualización editorial futura.
- No se desarrolla a nivel avanzado la selección de rutas BGP/RPKI, opciones IPv6, 802.1X, criptografía TLS, 0-RTT y replay, ni análisis de malware o respuesta a incidentes completa. Son límites deliberados de una guía introductoria por capas, no conclusiones de seguridad.
- Los ejemplos de herramientas enseñan interpretación y límites. La salida real depende de versión, permisos, punto de observación, configuración, reglas, hardware y topología; ejemplos de incidentes etiquetados como sintéticos no son evidencia real.
- Los enlaces externos requieren conexión. El texto, las preguntas, sus explicaciones y el estado guardado localmente forman parte de la PWA offline; no se guarda telemetría personal en servidor.

## Cobertura de fundamentos relevantes para eJPT

La guía apoya fundamentos de host y network auditing, reconocimiento, direccionamiento, rutas, puertos/servicios, lectura de tráfico y reconocimiento de aplicaciones web. La página pública de INE organiza además el examen en metodologías de evaluación, penetración de host/red, auditoría y pruebas web; incluye explotación, pivoting, enumeración de host, evaluación de vulnerabilidades y otros objetivos que esta obra no enseña de forma completa. Por eso es material de fundamentos y práctica analítica, **no sustituye el temario íntegro ni la práctica del examen eJPT** y **no está certificado ni avalado por INE**.

## Conclusión de confiabilidad

El contenido ofrece una base técnicamente confiable para estudio inicial: las distinciones OSI/TCP-IP, las PDUs, los protocolos citados, la observabilidad cifrada y los límites de las herramientas se explican con cautela; cada capítulo agrega un caso sintético y alternativas antes de concluir. La revisión contrastó las afirmaciones de mayor impacto con fuentes primarias actuales al 2026-11-14. La batería automatizada comprueba estructura, unicidad, rutas, accesibilidad básica, selección y puntuación, persistencia y uso offline; no certifica por sí sola exactitud académica exhaustiva. La conclusión es de **confiabilidad adecuada como guía de fundamentos**, condicionada a mantener las referencias vigentes y a una revisión académica humana periódica.
