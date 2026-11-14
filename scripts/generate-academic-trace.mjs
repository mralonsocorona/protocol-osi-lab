import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryDirectory = mkdtempSync(resolve(tmpdir(), "atlas-academic-trace-"));
const tempRequire = createRequire(resolve(temporaryDirectory, "runner.cjs"));

try {
  for (const source of ["knowledge.ts", "assessment-bank.ts"]) {
    const inputPath = resolve(root, "src", source);
    const outputPath = resolve(temporaryDirectory, source.replace(/\.ts$/, ".cjs"));
    const output = ts.transpileModule(readFileSync(inputPath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    writeFileSync(outputPath, output);
  }

  // Resolve the compiled modules with the expected sibling names.
  const knowledgePath = resolve(temporaryDirectory, "knowledge.cjs");
  const assessmentPath = resolve(temporaryDirectory, "assessment-bank.cjs");
  writeFileSync(resolve(temporaryDirectory, "knowledge.js"), readFileSync(knowledgePath));
  const assessmentSource = readFileSync(assessmentPath, "utf8").replaceAll('./knowledge', './knowledge.js');
  writeFileSync(assessmentPath, assessmentSource);
  const { knowledgeConcepts, sectionLabel } = tempRequire(knowledgePath);
  const { layerQuestionBank, integratedQuestionBank } = tempRequire(assessmentPath);
  const questions = [...layerQuestionBank, ...integratedQuestionBank];
  const safe = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ").trim();
  const questionKind = {
    single: "Respuesta única", multiple: "Selección múltiple", evidence: "Interpretación de evidencia", scenario: "Escenario",
  };
  const categoryNames = {
    fundamentals: "Fundamentos", protocols: "Protocolos", workflow: "Flujo", linux: "Linux",
    diagnosis: "Diagnóstico", "red-team": "Red Team", "blue-team": "Blue Team",
  };
  const difficulty = { introductorio: "introductorio", intermedio: "intermedio", avanzado: "avanzado" };

  const rows = questions.map((question) => {
    const chapter = question.layer === "integrated" ? "Integral" : `Capa ${question.layer}`;
    const category = categoryNames[question.category] ?? question.category;
    const sections = question.prerequisiteSectionIds.map((id) => `\`${id}\` (${sectionLabel(id)})`).join("<br />");
    const concepts = question.conceptIds.map((id) => knowledgeConcepts.find((concept) => concept.id === id)?.name ?? id).join(", ");
    const correct = question.options.filter((option) => question.correctOptionIds.includes(option.id)).map((option) => option.text).join(" · ");
    const distractors = question.options.filter((option) => !question.correctOptionIds.includes(option.id)).map((option) => option.text).join(" · ");
    const coverage = question.prerequisiteSectionIds.length && question.conceptIds.length && question.explanation.trim()
      ? "Cubierta estructuralmente · corroborar juicio semántico de distractores"
      : "Parcialmente cubierta · revisión editorial pendiente";
    return `| \`${safe(question.id)}\` | ${chapter} · ${safe(category)} | ${questionKind[question.kind]} · ${difficulty[question.difficulty]} | ${safe(question.prompt)} | ${safe(concepts)} | ${sections} | **${safe(correct)}**<br />${safe(question.explanation)} | ${safe(distractors)}<br /><strong>${coverage}</strong> |`;
  });

  const text = `# Registro pregunta por pregunta — Atlas OSI

Generado desde el banco tipado mediante \`node scripts/generate-academic-trace.mjs\`. Cada fila conserva la pregunta, conceptos, secciones previas, respuesta explicada y distractores. La clasificación comprueba trazabilidad estructural; no certifica por sí sola la exactitud semántica, plausibilidad de todas las alternativas ni ausencia de ambigüedad. Los límites y revisiones pendientes se explican en \`auditoria-academica.md\`.

Preguntas de capítulo: **${layerQuestionBank.length}** · preguntas integrales: **${integratedQuestionBank.length}** · conceptos en el diccionario: **${knowledgeConcepts.length}**.

| ID | Capítulo / categoría | Tipo / razonamiento | Pregunta | Conceptos relacionados | Secciones de aprendizaje | Respuesta y explicación | Distractores / dictamen de cobertura |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

## Criterio de revisión

- Las referencias usan IDs estables \`lN-seccion\`; en cada examen de capítulo, la primera referencia es la sección declarada en \`sectionRef\`. Las pruebas validan que todas las referencias existan y que el contenido marcado no dependa únicamente de secciones posteriores al examen.
- Los conceptos relacionados se almacenan junto con cada pregunta y se resuelven contra el diccionario. Una referencia estructural no sustituye la revisión editorial de si el texto previo enseña el razonamiento completo.
- El examen integral puede enlazar a secciones de cualquiera de las siete capas. No exige consultar MITRE ATT&CK o NIST para contestar.
- La columna de distractores mantiene sus textos para inspección humana. La plausibilidad técnica, dobles interpretaciones y posibles respuestas alternativas no pueden inferirse de la validación automatizada; queda pendiente una revisión semántica adversarial exhaustiva de las alternativas.
- “Cubierta estructuralmente” significa que existen prerrequisitos declarados, conceptos y explicación. No es una certificación automática de pedagogía ni exactitud técnica.

## Fuentes oficiales y técnicas registradas

- [MITRE ATT&CK T1557.002 — ARP Cache Poisoning](https://attack.mitre.org/techniques/T1557/002/) (versión 1.1) y [T1071.004 — DNS](https://attack.mitre.org/techniques/T1071/004/) (versión 1.4), consultadas el 2026-11-14. La relación DNS C2 es condicional; una consulta anómala no basta para asignarla.
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework), seis funciones; [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final), versión final de abril de 2025, sustituyó Rev. 2.
- [RFC 9849 — TLS Encrypted Client Hello](https://www.rfc-editor.org/rfc/rfc9849.html), [RFC 6066 — Server Name Indication](https://www.rfc-editor.org/rfc/rfc6066.html), [RFC 9582 — RPKI ROA Profiles](https://www.rfc-editor.org/rfc/rfc9582.html), [RFC 6349 — TCP Throughput Testing](https://www.rfc-editor.org/rfc/rfc6349.html).
- [IEEE 802.1X](https://standards.ieee.org/ieee/802.1X/7345/), [IEC 61746-1:2009 — OTDR calibration](https://webstore.iec.ch/en/publication/5748), [NIST glossary — False Positive](https://csrc.nist.gov/glossary/term/false_positive) y [NIST glossary — Intrusion Detection System](https://csrc.nist.gov/glossary/term/intrusion_detection_system).
- El diccionario enlaza RFC 2865 (RADIUS), RFC 5531 (ONC RPC), RFC 4648 (Base64), RFC 3629 (UTF-8), RFC 2003 (IP encapsulation), Linux man-pages y documentación del kernel, además de las fuentes primarias listadas por término.
`;

  writeFileSync(resolve(root, "docs", "trazabilidad-academica.md"), text);
  console.log(`Generated trace: ${layerQuestionBank.length + integratedQuestionBank.length} questions, ${knowledgeConcepts.length} concepts.`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
