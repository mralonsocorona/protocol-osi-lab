import type { Step } from "../data";
import { lessonFor, type LayerNumber } from "../education";

const nodes = {
  client: { x: 90, label: "Cliente", sub: "192.168.1.10", icon: "⌘" },
  switch: { x: 270, label: "Switch", sub: "Enlace local", icon: "⌁" },
  router: { x: 450, label: "Router", sub: "192.168.1.1", icon: "↗" },
  internet: { x: 630, label: "Internet", sub: "Red pública", icon: "◎" },
  server: { x: 810, label: "Servidor", sub: "203.0.113.10", icon: "▣" },
} as const;
type NodeKey = keyof typeof nodes;
const connections: [NodeKey, NodeKey][] = [
  ["client", "switch"], ["switch", "router"], ["router", "internet"], ["internet", "server"],
];

/** Returns a route made only of links that actually exist in the drawn topology. */
function topologyRoute(from: Step["from"], to: Step["to"]): NodeKey[] {
  const start = from as NodeKey;
  const destination = to as NodeKey;
  const queue: NodeKey[][] = [[start]];
  const visited = new Set<NodeKey>([start]);
  while (queue.length) {
    const route = queue.shift()!;
    const current = route[route.length - 1];
    if (current === destination) return route;
    for (const [a, b] of connections) {
      const next = a === current ? b : b === current ? a : undefined;
      if (next && !visited.has(next)) {
        visited.add(next);
        queue.push([...route, next]);
      }
    }
  }
  return [start, destination];
}

/** At L1/L2, retain the physical local segment while preserving packet direction. */
function localSegment(route: NodeKey[]): NodeKey[] {
  const client = route.indexOf("client");
  const router = route.indexOf("router");
  if (client < 0 || router < 0) return route;
  return route.slice(Math.min(client, router), Math.max(client, router) + 1);
}

function displayedNode(protocolId: string, id: NodeKey) {
  if (protocolId === "dns" && id === "router")
    return { ...nodes.router, label: "Resolvedor DNS", sub: "192.168.1.1" };
  return nodes[id];
}

export function Topology({
  step,
  playing,
  showLayer,
  protocolId,
}: {
  step: Step;
  playing: boolean;
  showLayer: LayerNumber;
  protocolId: string;
}) {
  const fullRoute = topologyRoute(step.from, step.to);
  const route = showLayer <= 2 ? localSegment(fullRoute) : fullRoute;
  const points = route.map((id) => `${nodes[id].x},154`).join(" ");
  const focus = (id: NodeKey) => {
    if (showLayer <= 2) return route.includes(id);
    if (showLayer === 3) return fullRoute.includes(id) && id !== "switch";
    return id === step.from || id === step.to;
  };
  const label = ["", "Señal", "Trama", "Paquete", "Segmento", "Sesión", "Datos", "Mensaje"][showLayer];
  const eventLabel = `L${step.layer} · ${step.protocol} · ${step.name}`;
  const markerWidth = Math.max(165, eventLabel.length * 6.4 + 22);
  const containedNote = "Contenido del paquete anterior; no se anima una segunda transmisión.";
  return <svg className="topology" viewBox="0 0 900 310" role="img" aria-label={`Capa inspeccionada ${showLayer}, ${lessonFor(showLayer).name}. Evento actual: ${eventLabel}. Ruta visual: ${fullRoute.join(" a ")}.${step.animation === "contained" ? ` ${containedNote}` : ""}`}>
    <defs>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dde8da" /></pattern>
      <linearGradient id="route" x1="0" x2="1"><stop stopColor="#9ed76d"/><stop offset="1" stopColor="#4f9376"/></linearGradient>
    </defs>
    <rect width="900" height="310" fill="url(#dots)" />
    <rect x="23" y="20" width="854" height="250" rx="20" fill="#fff" stroke="#e1e9dd" />
    <text x="45" y="48" fill="#71917c" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" letterSpacing="2">RUTA DE COMUNICACIÓN</text>
    <text x="856" y="48" textAnchor="end" fill="#5b8b48" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700">L{showLayer} / {label.toUpperCase()}</text>
    {connections.map(([a,b]) => <g key={a}>
      <line x1={nodes[a].x+35} x2={nodes[b].x-35} y1="154" y2="154" stroke="#dce7d8" strokeWidth="8" strokeLinecap="round" />
      <line x1={nodes[a].x+35} x2={nodes[b].x-35} y1="154" y2="154" stroke="#83b967" strokeWidth="2" strokeDasharray="5 6" />
    </g>)}
    <polyline points={points} fill="none" stroke="url(#route)" strokeWidth="5" strokeLinecap="round" opacity=".8" />
    {playing && step.animation === "move" && <g className="pdu-marker" aria-hidden="true"><rect x={-markerWidth / 2} y="-13" width={markerWidth} height="27" rx="2" fill="#244f3d" stroke="#c7ee8b" strokeWidth="2"/><text y="4" textAnchor="middle" fill="white" fontSize="10" fontFamily="IBM Plex Mono, monospace">{eventLabel}</text><animateMotion dur="2.4s" repeatCount="indefinite" path={`M${route.map((id) => `${nodes[id].x} 154`).join(" L")}`} /></g>}
    {step.animation === "contained" && <text className="contained-note" x="450" y="284" textAnchor="middle" fill="#5b8b48" fontFamily="DM Sans, sans-serif" fontSize="11">{containedNote}</text>}
    {(Object.entries(nodes) as [NodeKey, typeof nodes[NodeKey]][]).map(([id, node], i) => {
      const displayed = displayedNode(protocolId, id);
      return <g key={id}>
        <circle cx={node.x} cy="154" r="40" fill={focus(id) ? "#d9f0bd" : "#edf1ea"} stroke={focus(id) ? "#83b967" : "#d7dfd4"} strokeWidth="2" />
        <circle cx={node.x} cy="154" r="29" fill={focus(id) ? "#234e3a" : "#aebdb0"} />
        <text x={node.x} y="164" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="28" fill="white">{node.icon}</text>
        <text x={node.x} y="98" textAnchor="middle" fill="#9eb39f" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="11">0{i+1}</text>
        <text x={node.x} y="224" textAnchor="middle" fill="#244b38" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="16">{displayed.label}</text>
        <text x={node.x} y="243" textAnchor="middle" fill="#829484" fontFamily="DM Sans, sans-serif" fontSize="10">{id === "client" && showLayer === 2 ? "MAC …:10" : displayed.sub}</text>
      </g>;
    })}
  </svg>;
}
