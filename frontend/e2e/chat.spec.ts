import { test, expect, type Page } from "@playwright/test";

function setupChatMocks(page: Page) {
  page.route("**/api/projects", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/production/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ total_projects: 0, active_projects: 0, completed_this_month: 0, total_assets: 0, pipeline: [], upcoming_deadlines: [] }),
    });
  });
  page.route("**/api/production/pipeline", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/assets", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/publish/status/platforms", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/publish/jobs", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
}

test.describe("Chat panel", () => {
  test("opens chat and displays mocked assistant reply", async ({ page }) => {
    setupChatMocks(page);

    page.route("**/api/chat", async (route, request) => {
      const body = JSON.parse(request.postData() || "{}")
      if (body.message === "presupuesto") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            reply: "El presupuesto total del proyecto es de 15.000€. Llevamos gastados 9.200€.",
            suggested_actions: ["Ver pipeline", "Ver presupuesto", "Ver assets"],
          }),
        });
      } else {
        await route.abort("aborted");
      }
    });

    await page.goto("/");

    const chatButton = page.locator("button[aria-label='Chat']");
    await expect(chatButton).toBeVisible();
    await chatButton.click();

    await expect(page.getByText("Asistente de Producción").first()).toBeVisible();

    const input = page.locator("input[placeholder='Pregunta sobre producción...']");
    await input.fill("presupuesto");
    await input.press("Enter");

    await expect(page.getByText("presupuesto").first()).toBeVisible();
    await expect(page.getByText("15.000€").first()).toBeVisible();
    await expect(page.getByText("9.200€").first()).toBeVisible();
  });

  test("shows error when chat endpoint returns 500", async ({ page }) => {
    setupChatMocks(page);

    page.route("**/api/chat", async (route) => {
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ detail: "Internal server error" }) });
    });

    await page.goto("/");

    const chatButton = page.locator("button[aria-label='Chat']");
    await chatButton.click();

    const input = page.locator("input[placeholder='Pregunta sobre producción...']");
    await input.fill("hola");
    await input.press("Enter");

    await expect(page.getByText("Error de conexión con el asistente. Intenta de nuevo.").first()).toBeVisible();
  });
});
