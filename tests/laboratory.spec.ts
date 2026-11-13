import { test, expect } from "@playwright/test";
import { protocols } from "../src/data";
import { lessons, technologies, relatedTechnologies } from "../src/education";
import {
  encapsulationUnits,
  initialState,
  labReducer,
} from "../src/simulation";

test("educational coverage and catalog relationships are complete", () => {
  expect(lessons.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(new Set(technologies.map((t) => t.id)).size).toBe(technologies.length);
  for (const l of lessons) {
    expect(relatedTechnologies(l.n).length).toBeGreaterThan(1);
    expect(l.purpose.length).toBeGreaterThan(50);
    expect(l.scenario.evidence.length).toBeGreaterThan(0);
    expect(l.scenario.investigation.length).toBeGreaterThan(0);
    expect(l.scenario.mitigation.length).toBeGreaterThan(0);
  }
  for (const t of technologies.filter((t) => t.simulation))
    expect(protocols.some((p) => p.id === t.simulation)).toBeTruthy();
});
test("all 12 simulations retain valid steps and playback boundaries", () => {
  expect(protocols).toHaveLength(12);
  for (const p of protocols) {
    let state = labReducer(initialState, { type: "protocol", id: p.id });
    expect(state.layer).toBe(4);
    state = labReducer(state, { type: "toggle" });
    for (let i = 0; i < p.steps.length + 2; i++)
      state = labReducer(state, { type: "tick" });
    expect(state.step).toBe(p.steps.length - 1);
    expect(state.playing).toBe(false);
    expect(labReducer(state, { type: "seek", step: -1 }).step).toBe(0);
    expect(labReducer(state, { type: "toggle" }).step).toBe(0);
    for (const step of p.steps) {
      expect(step.layer).toBeGreaterThanOrEqual(1);
      expect(step.layer).toBeLessThanOrEqual(7);
      expect(step.detail).toBeTruthy();
      expect(step.blue).toBeTruthy();
    }
  }
});
test("inspection never interrupts or replaces the simulation", () => {
  const playing = labReducer(initialState, { type: "toggle" });
  const changed = labReducer(playing, { type: "layer", layer: 1 });
  expect(changed).toEqual({ ...playing, layer: 1 });
});
test("encapsulation sizes follow explicit overhead assumptions", () => {
  expect(new TextEncoder().encode(encapsulationUnits[0].payload).length).toBe(
    37,
  );
  expect(encapsulationUnits.map((u) => u.bytes)).toEqual([
    37,
    59,
    79,
    99,
    117,
    null,
  ]);
});
test("seven layers update education, topology, technologies and defense", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const l of lessons) {
    await page
      .getByRole("button", { name: `Capa ${l.n}: ${l.name}`, exact: true })
      .click();
    await expect(page.locator(".lesson-heading h1")).toHaveText(l.name);
    await expect(page.locator(".topology-context b")).toContainText(`L${l.n}`);
    const tech = relatedTechnologies(l.n).at(-1)!;
    await page
      .locator(".technology-grid")
      .getByRole("button", {
        name: new RegExp(tech.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .click();
    await expect(page.locator(".technology-detail>b")).toHaveText(tech.name);
    await page.getByRole("button", { name: "Blue Team", exact: true }).click();
    await expect(page.locator(".education-content h1")).toHaveText(
      l.scenario.title,
    );
    await page.getByRole("button", { name: "Comportamiento anómalo" }).click();
    await expect(page.locator(".evidence")).toContainText(
      l.scenario.evidence[0],
    );
    await page
      .getByRole("button", { name: "Tráfico normal", exact: true })
      .click();
    await expect(page.locator(".evidence")).toContainText(l.scenario.normal);
    await page.getByRole("button", { name: "Aprender", exact: true }).click();
  }
  expect(errors).toEqual([]);
});
test("protocol selection, player and inspection remain independent", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Capa 2: Enlace", exact: true })
    .click();
  await page
    .locator(".protocol-list")
    .getByRole("button", { name: /HTTPS/ })
    .click();
  await expect(page.locator(".lab-context")).toContainText("2 · Enlace");
  await expect(page.locator(".lab-context")).toContainText("HTTPS · evento L4");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await page.getByRole("button", { name: "PASO", exact: true }).click();
  await expect(page.locator(".event>strong")).toContainText("2. SYN-ACK");
  await page.getByRole("button", { name: "REPRODUCIR", exact: true }).click();
  await expect(page.locator(".event>strong")).toContainText("3. ACK", {
    timeout: 5000,
  });
  await page.getByRole("button", { name: "PAUSAR", exact: true }).click();
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await expect(page.locator(".event>strong")).toContainText("1. SYN");
  await page
    .getByRole("button", { name: "Inspeccionar capa del evento" })
    .click();
  await expect(page.locator(".lab-context")).toContainText("4 · Transporte");
});
test("encapsulation supports both directions and synchronizes inspected layer", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "ENCAPSULACIÓN", exact: true })
    .click();
  for (const u of encapsulationUnits) {
    await page
      .locator(".encap-units")
      .getByRole("button", { name: new RegExp(u.name) })
      .click();
    await expect(page.locator(".encap-detail h3")).toContainText(u.name);
    await expect(page.locator(".lab-context")).toContainText(`${u.layer} ·`);
  }
  await page.getByRole("button", { name: /Desencapsular/ }).click();
  await expect(page.locator(".encap-units button").first()).toContainText(
    "Bits y señales",
  );
  await expect(page.locator(".encap-detail")).toContainText(
    "El PHY recupera bits",
  );
  await page
    .getByRole("button", { name: "Capa 5: Sesión", exact: true })
    .click();
  await expect(page.locator(".encapsulation-view")).toContainText(
    "no añade una cabecera independiente de sesión",
  );
});
test("filter, search, sequence, keyboard and themes work", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Capa 6: Presentación", exact: true })
    .click();
  await page.getByRole("checkbox").check();
  await expect(page.locator(".protocol-list")).toContainText("QUIC");
  await page.getByRole("checkbox").uncheck();
  await page.getByRole("textbox", { name: "Buscar simulaciones" }).fill("DNS");
  await expect(page.locator(".protocol-list .protocol")).toHaveCount(1);
  await page.locator(".protocol-list .protocol").click();
  await page.getByRole("button", { name: "SECUENCIA", exact: true }).click();
  await page.locator(".sequence-event").nth(1).click();
  await expect(page.locator("tbody tr.highlight")).toContainText("response");
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await expect(page.locator(".app")).toHaveClass("app dark");
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("textbox", { name: "Buscar simulaciones" }),
  ).toBeFocused();
});
test("desktop and mobile layouts have no horizontal page overflow", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "Capa 1: Física", exact: true })
      .click();
    await expect(page.locator(".lesson-heading h1")).toHaveText("Física");
  }
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});

test("each original protocol can be selected, stepped and restarted in the browser", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  for (const p of protocols) {
    await page
      .locator(".protocol-list .protocol")
      .filter({
        has: page.locator("strong", {
          hasText: new RegExp(
            `^${p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          ),
        }),
      })
      .click();
    await expect(page.locator(".protocol-title h1")).toHaveText(p.title);
    await expect(page.locator("tbody tr")).toHaveCount(p.steps.length);
    await page.getByRole("button", { name: "PASO", exact: true }).click();
    await expect(page.locator(".event>strong")).toHaveText(
      `2. ${p.steps[1].name}`,
    );
    await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await expect(page.locator(".event>strong")).toHaveText(
      `1. ${p.steps[0].name}`,
    );
  }
});
