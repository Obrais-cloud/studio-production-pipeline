import { test, expect, type Page } from "@playwright/test";

function setupBaseMocks(page: Page) {
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
}

function setupPublishMocks(page: Page) {
  setupBaseMocks(page);

  page.route("**/api/publish/status/platforms", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { platform: "youtube", connected: true, account_name: "Cinefactory YT" },
        { platform: "vimeo", connected: false },
      ]),
    });
  });

  page.route("**/api/publish/jobs", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "pub-001",
          project_id: "proj-1",
          platform: "youtube",
          title: "Trailer Primavera",
          status: "live",
          external_id: "abc123",
          url: "https://www.youtube.com/watch?v=abc123",
          created_at: "2025-03-20T10:00:00Z",
          updated_at: "2025-03-20T12:00:00Z",
        },
        {
          id: "pub-002",
          project_id: "proj-2",
          platform: "vimeo",
          title: "Behind the Scenes",
          status: "failed",
          error_message: "Upload timeout",
          created_at: "2025-03-21T09:00:00Z",
          updated_at: "2025-03-21T09:05:00Z",
        },
      ]),
    });
  });
}

function setupDisconnectedMocks(page: Page) {
  setupBaseMocks(page);

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
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
}

test.describe("Publish panel", () => {
  test("shows platform connection status from mocked data", async ({ page }) => {
    setupPublishMocks(page);
    await page.goto("/");

    await expect(page.getByText("Publicación Automática").first()).toBeVisible();
    await expect(page.getByText("YouTube✓").first()).toBeVisible();
    await expect(page.getByText("Vimeo✗").first()).toBeVisible();
  });

  test("renders mocked publish jobs with statuses", async ({ page }) => {
    setupPublishMocks(page);
    await page.goto("/");

    await expect(page.getByText("Trailer Primavera").first()).toBeVisible();
    await expect(page.getByText("live").first()).toBeVisible();
    await expect(page.getByText("Behind the Scenes").first()).toBeVisible();
    await expect(page.getByText("failed").first()).toBeVisible();
  });

  test("shows disabled publish button when no platform is connected", async ({ page }) => {
    setupDisconnectedMocks(page);
    await page.goto("/");

    const publishButton = page.getByRole("button", { name: /Publicar video/i });
    await expect(publishButton).toBeDisabled();
  });
});
