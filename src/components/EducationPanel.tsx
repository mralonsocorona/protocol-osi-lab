import { useState } from "react";
import { lessonFor, relatedTechnologies } from "../education";
import type { LayerNumber } from "../education";
import { protocols } from "../data";
export function EducationPanel({
  layer,
  onProtocol,
}: {
  layer: LayerNumber;
  onProtocol: (id: string) => void;
}) {
  const lesson = lessonFor(layer),
    techs = relatedTechnologies(layer);
  const [selected, setSelected] = useState(techs[0].id);
  const technology = techs.find((t) => t.id === selected) ?? techs[0];
  return (
    <div className="education-content">
      <div className="lesson-heading">
        <span className="layer-number">{layer}</span>
        <div>
          <small>EXPLORAR CAPA OSI</small>
          <h1>{lesson.name}</h1>
          <span>PDU · {lesson.pdu}</span>
        </div>
      </div>
      <section>
        <h3>¿Qué hace esta capa?</h3>
        <p>{lesson.purpose}</p>
      </section>
      <section>
        <h3>¿Cómo funciona?</h3>
        <p>{lesson.process}</p>
        <div className="scope-note">{lesson.scope}</div>
      </section>
      <section>
        <h3>Protocolos y estándares relacionados</h3>
        <div className="technology-grid">
          {techs.map((t) => (
            <button
              key={t.id}
              aria-pressed={t.id === technology.id}
              onClick={() => setSelected(t.id)}
            >
              <strong>{t.name}</strong>
              <small>
                {t.kind} · {t.layers.map((n) => `L${n}`).join(" / ")}
              </small>
            </button>
          ))}
        </div>
        <article className="technology-detail">
          <b>{technology.name}</b>
          <p>{technology.summary}</p>
          {technology.caveat && (
            <p className="scope-note">{technology.caveat}</p>
          )}
          {technology.simulation ? (
            <button
              className="action-button"
              onClick={() => onProtocol(technology.simulation!)}
            >
              Estudiar secuencia{" "}
              {protocols.find((p) => p.id === technology.simulation)?.title} →
            </button>
          ) : (
            <small>Ficha conceptual · sin secuencia de reproducción.</small>
          )}
        </article>
      </section>
      <section>
        <h3>Dispositivos involucrados</h3>
        <div className="chips">
          {lesson.devices.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </section>
      <section>
        <h3>¿Qué podemos observar?</h3>
        <ul>
          {lesson.observe.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Ejemplo práctico</h3>
        <p>{lesson.example}</p>
      </section>
      <section className="defense-preview">
        <h3>Seguridad y Blue Team</h3>
        <b>{lesson.scenario.title}</b>
        <p>{lesson.scenario.problem}</p>
        <small>
          Abre la pestaña Blue Team para comparar evidencia e investigar.
        </small>
      </section>
      <details>
        <summary>OSI y TCP/IP · cómo leer este laboratorio</summary>
        <p>
          OSI es un modelo de referencia de siete capas. TCP/IP agrupa funciones
          en acceso a red, Internet, transporte y aplicación. Las funciones de
          sesión y presentación suelen formar parte de aplicaciones o
          bibliotecas; las asociaciones del catálogo son educativas, no
          equivalencias exactas.
        </p>
        <p>
          Fuentes:{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc9000.html"
            target="_blank"
            rel="noreferrer"
          >
            QUIC · RFC 9000
          </a>
          ,{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc8446.html"
            target="_blank"
            rel="noreferrer"
          >
            TLS · RFC 8446
          </a>
          ,{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc826.html"
            target="_blank"
            rel="noreferrer"
          >
            ARP · RFC 826
          </a>
          .
        </p>
      </details>
    </div>
  );
}
export function BlueTeamPanel({ layer }: { layer: LayerNumber }) {
  const [anomaly, setAnomaly] = useState(false);
  const s = lessonFor(layer).scenario;
  return (
    <div className="education-content">
      <small className="eyebrow">ESCENARIO DEFENSIVO · CAPA {layer}</small>
      <h1>{s.title}</h1>
      <p className="scope-note">
        Evidencia sintética para practicar. Una señal aislada no confirma un
        incidente.
      </p>
      <div
        className="scenario-toggle"
        role="group"
        aria-label="Estado del escenario"
      >
        <button aria-pressed={!anomaly} onClick={() => setAnomaly(false)}>
          Tráfico normal
        </button>
        <button aria-pressed={anomaly} onClick={() => setAnomaly(true)}>
          Comportamiento anómalo
        </button>
      </div>
      <div className={"evidence " + (anomaly ? "anomalous" : "")}>
        <b>{anomaly ? "ANOMALÍA A INVESTIGAR" : "LÍNEA BASE"}</b>
        <p>{anomaly ? s.anomaly : s.normal}</p>
        {anomaly && (
          <ul>
            {s.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
      <section>
        <h3>Explicación del problema</h3>
        <p>{s.problem}</p>
      </section>
      <section>
        <h3>Investigación defensiva</h3>
        <ol>
          {s.investigation.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ol>
      </section>
      <section>
        <h3>Medidas de mitigación</h3>
        <ul>
          {s.mitigation.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
      <small>Selecciona otra capa OSI para abrir su escenario.</small>
    </div>
  );
}
