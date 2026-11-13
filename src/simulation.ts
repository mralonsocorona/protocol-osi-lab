import { protocols } from "./data";
import type { LayerNumber } from "./education";
export type LabState = {
  pid: string;
  layer: LayerNumber;
  step: number;
  playing: boolean;
};
export type LabAction =
  | { type: "layer"; layer: LayerNumber }
  | { type: "protocol"; id: string }
  | { type: "seek"; step: number }
  | { type: "tick" }
  | { type: "toggle" };
export const initialState: LabState = {
  pid: "quic",
  layer: 4,
  step: 0,
  playing: false,
};
export function labReducer(state: LabState, action: LabAction): LabState {
  const p = protocols.find((p) => p.id === state.pid)!;
  switch (action.type) {
    case "layer":
      return { ...state, layer: action.layer };
    case "protocol": {
      const next = protocols.find((p) => p.id === action.id);
      return next ? { ...state, pid: next.id, step: 0, playing: false } : state;
    }
    case "seek":
      return {
        ...state,
        step: Math.max(0, Math.min(p.steps.length - 1, action.step)),
        playing: false,
      };
    case "toggle":
      return {
        ...state,
        step: state.step === p.steps.length - 1 ? 0 : state.step,
        playing: !state.playing,
      };
    case "tick":
      return state.playing
        ? {
            ...state,
            step: Math.min(state.step + 1, p.steps.length - 1),
            playing: state.step + 1 < p.steps.length - 1,
          }
        : state;
  }
}
export type EncapsulationUnit = {
  id: string;
  layer: LayerNumber;
  name: string;
  bytes: number | null;
  headers: string[];
  payload: string;
  change: string;
  receive: string;
};
// One HTTP request, TLS 1.3 AES-GCM with no padding, IPv4/TCP without options,
// untagged Ethernet. Sizes deliberately exclude PHY overhead.
export const encapsulationUnits: EncapsulationUnit[] = [
  {
    id: "http",
    layer: 7,
    name: "Datos HTTP",
    bytes: 37,
    headers: ["GET / HTTP/1.1", "Host: example.com"],
    payload: "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n",
    change:
      "Se serializa una petición de 37 bytes ASCII/UTF-8. No se añade una cabecera de sesión independiente.",
    receive: "La aplicación interpreta método, recurso y host.",
  },
  {
    id: "tls",
    layer: 6,
    name: "Registro TLS",
    bytes: 59,
    headers: [
      "Cabecera de registro: 5 B",
      "Tipo externo: application_data (23)",
      "TLS 1.3 · AES-GCM · etiqueta: 16 B",
    ],
    payload:
      "37 B HTTP + 1 B de tipo interno, cifrados; etiqueta AEAD de 16 B.",
    change:
      "Se añaden 5 B de cabecera, 1 B de tipo interno y 16 B de autenticación. Sin padding. El contenido HTTP deja de ser visible en la red.",
    receive:
      "El extremo TLS verifica autenticidad, descifra y recupera HTTP. Un router de tránsito no realiza este paso.",
  },
  {
    id: "tcp",
    layer: 4,
    name: "Segmento TCP",
    bytes: 79,
    headers: [
      "52344 → 443",
      "Cabecera TCP: 20 B, sin opciones",
      "Seq=1 · ACK=1 · flags=PSH,ACK (ilustrativos)",
    ],
    payload: "Registro TLS de 59 B.",
    change:
      "TCP añade 20 B. En este ejemplo cabe en un segmento; los límites de registros TLS y segmentos TCP no siempre coinciden.",
    receive:
      "TCP reordena bytes y elimina su cabecera en el destino antes de entregarlos a TLS.",
  },
  {
    id: "ip",
    layer: 3,
    name: "Paquete IPv4",
    bytes: 99,
    headers: [
      "192.168.1.10 → 203.0.113.10",
      "Cabecera IPv4: 20 B · protocolo=6 (TCP)",
      "TTL 64 en origen → 63 tras el primer router",
    ],
    payload: "Segmento TCP de 79 B.",
    change:
      "IPv4 añade 20 B. Sin opciones ni fragmentación. Se supone una ruta sin NAT.",
    receive:
      "Los routers actualizan TTL y checksum IPv4. El destino entrega el payload a TCP.",
  },
  {
    id: "ethernet",
    layer: 2,
    name: "Trama Ethernet",
    bytes: 117,
    headers: [
      "02:42:ac:11:00:10 → 02:42:ac:11:00:01",
      "Cabecera: 14 B · EtherType=0x0800",
      "FCS: 4 B · sin VLAN",
    ],
    payload: "Paquete IPv4 de 99 B.",
    change:
      "Se añaden 14 B de cabecera y 4 B de FCS. Las MAC son del cliente y su gateway; cambian en cada enlace enrutado.",
    receive:
      "La interfaz comprueba FCS y extrae IP. El router crea una trama nueva para el siguiente enlace.",
  },
  {
    id: "bits",
    layer: 1,
    name: "Bits y señales",
    bytes: null,
    headers: [
      "117 × 8 = 936 bits de la trama",
      "Medio ilustrativo: Ethernet por cobre",
    ],
    payload: "Símbolos que representan la trama según el PHY.",
    change:
      "La trama se codifica en señales. 936 bits excluyen preámbulo/SFD, intervalo entre tramas y sobrecarga de codificación física; no es el tamaño total en el medio.",
    receive:
      "El PHY recupera bits a partir de señales y los entrega a la capa de enlace.",
  },
];
