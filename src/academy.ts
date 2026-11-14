export type AcademyLayer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AcademyLesson = {
  number: AcademyLayer;
  name: string;
  introduction: string;
  mainFunctions: { name: string; explanation: string; example?: string }[];
  memorizationDefinition: string;
  everydayExample: { analogy: string; limits: string };
  studySummary: { does: string; dataUnit: string; technologies: string; remember: string[]; avoid: string[] };
  selfCheck: { question: string; answer: string }[];
  pdu: string;
  objective: string;
  fundamentals: string[];
  workflow: string[];
  encapsulation: string;
  protocols: { name: string; role: string }[];
  technologies: { name: string; role: string }[];
  communication: string;
  blueTeam: { heading: string; detail: string }[];
  redTeam: { heading: string; detail: string }[];
  commands: { command: string; purpose: string; interpretation: string }[];
  misconceptions: { claim: string; correction: string }[];
  exercises: { question: string; answer: string }[];
};

export const academyLessons: AcademyLesson[] = [
  {
    number: 1,
    name: "Física",
    introduction: "La capa física es el conjunto de medios y señales que permite que dos interfaces vecinas intercambien bits. Resuelve el problema de llevar información a través de cobre, fibra o radio. Entrega la señal recuperada a la capa de enlace y recibe de ella los bits que debe transmitir.",
    mainFunctions: [
      { name: "Representar bits como señales", explanation: "Los equipos acuerdan cómo distinguir los valores transmitidos en un medio.", example: "Un pulso eléctrico en cobre o un pulso de luz en fibra representa parte de la secuencia." },
      { name: "Transportar la señal", explanation: "El medio conduce energía entre un transmisor y un receptor.", example: "Par trenzado, fibra y ondas de radio tienen límites y fuentes de interferencia distintos." },
      { name: "Sincronizar emisor y receptor", explanation: "El receptor necesita reconocer cuándo observar la señal para reconstruir los símbolos." },
      { name: "Recuperar los bits recibidos", explanation: "El equipo interpreta símbolos y entrega una secuencia de bits a las funciones de enlace." },
      { name: "Establecer condiciones físicas", explanation: "Algunos enlaces negocian velocidad, dúplex, canal u otros parámetros; depende de la tecnología." },
    ],
    memorizationDefinition: "La capa física representa y transporta bits como señales eléctricas, ópticas o de radio a través de un medio. Define características de transmisión que permiten al receptor recuperar la secuencia y entregarla a la capa de enlace.",
    everydayExample: { analogy: "Imagina que envías destellos de una linterna a otra persona: acuerdan qué significa cada destello y la otra persona los observa para reconstruir el mensaje.", limits: "Una red usa señales mucho más precisas; un símbolo puede representar varios bits y el receptor compensa ruido y distorsión según el estándar." },
    studySummary: { does: "Transporta señales entre interfaces vecinas y recupera bits para la capa de enlace.", dataUnit: "Bits y símbolos físicos; no hay un encabezado universal de capa 1.", technologies: "Cobre, fibra, radio, NIC, transceptores y repetidores.", remember: ["Portadora activa no garantiza calidad ni conectividad completa.", "Cada tramo físico puede usar medio y velocidad diferentes."], avoid: ["Confundir velocidad nominal con datos útiles de una aplicación.", "Suponer que una captura de paquetes mide potencia óptica o calidad de radio."] },
    selfCheck: [
      { question: "¿Qué debe recuperar el receptor antes de que la capa de enlace procese una trama?", answer: "La secuencia de bits representada por las señales recibidas." },
      { question: "Si una interfaz muestra link up, ¿queda demostrada una aplicación sana?", answer: "No. Solo indica que se detectó el enlace; aún pueden existir errores o fallos en capas superiores." },
    ],
    pdu: "Bits representados como símbolos",
    objective:
      "Explicar cómo una interfaz convierte bits en señales que pueden viajar por cobre, fibra o radio, y qué puede observarse cuando un enlace se degrada.",
    fundamentals: [
      "La capa física describe las propiedades del medio, los conectores, la señalización, la sincronización y las condiciones de transmisión. El receptor recupera símbolos y los entrega a la capa de enlace; no interpreta direcciones MAC, paquetes IP, puertos ni solicitudes HTTP.",
      "Un bit es una unidad lógica, mientras que un símbolo es un estado físico definido por la modulación o codificación. Un símbolo puede transportar más de un bit. La velocidad de línea, el ancho de banda, la tasa de símbolos, la codificación, la potencia, el ruido y la distancia interactúan; por eso no son sinónimos de rendimiento útil.",
      "Ethernet separa funciones MAC y PHY. La PHY concreta depende de la variante: 1000BASE-T usa cuatro pares de cobre, 1000BASE-SX usa fibra multimodo, y 10GBASE-SR usa fibra para distancias cortas. Wi-Fi emplea radio y un PHY distinto; la compatibilidad requiere coincidir en banda, canalización y capacidades negociadas. CSMA/CA coordina el acceso compartido al medio Wi-Fi, no evita toda interferencia ni garantiza capacidad fija.",
      "La dirección IP es lógica y pertenece a una capa superior: un repetidor físico no la interpreta. Cambiar de cobre a fibra tampoco cambia por sí solo el destino IP. Una NIC puede reportar `LOWER_UP` o `Link detected: yes` cuando detecta portadora, aunque aún existan errores, pérdida o un fallo de aplicación.",
      "La capa física OSI es una herramienta conceptual. En una red real cada tramo tiene su propio medio y transceptores: una trama que cruza un switch se recibe, procesa y vuelve a señalizar en el siguiente enlace. Un router tampoco extiende un único medio físico extremo a extremo.",
    ],
    workflow: [
      "Las interfaces detectan un medio compatible y, cuando aplica, negocian velocidad, dúplex y parámetros del enlace. En fibra se comprueba también que los transceptores y longitudes de onda coincidan.",
      "El transmisor transforma bits de la capa MAC en símbolos y los modula o codifica según el estándar PHY. El medio altera la señal mediante atenuación, reflexión, interferencia, dispersión o ruido.",
      "El receptor sincroniza, estima los símbolos y detecta errores de señal. La corrección de errores, si el estándar la incluye, trabaja sobre bloques físicos y no sustituye la retransmisión de TCP.",
      "La PHY entrega la secuencia recuperada a la MAC. Si la calidad cae bajo los límites, la interfaz puede contar errores, renegociar velocidad o declarar el enlace abajo.",
    ],
    encapsulation:
      "La unidad física se suele describir como bits o símbolos. No se agrega aquí un encabezado universal de red: el preámbulo, la codificación y la señalización dependen del PHY. Una captura Ethernet normal comienza en una trama y no muestra directamente voltaje, potencia óptica ni símbolos de radio.",
    protocols: [
      { name: "IEEE 802.3 PHY", role: "Define variantes de Ethernet sobre cobre y fibra; la MAC asociada forma parte de la capa de enlace." },
      { name: "IEEE 802.11 PHY", role: "Define las bandas, canales y métodos de señalización Wi-Fi; la asociación y las tramas MAC también involucran capa 2." },
      { name: "IEEE 802.3z / 802.3ab", role: "Familias históricas de Gigabit Ethernet sobre fibra y cobre, respectivamente; la variante concreta determina el medio y alcance." },
      { name: "IEEE 802.3bz / 802.3an", role: "Ethernet multigigabit sobre cableado de par trenzado en distancias de acceso definidas por el estándar." },
    ],
    technologies: [
      { name: "NIC y transceptor PHY", role: "Codifican y recuperan símbolos en los extremos de un enlace." },
      { name: "Cobre de par trenzado", role: "Transporta señales diferenciales; el estado de pares, longitud y terminación afecta errores y velocidad." },
      { name: "Fibra y óptica", role: "Transporta pulsos de luz; tipo de fibra, óptica y presupuesto de potencia limitan alcance." },
      { name: "OTDR", role: "Reflectómetro que ayuda a ubicar atenuación y reflexiones a lo largo de una fibra; la traza se interpreta junto con transceptores, conectores y documentación del enlace." },
      { name: "Radio y antenas", role: "Comparten un medio sujeto a ruido, atenuación, obstáculos, canal y contención de tiempo de aire." },
      { name: "Repetidor y concentrador", role: "Regeneran o repiten señal; un switch moderno normalmente termina cada enlace y procesa tramas." },
    ],
    communication:
      "Al abrir HTTPS, la NIC transmite la trama inicial por su enlace local como una señal eléctrica, óptica o de radio. El switch termina esa señal y transmite otra por el puerto de salida. El router repite el proceso en cada interfaz de salida. El contenido IP/TCP/TLS no se vuelve señal por una sola conversión de extremo a extremo: cada tramo puede usar un medio y una velocidad distintos.",
    blueTeam: [
      { heading: "Amenazas y efectos", detail: "Corte o manipulación de cable, desconexiones, interferencia de radio, saturación del medio y acceso físico no autorizado pueden afectar disponibilidad. Los síntomas físicos no prueban por sí solos intención maliciosa." },
      { heading: "Telemetría", detail: "Correlaciona link up/down, CRC/FCS, errores de alineación, descartes, velocidad negociada, potencia óptica, SNR, retransmisiones Wi-Fi y cambios de puerto. Compara ambos extremos y una línea base por hora y ubicación." },
      { heading: "Detección e investigación", detail: "CRC/FCS son contadores de integridad de trama que puede exponer la NIC; un aumento no localiza la causa física ni autentica al emisor. RTT es el tiempo de ida y vuelta de una sonda o intercambio medido. Busca aumentos simultáneos de errores y flaps; distingue pérdida física de congestión o fallas del equipo. Verifica cableado, conectores, transceptor, potencia recibida, canal y eventos de mantenimiento antes de atribuir causa." },
      { heading: "Mitigación", detail: "Restringe acceso a racks y puertos, documenta cableado, usa redundancia y ópticas compatibles, corrige interferencia, monitorea cambios y conserva telemetría. Una sonda de red no mide potencia óptica ni reemplaza una inspección física." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "En una práctica con permiso, documenta interfaz, medio, velocidad, estado y segmentos que puedes observar. El inventario debe definir equipos, ventana, alcance y límites; no manipules cableado ni radio de producción." },
      { heading: "Enumeración segura", detail: "Usa información ya expuesta por el sistema y herramientas de diagnóstico para comprobar capacidades y detectar una configuración incompatible. La monitorización Wi-Fi debe limitarse al laboratorio y cumplir las reglas locales." },
      { heading: "Técnicas y herramientas", detail: "Una evaluación autorizada valida exposición física, puertos de acceso y segmentación; herramientas como ethtool, iw y analizadores de espectro son diagnósticas. Interferir intencionalmente, desconectar activos o capturar comunicaciones ajenas queda fuera de esta práctica." },
    ],
    commands: [
      { command: "ip link show dev eth0", purpose: "Consulta estado, MTU y banderas de la interfaz de ejemplo.", interpretation: "Busca `LOWER_UP`, velocidad si el controlador la publica, y si la interfaz está administrativamente activa. Sustituye `eth0` por una interfaz real de tu laboratorio." },
      { command: "ip -s link show dev eth0", purpose: "Muestra contadores de recepción y transmisión.", interpretation: "Compara `errors`, `dropped` y `carrier` a lo largo del tiempo; un contador acumulativo aislado no permite fechar ni atribuir el incidente." },
      { command: "sudo ethtool eth0", purpose: "Consulta negociación, velocidad, dúplex y capacidades Ethernet cuando el controlador lo soporta.", interpretation: "`Link detected: yes` solo confirma portadora; no demuestra que el cable esté libre de errores ni que la aplicación tenga conectividad." },
      { command: "iw dev", purpose: "Lista interfaces inalámbricas conocidas por `iw`.", interpretation: "En una interfaz Wi-Fi, `iw dev wlan0 link` informa asociación, frecuencia y señal si el sistema y el controlador permiten verlo." },
    ],
    misconceptions: [
      { claim: "La velocidad del enlace es el ancho de banda disponible para una aplicación.", correction: "Es una tasa física nominal por enlace; contención, codificación, encabezados, errores y congestión reducen el caudal útil." },
      { claim: "Si hay link, el cable y la comunicación están sanos.", correction: "Portadora indica que se detectó un enlace, no ausencia de errores, interferencia o pérdida de paquetes." },
      { claim: "Wi-Fi es solo capa 1.", correction: "El medio de radio corresponde a la PHY, pero asociación, acceso al medio, direcciones y tramas Wi-Fi incluyen funciones de capa 2." },
    ],
    exercises: [
      { question: "Una interfaz tiene `LOWER_UP`, pero el contador CRC aumenta y TCP retransmite. ¿Qué investigarías primero?", answer: "Compara errores de ambos puertos, velocidad y dúplex, cable/transceptor, potencia o SNR y correlación temporal. CRC señala corrupción de tramas recibidas; no identifica por sí solo su causa." },
      { question: "¿Una captura de Wireshark prueba que la señal de radio es buena?", answer: "No. Puede mostrar tramas recibidas y errores visibles por el controlador, pero la potencia, ocupación del canal y relación señal-ruido requieren telemetría o instrumentación de radio." },
    ],
  },
  {
    number: 2,
    name: "Enlace",
    introduction: "La capa de enlace organiza la entrega de tramas dentro de un enlace local, como una LAN conectada por switches. Resuelve cómo identificar al vecino al que se entrega cada unidad sin elegir una ruta por toda la red. Usa la capa física para transmitir señales y recibe paquetes de la capa de red para transportarlos localmente.",
    mainFunctions: [
      { name: "Agrupar datos en tramas", explanation: "La trama delimita una unidad que los equipos del enlace pueden reconocer.", example: "Una trama Ethernet identifica direcciones MAC y el tipo de carga que transporta." },
      { name: "Identificar interfaces locales", explanation: "Direcciones MAC permiten dirigir tramas dentro de una tecnología y un enlace." },
      { name: "Entregar dentro de una LAN", explanation: "Un switch aprende dónde vio una MAC de origen y consulta esa información para reenviar tramas." },
      { name: "Compartir el medio", explanation: "La tecnología establece cómo varias interfaces pueden usar el enlace; las reglas dependen del medio." },
      { name: "Detectar ciertos errores", explanation: "Un campo de comprobación puede advertir que una trama cambió accidentalmente durante la transmisión." },
    ],
    memorizationDefinition: "La capa de enlace organiza el envío de tramas entre interfaces de un enlace local. Usa direcciones locales y reglas de acceso o reenvío para entregar cada unidad al siguiente equipo, mientras la capa de red decide cómo llegar a otras redes.",
    everydayExample: { analogy: "Un switch se parece a un encargado que distribuye correspondencia dentro de un edificio: observa por qué puerta entró cada remitente y usa ese registro para entregar sobres posteriores a esa puerta.", limits: "La analogía simplifica el aprendizaje de direcciones. Un switch normalmente reenvía tramas dentro de una LAN, no decide rutas entre ciudades; también puede inundar una trama si aún desconoce su destino." },
    studySummary: { does: "Entrega tramas localmente mediante direcciones y reglas del enlace.", dataUnit: "Trama; por ejemplo, una trama Ethernet que lleva un paquete IP.", technologies: "Switches, bridges, Ethernet, Wi-Fi, VLAN, ARP y FCS.", remember: ["El switch aprende la MAC de origen asociada al puerto y a la VLAN.", "Para un destino remoto, el host entrega la trama a la MAC del gateway local."], avoid: ["Confundir MAC con dirección IP o identidad autenticada.", "Creer que FCS cifra o autentica una trama."] },
    selfCheck: [
      { question: "¿Qué dirección MAC usa el host cuando envía a una IP fuera de su subred?", answer: "La MAC del siguiente salto local, normalmente la del gateway; la IP destino sigue siendo la remota." },
      { question: "¿Qué aprende principalmente un switch Ethernet?", answer: "Relaciona MAC de origen observadas con un puerto y una VLAN para decidir el reenvío posterior." },
    ],
    pdu: "Trama",
    objective:
      "Seguir la entrega de tramas entre vecinos, entender cómo un switch aprende direcciones y relacionar Ethernet, VLAN y ARP sin confundirlos con IP.",
    fundamentals: [
      "Una dirección MAC identifica una interfaz dentro de una tecnología de enlace local. En Ethernet suele representarse como seis pares hexadecimales, por ejemplo `02:00:5e:10:00:01`. No es una dirección IP: la IP ayuda a entregar paquetes entre redes y la MAC dirige una trama en el siguiente enlace. La MAC puede administrarse localmente, cambiar o falsificarse; no prueba quién controla el equipo.",
      "Una trama Ethernet II lleva MAC de destino y origen, un campo EtherType que identifica la carga, los datos y un FCS. En una LAN conmutada, el switch aprende principalmente observando la MAC de origen que entra por cada puerto y VLAN. Después consulta esa tabla para reenviar a la salida conocida; si todavía no conoce un destino unicast, puede inundarlo dentro de la VLAN.",
      "ARP resuelve una pregunta concreta de IPv4: qué MAC debe usar el host para el próximo salto local. El host difunde una solicitud ARP en la LAN; el equipo que posee esa IPv4 suele responder con su asociación IPv4-MAC y el host puede guardarla temporalmente en caché. Si el destino IP está en otra red, el host no busca la MAC del servidor remoto: resuelve la MAC de su gateway.",
      "ARP viaja directamente dentro de una trama Ethernet (EtherType 0x0806) y no cruza routers. No incluye autenticación criptográfica, así que un anuncio falso puede contaminar cachés y facilitar una posición de intermediario; eso es un riesgo, no prueba automática de incidente. IPv6 no usa ARP: Neighbor Discovery realiza funciones relacionadas mediante ICMPv6.",
      "Una VLAN crea un dominio lógico de capa 2; una trama etiquetada con IEEE 802.1Q puede transportar su identificador entre puertos configurados. Los dispositivos de una VLAN comparten el dominio de broadcast, y la comunicación entre VLAN requiere una función de capa 3 y políticas explícitas. Una VLAN por sí sola no autentica usuarios ni cifra tráfico.",
      "FCS permite detectar ciertos cambios accidentales en la trama, pero no autentica ni cifra. La NIC o el hardware suelen calcularlo y pueden quitarlo antes de que el sistema operativo entregue la captura, así que su ausencia en Wireshark no indica que Ethernet no lo use. En algunas MAC, parte de los bits corresponde a un OUI; asignaciones locales, virtualización y spoofing limitan su valor como pista de fabricante.",
    ],
    workflow: [
      "La capa de red entrega un paquete IP a la interfaz. Si el destino está en la subred local, el host resuelve la MAC del destino; si es remoto, resuelve la MAC del siguiente salto, normalmente el gateway.",
      "La NIC encapsula el paquete en una trama con MAC origen y destino, EtherType y, si corresponde, etiqueta VLAN. La PHY transmite sus bits por el medio.",
      "Cada switch aprende la MAC de origen en la VLAN de ingreso y decide salida con su tabla MAC. Si el destino está en otro segmento o es el router, la trama llega a la interfaz correspondiente.",
      "El receptor valida el FCS y procesa EtherType. En una ruta con router, este retira la trama recibida y crea otra trama para el próximo enlace; las MAC cambian salto a salto.",
    ],
    encapsulation:
      "PDU: trama. En Ethernet, la carga lleva un paquete IPv4/IPv6, ARP u otro protocolo identificado por EtherType. 802.1Q inserta una etiqueta en el encabezado entre MAC origen y el EtherType interno. El FCS detecta corrupción accidental, no autentica ni cifra una trama.",
    protocols: [
      { name: "Ethernet (IEEE 802.3 / Ethernet II)", role: "Define formato MAC, direccionamiento local y acceso al medio cableado; Ethernet II usa EtherType para identificar la carga." },
      { name: "ARP (RFC 826)", role: "Resuelve una IPv4 a una dirección de hardware en el enlace; no cruza routers ni cifra la respuesta." },
      { name: "IEEE 802.1Q", role: "Transporta etiquetas VLAN y prioridad en tramas Ethernet; la VLAN permitida depende de la configuración de los puertos." },
      { name: "STP / RSTP (802.1D / 802.1w)", role: "Evita bucles de puente al bloquear rutas redundantes de capa 2; la terminología moderna de IEEE integra RSTP en 802.1Q." },
      { name: "LLDP (802.1AB) y LACP (802.1AX)", role: "LLDP anuncia información de vecinos; LACP negocia agregación de enlaces. Ambos operan sobre enlaces locales." },
    ],
    technologies: [
      { name: "Switch / bridge", role: "Aprende MAC de origen y reenvía tramas dentro de una VLAN según estado y políticas." },
      { name: "NIC", role: "Acepta tramas dirigidas a sus MAC, broadcast o grupos multicast según filtros." },
      { name: "VLAN access / trunk", role: "Un puerto access asigna una VLAN; un trunk permite un conjunto de VLAN etiquetadas entre equipos." },
      { name: "Punto de acceso", role: "Puentea redes Wi-Fi con LAN, pero gestiona asociación, autenticación y tramas 802.11." },
      { name: "Bridge inalámbrico y firewall L2", role: "Extienden o filtran dominios de enlace; el comportamiento depende de cómo estén configurados." },
    ],
    communication:
      "Un cliente 192.168.1.10/24 quiere hablar con 203.0.113.10. Compara prefijos y detecta que el destino es remoto, consulta la ruta por defecto y solicita por ARP la MAC de 192.168.1.1. Envía una trama con MAC origen del cliente, MAC destino del router y el paquete IP cuyo destino sigue siendo 203.0.113.10. El router retira esa trama y crea otra para su próximo salto. No busca la MAC del servidor remoto en la LAN.",
    blueTeam: [
      { heading: "Amenazas", detail: "Suplantación ARP, servidor DHCP no autorizado, cambios inesperados de VLAN, punto de acceso falso, bucle de capa 2 y agotamiento de tabla MAC pueden afectar integridad, segmentación o disponibilidad. El OUI de una MAC es una pista de asignación, no prueba de fabricante o identidad del equipo conectado." },
      { heading: "Telemetría", detail: "Revisa tabla MAC y movimientos, VLAN de acceso, vecinos ARP, DHCP snooping, Dynamic ARP Inspection, STP, LLDP, cambios de trunk y eventos de asociación Wi-Fi. Conserva puerto, VLAN, MAC y hora." },
      { heading: "Detección e investigación", detail: "Busca una IP que cambia de MAC, MAC de gateway anunciada por varios puertos, broadcasts anómalos o un trunk inesperado. Correlaciona DHCP, tabla CAM, logs del switch, autenticación 802.1X y ARP del host." },
      { heading: "Mitigación", detail: "DHCP snooping observa DHCP y aprende bindings IP-MAC-VLAN-puerto según la confianza configurada. DAI contrasta mensajes ARP con esos bindings o entradas configuradas; puede bloquear equipos legítimos si faltan bindings. 802.1X controla acceso de puerto mediante autenticación, comúnmente con un servidor RADIUS. Segmenta VLAN, limita trunks y valida soporte/configuración antes de habilitar controles." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "En una VLAN de laboratorio, identifica el prefijo, gateway, vecinos y alcance del segmento. Documenta si la captura se realiza en un puerto espejo o en una interfaz propia; una NIC normal no recibe todo el tráfico unicast ajeno." },
      { heading: "Enumeración", detail: "Compara tabla de vecinos del host con inventario aprobado y observa anuncios ARP y DHCP de un entorno aislado. No cambies cachés de terceros ni suplantes el gateway en producción." },
      { heading: "Técnicas y herramientas", detail: "Una práctica puede demostrar ARP falsificado entre máquinas virtuales y luego verificar controles; limítala a una topología aislada y consentimiento explícito. `ip neigh`, `bridge`, `arp-scan` y `tcpdump -e arp` ayudan a observar, no prueban por sí solos una vulnerabilidad." },
    ],
    commands: [
      { command: "ip neigh show", purpose: "Consulta caché de vecinos IPv4/IPv6 del kernel.", interpretation: "`REACHABLE`, `STALE`, `FAILED` y `INCOMPLETE` describen estado de resolución; una entrada dinámica no confirma identidad del vecino." },
      { command: "ip route get 203.0.113.10", purpose: "Muestra la decisión local de encaminamiento y la interfaz/siguiente salto calculados.", interpretation: "La línea `via` indica el gateway cuando el destino es remoto; la resolución de su MAC ocurre en el enlace local." },
      { command: "sudo tcpdump -eni eth0 'arp or vlan'", purpose: "Observa ARP y etiquetas 802.1Q en una interfaz permitida.", interpretation: "`-e` muestra encabezado de enlace; la visibilidad VLAN puede cambiar por offload de NIC y por el puerto de captura." },
      { command: "bridge fdb show", purpose: "Consulta la base de datos de reenvío de bridges locales Linux.", interpretation: "Una MAC se asocia a un puerto del bridge; equipos switch dedicados suelen requerir CLI o telemetría propia." },
    ],
    misconceptions: [
      { claim: "El switch aprende MAC de destino.", correction: "Aprende sobre todo MAC de origen y puerto/VLAN de ingreso; usa esa tabla para decidir dónde enviar el destino." },
      { claim: "ARP resuelve una IP pública a la MAC del servidor remoto.", correction: "ARP solo resuelve dentro del enlace local; para una IP remota el host resuelve la MAC del siguiente salto." },
      { claim: "La MAC identifica de forma confiable y permanente a una persona o dispositivo.", correction: "Puede cambiar, falsificarse o aleatorizarse; es un identificador local de interfaz, no un mecanismo de autenticación." },
      { claim: "FCS evita que alguien falsifique una trama.", correction: "Detecta errores accidentales. Un atacante que puede crear tramas también puede calcular un FCS válido." },
    ],
    exercises: [
      { question: "El destino IP está fuera de la subred. ¿Qué MAC aparece en la trama que sale del cliente?", answer: "La MAC del siguiente salto en la LAN, normalmente el gateway. La IP destino sigue siendo la del servidor remoto hasta que NAT u otra función la cambie." },
      { question: "¿Por qué un router reduce broadcasts Ethernet?", answer: "Cada interfaz de router termina un enlace y no reenvía broadcasts de capa 2 como ARP a otra red. Los servicios de relay son una función configurada, no un puente transparente del broadcast." },
    ],
  },
  {
    number: 3,
    name: "Red",
    introduction: "La capa de red permite que un equipo envíe paquetes a través de redes distintas. Resuelve el direccionamiento lógico y la elección de un siguiente salto. El router recibe una trama de enlace, examina el paquete IP, consulta sus rutas y lo entrega dentro de una nueva trama por el enlace siguiente.",
    mainFunctions: [
      { name: "Identificar interfaces y redes", explanation: "Las direcciones IP y sus prefijos permiten identificar interfaces y decidir si el destino es local o requiere otra red.", example: "192.0.2.10/24 pertenece al prefijo 192.0.2.0/24." },
      { name: "Separar redes", explanation: "Los prefijos permiten determinar si un destino está en la red local o requiere un router." },
      { name: "Elegir el siguiente salto", explanation: "Los routers consultan tablas de rutas para avanzar el paquete hacia su destino." },
      { name: "Transportar paquetes entre enlaces", explanation: "La dirección IP de destino suele mantenerse mientras cambian las tramas de cada tramo." },
      { name: "Informar condiciones de red", explanation: "Mensajes de control pueden describir errores o ayudar a diagnosticar el camino, según filtros y políticas." },
    ],
    memorizationDefinition: "La capa de red direcciona paquetes y permite reenviarlos entre redes distintas. Los routers consultan rutas para elegir el siguiente salto; en cada tramo, la capa de enlace entrega el paquete mediante una trama adecuada al enlace local.",
    everydayExample: { analogy: "Es como escribir una dirección postal con ciudad y código postal: cada centro de distribución decide a qué centro enviar la carta después.", limits: "Internet no sigue una fila única ni garantiza entrega. Las rutas pueden cambiar y cada centro solo decide el siguiente tramo según su información." },
    studySummary: { does: "Direcciona paquetes y selecciona caminos entre redes.", dataUnit: "Paquete o datagrama IP.", technologies: "IPv4, IPv6, routers, prefijos, tablas de rutas, gateway e ICMP.", remember: ["El host resuelve localmente la MAC del siguiente salto, no la MAC de todo servidor remoto.", "Un salto de traceroute sin respuesta no demuestra que el tránsito se haya perdido."], avoid: ["Confundir dirección IP con dirección MAC.", "Interpretar TTL/Hop Limit o ICMP como un contador de tiempo real de la aplicación."] },
    selfCheck: [
      { question: "¿Qué decide una tabla de rutas?", answer: "El siguiente salto o interfaz de salida para un prefijo de destino según las rutas disponibles." },
      { question: "¿Qué cambia al pasar un paquete por un router: el destino IP o la trama local?", answer: "El router normalmente crea una trama nueva para el siguiente enlace; la IP de destino se conserva salvo funciones como NAT." },
    ],
    pdu: "Paquete (datagrama IP)",
    objective:
      "Leer direccionamiento y prefijos IP, calcular el siguiente salto, distinguir encaminamiento de entrega local y comprender el papel de ICMP.",
    fundamentals: [
      "La capa de red transporta paquetes entre redes mediante direcciones lógicas. IPv4 e IPv6 ofrecen entrega de mejor esfuerzo: IP no promete que un paquete llegue, llegue una sola vez ni llegue en orden. TCP u otra capa superior puede aportar fiabilidad.",
      "Un host compara la dirección destino con sus rutas y el prefijo de cada ruta. El encaminamiento IP aplica la coincidencia de prefijo más larga y después métricas y política para elegir interfaz y siguiente salto. Un router repite la decisión con el paquete recibido.",
      "IPv4 tiene 32 bits y usa ARP en el enlace Ethernet para encontrar la MAC del vecino. IPv6 tiene 128 bits y Neighbor Discovery por ICMPv6; SLAAC y DHCPv6 pueden participar en configuración, según red. IPv6 no tiene broadcast de capa IP y usa multicast.",
      "Cada router reduce TTL IPv4 o Hop Limit IPv6 para limitar bucles; al agotarse puede devolver ICMP Time Exceeded. ICMP comunica errores y diagnósticos asociados a IP; `ping` usa Echo, pero bloquear Echo no implica que todo IP esté caído. Las rutas y los filtros determinan qué se observa.",
      "IPv4 puede fragmentarse en origen y, según DF y MTU, en routers. En IPv6 los routers no fragmentan; el origen usa Path MTU Discovery y un Fragment Header si necesita fragmentación. Las redes usan MTU y MSS para evitar fallos silenciosos en caminos heterogéneos.",
      "BGP intercambia prefijos entre sistemas autónomos aplicando política de cada red. RPKI puede publicar una ROA que autoriza a un sistema autónomo a originar un prefijo; la validación de origen ayuda a evaluar anuncios, pero no valida todo el camino BGP ni demuestra que una ruta sea benigna. uRPF contrasta la dirección origen con la información de rutas; el modo estricto puede descartar tráfico legítimo si la ruta es asimétrica.",
    ],
    workflow: [
      "El host crea un paquete IP con dirección origen y destino, protocolo siguiente (por ejemplo TCP, UDP o ICMP), TTL/Hop Limit y campos de control.",
      "Consulta tabla de rutas: ruta más específica, política y métrica seleccionan interfaz y siguiente salto. Si no hay ruta aplicable, el paquete falla localmente.",
      "Resuelve la dirección de enlace del siguiente salto mediante ARP para IPv4 o Neighbor Discovery para IPv6, y entrega el paquete en una trama local.",
      "Cada router valida encabezado, reduce TTL/Hop Limit, puede aplicar ACL, NAT, QoS o fragmentación IPv4, y crea una nueva trama para el siguiente enlace. La dirección IP lógica suele mantenerse aunque NAT puede modificarla.",
    ],
    encapsulation:
      "PDU: paquete o datagrama IP. IPv4 mínimo son 20 bytes sin opciones; IPv6 tiene encabezado base de 40 bytes y puede llevar encabezados de extensión. IP identifica el protocolo superior, no el puerto. ICMP viaja encapsulado en IP, y mensajes ICMPv6 son esenciales para Neighbor Discovery y funciones de IPv6.",
    protocols: [
      { name: "IPv4 (RFC 791 y actualizaciones)", role: "Direccionamiento de 32 bits, fragmentación IPv4 y entrega de datagramas entre redes." },
      { name: "IPv6 (RFC 8200)", role: "Direccionamiento de 128 bits, encabezado base simplificado y uso de extensiones; routers no fragmentan paquetes." },
      { name: "ICMPv4 (RFC 792) / ICMPv6 (RFC 4443)", role: "Transportan errores y diagnósticos IP; ICMPv6 también soporta funciones centrales como Neighbor Discovery." },
      { name: "OSPF / IS-IS / BGP", role: "Protocolos de control que intercambian rutas: interior, estado de enlace o interdominio. Sus mensajes y transporte no son todos equivalentes a un paquete de usuario." },
      { name: "IPsec ESP / AH", role: "Protegen paquetes IP en modos de transporte o túnel; la autenticación/cifrado depende del protocolo, modo y configuración." },
    ],
    technologies: [
      { name: "Router", role: "Reenvía paquetes entre interfaces y redes aplicando tabla y política de rutas." },
      { name: "Switch multicapa", role: "Combina conmutación L2 con encaminamiento IP en hardware." },
      { name: "Firewall L3/L4", role: "Aplica política sobre direcciones, protocolos, estados y, según producto, más contexto." },
      { name: "NAT y CGNAT", role: "Traducen direcciones/puertos; NAT no es sinónimo de firewall ni de cifrado." },
      { name: "Túnel VPN", role: "Encapsula tráfico IP sobre otro camino; el MTU efectivo disminuye por encabezados añadidos." },
    ],
    communication:
      "Para llegar desde 192.168.1.10/24 a 203.0.113.10, el cliente elige su ruta por defecto y ARP resuelve 192.168.1.1. El paquete IP mantiene la dirección destino del servidor, pero las tramas cambian en cada enlace. Cada router consulta la ruta más específica, decrementa TTL y vuelve a encapsular. Si una ruta se pierde, puede aparecer ICMP Destination Unreachable; si el TTL se agota, traceroute infiere saltos usando respuestas ICMP o UDP/TCP según método.",
    blueTeam: [
      { heading: "Amenazas", detail: "Suplantación de origen, rutas no autorizadas, escaneo de red, abuso de túneles, evasión mediante fragmentación, errores de ACL y ataques de agotamiento pueden exponer o interrumpir segmentos." },
      { heading: "Telemetría", detail: "Correlaciona flujos NetFlow/IPFIX —resúmenes de conversaciones, no copias de cada paquete—, logs de firewall/router, cambios de ruta, ARP/NDP, ICMP, TTL, fragmentos, VPN y tabla de vecinos. Campos, granularidad y muestreo dependen del exportador; un sensor fuera de ruta puede ver solo una parte del tráfico." },
      { heading: "Detección e investigación", detail: "Busca nuevos prefijos o vecinos, paquetes con origen imposible para la interfaz, picos de destinos/puertos, fragmentos inusuales y cambios de siguiente salto. Comprueba rutas de ida y vuelta, NAT, filtros y rutas asimétricas antes de descartar la falta de respuesta como caída." },
      { heading: "Mitigación", detail: "Usa filtros anti-spoofing (por ejemplo BCP 38 donde aplique), ACL explícitas, segmentación, autenticación de protocolos de enrutamiento, validación de origen BGP con RPKI/ROA cuando esté desplegada, uRPF según simetría de rutas, límites de control-plane, MTU coherente y registro de cambios. Permite ICMPv6 necesario para operar IPv6." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "Define rangos aprobados y evita escanear direcciones de terceros. Primero confirma rutas locales, resolución de nombres y alcance desde el segmento asignado; conserva hora, origen y parámetros usados." },
      { heading: "Enumeración", detail: "En un laboratorio, compara tabla de rutas con saltos observables, identifica hosts activos y documenta qué filtros o NAT ocultan direcciones. La ausencia de respuesta ICMP no demuestra que un host esté apagado." },
      { heading: "Técnicas y herramientas", detail: "Nmap en modo de descubrimiento o escaneo de puertos debe apuntar solo a objetivos autorizados y a una tasa acordada. `traceroute`, `tracepath`, `ip route` y capturas permiten entender camino y fallos sin alterar rutas del sistema." },
    ],
    commands: [
      { command: "ip -4 addr show && ip -6 addr show", purpose: "Inspecciona direcciones y prefijos asignados a interfaces.", interpretation: "La dirección, prefijo y estado ayudan a calcular pertenencia a subred; una dirección link-local IPv6 no sustituye una ruta global." },
      { command: "ip route get 203.0.113.10", purpose: "Calcula interfaz y siguiente salto elegidos por el kernel.", interpretation: "Compárala con la política de red esperada; la ruta efectiva puede diferir por reglas, VRF o tablas múltiples." },
      { command: "tracepath -n 203.0.113.10", purpose: "Explora saltos y Path MTU sin DNS inverso.", interpretation: "Saltos `no reply` pueden filtrar ICMP o limitar respuestas; no prueban pérdida de tránsito si el destino sí responde." },
      { command: "ping -c 4 192.0.2.1", purpose: "Envía cuatro solicitudes ICMP Echo a una dirección documental reservada.", interpretation: "En una práctica, reemplázala por el host autorizado. Latencia y pérdida dependen del trayecto y de si Echo se permite; ICMP Echo no es TCP." },
    ],
    misconceptions: [
      { claim: "Una dirección IP identifica físicamente un equipo para siempre.", correction: "Es una dirección lógica asignada por interfaz o política; puede cambiar, traducirse, compartirse o ser suplantada." },
      { claim: "Un router reenvía una trama Ethernet intacta.", correction: "Termina la trama de entrada y crea otra para el siguiente enlace; el paquete IP atraviesa routers sujeto a TTL, políticas y posibles traducciones." },
      { claim: "ICMP es solo ping.", correction: "ICMP lleva errores y funciones de diagnóstico; ICMPv6 es parte necesaria de Neighbor Discovery y Path MTU Discovery." },
      { claim: "Las capas OSI describen exactamente cómo implementa el sistema cada protocolo.", correction: "OSI es un modelo de referencia. TCP/IP agrupa funciones de forma distinta y algunos protocolos abarcan varias capas conceptuales." },
    ],
    exercises: [
      { question: "Un host /24 envía a una IP del mismo /24 y a otra externa. ¿Qué cambia en la resolución de enlace?", answer: "Para la IP local resuelve la MAC del destino; para la externa resuelve la MAC del gateway. En ambos casos la trama solo cubre el enlace local." },
      { question: "Traceroute muestra un salto sin respuesta y el siguiente sí responde. ¿Qué puedes concluir?", answer: "Ese router no envió una respuesta observable; puede filtrar o limitar ICMP. Como el tráfico alcanzó un salto posterior, no puedes concluir que el router descartó todo el tránsito." },
    ],
  },
  {
    number: 4,
    name: "Transporte",
    introduction: "La capa de transporte conecta procesos de aplicaciones en equipos distintos. Resuelve cómo distinguir varias conversaciones que comparten direcciones IP. Usa puertos para entregar datos al socket adecuado y se apoya en la capa de red para moverlos entre extremos.",
    mainFunctions: [
      { name: "Entregar datos al proceso adecuado", explanation: "Los puertos ayudan al sistema operativo a multiplexar conversaciones entre aplicaciones.", example: "Una conexión a TCP 443 llega al servicio que escucha en ese puerto, según el sistema y la configuración." },
      { name: "Ofrecer un flujo fiable con TCP", explanation: "TCP ordena bytes y usa confirmaciones y retransmisiones para recuperar pérdidas observadas." },
      { name: "Enviar datagramas con UDP", explanation: "UDP conserva límites de mensajes y no garantiza por sí mismo entrega ni orden." },
      { name: "Controlar ritmo y congestión", explanation: "TCP adapta el envío según confirmaciones y señales de congestión; el comportamiento depende de la implementación." },
      { name: "Describir extremos y estado", explanation: "Direcciones, puertos y estado permiten identificar una conversación; NAT y balanceadores pueden cambiar lo que observa cada punto." },
    ],
    memorizationDefinition: "La capa de transporte permite intercambiar datos entre procesos usando puertos. TCP ofrece un flujo ordenado con mecanismos de entrega; UDP envía datagramas sin garantizar entrega ni orden. Cada aplicación elige según sus requisitos.",
    everydayExample: { analogy: "Piensa en un edificio con una dirección postal y varios departamentos: la dirección lleva al edificio y el número de departamento ayuda a entregar el paquete al servicio correcto.", limits: "Un puerto no identifica por sí solo a una persona o aplicación y la analogía no refleja retransmisiones, estados ni reglas de firewall." },
    studySummary: { does: "Multiplexa conversaciones y ofrece servicios de transporte entre procesos.", dataUnit: "Segmento TCP o datagrama UDP.", technologies: "Puertos, sockets, TCP, UDP, QUIC y conntrack.", remember: ["SYN inicia el handshake TCP; SYN_RECV puede ser un estado normal transitorio.", "Interpreta retransmisiones, RTT y estado junto con carga, ruta y punto de captura."], avoid: ["Afirmar que UDP es siempre más rápido o inseguro.", "Concluir un SYN flood solo por observar SYN_RECV."] },
    selfCheck: [
      { question: "¿Qué diferencia básica hay entre el servicio de TCP y el de UDP?", answer: "TCP proporciona un flujo ordenado y mecanismos de entrega; UDP ofrece datagramas sin esas garantías." },
      { question: "¿Para qué sirve un puerto de transporte?", answer: "Ayuda al sistema a entregar datos de una conversación al socket o servicio correspondiente." },
    ],
    pdu: "Segmento TCP o datagrama UDP",
    objective:
      "Diferenciar transporte fiable orientado a flujo de datagramas sin conexión, leer puertos y relacionar sockets, estados y servicios.",
    fundamentals: [
      "La capa de transporte multiplexa conversaciones mediante puertos y ofrece servicios de proceso a proceso. Un socket TCP se identifica por protocolo, IP y puerto local/remoto; conexiones simultáneas pueden compartir puerto servidor si difiere la tupla de cliente.",
      "TCP ofrece un flujo de bytes ordenado y fiable mientras dure una conexión. SYN, SYN-ACK y ACK sincronizan estado inicial; números de secuencia y acuses reconocen bytes, retransmisiones recuperan pérdidas, ventana de recepción controla flujo y algoritmos de congestión ajustan uso de la ruta. Los límites de `write()` no son límites de mensajes en TCP.",
      "En el handshake habitual, SYN inicia la apertura, SYN-ACK reconoce el SYN y propone su propio número de secuencia, y ACK confirma ese SYN-ACK. En Linux, `SYN_RECV` suele indicar que el servidor recibió SYN y envió SYN-ACK, pero aún espera el ACK final. Un estado de vida corta es normal; una acumulación persistente merece revisar proporción de ACK finales, tasa de conexiones, colas/recursos y disponibilidad del servicio.",
      "Muchos `SYN_RECV` no demuestran un SYN flood. Pérdida, RTT alto, clientes que abandonan, captura asimétrica, balanceadores o estado de firewall pueden producir observaciones similares. Compara una línea base y el handshake completo desde puntos adecuados con pérdidas/retransmisiones, rutas de ida y vuelta, métricas del host y cambios recientes antes de atribuir causa.",
      "UDP conserva límites de datagrama y agrega puertos y checksum, pero no retransmite, ordena ni establece conexión por sí solo. DNS, voz y juegos pueden usar UDP; las aplicaciones deben implementar cualquier fiabilidad que necesiten. ICMP no tiene puertos TCP/UDP.",
      "El puerto describe un punto de demultiplexación, no prueba qué aplicación corre. NAT y conntrack pueden mantener mapeos y estado de flujos para traducir direcciones/puertos y reconocer respuestas; sus tablas tienen límites y temporizadores. Los firewalls con estado permiten tráfico de respuesta de una conexión observada, pero eso no equivale a que todo UDP sea una sesión fiable.",
      "QUIC funciona sobre UDP y aporta conexiones, streams, control de congestión y cifrado TLS integrado; conceptualmente combina funciones asociadas a transporte y seguridad. HTTP/3 usa QUIC. No es TCP ni un protocolo puramente de capa 7.",
    ],
    workflow: [
      "La aplicación abre un socket y elige protocolo y puerto local; el sistema operativo asocia cada segmento o datagrama con la tupla de socket correspondiente.",
      "Para TCP, el cliente inicia con SYN; el servidor responde SYN-ACK y el cliente confirma ACK. Los dos lados negocian opciones como MSS, SACK y window scaling.",
      "TCP entrega bytes en orden al proceso, retransmite según acuses y temporizadores y regula envío por ventana y control de congestión. UDP entrega datagramas si llegan y el socket está asociado.",
      "Al cerrar TCP, FIN/ACK o RST cambian estado; TIME_WAIT protege contra segmentos atrasados. En firewall/NAT, el flujo y sus temporizadores determinan la asociación de estado.",
    ],
    encapsulation:
      "PDU TCP: segmento con puertos, secuencia, ACK, flags, ventana y checksum. PDU UDP: datagrama de encabezado mínimo de 8 bytes con puertos, longitud y checksum. El transporte se encapsula en IP; la carga TCP es un flujo de bytes y UDP mantiene límites de datagrama.",
    protocols: [
      { name: "TCP (RFC 9293)", role: "Flujo fiable y ordenado con control de flujo y congestión; las aplicaciones definen cómo interpretar sus bytes." },
      { name: "UDP (RFC 768; actualización RFC 9868)", role: "Datagramas sin establecimiento de conexión ni garantías de entrega y orden; RFC 9868 agrega opciones UDP." },
      { name: "SCTP (RFC 9260)", role: "Transporte orientado a mensajes con asociaciones, multistreaming y multihoming en implementaciones compatibles." },
      { name: "QUIC (RFC 9000) / HTTP/3 (RFC 9114)", role: "QUIC implementa flujos y seguridad sobre UDP; HTTP/3 mapea semántica HTTP a streams QUIC." },
      { name: "DCCP (RFC 4340)", role: "Protocolo de transporte de datagramas con control de congestión; su despliegue es poco común." },
    ],
    technologies: [
      { name: "Stack de red del sistema operativo", role: "Gestiona sockets, estados TCP, colas, puertos y entrega de datos a procesos." },
      { name: "Firewall con estado", role: "Relaciona paquetes con flujos y aplica política por protocolo, tupla y estado." },
      { name: "NAT/PAT", role: "Mantiene mapeos de direcciones y puertos que afectan la tupla vista en cada lado." },
      { name: "Balanceador L4", role: "Distribuye conexiones o datagramas según direcciones y puertos, sin necesariamente interpretar HTTP." },
      { name: "Proxy TCP / terminador QUIC", role: "Puede terminar una conexión y abrir otra; en ese caso existen dos transportes distintos." },
    ],
    communication:
      "Al solicitar HTTPS/TCP, el cliente abre una conexión desde un puerto efímero hacia puerto 443. El handshake TCP no autentica el servidor ni cifra datos. Luego TLS negocia claves. En HTTP/3, QUIC suele iniciar con UDP destino 443 y ejecuta allí sus propios streams y handshake. Un firewall puede observar puertos y estados aunque no vea el contenido cifrado.",
    blueTeam: [
      { heading: "Amenazas", detail: "Escaneo de puertos, SYN flood, abuso de servicios expuestos, conexiones salientes persistentes, agotamiento de sockets y tunelización sobre UDP pueden violar política o disponibilidad." },
      { heading: "Telemetría", detail: "Registra tuplas, protocolo, estados TCP (incluido `SYN_RECV` en sistemas que exponen ese nombre), duración, bytes, retransmisiones, resets, puertos efímeros, conntrack y decisión de firewall. Un SYN aislado no es una sesión establecida." },
      { heading: "Detección e investigación", detail: "Unos pocos estados SYN_RECV mientras termina el handshake son normales. Busca acumulación persistente, pocos ACK finales, presión de cola/recurso e impacto en el servicio; correlaciona pérdidas, RTT, rutas asimétricas, balanceador, firewall y cambios recientes antes de plantear un SYN flood." },
      { heading: "Mitigación", detail: "Reduce servicios expuestos, aplica listas de permitidos, límites de tasa y protecciones de SYN del sistema (por ejemplo SYN cookies, si la plataforma las admite) o SYN proxy debidamente dimensionados. Estas medidas reducen recursos de conexiones incompletas, pero no sustituyen medir impacto ni distinguir pérdida y asimetría. No bloquees UDP indiscriminadamente." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "Mantén el escaneo dentro de los hosts y puertos incluidos en la autorización. Registra origen, ventanas, velocidad y opciones; el escaneo puede activar controles o cargar equipos." },
      { heading: "Enumeración", detail: "Identifica puertos accesibles, estados y servicio aparente, pero valida banners con evidencia: el número de puerto es una convención, no una identificación confiable." },
      { heading: "Técnicas y herramientas", detail: "En laboratorio, compara `ss`, `nc -vz` y Nmap con reglas de firewall conocidas. Usa pruebas no destructivas y detente si el alcance o autorización no cubren el activo." },
    ],
    commands: [
      { command: "ss -lntup", purpose: "Lista sockets en escucha TCP/UDP y, con privilegios, procesos asociados.", interpretation: "`LISTEN` es TCP; UDP no presenta el mismo handshake. Un puerto abierto en loopback puede no ser accesible desde otras interfaces." },
      { command: "ss -ant state established", purpose: "Muestra conexiones TCP establecidas locales.", interpretation: "Observa endpoints y estado desde un host; NAT o proxies pueden hacer que la vista difiera del perímetro." },
      { command: "nc -vz -w 2 127.0.0.1 22", purpose: "Prueba conectividad TCP a un servicio local autorizado con timeout.", interpretation: "`succeeded` prueba que el handshake se completó desde ese origen; no identifica versión, seguridad ni acceso a la aplicación." },
      { command: "sudo tcpdump -nn -i any 'tcp port 443 or udp port 443'", purpose: "Compara transporte TCP y UDP en puerto 443 en interfaces visibles.", interpretation: "`-nn` evita resolución de nombres; QUIC sobre UDP/443 no se vuelve TCP por usar el mismo número de puerto." },
    ],
    misconceptions: [
      { claim: "TCP conserva mensajes exactamente como los envía la aplicación.", correction: "TCP es un flujo de bytes; lecturas pueden agrupar o dividir escrituras. La aplicación necesita su propio framing." },
      { claim: "UDP es inseguro porque no tiene conexión.", correction: "UDP no ofrece fiabilidad ni seguridad propia; una aplicación puede proteger su carga con protocolos como QUIC o DTLS." },
      { claim: "Un puerto 443 significa HTTPS.", correction: "Solo indica destino de transporte convencional. Puede alojar otro protocolo; HTTPS puede usar TCP/TLS o QUIC/UDP." },
      { claim: "El handshake TCP cifra y autentica.", correction: "Solo establece estado y opciones TCP. La autenticación y cifrado pertenecen a protocolos superiores como TLS." },
    ],
    exercises: [
      { question: "¿Qué se confirma con SYN, SYN-ACK y ACK?", answer: "Que los extremos intercambiaron segmentos y sincronizaron estado TCP inicial. No valida identidad del servicio ni completa el handshake TLS." },
      { question: "¿Por qué `ss` muestra un listener pero una prueba remota falla?", answer: "Puede escuchar solo en loopback, una ACL/firewall puede filtrar, la ruta puede fallar o el puerto publicado por NAT/balanceador puede ser distinto. Verifica dirección de bind, ruta y política por salto." },
    ],
  },
  {
    number: 5,
    name: "Sesión",
    introduction: "La capa de sesión es una forma del modelo OSI de pensar en los diálogos que una aplicación mantiene: cómo comienzan, continúan, coordinan turnos y terminan. Ayuda a describir continuidad entre intercambios. En TCP/IP estas tareas suelen estar repartidas entre aplicaciones, bibliotecas y protocolos; no hay un protocolo universal exclusivo de capa 5.",
    mainFunctions: [
      { name: "Abrir y cerrar diálogos", explanation: "Una aplicación puede establecer cuándo empieza y termina una interacción lógica." },
      { name: "Mantener continuidad", explanation: "Un identificador o contexto puede asociar varias solicitudes a una misma actividad lógica." },
      { name: "Coordinar intercambios", explanation: "Los participantes pueden organizar turnos, fases o estados de una conversación." },
      { name: "Recuperar o reanudar trabajo", explanation: "Algunos sistemas guardan puntos de control para continuar tras una interrupción; no es una función garantizada por todo protocolo." },
      { name: "Separar sesión de transporte", explanation: "Una sesión de aplicación puede abarcar varias conexiones o cambiar de ruta, proxy o dispositivo." },
    ],
    memorizationDefinition: "En el modelo OSI, la capa de sesión agrupa funciones que establecen, coordinan y reanudan diálogos entre aplicaciones. En sistemas TCP/IP esas tareas suelen integrarse en la aplicación y sus protocolos, sin un protocolo universal exclusivo de esta capa.",
    everydayExample: { analogy: "Una videollamada tiene una sala con participantes, estado y turnos; la conversación puede continuar aunque cambie la conexión usada por un participante.", limits: "La sala no es necesariamente un objeto separado en la red. Cada aplicación implementa continuidad y recuperación de una forma propia." },
    studySummary: { does: "Describe el estado y la continuidad lógica de diálogos entre aplicaciones.", dataUnit: "Datos de aplicación asociados a una sesión lógica; no existe un encabezado universal de capa 5.", technologies: "Estados de aplicación, sesiones, cookies, tokens, RPC y sockets que pueden sostenerlas.", remember: ["Una sesión de aplicación no es lo mismo que una conexión TCP.", "El modelo OSI organiza funciones; TCP/IP integra varias de ellas en la aplicación."], avoid: ["Afirmar que TCP implementa por sí solo la capa de sesión.", "Tratar un token como prueba suficiente de identidad o autorización." ] },
    selfCheck: [
      { question: "¿Puede una sesión de aplicación continuar en más de una conexión TCP?", answer: "Sí. La sesión lógica y la conexión de transporte son estados distintos; la aplicación determina cómo conservar continuidad." },
      { question: "¿Hay un único protocolo que todas las redes usen para capa 5?", answer: "No. Es una agrupación funcional del modelo OSI; las implementaciones distribuyen esas tareas de distintas maneras." },
    ],
    pdu: "Datos de diálogo o sesión de aplicación",
    objective:
      "Reconocer la idea de diálogo, estado y recuperación de sesión, y separar una sesión lógica de una conexión de transporte.",
    fundamentals: [
      "El modelo OSI asigna a la capa 5 establecimiento, administración y terminación de diálogos entre aplicaciones, control del turno de conversación y puntos de sincronización o recuperación. Es una clasificación conceptual; las pilas TCP/IP reales no suelen implementar un módulo universal llamado capa de sesión.",
      "Una sesión lógica puede sobrevivir a varias conexiones TCP o QUIC, o una conexión puede transportar múltiples sesiones y streams. Por ejemplo, un navegador reutiliza conexiones HTTP y mantiene cookies de aplicación; un token puede identificar una sesión incluso tras reconectar. Sesión, socket y autenticación son conceptos distintos.",
      "RPC, SMB, bases de datos, SIP y aplicaciones web mantienen estado con mecanismos propios. Algunos protocolos ofrecen diálogo o negociación que se suele ubicar en capa 5; su clasificación exacta depende de la función analizada y del modelo didáctico.",
      "El estado de sesión puede residir en cliente, servidor, proxy o almacén compartido. Un timeout, cierre explícito, revocación o expiración debe liberar recursos y limitar la reutilización. Si no se protege bien, aparecen fijación, robo, repetición y confusión entre sesiones.",
    ],
    workflow: [
      "La aplicación inicia un diálogo y crea un identificador, contexto de autenticación o estado compartido; el transporte subyacente puede ser TCP, UDP/QUIC u otro.",
      "Los participantes intercambian mensajes de control y datos. Los puntos de sincronización, keepalives o números de secuencia de aplicación permiten continuar o detectar estado obsoleto.",
      "Una reconexión puede reanudar una sesión si el protocolo lo define y el servidor valida el contexto; establecer un nuevo TCP por sí solo no restaura identidad ni autorización.",
      "La aplicación cierra o expira el estado y revoca credenciales asociadas. Registros de inicio, cambio, reanudación y cierre permiten reconstruir el ciclo de vida.",
    ],
    encapsulation:
      "OSI describe una unidad de diálogo o datos de sesión, pero no existe un encabezado de sesión universal en Ethernet/IP. En despliegues reales los datos de sesión viajan dentro de mensajes de aplicación, streams de transporte y paquetes IP; el mecanismo y su formato son propios del protocolo.",
    protocols: [
      { name: "RPC (ONC RPC / DCE-RPC)", role: "Invoca operaciones remotas; el transporte y los detalles de estado dependen del protocolo y servicio." },
      { name: "SMB 2/3", role: "Mantiene sesiones de cliente y árbol/conexión a recursos; se transporta normalmente sobre TCP, con variantes y modos según entorno." },
      { name: "SIP (RFC 3261)", role: "Señaliza diálogos de comunicaciones. Es un protocolo de aplicación aunque sus diálogos ilustran bien el concepto de sesión." },
      { name: "TLS resumption", role: "Permite reanudar ciertos contextos criptográficos, pero no es una sesión OSI universal ni equivale a la sesión autenticada de una aplicación." },
      { name: "Cookies y tokens web", role: "Mecanismos de estado de aplicación para asociar solicitudes con una sesión; su alcance depende de política del servidor y atributos." },
    ],
    technologies: [
      { name: "Gestor de sesiones", role: "Crea, valida, expira y revoca estado lógico asociado con una aplicación." },
      { name: "Proxy y balanceador", role: "Pueden mantener afinidad o transportar una sesión; deben evitar confiar en estado cliente sin validar." },
      { name: "Almacén compartido", role: "Distribuye estado entre instancias para reanudación; permisos y expiración deben ser coherentes." },
      { name: "Kerberos / ticketing", role: "Emite credenciales reutilizables con vida y alcance definidos; participa en autenticación y estado de aplicación." },
      { name: "Gateway RPC", role: "Media llamadas entre servicios, protocolo y dominios de seguridad." },
    ],
    communication:
      "Al iniciar sesión en una aplicación web, el cliente autentica credenciales por HTTPS y recibe una cookie de sesión protegida. Cada solicitud HTTP posterior puede usar una conexión ya abierta o una nueva; el servidor valida cookie, expiración y permisos. Cerrar TCP no necesariamente cierra la sesión web, y volver a conectar TCP no autoriza al usuario. Un cierre de sesión efectivo invalida el token en el servidor o reduce su vigencia de manera controlada.",
    blueTeam: [
      { heading: "Amenazas", detail: "Robo o fijación de sesión, tokens largos sin revocación, reutilización tras cierre, secuestro de diálogo, replay, credenciales expuestas en logs y sesiones huérfanas en proxies son riesgos de estado y aplicación." },
      { heading: "Telemetría", detail: "Registra creación, autenticación, renovación, privilegio, origen, expiración y revocación con identificadores seudónimos. Evita registrar cookies, bearer tokens, secretos RPC o contenido sensible." },
      { heading: "Detección e investigación", detail: "Busca una misma sesión desde ubicaciones o dispositivos incompatibles, cambios súbitos de privilegio, token usado después de revocación y reanudación anómala. Correlaciona identidad, aplicación, proxy, dispositivo y reloj." },
      { heading: "Mitigación", detail: "Usa identificadores impredecibles, rotación tras autenticación y privilegio, expiración apropiada, revocación y controles anti-CSRF: el ataque intenta que el navegador autenticado envíe una acción que el usuario no pretendía. Cookies Secure/HttpOnly/SameSite ayudan según el flujo, pero no sustituyen validar solicitudes ni proteger contra XSS. Minimiza exposición de logs y tokens." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "Mapea flujos de login, renovación y logout en una aplicación de prueba. Asegura cuentas y datos sintéticos, y define límites de frecuencia; no captures tokens de usuarios reales." },
      { heading: "Enumeración", detail: "Documenta cookies y cabeceras observables en tu propia sesión, tiempos de expiración, invalidación al salir y comportamiento en varios dispositivos. No intentes reutilizar identificadores de terceros." },
      { heading: "Técnicas y herramientas", detail: "En laboratorio, prueba que una sesión antigua se invalida al salir y que el identificador rota después de autenticar. DevTools, Burp Suite Community y `curl` pueden ayudar en sistemas autorizados; enmascara tokens en evidencia." },
    ],
    commands: [
      { command: "curl -sS -D - -o /dev/null https://example.org/", purpose: "Inspecciona estado HTTP y encabezados de respuesta de un dominio público de ejemplo.", interpretation: "Observa `Set-Cookie` y atributos sin imprimir un cuerpo. Hazlo solo en un sistema permitido y no compartas valores de cookies." },
      { command: "ss -tnp", purpose: "Relaciona conexiones TCP locales con procesos cuando el sistema lo permite.", interpretation: "Muestra transporte y sockets, no el estado de login mantenido por la aplicación." },
      { command: "journalctl -u ssh --since '10 minutes ago'", purpose: "Consulta eventos recientes de SSH en sistemas con systemd y permisos adecuados.", interpretation: "Correlaciona autenticación y conexiones, pero las sesiones de una aplicación distinta requieren sus propios logs." },
      { command: "date -Is", purpose: "Registra hora local ISO-8601 durante una prueba controlada.", interpretation: "Compara relojes sincronizados al correlacionar cliente, proxy y servidor; diferencias de hora pueden simular secuencias extrañas." },
    ],
    misconceptions: [
      { claim: "Cada conexión TCP equivale a una sesión de usuario.", correction: "Una sesión de aplicación puede abarcar conexiones; una conexión puede transportar varias sesiones o usuarios multiplexados." },
      { claim: "Cerrar el navegador siempre invalida el login.", correction: "La cookie puede persistir o el servidor mantener estado hasta expirar; logout y revocación deben definirse explícitamente." },
      { claim: "La capa 5 aparece como un encabezado fijo en cada paquete.", correction: "En redes modernas no hay un encabezado OSI de sesión universal; el estado se expresa en protocolos de aplicación." },
      { claim: "Una cookie aleatoria por sí sola protege una sesión.", correction: "Importan entropía, transporte, almacenamiento, alcance, expiración, rotación, revocación y validación del servidor." },
    ],
    exercises: [
      { question: "La conexión TCP de un usuario se cierra, pero vuelve a cargar la página autenticada. ¿Qué lo explica?", answer: "La sesión de aplicación puede estar identificada por una cookie/token persistente y el servidor todavía la considera válida; el nuevo TCP es una conexión distinta." },
      { question: "¿Qué pruebas muestran que logout revoca sesión y no solo borra la cookie local?", answer: "En una aplicación de laboratorio, conserva de forma segura un token sintético antes de cerrar sesión e intenta reutilizarlo después; debe rechazarse. Evita exponer tokens en reportes." },
    ],
  },
  {
    number: 6,
    name: "Presentación",
    introduction: "La capa de presentación ayuda a describir cómo representar los datos para que las aplicaciones puedan interpretarlos. Trata formatos, codificación, serialización, compresión y protección criptográfica. En TCP/IP no siempre existe una capa separada: bibliotecas y protocolos distribuyen esas funciones entre la aplicación y el transporte.",
    mainFunctions: [
      { name: "Representar estructuras", explanation: "Un formato define cómo ordenar campos, números, texto u objetos." },
      { name: "Codificar caracteres", explanation: "Una codificación convierte caracteres en bytes que pueden enviarse y recuperarse.", example: "UTF-8 representa texto Unicode con secuencias de uno a cuatro bytes." },
      { name: "Serializar mensajes", explanation: "La serialización transforma una estructura en una secuencia apta para almacenamiento o transmisión." },
      { name: "Comprimir datos", explanation: "La compresión reduce tamaño usando reglas que el receptor debe poder interpretar." },
      { name: "Proteger datos", explanation: "El cifrado y la autenticación pueden proteger contenido o canal; TLS suele clasificarse en distintas capas según el enfoque." },
    ],
    memorizationDefinition: "La capa de presentación describe cómo codificar, representar, transformar o proteger los datos para que las aplicaciones los interpreten. Formatos, compresión y cifrado pueden vivir en bibliotecas o protocolos distintos; su clasificación depende de la función estudiada.",
    everydayExample: { analogy: "Es como acordar el idioma, el formato de fecha y el tipo de archivo de un documento antes de compartirlo; un sobre sellado añade protección durante el envío.", limits: "Los sistemas reales usan muchos formatos y capas de protección independientes. Tener el mismo formato no autentica al emisor ni garantiza que el contenido sea seguro." },
    studySummary: { does: "Describe formatos y transformaciones que permiten representar e interpretar datos.", dataUnit: "Bytes o estructuras codificadas según el formato elegido.", technologies: "UTF-8, JSON, ASN.1, compresión, certificados, PKI y TLS según el contexto.", remember: ["Codificar no es cifrar: Base64 no oculta el contenido.", "TLS protege un canal; no garantiza que una aplicación autorice correctamente cada acción."], avoid: ["Afirmar que TLS pertenece universalmente a una sola capa OSI.", "Confundir una firma, un hash y un mecanismo de confidencialidad."] },
    selfCheck: [
      { question: "¿Qué diferencia hay entre codificar y cifrar?", answer: "La codificación representa datos según reglas públicas; el cifrado busca que el contenido no sea legible sin la clave adecuada." },
      { question: "¿Un canal TLS válido demuestra que la aplicación es segura?", answer: "No. Protege el canal bajo la configuración observada, pero la aplicación todavía puede tener fallas de lógica o autorización." },
    ],
    pdu: "Datos representados, codificados o protegidos",
    objective:
      "Analizar cómo se representan, transforman, comprimen y protegen los datos, y estudiar TLS y certificados sin presentar la capa 6 como una ubicación universal fija.",
    fundamentals: [
      "El modelo OSI asigna a presentación la sintaxis y semántica de datos, conversión de formato, compresión y cifrado. En Internet esas funciones suelen vivir en bibliotecas y protocolos que se integran con la aplicación; no existe una capa de presentación TCP/IP independiente en todos los flujos.",
      "Una cadena puede representarse como UTF-8, UTF-16 u otra codificación; una estructura puede serializarse como JSON, ASN.1, Protocol Buffers o CBOR; una carga puede comprimirse con gzip o zstd. Interpretar bytes exige conocer formato, versión, longitud y reglas de validación.",
      "TLS 1.3 (RFC 9846, que actualiza y reemplaza RFC 8446) protege un canal con autenticación del servidor y, opcionalmente, del cliente según método y configuración; aporta negociación criptográfica y cifrado autenticado. Es común ubicarlo en la capa 6 para enseñanza por sus funciones de representación y seguridad, pero en sistemas reales se integra entre la API de aplicación y el transporte, y su clasificación OSI es discutible.",
      "X.509 define certificados de clave pública y cadenas de certificación. La validación del certificado comprueba la cadena, vigencia y políticas; el cliente TLS también debe verificar que la identidad del servicio coincida con el nombre solicitado. TLS protege el canal, pero no garantiza que el contenido o servicio sea benigno ni cifra metadatos de red como IP y puerto.",
      "SNI es una extensión del ClientHello TLS que indica el nombre de servicio para elegir el certificado en servidores compartidos. En handshakes convencionales puede observarse sin descifrar HTTP. ECH es una extensión que, cuando está configurada y negociada, cifra el ClientHello interno que contiene datos sensibles como el nombre solicitado; el ClientHello externo y otros metadatos pueden seguir visibles, y no todo cliente/servidor usa ECH.",
      "Cifrado no es codificación: Base64 solo representa bytes imprimibles; compresión no es cifrado; hashing no es cifrado reversible. Confundir estas operaciones causa exposición de secretos y análisis incorrecto de capturas.",
    ],
    workflow: [
      "La aplicación transforma objetos a una representación acordada: texto, serialización, tipos, orden de campos y codificación de caracteres.",
      "Puede comprimir o negociar un formato. El receptor debe limitar tamaños y expansión de recursos para evitar entradas maliciosas o bombas de descompresión.",
      "Con TLS, los extremos negocian versión, algoritmos y claves; el cliente valida certificado y nombre. El canal deriva claves de tráfico y cifra registros con autenticación de integridad.",
      "El receptor autentica y descifra registros TLS, descomprime si el protocolo lo establece, valida la sintaxis y entrega datos a la aplicación. La app aún debe validar autorización y semántica.",
    ],
    encapsulation:
      "No hay una PDU de presentación universal. JSON, ASN.1, TLS records y formatos binarios tienen estructuras propias; TLS encapsula datos de aplicación en registros sobre transporte confiable en su modo tradicional. TLS 1.3 sobre QUIC usa el mapeo de QUIC, no registros TLS TCP convencionales.",
    protocols: [
      { name: "TLS 1.3 (RFC 9846; antes RFC 8446)", role: "Establece claves y protege datos con cifrado autenticado; su ubicación OSI se clasifica de varias formas." },
      { name: "X.509 / PKIX", role: "Define certificados y cadenas de confianza para vincular identidades con claves públicas." },
      { name: "ASN.1 / DER / BER", role: "Notaciones y codificaciones para estructuras de datos; X.509 suele codificarse como DER." },
      { name: "UTF-8 (RFC 3629)", role: "Codificación de Unicode ampliamente usada; validar texto exige decodificación estricta y tratamiento de normalización adecuado." },
      { name: "gzip / zlib / CBOR / Protocol Buffers", role: "Ejemplos de compresión y serialización; suelen ser convenciones de aplicación, no protocolos de capa 6 obligatorios." },
    ],
    technologies: [
      { name: "Biblioteca TLS", role: "OpenSSL, BoringSSL, rustls u otra implementa criptografía y validación según configuración." },
      { name: "Autoridad certificadora", role: "Firma certificados dentro de una cadena de confianza; su firma no demuestra seguridad del sitio." },
      { name: "Codificador/serializador", role: "Convierte estructuras a bytes y viceversa con reglas de esquema y versión." },
      { name: "Proxy de terminación TLS", role: "Descifra en un punto de confianza y crea otro canal; cambia el límite de visibilidad y confianza." },
      { name: "HSM y almacén de claves", role: "Protegen claves privadas y operaciones criptográficas; deben controlar exportación, acceso y rotación." },
    ],
    communication:
      "En HTTPS sobre TCP, el cliente inicia TLS después del handshake TCP, envía ClientHello con capacidades y nombre de servidor (salvo protecciones de metadatos compatibles), valida certificado y acuerda claves. Los datos HTTP pasan a registros TLS cifrados antes de entrar a TCP. Un observador puede ver IP, puertos, tamaños y tiempos, pero no la ruta HTTP cifrada; una terminación TLS autorizada ve contenido en claro y se convierte en punto sensible.",
    blueTeam: [
      { heading: "Amenazas", detail: "Certificados vencidos o mal emitidos, validación deshabilitada, versiones débiles, claves expuestas, downgrade, formatos ambiguos, errores de parsing y compresión con fuga de secretos afectan confidencialidad e integridad." },
      { heading: "Telemetría", detail: "Registra versión TLS, suites, resultado de validación, SNI visible cuando aplique, huella de certificado, expiración y errores; no registres claves ni contenido descifrado sin necesidad y controles." },
      { heading: "Detección e investigación", detail: "Compara versiones y certificados con línea base, busca fallos de verificación, renegociaciones o destinos de confianza anómalos. En tráfico cifrado, metadatos y telemetría del endpoint complementan sensores de red; una huella TLS no es identidad concluyente." },
      { heading: "Mitigación", detail: "Mantén bibliotecas actualizadas, valida nombre y cadena, protege/rota claves, usa TLS moderno, desactiva algoritmos obsoletos y valida formatos con límites. Gestiona inspección TLS como un punto de confianza con acceso mínimo y auditoría." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "Evalúa solo dominios y certificados incluidos en alcance. Verifica configuración con bajo impacto y guarda nombres, hora, versión de herramienta y evidencia redactada." },
      { heading: "Enumeración", detail: "Comprueba vigencia, SAN, cadena, protocolo y negociación. La inspección de certificado no requiere intentar robar claves ni interceptar usuarios." },
      { heading: "Técnicas y herramientas", detail: "`openssl s_client`, `curl -v` y escáneres de configuración TLS en modo de prueba permiten revisar endpoints propios. No desactives validación como solución; úsalo solo como comparación diagnóstica controlada." },
    ],
    commands: [
      { command: "openssl s_client -connect example.org:443 -servername example.org -verify_return_error </dev/null", purpose: "Abre un handshake TLS de diagnóstico y solicita validación estricta de la cadena.", interpretation: "Verifica nombre/cadena según almacén local; `Verify return code: 0` no audita contenido de aplicación ni todas las políticas de seguridad." },
      { command: "curl -I --max-time 10 https://example.org/", purpose: "Consulta encabezados HTTP sobre TLS con timeout.", interpretation: "Si falla certificado, investiga cadena, nombre y reloj; no uses `-k` para ocultar la causa en producción." },
      { command: "openssl x509 -in server.pem -noout -subject -issuer -dates -ext subjectAltName", purpose: "Inspecciona un certificado PEM local que te pertenezca o esté autorizado.", interpretation: "Compara `notBefore`, `notAfter`, emisor y SAN con el nombre esperado; el sujeto común no sustituye la comprobación SAN." },
      { command: "printf 'Red\n' | iconv -f UTF-8 -t UTF-16LE | od -An -tx1", purpose: "Muestra bytes de una conversión de texto UTF-8 a UTF-16LE.", interpretation: "La representación de bytes cambia sin cifrado. `od` expone valores hexadecimales; codificación y confidencialidad son cosas distintas." },
    ],
    misconceptions: [
      { claim: "TLS siempre es capa 6.", correction: "Es una ubicación didáctica frecuente por seguridad/representación, pero TLS real se integra entre API de aplicación y transporte y su asignación OSI no es universal." },
      { claim: "Base64 cifra un secreto.", correction: "Base64 es una codificación reversible sin clave; cualquiera puede decodificarla." },
      { claim: "Un certificado válido prueba que una empresa es legítima o que no hay malware.", correction: "La validación vincula un nombre con una clave según la PKI; no garantiza intención, calidad ni ausencia de compromiso." },
      { claim: "El cifrado oculta todos los metadatos.", correction: "IP, puertos, tamaños, tiempos y parte de la negociación pueden seguir visibles según protocolo y extensiones." },
    ],
    exercises: [
      { question: "¿Qué diferencia observas al convertir texto con iconv y al cifrarlo con TLS?", answer: "La conversión cambia representación pero conserva lectura directa con el formato conocido. TLS usa claves y autenticación para impedir lectura/modificación por observadores sin claves." },
      { question: "`openssl s_client` muestra un certificado vigente pero falla la verificación del nombre. ¿Qué significa?", answer: "La vigencia no basta: el nombre solicitado debe coincidir con SAN del certificado y la cadena debe llegar a un ancla confiable. No ignores ese error." },
    ],
  },
  {
    number: 7,
    name: "Aplicación",
    introduction: "La capa de aplicación reúne protocolos y servicios que permiten a los programas solicitar y ofrecer funciones de red. Resuelve cómo nombrar servicios y cómo expresar solicitudes y respuestas. No es la pantalla ni el programa completo: define intercambios que usan transporte, red y enlace para llegar a otro sistema.",
    mainFunctions: [
      { name: "Resolver nombres y descubrir servicios", explanation: "Un protocolo puede traducir un nombre legible a información útil para conectar.", example: "DNS puede devolver una dirección para un nombre de dominio." },
      { name: "Solicitar recursos", explanation: "Los protocolos web definen cómo pedir y responder por documentos o datos." },
      { name: "Intercambiar mensajes de negocio", explanation: "Aplicaciones usan protocolos para correo, archivos, administración y otros servicios." },
      { name: "Configurar equipos", explanation: "Protocolos de configuración pueden asignar parámetros como direcciones, rutas y resolvers." },
      { name: "Definir autenticación y contexto", explanation: "Un protocolo puede llevar credenciales o identidad; las reglas de autorización dependen del servicio y la aplicación." },
    ],
    memorizationDefinition: "La capa de aplicación reúne protocolos que permiten a las aplicaciones intercambiar solicitudes, respuestas y mensajes de servicio. No equivale a una interfaz gráfica ni a un programa completo: define comportamientos y formatos sobre las capas inferiores.",
    everydayExample: { analogy: "Piensa en una ventanilla de atención: explicas qué servicio necesitas con un formato acordado y recibes una respuesta que sigue ciertas reglas.", limits: "Un protocolo no garantiza que la solicitud sea legítima ni que el servicio esté disponible; las reglas dependen de la aplicación, la identidad y la política." },
    studySummary: { does: "Define intercambios de red que las aplicaciones usan para ofrecer servicios.", dataUnit: "Mensajes, solicitudes y respuestas según cada protocolo.", technologies: "DNS, HTTP/HTTPS, SMTP, DHCP, SSH, APIs, proxies y servicios de aplicación.", remember: ["Una aplicación de usuario y un protocolo de aplicación son conceptos distintos.", "HTTP 200 describe un resultado HTTP, no demuestra por sí solo autorización correcta."], avoid: ["Confundir DNS con la conexión web o con ARP global.", "Concluir compromiso solo por un nombre DNS largo o una respuesta HTTP aislada."] },
    selfCheck: [
      { question: "¿DNS abre por sí mismo una página web?", answer: "No. DNS ayuda a resolver nombres; después la aplicación establece las comunicaciones necesarias con el servicio." },
      { question: "¿Qué diferencia hay entre una aplicación y su protocolo?", answer: "La aplicación es el programa o servicio; el protocolo define formatos y reglas para intercambiar mensajes." },
    ],
    pdu: "Mensaje o dato de aplicación",
    objective:
      "Relacionar solicitudes y respuestas de aplicaciones con servicios de red, leer protocolos reales y construir una metodología inicial de enumeración para prácticas eJPT.",
    fundamentals: [
      "La capa de aplicación define la semántica visible al usuario o servicio: nombres, métodos, comandos, recursos y errores. No es la aplicación gráfica en sí ni equivale a un puerto. DNS, HTTP, SSH, SMTP, DHCP y muchos otros protocolos suelen estudiarse aquí, aunque se apoyan en transporte, red y enlace.",
      "DNS traduce nombres mediante consultas recursivas o iterativas. Un stub suele preguntar a un resolver recursivo; este puede consultar raíz, TLD y servidor autoritativo, aplicar caché y devolver TTL. `NXDOMAIN` es una respuesta negativa que indica que el nombre consultado no existe según el servidor; no demuestra falta de conectividad ni actividad maliciosa. DNS usa comúnmente UDP/53 y también TCP/53 para respuestas truncadas, transferencias y otros casos. DoT y DoH protegen el tramo al resolver, no vuelven invisibles todos los metadatos.",
      "HTTP define mensajes, métodos, códigos, encabezados, representación y semántica de recursos. `200` suele indicar que la solicitud tuvo éxito; `401` indica que faltan credenciales válidas y puede incluir un desafío de autenticación; `403` indica que el servidor rehúsa atenderla. Ninguno prueba por sí solo qué usuario actuó ni si la autorización fue correcta: correlaciona identidad y logs de aplicación. `Host` en HTTP/1.1 y `:authority` en HTTP/2/3 identifican la autoridad solicitada. HTTP/1.1 puede reutilizar TCP; HTTP/2 multiplexa streams sobre una conexión TCP; HTTP/3 usa streams QUIC sobre UDP. HTTPS es HTTP protegido por TLS o QUIC/TLS.",
      "SSH ofrece acceso remoto cifrado y canales; SFTP es un subsistema SSH, no FTP sobre TLS. DHCP configura direcciones y parámetros de red en IPv4 mediante DORA broadcast/unicast según estado. Cada protocolo exige autenticación, autorización y configuración segura propias.",
      "El modelo TCP/IP agrupa las capas 5, 6 y 7 de OSI en una capa de aplicación amplia. Esa diferencia explica por qué TLS, sesión, serialización y semántica suelen aparecer mezcladas en implementaciones reales.",
    ],
    workflow: [
      "La aplicación resuelve configuración y nombre: DNS puede consultar caché local y luego un resolver configurado, usando UDP/TCP o un transporte cifrado como DoH/DoT.",
      "El proceso abre transporte hacia el servicio; TCP establece conexión o QUIC inicia sobre UDP. La aplicación negocia protocolo y protege contenido con TLS/SSH cuando corresponde.",
      "Cliente y servidor intercambian mensajes con sintaxis y semántica definidas: por ejemplo HTTP método/path/headers/body o SSH identificación, intercambio de claves y canales.",
      "El servidor autentica, autoriza y procesa la solicitud, registra el resultado y devuelve código, datos o error. La respuesta viaja por las mismas funciones en sentido inverso, no necesariamente por una ruta simétrica.",
    ],
    encapsulation:
      "PDU: mensaje de aplicación. Un HTTP request, consulta DNS o intercambio SSH se encapsula en transporte (TCP, UDP/QUIC), IP y una trama por enlace. DHCPv4 usa UDP 67/68, DNS normalmente 53 y HTTP convencional 80/443; los puertos son convenciones y pueden cambiar por despliegue.",
    protocols: [
      { name: "DNS (RFC 1034/1035 y extensiones)", role: "Distribuye nombres y tipos de registro; respuestas pueden ser autoritativas, recursivas, cacheadas o negativas." },
      { name: "HTTP/1.1, HTTP/2, HTTP/3", role: "Semántica de solicitudes y respuestas web; se transportan sobre TCP en HTTP/1.1/2 y QUIC sobre UDP en HTTP/3." },
      { name: "SSH-2 (RFC 4251 y familia)", role: "Acceso remoto y canales protegidos; valida identidad del servidor mediante host key y autentica usuarios según política." },
      { name: "DHCPv4 (RFC 2131) / DHCPv6 (RFC 8415)", role: "Asigna parámetros de configuración; DHCPv4 usa DORA y broadcasts iniciales, DHCPv6 utiliza multicast y mensajes propios." },
      { name: "SMTP / IMAP / SMB / NTP", role: "Ejemplos de protocolos de aplicación para correo, archivos y tiempo, cada uno con puertos, mecanismos y límites propios." },
    ],
    technologies: [
      { name: "Resolver DNS", role: "Recorre delegaciones, valida/cacha respuestas y sirve a clientes; puede ser local, empresarial o público." },
      { name: "Servidor web / reverse proxy", role: "Procesa HTTP o termina TLS y enruta solicitudes a servicios internos." },
      { name: "Servidor SSH", role: "Ofrece autenticación y canales remotos; acceso debe limitarse por identidad, llave y política." },
      { name: "DHCP server / relay", role: "Asigna configuración en una subred y retransmite solicitudes a servidores según diseño." },
      { name: "WAF / proxy de aplicación", role: "Interpreta parte del protocolo HTTP y aplica reglas; no reemplaza validación segura en la aplicación." },
    ],
    communication:
      "Al visitar `https://www.example.org/`, el cliente obtiene una dirección vía DNS, selecciona ruta, resuelve el siguiente salto y establece TCP/TLS o QUIC/TLS. Envía una petición HTTP con método, autoridad, ruta y encabezados; el servidor proxy puede terminar TLS, elegir backend y reenviar la solicitud. La respuesta incluye un código y representación. DNS, TCP/QUIC, IP y tramas describen partes distintas del mismo intercambio.",
    blueTeam: [
      { heading: "Amenazas", detail: "Phishing, abuso de credenciales, inyección, traversal, SSRF, DNS tunneling, abuso de SSH, DHCP rogue y fallos de autorización afectan aplicaciones. Una cadena sospechosa debe investigarse con contexto; no es prueba suficiente por sí sola." },
      { heading: "Telemetría", detail: "Correlaciona logs DNS, proxy, WAF, aplicación, autenticación, EDR y flujo de red. Registra identidad, host, recurso, resultado y request ID; redacta contraseñas, tokens y datos personales." },
      { heading: "Detección e investigación", detail: "Busca consultas DNS de alta entropía/volumen, respuestas raras, rutas HTTP inusuales, autenticaciones fallidas, comandos SSH fuera de ventana y cambios de DHCP. Reconstruye la cadena cliente→resolver/proxy→servicio y conserva evidencia con zona horaria." },
      { heading: "Mitigación", detail: "Aplica parches, autenticación multifactor, mínimo privilegio, validación de entrada, autorización por recurso, políticas DNS y egreso, SSH por llaves administradas y DHCP snooping. Define respuesta a incidentes y rotación de secretos." },
    ],
    redTeam: [
      { heading: "Reconocimiento autorizado", detail: "Lee el alcance de la evaluación y prueba solo dominios, rangos, aplicaciones y cuentas incluidas. Comienza con navegación normal, DNS y certificados; registra solicitudes y evita datos reales." },
      { heading: "Enumeración", detail: "Enumera subdominios solo desde fuentes permitidas, consulta registros DNS, inspecciona tecnologías expuestas y rutas de una aplicación de prueba. Confirma cada hallazgo y documenta impacto, evidencia y límites." },
      { heading: "Técnicas y herramientas", detail: "`dig`, `curl`, `whatweb`, Burp Suite y Nmap son habituales en laboratorios eJPT; apunta a máquinas de práctica o activos explícitamente autorizados. Evita fuerza bruta, explotación o denegación de servicio si el permiso no lo incluye." },
    ],
    commands: [
      { command: "dig example.org A +noall +answer", purpose: "Consulta registros IPv4 A y muestra solo respuesta en el resolver configurado.", interpretation: "Observa nombre, TTL, clase y dirección. Respuesta vacía puede deberse a ausencia de A, caché, política o fallo de resolución." },
      { command: "dig example.org MX +noall +answer", purpose: "Consulta registros de intercambio de correo MX.", interpretation: "La preferencia menor tiene prioridad relativa; MX no revela por sí solo la seguridad del correo ni el backend real." },
      { command: "curl -sS -D - -o /dev/null https://example.org/", purpose: "Realiza una petición HTTPS GET y muestra encabezados de respuesta sin guardar el cuerpo.", interpretation: "Revisa código y encabezados; un `200` no demuestra que el contenido sea seguro ni que una autorización esté bien aplicada." },
      { command: "ssh -vv -o BatchMode=yes usuario@192.0.2.10", purpose: "Muestra diagnóstico de negociación SSH y falla sin pedir contraseña.", interpretation: "Usa solo una VM autorizada y reemplaza la dirección documental. Verifica fingerprint de host por canal confiable; no aceptes una llave desconocida a ciegas." },
      { command: "python3 -m http.server 8000 --bind 127.0.0.1", purpose: "Levanta un servidor HTTP local de solo lectura para practicar desde el mismo equipo.", interpretation: "Abre `http://127.0.0.1:8000` en el equipo local y detén con Ctrl+C. No lo expongas a redes ajenas." },
    ],
    misconceptions: [
      { claim: "DNS solo usa UDP.", correction: "DNS también usa TCP/53; el transporte depende del caso. DoT suele usar TCP/853 y DoH HTTPS, mientras el formato DNS se conserva." },
      { claim: "HTTP/3 usa TCP porque HTTP es capa 7.", correction: "HTTP/3 mapea semántica HTTP a QUIC sobre UDP; la clasificación OSI no determina el transporte real." },
      { claim: "SSH y SFTP son lo mismo que FTP seguro.", correction: "SFTP es un subsistema de SSH; FTPS protege FTP con TLS y FTP usa otra arquitectura de conexiones." },
      { claim: "Ver un puerto o banner identifica de forma definitiva el software.", correction: "Puede falsificarse, ocultarse o terminarse en proxy. Confirma con evidencia adicional y respeta alcance." },
    ],
    exercises: [
      { question: "¿Qué ocurre si `dig` resuelve un nombre pero HTTPS falla?", answer: "DNS completó una consulta, pero pueden fallar ruta, transporte, TLS, certificado, proxy o aplicación. Prueba cada capa por separado y conserva el error exacto." },
      { question: "¿Qué explica que una captura muestre DNS y TCP pero no una ruta HTTP?", answer: "HTTP puede ir cifrado dentro de TLS o QUIC. En el sensor de red quedan visibles ciertos metadatos, pero el path requiere logs del endpoint o una terminación TLS autorizada." },
      { question: "¿Qué relación hay entre DORA y cuatro paquetes Ethernet broadcast?", answer: "Discover, Offer, Request y ACK son fases de DHCPv4, no necesariamente cuatro broadcasts: el tipo de destino depende del estado del cliente, flags y servidor; mensajes posteriores pueden ser unicast." },
    ],
  },
];

export const layerByNumber = (number: AcademyLayer) => academyLessons[number - 1];
