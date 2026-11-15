import { expect, test } from "@playwright/test";

const chapters = [
  ["fundamentos", "Fundamentos de seguridad"],
  ["criptografia", "Criptografía aplicada"],
  ["pki", "PKI y certificados digitales"],
  ["iam", "Identidad y gestión de accesos"],
  ["redes", "Redes y arquitectura segura"],
  ["blue-team", "Blue Team y detección de amenazas"],
  ["siem", "SIEM y análisis de registros"],
  ["respuesta-incidentes", "Respuesta a incidentes y análisis forense"],
  ["vulnerabilidades", "Gestión de vulnerabilidades"],
  ["riesgos-continuidad", "Riesgos, gobernanza y continuidad"],
  ["nube-contenedores", "Seguridad en la nube y contenedores"],
  ["glosario", "Glosario técnico"],
] as const;

test("Bases publica índice, doce rutas directas y contenido desarrollado", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/bases/");
  await expect(page.getByRole("heading", { name: /Comprende los conceptos/ })).toBeVisible();
  await expect(page.locator(".chapter-row")).toHaveCount(12);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/bases/manifest.webmanifest");

  for (const [slug, title] of chapters) {
    const response = await page.goto("/bases/" + slug + "/");
    expect(response?.ok(), slug + " direct route").toBeTruthy();
    await expect(page.locator(".bases-chapter-picker")).toContainText(title);
    await expect(page.locator(".bases-lesson h1")).toHaveText(title);
    await expect(page.locator(".bases-prose-section").first()).toBeVisible();
    if (slug !== "glosario") expect(await page.locator(".bases-concept-card").count(), title).toBeGreaterThanOrEqual(3);
  }
  expect(pageErrors).toEqual([]);
});

test("glosario contextual, preferencias, progreso y evaluación guardan estado propio", async ({ page }) => {
  await page.goto("/bases/criptografia/");
  const originalUrl = page.url();
  const term = page.locator(".bases-term-link").filter({ hasText: "AES-GCM" }).first();
  await term.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Cifrado simétrico");
  await expect(page).toHaveURL(originalUrl);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(term).toBeFocused();

  await page.getByRole("button", { name: "Abrir glosario", exact: true }).click();
  await page.getByPlaceholder("Buscar término, sigla o definición").fill("Online Certificate Status Protocol");
  await page.locator(".bases-glossary-filter select").selectOption("pki");
  const glossaryResult = page.locator(".bases-glossary-result");
  await expect(glossaryResult).toHaveCount(1);
  await glossaryResult.click();
  await expect(page.locator(".bases-glossary-detail")).toContainText("Online Certificate Status Protocol");
  await page.getByRole("button", { name: /Abrir ficha de CRL/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/bases/blue-team/");
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileWidth = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(mobileWidth.content).toBeLessThanOrEqual(mobileWidth.viewport);

  await page.goto("/bases/criptografia/");
  await page.getByRole("button", { name: "Lectura" }).click();
  await page.locator(".bases-reader-settings label").filter({ hasText: "Tipografía" }).locator("select").selectOption("mono");
  await page.locator(".bases-reader-settings label").filter({ hasText: "Tamaño de texto" }).locator('input[type="range"]').fill("23");
  await page.locator(".bases-reader-settings label").filter({ hasText: "Tema" }).locator("select").selectOption("mono");
  await expect(page.locator(".bases-shell")).toHaveAttribute("data-reader-font", "mono");
  await expect(page.locator(".bases-shell")).toHaveAttribute("data-theme", "mono");
  const typography = await page.locator(".bases-concept-details p").first().evaluate((element) => getComputedStyle(element).fontSize);
  expect(Number.parseFloat(typography)).toBeGreaterThanOrEqual(21);
  expect(await page.evaluate(() => localStorage.getItem("blacknova:bases:preferences"))).toContain('"theme":"mono"');

  await page.getByRole("button", { name: "Índice" }).first().click();
  await page.locator(".chapter-row").filter({ hasText: "PKI y certificados digitales" }).click();
  await page.getByRole("button", { name: "Marcar como completado" }).click();
  await page.getByRole("button", { name: "Lectura" }).click();
  const firstQuestion = page.locator(".bases-question").nth(0);
  await firstQuestion.locator("input").nth(1).check();
  await page.locator(".bases-question").nth(1).locator("input").nth(1).check();
  await page.locator(".bases-question").nth(2).locator("input").nth(0).check();
  await page.locator(".bases-question").nth(3).locator("input").nth(0).check();
  await expect(page.locator(".bases-question-feedback")).toHaveCount(0);
  await page.getByRole("button", { name: "Enviar respuestas" }).click();
  await expect(page.getByText("4 de 4 · 100 %")).toBeVisible();
  await expect(page.locator(".bases-question-feedback")).toHaveCount(4);
  const saved = await page.evaluate(() => ({
    preferences: localStorage.getItem("blacknova:bases:preferences"),
    progress: localStorage.getItem("blacknova:bases:progress"),
    results: localStorage.getItem("blacknova:bases:quiz-results"),
    atlas: localStorage.getItem("atlas-osi.study.v2"),
  }));
  expect(saved.preferences).toContain('"font":"mono"');
  expect(saved.progress).toContain('"status":"completed"');
  expect(saved.results).toContain('"percent":100');
  expect(saved.atlas).toBeNull();
});

test("Bases y Atlas mantienen manifiestos, service workers y cachés independientes y Bases funciona offline", async ({ page, context, request, baseURL }) => {
  const origin = baseURL!;
  const manifestResponse = await request.get(origin + "/bases/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({ id: "/bases/", start_url: "/bases/", scope: "/bases/", display: "standalone" });
  expect(manifest.name).not.toBe("Atlas OSI Academia");
  for (const icon of manifest.icons) {
    const response = await request.get(origin + icon.src);
    expect(response.ok(), icon.src).toBeTruthy();
    const bytes = await response.body();
    expect(bytes.toString("hex", 0, 8)).toBe("89504e470d0a1a0a");
    expect(response.headers()["content-type"]).toContain("image/png");
  }

  await page.goto("/bases/");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.goto("/capas/");
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).some((registration) => new URL(registration.scope).pathname === "/capas"));
  await page.goto("/bases/");
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const registrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map((registration) => ({
    scope: new URL(registration.scope).pathname,
    script: new URL(registration.active!.scriptURL).pathname,
  })));
  expect(registrations).toContainEqual({ scope: "/bases/", script: "/bases/service-worker.js" });
  expect(registrations).toContainEqual({ scope: "/capas", script: "/service-worker.js" });
  const cacheNames = await page.evaluate(() => caches.keys());
  expect(cacheNames.some((name) => name.startsWith("blacknova-bases-shell-"))).toBeTruthy();
  expect(cacheNames.some((name) => name.startsWith("atlas-osi-shell-"))).toBeTruthy();
  await context.setOffline(true);
  await page.goto("/bases/pki/");
  await expect(page.locator(".bases-lesson h1")).toHaveText("PKI y certificados digitales");
});
