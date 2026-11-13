import { test, expect } from "@playwright/test";
import { protocols, eventsForLayer, completeEvents } from "../src/data";
import { lessons, technologies, relatedTechnologies } from "../src/education";
import {
  encapsulationUnits,
  initialState,
  labReducer,
  validateSimulation,
} from "../src/simulation";

test("educational coverage and catalog relationships are complete", () => {
  expect(lessons.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(new Set(technologies.map((t) => t.id)).size).toBe(technologies.length);
  for (const technology of technologies) {
    expect(technology.standards.length, `${technology.id} standards`).toBeGreaterThan(0);
    expect(technology.operation.length, `${technology.id} operation`).toBeGreaterThan(40);
    expect(technology.security.length, `${technology.id} security`).toBeGreaterThan(40);
    expect(technology.summary.length).toBeGreaterThan(15);
  }
  for (const l of lessons) {
    expect(relatedTechnologies(l.n).length).toBeGreaterThan(1);
    expect(l.purpose.length).toBeGreaterThan(50);
    expect(l.scenario.evidence.length).toBeGreaterThan(0);
    expect(l.scenario.investigation.length).toBeGreaterThan(0);
    expect(l.scenario.mitigation.length).toBeGreaterThan(0);
    expect(l.process.length).toBeGreaterThan(70);
    expect(l.example.length).toBeGreaterThan(25);
    expect(l.scenario.tools.length).toBeGreaterThan(0);
    expect(l.scenario.falsePositives.length).toBeGreaterThan(20);
    expect(l.scenario.limits.length).toBeGreaterThan(20);
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
      expect(step.eventId).toBeTruthy();
      expect(step.protocol).toBeTruthy();
      expect(step.operation).toBeTruthy();
      expect(step.relatedLayers).toContain(step.layer);
      expect(step.relatedLayers.every((n) => n >= 1 && n <= 7)).toBeTruthy();
      expect(step.observableLayers.length).toBeGreaterThan(0);
      expect(step.observabilityNote).toBeTruthy();
      expect(step.simulationRef.protocolId).toBe(p.id);
    }
    expect(p.standards.length).toBeGreaterThan(0);
    expect(p.osiRationale.length).toBeGreaterThan(60);
    expect(p.lifecycle.length).toBeGreaterThan(60);
    expect(p.security.length).toBeGreaterThan(60);
  }
});

test("simulation integrity rejects malformed runs and accepts every shipped sequence", () => {
  for (const protocol of protocols)
    expect(validateSimulation(protocol), protocol.id).toEqual([]);

  const template = protocols[0];
  const single = {
    ...template,
    id: "single",
    steps: [{
      ...template.steps[0],
      eventId: "single-1",
      simulationRef: { protocolId: "single", stepIndex: 0 },
    }],
  };
  expect(validateSimulation(single)).toEqual([]);
  expect(validateSimulation({ ...single, id: "empty", steps: [] })).toEqual([
    "La simulación no tiene eventos.",
  ]);
  expect(labReducer({ ...initialState, pid: "missing", playing: true }, { type: "toggle" })).toEqual({
    ...initialState,
    pid: "missing",
    playing: false,
  });
});

test("layer inspection filters only responsible operations and preserves source order/integrity", () => {
  for (const protocol of protocols) {
    const before = JSON.stringify(protocol.steps);
    const complete = completeEvents(protocol.steps);
    expect(complete.map((entry) => entry.step)).toEqual(protocol.steps);
    for (const layer of [1, 2, 3, 4, 5, 6, 7] as const) {
      const filtered = eventsForLayer(protocol.steps, layer);
      expect(filtered.every(({ step }) => step.layer === layer)).toBeTruthy();
      expect(filtered.map(({ sourceIndex }) => sourceIndex)).toEqual(
        filtered.map(({ sourceIndex }) => sourceIndex).slice().sort((a, b) => a - b),
      );
      expect(filtered.every(({ sourceIndex, step }) => protocol.steps[sourceIndex] === step)).toBeTruthy();
    }
    expect(JSON.stringify(protocol.steps)).toBe(before);
  }
  expect(eventsForLayer(protocols.find((p) => p.id === "tcp")!.steps, 1)).toHaveLength(0);
  expect(eventsForLayer(protocols.find((p) => p.id === "tcp")!.steps, 5)).toHaveLength(0);
  expect(eventsForLayer(protocols.find((p) => p.id === "tcp")!.steps, 4).length).toBeGreaterThan(0);
});

test("protocol stacks and key synthetic exchanges are classified coherently", () => {
  const byId = Object.fromEntries(protocols.map((p) => [p.id, p]));
  expect(byId.arp.steps.every((step) => step.layer === 2 && step.relatedLayers.includes(3))).toBeTruthy();
  expect(byId.dhcp.steps.map((step) => step.name)).toEqual(["Discover", "Offer", "Request", "ACK"]);
  expect(byId.dhcp.steps.every((step) => step.layer === 7 && step.relatedLayers.includes(4))).toBeTruthy();
  expect(byId.tcp.steps.slice(0, 3).map((step) => step.name)).toEqual(["SYN", "SYN-ACK", "ACK"]);
  expect(byId.tcp.steps.slice(-4).map((step) => step.name)).toEqual(["FIN cliente", "ACK servidor", "FIN servidor", "ACK final"]);
  expect(byId.tcp.steps[1].fields.Ack).toBe("1001");
  expect(byId.tcp.steps[2].fields.Ack).toBe("5001");
  expect(byId.tcp.steps.every((step) => step.fields["Puerto origen"] && step.fields["Puerto destino"])).toBeTruthy();
  expect(byId.udp.steps.every((step) => !("TCP flags" in step.fields))).toBeTruthy();
  expect(byId.icmp.steps.every((step) => !("Puerto origen" in step.fields))).toBeTruthy();
  expect(byId.https.steps.slice(0, 3).every((step) => step.protocol === "TCP" && step.layer === 4)).toBeTruthy();
  expect(byId.https.steps.every((step) => step.fields["Puerto origen"] === "52344" || step.fields["Puerto origen"] === "443")).toBeTruthy();
  expect(byId.https.steps.find((step) => step.name === "ClientHello")?.protocol).toBe("TLS 1.3");
  expect(byId.https.steps.find((step) => step.name === "HTTP cifrado")?.protocol).toBe("HTTP");
  expect(byId.quic.steps.find((step) => step.name === "QUIC Initial")?.layer).toBe(4);
  const quicClientHello = byId.quic.steps.find((step) => step.name === "ClientHello QUIC");
  expect(quicClientHello?.layer).toBe(6);
  expect(quicClientHello?.animation).toBe("contained");
  expect(byId.quic.steps.find((step) => step.name === "Server Initial")?.fields["Parámetros QUIC"]).toBe("No van en Initial");
  expect(byId.quic.steps.find((step) => step.name === "EncryptedExtensions QUIC")?.fields["Parámetros QUIC"]).toContain("EncryptedExtensions");
  expect(byId.quic.steps.map((step) => step.name).indexOf("Client Finished sobre QUIC")).toBeLessThan(
    byId.quic.steps.map((step) => step.name).indexOf("HTTP/3 Request"),
  );
  expect(byId.quic.steps.find((step) => step.name === "HANDSHAKE_DONE")?.layer).toBe(4);
  expect(byId.quic.steps.find((step) => step.name === "HTTP/3 Request")?.layer).toBe(7);
  expect(byId.ssh.steps.map((step) => step.name)).toEqual([
    "Versión del cliente", "Versión del servidor", "KEXINIT del cliente", "KEXINIT del servidor",
    "KEX ECDH init", "KEX ECDH reply", "NEWKEYS del cliente", "NEWKEYS del servidor",
    "Solicitud de servicio", "Servicio aceptado", "Autenticación por clave pública",
    "Autenticación exitosa", "Abrir canal de sesión", "Canal confirmado",
  ]);
  expect(byId.dns.steps.every((step) => [step.from, step.to].includes("router"))).toBeTruthy();
  expect(byId.ip.steps.every((step) => step.logicalSource === "client" && step.logicalDestination === "server")).toBeTruthy();
  expect(byId.ip.steps.map((step) => step.nextHop)).toEqual(["router", "internet", "server"]);
  expect(byId.tls.standards).toContain("RFC 9846");
  expect(byId.dns.lifecycle).toContain("no representa recursión");
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
  await expect(page.locator("tbody tr").nth(0).locator("td").nth(4)).toHaveText("TCP");
  await expect(page.locator("tbody tr").nth(3).locator("td").nth(4)).toHaveText("TLS 1.3");
  await expect(page.locator("tbody tr").last().locator("td").nth(4)).toHaveText("HTTP");
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

test("editorial workspace fills the desktop and left events control the inspector", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("main").evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const footer = document.querySelector("footer")!.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect();
    return bounds.width === window.innerWidth && Math.abs(bounds.top - header.bottom) < 1 && Math.abs(bounds.bottom - footer.top) < 1;
  })).toBeTruthy();
  await page.getByRole("button", { name: "Capa 3: Red", exact: true }).click();
  await expect(page.locator(".lesson-heading h1")).toHaveText("Red");
  await page.locator(".event-list .event-item").nth(1).click();
  await expect(page.locator(".event>strong")).toContainText("2. ClientHello QUIC");
  await expect(page.locator(".event-list .event-item").nth(1)).toHaveAttribute("aria-current", "step");
});

test("ARP and DHCP use protocol-appropriate addresses in the event table", async ({ page }) => {
  await page.goto("/");
  await page.locator(".protocol-list .protocol").filter({ hasText: "ARP" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("ff:ff:ff:ff:ff:ff");
  await page.locator(".protocol-list .protocol").filter({ hasText: "DHCP" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("0.0.0.0");
  await expect(page.locator("tbody tr").first()).toContainText("255.255.255.255");
});

test("topology follows drawn links, identifies the DNS resolver and avoids duplicate QUIC animation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await page.locator(".protocol-list .protocol").filter({
    has: page.locator("strong", { hasText: /^IPv4$/ }),
  }).click();
  await expect(page.locator(".topology")).toHaveAttribute(
    "aria-label",
    /Ruta visual: client a switch a router/,
  );
  await expect(page.locator(".topology polyline")).toHaveAttribute("points", "90,154 270,154 450,154");
  await expect(page.locator(".event-classification")).toContainText("Datagrama lógico: Cliente → Servidor");
  await expect(page.locator(".event-classification")).toContainText("siguiente salto: Router");

  await page.locator(".protocol-list .protocol").filter({ hasText: "DNS" }).click();
  await expect(page.locator(".topology")).toContainText("Resolvedor DNS");
  await expect(page.locator("tbody tr").first()).toContainText("192.168.1.10");
  await expect(page.locator("tbody tr").first()).toContainText("192.168.1.1");

  await page.locator(".protocol-list .protocol").filter({ hasText: "QUIC" }).click();
  await page.getByRole("button", { name: "Inspeccionar evento 2: ClientHello QUIC" }).click();
  await expect(page.locator(".event-classification")).toContainText("no genera una segunda animación");
  await expect(page.locator(".contained-note")).toBeVisible();
  await page.getByRole("button", { name: "REPRODUCIR", exact: true }).click();
  await expect(page.locator(".topology animateMotion")).toHaveCount(0);
  await page.getByRole("button", { name: "PAUSAR", exact: true }).click();
  expect(errors).toEqual([]);
});

test("player boundaries and rapid context changes do not retain stale state", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await page.locator(".protocol-list .protocol").filter({
    has: page.locator("strong", { hasText: /^UDP$/ }),
  }).click();
  await page.getByRole("button", { name: "PASO", exact: true }).click();
  await expect(page.locator(".event>strong")).toHaveText("2. Respuesta UDP");
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await expect(page.locator(".event>strong")).toHaveText("1. Datagrama UDP");
  await page.getByRole("combobox", { name: "Velocidad" }).selectOption("2");
  await page.getByRole("button", { name: "REPRODUCIR", exact: true }).click();
  await expect(page.locator(".topology animateMotion")).toHaveCount(1);
  await page.waitForTimeout(1100);
  await expect(page.locator(".event>strong")).toHaveText("2. Respuesta UDP");
  await expect(page.getByRole("button", { name: "PASO", exact: true })).toBeDisabled();
  await expect(page.locator(".topology animateMotion")).toHaveCount(0);
  await page.getByRole("button", { name: "REPRODUCIR", exact: true }).click();
  await expect(page.locator(".event>strong")).toHaveText("1. Datagrama UDP");
  await page.getByRole("button", { name: "Capa 2: Enlace", exact: true }).click();
  await expect(page.getByRole("button", { name: "PAUSAR", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "PAUSAR", exact: true }).click();

  for (const title of ["TCP", "DNS", "QUIC", "SSH"]) {
    await page.locator(".protocol-list .protocol").filter({
      has: page.locator("strong", { hasText: new RegExp(`^${title.replace("/", "\\/")}`) }),
    }).click();
  }
  const ssh = protocols.find((protocol) => protocol.id === "ssh")!;
  await expect(page.locator(".protocol-title h1")).toHaveText("SSH");
  await expect(page.locator("tbody tr")).toHaveCount(ssh.steps.length);
  await expect(page.locator(".event>strong")).toHaveText(`1. ${ssh.steps[0].name}`);
  expect(errors).toEqual([]);
});

test("layer inspection has its own filter while the complete simulation remains available", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Inspección por capa" }).click();
  const quic = protocols.find((protocol) => protocol.id === "quic")!;
  await expect(page.locator(".event-list .event-item")).toHaveCount(eventsForLayer(quic.steps, 4).length);
  await expect(page.locator(".event-list")).toContainText("QUIC Initial");
  for (const item of await page.locator(".event-list .event-item").all())
    await expect(item.locator("small")).toContainText("L4");
  await page.getByRole("button", { name: "SECUENCIA", exact: true }).click();
  await expect(page.locator(".sequence-event")).toHaveCount(eventsForLayer(quic.steps, 4).length);
  await expect(page.locator(".packets h2")).toContainText("OPERACIONES PROPIAS · CAPA 4");

  await page.getByRole("button", { name: "Capa 1: Física", exact: true }).click();
  await expect(page.locator(".event-list .event-item")).toHaveCount(0);
  await expect(page.locator(".layer-empty")).toContainText("No hay operaciones propias de capa 1");
  await expect(page.locator(".sequence-event")).toHaveCount(0);

  await page.getByRole("button", { name: "Capa 6: Presentación", exact: true }).click();
  await page.locator(".event-list .event-item").first().click();
  await expect(page.locator(".event>strong")).toContainText("ClientHello QUIC");
  await expect(page.locator(".event-classification")).toContainText("responsable L6");
  await page.getByRole("button", { name: "Simulación completa" }).click();
  await expect(page.locator(".sequence-event")).toHaveCount(quic.steps.length);
  await expect(page.locator("tbody tr")).toHaveCount(quic.steps.length);
});
