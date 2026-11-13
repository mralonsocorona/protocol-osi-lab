import { useState } from "react";
import { encapsulationUnits } from "../simulation";
import type { LayerNumber } from "../education";
export function EncapsulationView({
  layer,
  onLayer,
}: {
  layer: LayerNumber;
  onLayer: (n: LayerNumber) => void;
}) {
  const [direction, setDirection] = useState<"send" | "receive">("send");
  const unit =
    encapsulationUnits.find((u) => u.layer === layer) ?? encapsulationUnits[0];
  const units =
    direction === "send"
      ? encapsulationUnits
      : [...encapsulationUnits].reverse();
  return (
    <div className="encapsulation-view">
      <div className="encap-title">
        <h2>DE LOS DATOS A LA SEÑAL</h2>
        <span className="simulation-tag">EJEMPLO SIMULADO</span>
      </div>
      <p>
        HTTP/1.1 → TLS 1.3 → TCP → IPv4 → Ethernet. Ejemplo independiente del
        protocolo activo del reproductor.
      </p>
      <div className="scenario-toggle" role="group" aria-label="Dirección">
        <button
          aria-pressed={direction === "send"}
          onClick={() => setDirection("send")}
        >
          ↓ Encapsular · emisor
        </button>
        <button
          aria-pressed={direction === "receive"}
          onClick={() => setDirection("receive")}
        >
          ↑ Desencapsular · receptor
        </button>
      </div>
      {layer === 5 && (
        <p className="scope-note">
          Capa 5: esta pila no añade una cabecera independiente de sesión. Su
          contexto lo gestiona la aplicación.
        </p>
      )}
      <div className="encap-units">
        {units.map((u, i) => (
          <button
            key={u.id}
            className={unit.id === u.id ? "selected" : ""}
            aria-pressed={unit.id === u.id}
            onClick={() => onLayer(u.layer)}
          >
            <small>
              {i + 1} · L{u.layer}
            </small>
            <strong>{u.name}</strong>
            <span>{u.bytes === null ? "Señales" : `${u.bytes} B`}</span>
          </button>
        ))}
      </div>
      <div className="encap-detail">
        <h3>
          {unit.name}{" "}
          {unit.bytes !== null && (
            <small>· {unit.bytes} B en este ejemplo</small>
          )}
        </h3>
        <div className="encap-columns">
          <section>
            <h4>Cabeceras y campos</h4>
            <ul>
              {unit.headers.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4>Payload</h4>
            <p className="payload">{unit.payload}</p>
          </section>
        </div>
        <h4>
          {direction === "send"
            ? "¿Qué se añade o transforma?"
            : "¿Qué se recupera?"}
        </h4>
        <p>{direction === "send" ? unit.change : unit.receive}</p>
      </div>
      <p className="muted">
        Supuestos: conexión y claves ya establecidas, un registro, un segmento,
        sin opciones TCP/IP, VLAN, NAT ni padding TLS. Los tamaños son
        calculados para este ejemplo, no capturados. FCS puede no aparecer en
        capturas de NIC.
      </p>
    </div>
  );
}
