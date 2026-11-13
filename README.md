# Protocol OSI Lab

Laboratorio educativo con React, TypeScript estricto y Vite. Evoluciona el proyecto original y conserva las 12 secuencias, los diagramas isométricos azules, el inspector, el reproductor y ambos temas. No necesita backend.

## Ejecutar

Con Node.js 20/22:

```bash
npm ci
npm run dev
```

## Compilar y verificar

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm test
npm run preview
```

`build` comprueba tipos antes de generar `dist/`. Playwright inicia Vite automáticamente para las pruebas. Se añadieron únicamente herramientas de desarrollo: tipos de React para comprobar TypeScript y Playwright para verificar el funcionamiento en navegador. No se agregaron dependencias de ejecución.

## Recorrido del laboratorio

- **Seleccionar capa OSI** actualiza la lección, PDU, tecnologías, dispositivos, observables, escenario defensivo y contexto de la topología. La capa inspeccionada se mantiene mientras avanza o cambia la simulación.
- **Aprender** ofrece siete lecciones y un catálogo de protocolos, estándares, formatos y funciones con asociaciones multicapa. Las fichas distinguen tecnologías conceptuales de las que tienen una secuencia reproducible.
- **Simulaciones** conserva TCP, UDP, ARP, ICMP, IPv4, DNS, DHCP, HTTP, HTTPS, TLS 1.3, SSH y QUIC. El filtro por capa considera asociaciones múltiples. Las fichas permiten cargar las secuencias disponibles.
- **Red** añade un switch al dibujo original, resalta dispositivos según la capa y muestra unidades en movimiento. En capas 1 y 2 ilustra el enlace local; en capas superiores distingue funciones de los extremos del reenvío de los routers.
- **Secuencia** y **Flujo simulado** permiten seleccionar eventos. El reproductor conserva paso, anterior, reinicio, pausa y velocidades 0.5×/1×/2×.
- **Inspector** mantiene separados la capa inspeccionada, el protocolo activo y la capa del evento. El botón «Inspeccionar capa del evento» los alinea cuando se desea.
- **Encapsulación** explica HTTP/1.1 → TLS 1.3 → TCP → IPv4 → Ethernet → bits. Cada unidad permite explorar cabeceras, direcciones, puertos, payload y transformaciones al enviar/recibir.
- **Blue Team** contiene siete escenarios con línea base, anomalía, evidencia sintética, investigación y mitigaciones. La evidencia por evento de las secuencias originales también se conserva.
- Navegación por teclado, foco visible, controles etiquetados, búsqueda Ctrl+K y espacio para reproducir/pausar fuera de controles interactivos. Diseño adaptable para escritorio, tableta y móvil.

## Organización

- `src/data.ts`: las 12 simulaciones originales y nombres OSI.
- `src/education.ts`: siete lecciones, catálogo multicapa y siete escenarios defensivos.
- `src/simulation.ts`: reducer del reproductor y modelo de encapsulación con tamaños calculados.
- `src/components/`: topología, panel educativo/defensivo y encapsulación.
- `src/main.tsx`: integración, navegación, filtros e inspector de eventos.
- `src/style.css`: identidad visual, temas y adaptación responsive.
- `tests/laboratory.spec.ts`: cobertura de contenido, coherencia y límites del reproductor, las 12 simulaciones en navegador, selección de las siete capas, tecnologías, escenarios, encapsulación, búsqueda, temas y dimensiones de pantalla.

## Precisión y límites

Los paquetes, tiempos, tamaños y evidencias son **datos sintéticos**, no capturas PCAP. Los flujos son secuencias simplificadas: no se ejecuta una pila de red ni criptografía real, y algunos mensajes de negociación/cierre se omiten. La topología es fija y resume Internet como una nube; no calcula rutas ni modela NAT o proxies. Los escenarios comparan evidencia preparada, no generan ataques ni analizan tráfico del equipo.

La encapsulación es un ejemplo independiente de la simulación activa. Supone conexión establecida, HTTP ASCII de 37 B, TLS 1.3 con AES-GCM sin padding (59 B), TCP sin opciones (79 B), IPv4 sin opciones (99 B) y Ethernet sin VLAN con FCS (117 B). Los 936 bits excluyen preámbulo/SFD, intervalo entre tramas y codificación PHY. No se añade una cabecera artificial de sesión. No representa HTTP/3: QUIC integra TLS sin usar la misma pila de registros TLS sobre TCP.

OSI es un modelo de referencia: las funciones de las capas 5 y 6 suelen estar integradas en aplicaciones y bibliotecas TCP/IP. Las asociaciones del catálogo son didácticas, no equivalencias rígidas. UTF-8 y JPEG no son protocolos de red. Los routers de tránsito no terminan necesariamente transporte, sesión, TLS o aplicación; dispositivos especializados sí pueden inspeccionar o terminar esas funciones.

La suite de navegador se verifica con Chromium; no se ha verificado con Firefox/Safari ni dispositivos físicos. Las fuentes web se descargan desde Google Fonts; hay fallback local monoespaciado. No se incluye importación PCAP ni nuevas secuencias reproducibles para cada tecnología del catálogo.

Referencias primarias para las distinciones revisadas: [QUIC, RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html), [TLS 1.3, RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html) y [ARP, RFC 826](https://www.rfc-editor.org/rfc/rfc826.html).

## Verificación de esta entrega

- `npm run build`: correcto; comprobación TypeScript estricta y bundle Vite de producción generado en `dist/`.
- `npm test`: **10 pruebas correctas** en Chromium, incluidas las 12 secuencias originales y las siete capas/escenarios.
- Dimensiones verificadas: 1440, 1024 y 390 px; sin desbordamiento horizontal de página. Las tablas conservan su desplazamiento interno.
- Capturas generadas durante las pruebas: `test-results/desktop.png` y `test-results/mobile.png` (artefactos locales ignorados por Git).

Archivos existentes actualizados: `src/main.tsx`, `src/data.ts`, `src/style.css`, `package.json`, `package-lock.json`, `README.md`, `tsconfig.json` e `index.html` (los dos últimos solo formateados). Archivos nuevos: `src/education.ts`, `src/simulation.ts`, `src/components/EducationPanel.tsx`, `src/components/EncapsulationView.tsx`, `src/components/Topology.tsx`, `tests/laboratory.spec.ts`, `playwright.config.ts` y `.gitignore`.
