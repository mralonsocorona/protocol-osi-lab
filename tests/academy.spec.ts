import { expect, test } from "@playwright/test";
import { academyLessons } from "../src/academy";
import { chapterRecaps, chapterReferences } from "../src/academy-references";
import { lessons as investigationLessons } from "../src/education";
import { estimatedMinutes } from "../src/Academy";
import { mitreReferences, nistReferences, knowledgeConcepts } from "../src/knowledge";

const layerNames = [
  "Física",
  "Enlace",
  "Red",
  "Transporte",
  "Sesión",
  "Presentación",
  "Aplicación",
];

test("all seven lessons contain detailed technical, defensive and authorized offensive coverage", () => {
  expect(academyLessons.map((lesson) => lesson.name)).toEqual(layerNames);
  expect(academyLessons.map((lesson) => lesson.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  for (const lesson of academyLessons) {
    expect(lesson.objective.length).toBeGreaterThan(80);
    expect(lesson.fundamentals.length).toBeGreaterThanOrEqual(4);
    expect(lesson.fundamentals.join(" ").length).toBeGreaterThan(1_000);
    expect(lesson.workflow).toHaveLength(4);
    expect(lesson.encapsulation.length).toBeGreaterThan(100);
    expect(lesson.protocols.length).toBeGreaterThanOrEqual(4);
    expect(lesson.technologies.length).toBeGreaterThanOrEqual(4);
    expect(lesson.communication.length).toBeGreaterThan(350);
    expect(lesson.blueTeam).toHaveLength(4);
    expect(lesson.redTeam.length).toBeGreaterThanOrEqual(3);
    expect(lesson.commands.length).toBeGreaterThanOrEqual(4);
    expect(lesson.misconceptions.length).toBeGreaterThanOrEqual(3);
    expect(lesson.exercises.length).toBeGreaterThanOrEqual(2);
    expect(chapterRecaps[lesson.number]).toHaveLength(3);
    expect(chapterReferences[lesson.number].length).toBeGreaterThanOrEqual(3);
    expect(chapterReferences[lesson.number].every((reference) => /^https:\/\//.test(reference.url))).toBeTruthy();
    const scenario = investigationLessons[lesson.number - 1].scenario;
    expect(scenario.title.length).toBeGreaterThan(3);
    expect(scenario.evidence.length).toBeGreaterThan(0);
    expect(scenario.falsePositives.length).toBeGreaterThan(40);
    expect(scenario.limits.length).toBeGreaterThan(40);
    for (const command of lesson.commands) {
      expect(command.command.length).toBeGreaterThan(4);
      expect(command.purpose.length).toBeGreaterThan(30);
      expect(command.interpretation.length).toBeGreaterThan(50);
    }
  }
  const combined = academyLessons.map((lesson) => [lesson.name, ...lesson.fundamentals, lesson.communication].join(" ")).join(" ");
  for (const concept of ["TCP/IP", "Ethernet", "ARP", "IPv4", "IPv6", "ICMP", "TCP", "UDP", "DNS", "HTTP", "TLS", "QUIC"])
    expect(combined).toContain(concept);
});

test("MITRE and NIST scenario references use verified IDs and the CSF 2.0 function set", () => {
  const allScenarios = investigationLessons.map((lesson) => lesson.scenario);
  const mitreMappings = allScenarios.flatMap((scenario) => scenario.mitre ?? []);
  expect(mitreMappings.map((mapping) => mapping.id).sort()).toEqual(["T1071.004", "T1557.002"]);
  const officialMappings = [mitreReferences.arpPoisoning, mitreReferences.dnsC2];
  expect(mitreMappings.every((mapping) => officialMappings.some((reference) => reference.id === mapping.id && mapping.url === reference.url && mapping.version === reference.version))).toBeTruthy();
  expect(mitreMappings.every((mapping) => /^T\d{4}(\.\d{3})?$/.test(mapping.id) && /^\d+\.\d+$/.test(mapping.version) && mapping.description.length > 40 && mapping.scenarioRelation.length > 40 && mapping.evidence.length > 20 && mapping.limitations.length > 40)).toBeTruthy();

  const functions = new Set(["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"]);
  const nistMappings = allScenarios.flatMap((scenario) => scenario.nist ?? []);
  expect(nistMappings.length).toBeGreaterThan(0);
  expect(nistMappings.every((mapping) => mapping.framework === "NIST CSF 2.0" && functions.has(mapping.function) && mapping.reason.length > 30)).toBeTruthy();
  expect(nistReferences.csf.version).toBe("2.0");
  expect(nistReferences.incidentResponse.status).toContain("Final");
  expect(knowledgeConcepts.every((concept) => concept.references.every((reference) => /^https:\/\//.test(reference.url)))).toBeTruthy();
});

test("direct route loads the independent seven-layer course", async ({ page }) => {
  const response = await page.goto("/capas");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Atlas OSI · Academia de redes");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.getByRole("heading", { name: "Redes, leídas desde sus capas." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Siete capítulos" })).toBeVisible();
  await expect(page.locator(".chapter-row")).toHaveCount(7);
  expect(estimatedMinutes(1)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Abrir capítulo 1: Física" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Física" })).toBeVisible();
  await expect(page.locator(".topology")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "REPRODUCIR" })).toHaveCount(0);

  for (let index = 0; index < layerNames.length; index++) {
    const number = index + 1;
    await page.getByRole("button", { name: `Capa ${number}: ${layerNames[index]}`, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: layerNames[index] })).toBeVisible();
    await expect(page.locator(".academy-layer-button[aria-pressed=true]")).toHaveCount(1);
    for (const heading of [
      "Fundamentos y explicación técnica",
      "Funcionamiento paso a paso",
      "Encapsulación y PDU",
      "Protocolos y estándares",
      "Dispositivos y tecnologías",
      "Una comunicación real",
      "Perspectiva Blue Team",
      "Perspectiva Red Team",
      "Comandos Linux de práctica",
      "Errores conceptuales frecuentes",
      "Ejercicios de lectura",
      "Resumen técnico",
      "Referencias y lecturas primarias",
    ]) await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.locator(".academy-investigation")).toContainText("CASO DE INVESTIGACIÓN · ESCENARIO SINTÉTICO");
    await expect(page.locator(".academy-investigation h3")).toHaveText(investigationLessons[number - 1].scenario.title);
    await expect(page.locator(".academy-command").first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Capa 4: Transporte", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Transporte" })).toBeVisible();
  await expect(page).toHaveURL(/#capa-4$/);
});

test("layer navigation and back-to-top control work on mobile widths", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/capas");
  await page.getByRole("button", { name: "Abrir capítulo 1: Física" }).click();
  for (const [control, exact] of [["Abrir índice del libro", false], ["Abrir Diccionario y Centro de conocimiento", false], ["Lectura", true], ["Guardar marcador de lectura", false]] as const) {
    await expect(page.getByRole("button", { name: control, exact })).toBeVisible();
  }
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")]
        .map((element) => ({ name: element.className || element.tagName, right: Math.round(element.getBoundingClientRect().right) }))
        .filter((element) => element.right > window.innerWidth + 1)
        .slice(0, 5),
    }));
    expect(layout.document, `Horizontal overflow at ${width}px: ${JSON.stringify(layout.overflow)}`).toBeLessThanOrEqual(layout.viewport);
    if (width <= 390) {
      const caseColumnCount = await page.locator(".academy-case-columns").first().evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length);
      expect(caseColumnCount, `Scenario columns at ${width}px`).toBe(1);
    }
  }

  const backToTop = page.getByRole("button", { name: "Volver arriba" });
  await expect(backToTop).not.toHaveClass(/is-visible/);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(backToTop).toHaveClass(/is-visible/);
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("manifest, scoped service worker, icons and lesson shell work offline", async ({ page, context, request }) => {
  await page.goto("/capas");
  await page.getByRole("button", { name: "Abrir capítulo 1: Física" }).click();
  const origin = new URL(page.url()).origin;
  const manifestResponse = await request.get(`${origin}/manifest.webmanifest`);
  expect(manifestResponse.status()).toBe(200);
  expect(manifestResponse.headers()["content-type"]).toContain("manifest+json");
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ start_url: "/capas", scope: "/capas", display: "standalone" });

  for (const icon of manifest.icons) {
    const response = await request.get(new URL(icon.src, origin).toString());
    expect(response.status()).toBe(200);
    const dimensions = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return `${image.naturalWidth}x${image.naturalHeight}`;
    }, icon.src);
    expect(icon.sizes).toContain(dimensions);
  }

  const serviceWorker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return { scope: new URL(registration.scope).pathname, script: registration.active?.scriptURL };
  });
  expect(serviceWorker.scope).toBe("/capas");
  expect(new URL(serviceWorker.script!).pathname).toBe("/service-worker.js");
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBeTruthy();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Física" })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Física" })).toBeVisible();
  await page.getByRole("button", { name: "Capa 7: Aplicación", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Aplicación" })).toBeVisible();
  await page.getByRole("button", { name: "Evaluar mis conocimientos" }).click();
  await expect(page.getByRole("dialog", { name: "Evaluar mis conocimientos" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Abrir Diccionario y Centro de conocimiento" }).click();
  const knowledge = page.getByRole("dialog", { name: "Diccionario" });
  await expect(knowledge).toBeVisible();
  await knowledge.getByRole("searchbox", { name: "Buscar un término o sigla" }).fill("DNS tunnel");
  await expect(knowledge.getByRole("button", { name: /DNS tunneling/ })).toBeVisible();
});

test("laboratory root remains separate and does not register the academy worker", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".topology")).toBeVisible();
  await expect(page.getByRole("button", { name: "Capa 1: Física", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Las capas que conectan cada sistema." })).toHaveCount(0);
  const registrations = await page.evaluate(async () => "serviceWorker" in navigator
    ? (await navigator.serviceWorker.getRegistrations()).map((registration) => registration.scope)
    : []);
  expect(registrations).toEqual([]);
});

test("library estimates, reader preferences, bookmarks and reading progress persist locally", async ({ page }) => {
  await page.goto("/capas");
  for (const row of await page.locator(".chapter-row").all()) {
    await expect(row.locator(".chapter-copy small")).toContainText("min de lectura");
    await expect(row.locator(".chapter-copy small")).toContainText("Evaluación: Sin evaluación");
  }
  await page.getByRole("button", { name: "Abrir capítulo 2: Enlace" }).click();
  await page.getByRole("button", { name: "Lectura", exact: true }).click();
  await page.getByLabel("Tema").selectOption("sepia");
  const fontSize = page.locator(".reader-settings input[type=range]").first();
  await fontSize.focus();
  await fontSize.press("ArrowRight");
  await fontSize.press("ArrowRight");
  await fontSize.press("ArrowRight");
  await expect(page.locator(".academy-shell")).toHaveAttribute("data-theme", "sepia");
  await expect(page.locator(".academy-shell")).toHaveCSS("--reader-font-size", "20px");
  await page.getByRole("button", { name: "Guardar marcador de lectura" }).click();
  await expect(page.getByRole("button", { name: "Ir al marcador guardado" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.querySelector("#l2-blue-team")!.getBoundingClientRect().top + window.scrollY));
  await page.waitForTimeout(650);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas-osi.study.v2") ?? "{}"));
  expect(saved.preferences).toMatchObject({ theme: "sepia", fontSize: 20 });
  expect(saved.bookmarks[2]).toBe(0);
  expect(saved.readProgress[2]).toBeGreaterThan(30);
  await page.reload();
  await expect(page.locator(".academy-shell")).toHaveAttribute("data-theme", "sepia");
  await expect(page.getByRole("heading", { level: 1, name: "Enlace" })).toBeVisible();
  await page.getByRole("button", { name: "Abrir índice del libro" }).click();
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});

test("dictionary search, contextual definitions, related concepts and study links work accessibly", async ({ page }) => {
  await page.goto("/capas#capa-2");
  await expect(page.getByRole("heading", { level: 1, name: "Enlace" })).toBeVisible();
  const dictionaryButton = page.getByRole("button", { name: "Abrir Diccionario y Centro de conocimiento" });
  await dictionaryButton.click();
  const dialog = page.getByRole("dialog", { name: "Diccionario" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Volver a la lectura" }).focus();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Cerrar diccionario" })).toBeFocused();
  const search = dialog.getByRole("searchbox", { name: "Buscar un término o sigla" });
  await search.fill("ARP Cache Poisoning");
  await dialog.getByRole("button", { name: /ARP spoofing/ }).click();
  await expect(dialog.getByRole("heading", { level: 3, name: "ARP spoofing" })).toBeVisible();
  await expect(dialog.locator(".knowledge-definition")).toContainText("Anunciar una asociación IPv4-MAC falsa");
  await dialog.getByRole("button", { name: "Definición técnica" }).click();
  await expect(dialog.locator(".knowledge-definition")).toContainText("Manipulación de cachés ARP");
  await dialog.getByRole("button", { name: "ARP", exact: true }).click();
  await expect(dialog.getByRole("heading", { level: 3, name: "ARP", exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: /Capítulo 2.*Fundamentos/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Fundamentos y explicación técnica", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("l2-fundamentos");

  const contextualTerm = page.locator("#l2-fundamentos .glossary-term").filter({ hasText: "ARP" }).first();
  await contextualTerm.scrollIntoViewIfNeeded();
  await contextualTerm.focus();
  const before = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 3, name: "ARP", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(contextualTerm).toBeFocused();
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(60);
});

test("knowledge center remains readable and keyboard closable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/capas#capa-1");
  await page.getByRole("button", { name: "Abrir Diccionario y Centro de conocimiento" }).click();
  const dialog = page.getByRole("dialog", { name: "Diccionario" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Capas", exact: true }).click();
  await expect(dialog.getByRole("heading", { level: 3, name: "Física" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("chapter assessment validates before revealing rationale, scores, saves attempt and restores focus", async ({ page }) => {
  await page.goto("/capas#capa-1");
  const trigger = page.getByRole("button", { name: "Evaluar mis conocimientos" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Pregunta 1 de 10")).toBeVisible();
  await expect(dialog.locator(".assessment-feedback")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  for (let question = 1; question <= 10; question += 1) {
    await expect(dialog.getByText(`Pregunta ${question} de 10`)).toBeVisible();
    await dialog.locator(".assessment-option").first().click();
    await dialog.getByRole("button", { name: "Confirmar respuesta" }).click();
    await expect(dialog.locator(".assessment-feedback")).toBeVisible();
    if (question < 10) await dialog.getByRole("button", { name: "Siguiente pregunta" }).click();
  }
  await dialog.getByRole("button", { name: "Ver resultados" }).click();
  await expect(dialog.getByRole("heading", { name: "Revisión del intento" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Rendimiento por tema" })).toBeVisible();
  await expect(dialog.getByText("Razonamiento Blue Team")).toBeVisible();
  await expect(dialog.locator(".assessment-review-list > li")).toHaveCount(10);
  await expect(dialog.locator(".assessment-review-links")).toHaveCount(10);
  await expect(dialog.locator(".assessment-review-links").first().getByRole("button", { name: /Repasar este concepto/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Volver al capítulo" }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas-osi.study.v2") ?? "{}"));
  expect(saved.attempts).toHaveLength(1);
  expect(saved.attempts[0]).toMatchObject({ kind: "chapter", layer: 1, total: 10 });
  expect(saved.attempts[0].blueTeam.total).toBeGreaterThanOrEqual(4);
  expect(Object.keys(saved.attempts[0].byTopic).length).toBeGreaterThan(0);
});

test("integrated assessment presents 25 questions and supports a full review", async ({ page }) => {
  await page.goto("/capas");
  await page.getByRole("button", { name: "Iniciar evaluación" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Pregunta 1 de 25")).toBeVisible();
  for (let question = 1; question <= 25; question += 1) {
    await dialog.locator(".assessment-option").first().click();
    await dialog.getByRole("button", { name: "Confirmar respuesta" }).click();
    if (question < 25) await dialog.getByRole("button", { name: "Siguiente pregunta" }).click();
  }
  await dialog.getByRole("button", { name: "Ver resultados" }).click();
  await expect(dialog.locator(".assessment-review-list > li")).toHaveCount(25);
  await dialog.getByRole("button", { name: "Volver a la biblioteca" }).click();
  await expect(page.getByText("Evaluación integral", { exact: true })).toBeVisible();
});
