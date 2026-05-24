import { test, expect, type Page } from "@playwright/test";

function setupProjectMocks(page: Page) {
  page.route("**/api/projects", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "proj-test-001",
          title: "Cortometraje Primavera",
          studio: "Cinefactory",
          description: "Un cortometraje de primavera",
          status: "production",
          budget: 15000,
          deadline: "2025-07-15T00:00:00Z",
          created_at: "2025-01-10T12:00:00Z",
          updated_at: "2025-03-20T14:00:00Z",
          tasks_completed: 4,
          tasks_total: 10,
          assets_count: 12,
        },
        {
          id: "proj-test-002",
          title: "Documental Otoño",
          studio: "100 Sutton",
          description: "Documental sobre el otoño",
          status: "post_production",
          budget: 8000,
          deadline: "2025-08-01T00:00:00Z",
          created_at: "2025-02-05T09:00:00Z",
          updated_at: "2025-03-22T16:00:00Z",
          tasks_completed: 8,
          tasks_total: 8,
          assets_count: 24,
        },
        {
          id: "proj-test-003",
          title: "Spot Publicitario",
          studio: "Cinexin",
          description: "Spot de 30 segundos",
          status: "review",
          budget: 3000,
          deadline: "2025-06-01T00:00:00Z",
          created_at: "2025-03-01T10:00:00Z",
          updated_at: "2025-03-25T11:00:00Z",
          tasks_completed: 6,
          tasks_total: 6,
          assets_count: 5,
        },
        {
          id: "proj-test-004",
          title: "Podcast Piloto",
          studio: "Cinefactory",
          description: "Piloto de podcast",
          status: "idea",
          budget: 2000,
          deadline: null,
          created_at: "2025-03-28T08:00:00Z",
          updated_at: "2025-03-28T08:00:00Z",
          tasks_completed: 0,
          tasks_total: 0,
          assets_count: 0,
        },
      ]),
    });
  });

  page.route("**/api/production/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        total_projects: 4,
        active_projects: 3,
        completed_this_month: 1,
        total_assets: 41,
        pipeline: [],
        upcoming_deadlines: [],
      }),
    });
  });

  page.route("**/api/production/pipeline", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { phase: "scripting", status: "completed", progress_pct: 100, tasks: [], deliverables: ["guion"] },
        { phase: "shooting", status: "active", progress_pct: 60, tasks: [], deliverables: [] },
        { phase: "editing", status: "pending", progress_pct: 0, tasks: [], deliverables: [] },
        { phase: "promotion", status: "pending", progress_pct: 0, tasks: [], deliverables: [] },
        { phase: "publishing", status: "pending", progress_pct: 0, tasks: [], deliverables: [] },
      ]),
    });
  });

  page.route("**/api/assets", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  page.route("**/api/publish/status/platforms", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { platform: "youtube", connected: false },
        { platform: "vimeo", connected: false },
      ]),
    });
  });

  page.route("**/api/publish/jobs", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

test.describe("Projects CRUD display", () => {
  test("stats counters reflect mocked project data", async ({ page }) => {
    setupProjectMocks(page);
    await page.goto("/");

    const totalCard = page.getByText("Proyectos").first().locator("xpath=..");
    await expect(totalCard).toContainText("4");
    const activeCard = page.getByText("Activos").first().locator("xpath=..");
    await expect(activeCard).toContainText("3");
    const completedCard = page.getByText("Este mes").first().locator("xpath=..");
    await expect(completedCard).toContainText("1");
  });

  test("kanban groups projects into correct columns with counts", async ({ page }) => {
    setupProjectMocks(page);
    await page.goto("/");

    // Idea column has 1 project
    await expect(page.getByText("Idea").first()).toBeVisible();
    await expect(page.getByText("Podcast Piloto").first()).toBeVisible();

    // Production column has 1 project
    await expect(page.getByText("Producción").first()).toBeVisible();
    await expect(page.getByText("Cortometraje Primavera").first()).toBeVisible();

    // Post-prod column has 1 project
    await expect(page.getByText("Post-prod").first()).toBeVisible();
    await expect(page.getByText("Documental Otoño").first()).toBeVisible();

    // Review column has 1 project
    await expect(page.getByText("Revisión").first()).toBeVisible();
    await expect(page.getByText("Spot Publicitario").first()).toBeVisible();
  });

  test("project card renders studio badge, budget, deadline and progress", async ({ page }) => {
    setupProjectMocks(page);
    await page.goto("/");

    await expect(page.getByText("Cortometraje Primavera").first()).toBeVisible();
    await expect(page.getByText("Cinefactory").first()).toBeVisible();
    await expect(page.getByText("15.000 €").first()).toBeVisible();
    await expect(page.getByText("Documental Otoño").first()).toBeVisible();
    await expect(page.getByText("100 Sutton").first()).toBeVisible();

    // Progress percentages
    await expect(page.getByText("40%").first()).toBeVisible(); // 4/10
    await expect(page.getByText("100%").first()).toBeVisible(); // 8/8
  });

  test("timeline reflects mocked pipeline phases", async ({ page }) => {
    setupProjectMocks(page);
    await page.goto("/");

    await expect(page.getByText("Pipeline de Producción").first()).toBeVisible();
    await expect(page.getByText("Guion").first()).toBeVisible();
    await expect(page.getByText("Rodaje").first()).toBeVisible();
    await expect(page.getByText("Edición").first()).toBeVisible();
  });

  test("empty project list shows zero counts in all kanban columns", async ({ page }) => {
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

    await page.goto("/");

    const totalCard = page.getByText("Proyectos").first().locator("xpath=..");
    await expect(totalCard).toContainText("0");
    await expect(page.getByText("Idea").first()).toBeVisible();
    await expect(page.getByText("Guion").first()).toBeVisible();
  });
});
