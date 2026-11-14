import { expect, test } from "@playwright/test";
import { academyLessons } from "../src/academy";

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

test("direct route loads the independent seven-layer course", async ({ page }) => {
  const response = await page.goto("/capas");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Atlas OSI · Academia de redes");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.getByRole("heading", { name: "Las capas que conectan cada sistema." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Física" })).toBeVisible();
  await expect(page.locator(".topology")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "REPRODUCIR" })).toHaveCount(0);

  for (let index = 0; index < layerNames.length; index++) {
    const number = index + 1;
    await page.getByRole("button", { name: `Capa ${number}: ${layerNames[index]}`, exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: layerNames[index] })).toBeVisible();
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
      "Ejercicios y autoevaluación",
    ]) await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.locator(".academy-command").first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Capa 4: Transporte", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 2, name: "Transporte" })).toBeVisible();
  await expect(page).toHaveURL(/#capa-4$/);
});

test("layer navigation and back-to-top control work on mobile widths", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/capas");
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
  await expect(page.getByRole("heading", { level: 2, name: "Física" })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: "Física" })).toBeVisible();
  await page.getByRole("button", { name: "Capa 7: Aplicación", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Aplicación" })).toBeVisible();
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
