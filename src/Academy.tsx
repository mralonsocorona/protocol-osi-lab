import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { academyLessons, type AcademyLayer } from "./academy";
import "./academy.css";

function layerFromHash(): AcademyLayer {
  const match = window.location.hash.match(/^#capa-([1-7])$/);
  return (match ? Number(match[1]) : 1) as AcademyLayer;
}

export function Academy() {
  const [selected, setSelected] = useState<AcademyLayer>(layerFromHash);
  const [showTop, setShowTop] = useState(false);
  const lesson = academyLessons[selected - 1];

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.createElement("meta");
    const manifest = document.createElement("link");
    document.title = "Atlas OSI · Academia de redes";
    description.name = "description";
    description.content = "Curso de fundamentos de redes y ciberseguridad a través de las siete capas OSI.";
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.append(description, manifest);

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/capas", updateViaCache: "none" })
        .then((value) => {
          registration = value;
          void value.update();
        })
        .catch(() => undefined);
    }

    const handleScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.title = previousTitle;
      description.remove();
      manifest.remove();
      void registration;
    };
  }, []);

  const navigate = (number: AcademyLayer) => {
    if (number === selected) return;
    setSelected(number);
    window.history.replaceState(null, "", `/capas#capa-${number}`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <div className="academy-shell">
      <a className="academy-skip" href="#lesson-content">Saltar al contenido</a>
      <header className="academy-header">
        <div className="academy-brand" aria-label="Atlas OSI Academia">
          <span className="academy-mark" aria-hidden="true">A</span>
          <span><strong>ATLAS OSI</strong><small>ACADEMIA DE REDES</small></span>
        </div>
      </header>

      <main className="academy-main">
        <section className="academy-intro" aria-labelledby="academy-title">
          <div className="academy-kicker">FUNDAMENTOS DE REDES Y CIBERSEGURIDAD <span>·</span> 01—07</div>
          <h1 id="academy-title">Las capas que conectan<br className="academy-desktop-break" /> cada sistema.</h1>
          <p>
            Un curso técnico para seguir los datos desde el medio físico hasta la aplicación. El modelo OSI organiza funciones para aprender; las redes reales implementan TCP/IP con límites que no siempre coinciden capa por capa.
          </p>
          <div className="academy-course-note">
            <span className="academy-note-index">01</span>
            <p><strong>Cómo estudiar esta guía</strong><br />Selecciona una capa y sigue su PDU, protocolos, observabilidad y práctica. Los comandos usan destinos documentales o locales: sustitúyelos solo por sistemas de tu laboratorio autorizado.</p>
          </div>
        </section>

        <nav className="academy-layer-nav" aria-label="Seleccionar capa OSI">
          <div className="academy-nav-heading">
            <span>ÍNDICE DEL CURSO</span>
            <span>CAPA 0{selected} / 07</span>
          </div>
          <div className="academy-layer-list">
            {academyLessons.map((item) => (
              <button
                className={selected === item.number ? "academy-layer-button is-selected" : "academy-layer-button"}
                key={item.number}
                type="button"
                aria-label={`Capa ${item.number}: ${item.name}`}
                aria-pressed={selected === item.number}
                onClick={() => navigate(item.number)}
              >
                <span className="academy-layer-number">0{item.number}</span>
                <span className="academy-layer-name">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <article className="academy-lesson" id="lesson-content" aria-labelledby="lesson-title">
          <header className="academy-lesson-heading">
            <div className="academy-lesson-overline">
              <span>CAPA 0{lesson.number}</span><span className="academy-overline-rule" /><span>{lesson.pdu.toUpperCase()}</span>
            </div>
            <h2 id="lesson-title" aria-live="polite">{lesson.name}</h2>
            <p className="academy-objective"><span>OBJETIVO</span>{lesson.objective}</p>
          </header>

          <section className="academy-section" aria-labelledby="fundamentos-title">
            <div className="academy-section-label"><span>01</span><h3 id="fundamentos-title">Fundamentos y explicación técnica</h3></div>
            <div className="academy-prose">{lesson.fundamentals.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </section>

          <section className="academy-section" aria-labelledby="flujo-title">
            <div className="academy-section-label"><span>02</span><h3 id="flujo-title">Funcionamiento paso a paso</h3></div>
            <ol className="academy-step-list">{lesson.workflow.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}</ol>
          </section>

          <section className="academy-section" aria-labelledby="encapsulacion-title">
            <div className="academy-section-label"><span>03</span><h3 id="encapsulacion-title">Encapsulación y PDU</h3></div>
            <div className="academy-callout"><strong>{lesson.pdu}</strong><p>{lesson.encapsulation}</p></div>
          </section>

          <section className="academy-section" aria-labelledby="protocolos-title">
            <div className="academy-section-label"><span>04</span><h3 id="protocolos-title">Protocolos y estándares</h3></div>
            <div className="academy-table-wrap" role="region" aria-label="Protocolos y estándares relacionados" tabIndex={0}>
              <table><thead><tr><th scope="col">Protocolo / estándar</th><th scope="col">Función y clasificación</th></tr></thead>
                <tbody>{lesson.protocols.map((protocol) => <tr key={protocol.name}><th scope="row">{protocol.name}</th><td>{protocol.role}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="academy-section" aria-labelledby="tecnologias-title">
            <div className="academy-section-label"><span>05</span><h3 id="tecnologias-title">Dispositivos y tecnologías</h3></div>
            <div className="academy-tech-list">{lesson.technologies.map((technology, index) => <div className="academy-tech-row" key={technology.name}><span>0{index + 1}</span><strong>{technology.name}</strong><p>{technology.role}</p></div>)}</div>
          </section>

          <section className="academy-section" aria-labelledby="ejemplo-title">
            <div className="academy-section-label"><span>06</span><h3 id="ejemplo-title">Una comunicación real</h3></div>
            <div className="academy-prose"><p>{lesson.communication}</p></div>
          </section>

          <section className="academy-section academy-team-section" aria-labelledby="blue-title">
            <div className="academy-section-label"><span>07</span><h3 id="blue-title">Perspectiva Blue Team</h3></div>
            <p className="academy-section-lead">Investigar una señal requiere contexto, telemetría y una hipótesis comprobable. Un indicador aislado no demuestra un incidente.</p>
            <div className="academy-insight-list">{lesson.blueTeam.map((item) => <div className="academy-insight" key={item.heading}><h4>{item.heading}</h4><p>{item.detail}</p></div>)}</div>
          </section>

          <section className="academy-section academy-team-section" aria-labelledby="red-title">
            <div className="academy-section-label"><span>08</span><h3 id="red-title">Perspectiva Red Team</h3></div>
            <p className="academy-section-lead">Las técnicas se practican con autorización explícita, activos definidos y límites de impacto acordados.</p>
            <div className="academy-insight-list">{lesson.redTeam.map((item) => <div className="academy-insight" key={item.heading}><h4>{item.heading}</h4><p>{item.detail}</p></div>)}</div>
          </section>

          <section className="academy-section" aria-labelledby="comandos-title">
            <div className="academy-section-label"><span>09</span><h3 id="comandos-title">Comandos Linux de práctica</h3></div>
            <p className="academy-section-lead">Ejemplos reproducibles. Los comandos de consulta muestran el entorno local; reemplaza los destinos solo dentro de tu alcance autorizado.</p>
            <div className="academy-command-list">{lesson.commands.map((item) => <article className="academy-command" key={item.command}><pre><code>{item.command}</code></pre><div><strong>{item.purpose}</strong><p>{item.interpretation}</p></div></article>)}</div>
          </section>

          <section className="academy-section" aria-labelledby="errores-title">
            <div className="academy-section-label"><span>10</span><h3 id="errores-title">Errores conceptuales frecuentes</h3></div>
            <dl className="academy-misconceptions">{lesson.misconceptions.map((item) => <div key={item.claim}><dt>{item.claim}</dt><dd>{item.correction}</dd></div>)}</dl>
          </section>

          <section className="academy-section" aria-labelledby="ejercicios-title">
            <div className="academy-section-label"><span>11</span><h3 id="ejercicios-title">Ejercicios y autoevaluación</h3></div>
            <div className="academy-exercises">{lesson.exercises.map((item, index) => <details key={item.question}><summary><span>0{index + 1}</span>{item.question}</summary><p>{item.answer}</p></details>)}</div>
          </section>

          <aside className="academy-model-note" aria-label="Nota sobre el modelo OSI">
            <strong>El modelo es un mapa, no una pila literal.</strong>
            <p>TCP/IP agrupa las capas de sesión, presentación y aplicación OSI como aplicación; su capa de enlace reúne funciones de las capas física y de enlace. Protocolos como TLS, ARP, ICMP y QUIC se clasifican según la función que se estudia y el contexto. La clasificación no reemplaza leer el estándar ni observar una implementación real.</p>
          </aside>

          <nav className="academy-next-prev" aria-label="Navegar entre lecciones">
            <button type="button" onClick={() => navigate(Math.max(1, selected - 1) as AcademyLayer)} disabled={selected === 1}>
              <ChevronLeft size={17} aria-hidden="true" /><span><small>ANTERIOR</small>{selected > 1 ? academyLessons[selected - 2].name : "Inicio del curso"}</span>
            </button>
            <button type="button" onClick={() => navigate(Math.min(7, selected + 1) as AcademyLayer)} disabled={selected === 7}>
              <span><small>SIGUIENTE</small>{selected < 7 ? academyLessons[selected].name : "Fin del curso"}</span><ChevronRight size={17} aria-hidden="true" />
            </button>
          </nav>
        </article>

        <footer className="academy-footer"><span>ATLAS OSI · ACADEMIA</span><span>SIETE CAPAS · UNA RED INTERCONECTADA</span><a href="#academy-title"><ArrowDown size={14} aria-hidden="true" /> Volver al índice</a></footer>
      </main>

      <button
        className={showTop ? "academy-back-top is-visible" : "academy-back-top"}
        type="button"
        aria-label="Volver arriba"
        title="Volver arriba"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}
      ><ArrowUp size={19} aria-hidden="true" /></button>
    </div>
  );
}
