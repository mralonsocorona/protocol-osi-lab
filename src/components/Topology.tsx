import type { Step } from "../data";
import { lessonFor, type LayerNumber } from "../education";
const nodes: { [k: string]: [number, number] } = {
  client: [100, 365],
  switch: [265, 285],
  router: [425, 205],
  internet: [650, 365],
  server: [855, 130],
};
export function Topology({
  step,
  playing,
  showLayer,
}: {
  step: Step;
  playing: boolean;
  showLayer: LayerNumber;
}) {
  const route =
    step.from === "client" && step.to === "server"
      ? ["client", "switch", "router", "internet", "server"]
      : step.from === "server" && step.to === "client"
        ? ["server", "internet", "router", "switch", "client"]
        : step.from === "client" && step.to === "router"
          ? ["client", "switch", "router"]
          : step.from === "router" && step.to === "client"
            ? ["router", "switch", "client"]
            : [step.from, step.to];
  const localRoute =
    step.from === "router" || step.from === "server"
      ? ["router", "switch", "client"]
      : ["client", "switch", "router"];
  const displayRoute = showLayer <= 2 ? localRoute : route;
  const unitLabel = [
    "",
    "0101 · señal",
    "Trama · MAC",
    "Paquete · IP",
    "Transporte · puertos",
    "Sesión lógica",
    "Datos protegidos / formato",
    "Mensaje de aplicación",
  ][showLayer];
  const points = displayRoute.map((k) => nodes[k].join(",")).join(" ");
  return (
    <svg
      className="topology"
      viewBox="0 0 980 495"
      role="img"
      aria-label={`Topología de capa ${showLayer}: ${lessonFor(showLayer).name}. Cliente, switch, router, Internet y servidor.`}
    >
      <defs>
        <pattern
          id="grid"
          width="48"
          height="28"
          patternUnits="userSpaceOnUse"
          patternTransform="skewY(-28)"
        >
          <path
            d="M 48 0 L 0 0 0 28"
            fill="none"
            stroke="#dbe6fa"
            strokeWidth="1"
          />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <rect width="980" height="495" fill="url(#grid)" />
      {[
        ["client", "switch"],
        ["switch", "router"],
        ["router", "internet"],
        ["internet", "server"],
      ].map(([x, y]) => (
        <line
          key={x}
          x1={nodes[x][0]}
          y1={nodes[x][1]}
          x2={nodes[y][0]}
          y2={nodes[y][1]}
          stroke="#a8bfe9"
          strokeWidth="2"
          strokeDasharray="8 8"
        />
      ))}
      <polyline
        points={points}
        stroke="#0b57c2"
        strokeWidth="3"
        fill="none"
        strokeDasharray="7 9"
        opacity=".8"
      />
      {playing && (
        <g className="pdu-marker" aria-hidden="true">
          <rect
            x="-72"
            y="-25"
            width="144"
            height="27"
            rx={showLayer === 1 ? 13 : 3}
            fill="#0b57c2"
            stroke="white"
            strokeWidth="2"
          />
          <text y="-8" textAnchor="middle" fill="white" fontSize="11">
            {unitLabel}
          </text>
          <animateMotion
            key={points}
            dur="2.4s"
            repeatCount="indefinite"
            path={"M" + displayRoute.map((k) => nodes[k].join(" ")).join(" L")}
          />
        </g>
      )}
      {Object.entries(nodes).map(([id, [x, y]]) => (
        <g key={id} transform={`translate(${x},${y})`}>
          <ellipse
            className={
              showLayer === 1 ||
              (showLayer === 2 &&
                ["client", "switch", "router"].includes(id)) ||
              (showLayer === 3 && id !== "switch") ||
              (showLayer >= 4 && ["client", "server"].includes(id))
                ? "node-focus"
                : "node-transit"
            }
            cy="30"
            rx="77"
            ry="17"
            fill="#d5dff1"
            opacity=".6"
          />
          {id === "client" ? (
            <>
              <rect
                x="-58"
                y="-70"
                width="100"
                height="68"
                rx="5"
                fill="#e8f0ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <rect x="-48" y="-61" width="80" height="49" fill="#bad0f5" />
              <path
                d="M-67 7H50L74 35H-43Z"
                fill="#e8f0ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M-32 13H36M-26 20H43M-18 27H51"
                stroke="#6c93d8"
                strokeWidth="3"
              />
            </>
          ) : id === "switch" ? (
            <>
              <path
                d="M-53-20L0-45L53-20L0 5Z"
                fill="#d9e7ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M-53-20V10L0 35L53 10V-20L0 5Z"
                fill="#a8c5fa"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M-40-3l30 14m25 0l27-13"
                stroke="#1248b5"
                strokeWidth="6"
              />
            </>
          ) : id === "router" ? (
            <>
              <path
                d="M-66-24L0-59L67-25L0 9Z"
                fill="#d9e7ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M-66-24V20L0 55V9Z"
                fill="#a8c5fa"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M0 9L67-25V20L0 55Z"
                fill="#e8f0ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path d="M-5-55V-108" stroke="#1248b5" strokeWidth="5" />
              <circle
                cx="-5"
                cy="-112"
                r="6"
                fill="white"
                stroke="#1248b5"
                strokeWidth="3"
              />
              <path d="M14 22h35M14 33h35" stroke="#1248b5" strokeWidth="5" />
            </>
          ) : id === "internet" ? (
            <>
              <path
                d="M-62 20C-99 12-89-36-56-39C-55-69-21-81-2-60C25-90 66-67 64-38C102-24 88 23 59 24Z"
                fill="white"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <circle
                r="23"
                cy="-13"
                fill="none"
                stroke="#1248b5"
                strokeWidth="3"
              />
              <ellipse
                cy="-13"
                rx="10"
                ry="23"
                fill="none"
                stroke="#1248b5"
                strokeWidth="2"
              />
              <path
                d="M-22-13H22M-19-23H19M-19-3H19"
                stroke="#1248b5"
                strokeWidth="2"
              />
            </>
          ) : (
            <>
              <path
                d="M-50-72L0-100L52-70L0-42Z"
                fill="#d4e4ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M-50-72V50L0 78V-42Z"
                fill="#b2cbf5"
                stroke="#1248b5"
                strokeWidth="4"
              />
              <path
                d="M0-42L52-70V50L0 78Z"
                fill="#eaf2ff"
                stroke="#1248b5"
                strokeWidth="4"
              />
              {[-23, 5, 33].map((y) => (
                <g key={y}>
                  <path
                    d={`M-39 ${y}L-10 ${y + 15}M10 ${y + 12}L40 ${y - 5}`}
                    stroke="#1248b5"
                    strokeWidth="6"
                  />
                  <circle cx="-33" cy={y + 12} r="3" fill="#1248b5" />
                </g>
              ))}
            </>
          )}
          <text
            x="0"
            y={id === "server" ? 105 : id === "router" ? 85 : 85}
            textAnchor="middle"
            fontSize="21"
            fontWeight="800"
            fill="#0b328b"
          >
            {
              {
                client: "Cliente",
                switch: "Switch",
                router: "Router",
                internet: "Internet",
                server: "Servidor",
              }[id]
            }
          </text>
          <text
            x="0"
            y={id === "server" ? 126 : id === "router" ? 107 : 106}
            textAnchor="middle"
            fontSize="15"
            fill="#466cb2"
          >
            {
              {
                client: showLayer === 2 ? "MAC …:10" : "192.168.1.10",
                switch: "Conmutación L2",
                router: "192.168.1.1",
                internet: "Red pública",
                server: "203.0.113.10",
              }[id]
            }
          </text>
        </g>
      ))}
    </svg>
  );
}
