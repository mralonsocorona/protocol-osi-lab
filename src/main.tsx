import React, { useEffect, useMemo, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Network,
  Activity,
  Sun,
  Moon,
  BookOpen,
} from "lucide-react";
import { protocols, layers } from "./data";
import { lessonFor, protocolLayers } from "./education";
import type { LayerNumber } from "./education";
import { initialState, labReducer } from "./simulation";
import { Topology } from "./components/Topology";
import { EducationPanel, BlueTeamPanel } from "./components/EducationPanel";
import { EncapsulationView } from "./components/EncapsulationView";
import "./style.css";
const addresses = {
  client: "192.168.1.10",
  router: "192.168.1.1",
  internet: "Red ISP",
  server: "203.0.113.10",
};
function App() {
  const [state, dispatch] = useReducer(labReducer, initialState);
  const { pid, layer, step: stepIndex, playing } = state;
  const [filter, setFilter] = useState("TODOS"),
    [query, setQuery] = useState("");
  const [mode, setMode] = useState<"red" | "secuencia" | "encapsulacion">(
    "red",
  );
  const [tab, setTab] = useState<"learn" | "event" | "blue">("learn");
  const [speed, setSpeed] = useState(1),
    [dark, setDark] = useState(false),
    [showOnly, setShowOnly] = useState(false);
  const p = protocols.find((x) => x.id === pid)!;
  const current = p.steps[stepIndex];
  const lesson = lessonFor(layer);
  const list = useMemo(
    () =>
      protocols.filter(
        (x) =>
          (filter === "TODOS" || x.category === filter) &&
          (!showOnly || protocolLayers(x.id, x.layer).includes(layer)) &&
          `${x.title} ${x.subtitle}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query, showOnly, layer],
  );
  const setLayer = (n: LayerNumber) => dispatch({ type: "layer", layer: n });
  const selectProtocol = (id: string) => dispatch({ type: "protocol", id });
  const wrap = (step: number) => dispatch({ type: "seek", step });
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => dispatch({ type: "tick" }),
      1800 / speed,
    );
    return () => window.clearInterval(timer);
  }, [playing, pid, speed]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("search")?.focus();
      }
      if (
        e.code === "Space" &&
        !(
          e.target instanceof Element &&
          e.target.closest(
            "input,button,select,textarea,a,summary,[contenteditable]",
          )
        )
      ) {
        e.preventDefault();
        dispatch({ type: "toggle" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return (
    <div className={dark ? "app dark" : "app"}>
      <header>
        <div className="brand">
          <div className="brand-icon">⬡</div>
          <div>
            <strong>
              PROTOCOL <em>EXPLORER</em>
            </strong>
            <small>LABORATORIO OSI · BLUE TEAM</small>
          </div>
        </div>
        <nav className="layer-picker" aria-label="Seleccionar capa OSI">
          <div className="mini-label">
            CAPA OSI <span>· {lesson.name.toUpperCase()}</span>
          </div>
          <div className="layer-buttons">
            {([1, 2, 3, 4, 5, 6, 7] as LayerNumber[]).map((n) => (
              <button
                key={n}
                aria-label={`Capa ${n}: ${lessonFor(n).name}`}
                aria-pressed={layer === n}
                className={layer === n ? "active" : ""}
                onClick={() => setLayer(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </nav>
        <div className="header-actions">
          <div className="search">
            <Search size={16} />
            <input
              id="search"
              aria-label="Buscar simulaciones"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar simulaciones"
            />
            <kbd>Ctrl K</kbd>
          </div>
          <button
            aria-label="Cambiar tema"
            title="Cambiar tema"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main>
        <aside className="panel sidebar">
          <h2>SIMULACIONES</h2>
          <div className="tabs">
            {["TODOS", "BASE", "APLICACIÓN", "SEGURIDAD"].map((t) => (
              <button
                aria-pressed={filter === t}
                className={filter === t ? "selected" : ""}
                key={t}
                onClick={() => setFilter(t)}
              >
                {t}{" "}
                <span>
                  {t === "TODOS"
                    ? protocols.length
                    : protocols.filter((p) => p.category === t).length}
                </span>
              </button>
            ))}
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={showOnly}
              onChange={(e) => setShowOnly(e.target.checked)}
            />{" "}
            Relacionadas con capa {layer}
          </label>
          <div className="protocol-list">
            {list.length ? (
              list.map((x) => (
                <button
                  key={x.id}
                  aria-pressed={x.id === pid}
                  className={"protocol " + (x.id === pid ? "chosen" : "")}
                  onClick={() => selectProtocol(x.id)}
                >
                  <span className="radio">{x.id === pid ? "●" : "○"}</span>
                  <span className="protocol-copy">
                    <strong>{x.title}</strong>
                    <small>{x.subtitle}</small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))
            ) : (
              <div className="empty">
                <p>No hay secuencias para este filtro.</p>
                <p>
                  Explora las tecnologías de esta capa en la pestaña Aprender.
                </p>
                <button
                  onClick={() => {
                    setShowOnly(false);
                    setFilter("TODOS");
                    setQuery("");
                  }}
                >
                  Ver las 12 simulaciones
                </button>
              </div>
            )}
          </div>
          <div className="side-note">
            <BookOpen size={16} /> 12 secuencias · catálogo ampliado en Aprender
          </div>
        </aside>
        <section className="center">
          <div className="lab-context">
            <div>
              <span className="eyebrow">CAPA INSPECCIONADA</span>
              <strong>
                {layer} · {lesson.name}
              </strong>
            </div>
            <div>
              <span className="eyebrow">SIMULACIÓN ACTIVA</span>
              <strong>
                {p.title} · evento L{current.layer}
              </strong>
            </div>
            <button onClick={() => setLayer(current.layer as LayerNumber)}>
              Inspeccionar capa del evento →
            </button>
          </div>
          <div className="panel visual">
            <nav className="visual-tools" aria-label="Vista del laboratorio">
              <button
                aria-pressed={mode === "red"}
                className={mode === "red" ? "selected" : ""}
                onClick={() => setMode("red")}
              >
                <Network size={15} /> RED
              </button>
              <button
                aria-pressed={mode === "secuencia"}
                className={mode === "secuencia" ? "selected" : ""}
                onClick={() => setMode("secuencia")}
              >
                <Activity size={15} /> SECUENCIA
              </button>
              <button
                aria-pressed={mode === "encapsulacion"}
                className={mode === "encapsulacion" ? "selected" : ""}
                onClick={() => setMode("encapsulacion")}
              >
                ENCAPSULACIÓN
              </button>
            </nav>
            {mode === "red" ? (
              <div className="network-view">
                <div className="topology-context">
                  <b>
                    L{layer} · {lesson.topology}
                  </b>
                  <span>{lesson.scope}</span>
                </div>
                <Topology step={current} playing={playing} showLayer={layer} />
                <div className="topology-legend">
                  <span>● Resaltado: elementos relevantes</span>
                  <span>
                    {layer <= 2
                      ? "Se ilustra el primer enlace local; los enlaces restantes usan sus propias tramas y señales."
                      : layer === 3
                        ? "Internet agrupa routers de tránsito; cada router decide el siguiente salto."
                        : "Los routers transportan IP; no terminan estas funciones. Se supone tráfico sin NAT ni proxy."}
                  </span>
                </div>
              </div>
            ) : mode === "encapsulacion" ? (
              <EncapsulationView layer={layer} onLayer={setLayer} />
            ) : (
              <div className="sequence">
                <div className="sequence-title">
                  SECUENCIA SIMULADA · {p.title}
                </div>
                <div className="sequence-head">
                  <span>ORIGEN</span>
                  <span>DESTINO</span>
                </div>
                {p.steps.map((x, i) => (
                  <button
                    onClick={() => {
                      wrap(i);
                      setTab("event");
                    }}
                    key={i}
                    aria-current={i === stepIndex ? "step" : undefined}
                    className={
                      "sequence-event " + (i === stepIndex ? "current" : "")
                    }
                  >
                    <span>
                      {i + 1}. {x.name}
                      <small>
                        {x.from} → {x.to} · L{x.layer}
                      </small>
                    </span>
                    <span
                      className={
                        x.from === "server" ? "arrow reverse" : "arrow"
                      }
                    >
                      {x.from === "server" ? "←" : "→"}
                    </span>
                    <span>{x.info}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="panel packets">
            <div className="packet-header">
              <h2>FLUJO SIMULADO · {p.title}</h2>
              <div className="play-controls">
                <select
                  aria-label="Velocidad"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                >
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                  <option value={2}>2×</option>
                </select>
                <button
                  onClick={() => wrap(stepIndex - 1)}
                  aria-label="Anterior"
                  disabled={stepIndex === 0}
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  className="primary"
                  onClick={() => dispatch({ type: "toggle" })}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                  {playing ? "PAUSAR" : "REPRODUCIR"}
                </button>
                <button
                  onClick={() => wrap(stepIndex + 1)}
                  disabled={stepIndex === p.steps.length - 1}
                >
                  PASO
                </button>
                <button onClick={() => wrap(0)} aria-label="Reiniciar">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <caption className="sr-only">
                  Paquetes simulados de {p.title}. Selecciona un evento para
                  inspeccionarlo.
                </caption>
                <thead>
                  <tr>
                    {[
                      "N.º",
                      "TIEMPO",
                      "ORIGEN",
                      "DESTINO",
                      "PROTOCOLO",
                      "INFO",
                      "TAMAÑO EST.",
                    ].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.steps.map((x, i) => (
                    <tr
                      key={i}
                      onClick={() => {
                        wrap(i);
                        setTab("event");
                      }}
                      className={stepIndex === i ? "highlight" : ""}
                    >
                      <td>
                        <button
                          aria-label={`Inspeccionar evento ${i + 1}: ${x.name}`}
                          aria-current={stepIndex === i ? "step" : undefined}
                          onClick={() => {
                            wrap(i);
                            setTab("event");
                          }}
                          className={"packet-num " + x.kind.toLowerCase()}
                        >
                          {i + 1}
                        </button>
                      </td>
                      <td>{(i * 0.018).toFixed(3)}s</td>
                      <td>{addresses[x.from]}</td>
                      <td>{addresses[x.to]}</td>
                      <td>{p.title}</td>
                      <td>{x.info}</td>
                      <td>{x.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <aside className="panel details">
          <nav className="detail-tabs" aria-label="Panel contextual">
            {(
              [
                { id: "learn", label: "Aprender" },
                { id: "event", label: "Inspector" },
                { id: "blue", label: "Blue Team" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          {tab === "learn" ? (
            <EducationPanel
              key={layer}
              layer={layer}
              onProtocol={(id) => {
                selectProtocol(id);
                setTab("event");
              }}
            />
          ) : tab === "blue" ? (
            <BlueTeamPanel key={layer} layer={layer} />
          ) : (
            <div className="details-body">
              <small className="eyebrow">
                SIMULACIÓN ACTIVA · INDEPENDIENTE DE LA CAPA INSPECCIONADA
              </small>
              <div className="protocol-title">
                <h1>{p.title}</h1>
                <span className="status">SIMULADO</span>
              </div>
              <p className="subtitle">{p.subtitle}</p>
              <p className="description">{p.description}</p>
              <div className="facts">
                <div>
                  <b>ASOCIACIONES OSI</b>
                  <span>
                    {protocolLayers(p.id, p.layer)
                      .map((n) => `L${n}`)
                      .join(" / ")}
                  </span>
                </div>
                <div>
                  <b>TRANSPORTE</b>
                  <span>{p.transport}</span>
                </div>
                <div>
                  <b>PUERTO</b>
                  <span>{p.port}</span>
                </div>
                <div>
                  <b>EVENTO</b>
                  <span>
                    {stepIndex + 1} / {p.steps.length} · L{current.layer}
                  </span>
                </div>
              </div>
              <div className="inspector-layers">
                {layers.map((l) => (
                  <button
                    key={l.n}
                    aria-label={`Inspeccionar capa ${l.n}`}
                    aria-pressed={layer === l.n}
                    onClick={() => setLayer(l.n as LayerNumber)}
                    className={layer === l.n ? "active" : ""}
                  >
                    {l.n}
                  </button>
                ))}
              </div>
              <div className="inspector">
                <div className="inspector-kicker">
                  CAPA INSPECCIONADA · {layer}
                </div>
                <h3>{lesson.pdu}</h3>
                <p>{lesson.process}</p>
                <small>
                  {protocolLayers(p.id, p.layer).includes(layer)
                    ? "El protocolo activo tiene funciones relacionadas con esta capa."
                    : "Esta capa se explora de forma independiente de la asociación principal del protocolo activo."}
                </small>
              </div>
              <div className="section-title">
                EVENTO ACTUAL · CAPA {current.layer}
              </div>
              <div className="event">
                <strong>
                  {stepIndex + 1}. {current.name}
                </strong>
                <p>{current.detail}</p>
                {Object.entries(current.fields).map(([k, v]) => (
                  <div className="field" key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="blue-team">
                <b>OBSERVACIÓN DEFENSIVA DEL EVENTO</b>
                <p>{current.blue}</p>
              </div>
              <button className="blue-toggle" onClick={() => setTab("blue")}>
                Abrir escenario Blue Team de capa {layer} →
              </button>
              <p className="disclaimer">
                Campos, tiempos y tamaños ilustrativos. No es una captura ni una
                implementación completa de los protocolos.
              </p>
            </div>
          )}
        </aside>
      </main>
      <footer>
        <span>PROTOCOL OSI LAB · LABORATORIO INTERACTIVO</span>
        <span>DATOS SINTÉTICOS · SIN CAPTURA REAL</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
