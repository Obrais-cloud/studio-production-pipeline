import { test, expect, type Page } from "@playwright/test";

function setupAssetMocks(page: Page) {
  page.route("**/api/projects", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/production/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        total_projects: 0,
        active_projects: 0,
        completed_this_month: 0,
        total_assets: 0,
        pipeline: [],
        upcoming_deadlines: [],
      }),
    });
  });
  page.route("**/api/production/pipeline", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/publish/status/platforms", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
  page.route("**/api/publish/jobs", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  page.route("**/api/assets", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "asset-1",
          project_id: "proj-1",
          name: "Guion_v1.pdf",
          type: "script",
          size_bytes: 245760,
          created_at: "2025-03-01T10:00:00Z",
          uploaded_by: "Ana",
        },
        {
          id: "asset-2",
          project_id: "proj-1",
          name: "Storyboard_A.jpg",
          type: "storyboard",
          size_bytes: 1048576,
          created_at: "2025-03-02T11:00:00Z",
          uploaded_by: "Luis",
        },
        {
          id: "asset-3",
          project_id: "proj-1",
          name: "Footage_001.mp4",
          type: "footage",
          size_bytes: 2147483648,
          created_at: "2025-03-05T09:00:00Z",
          uploaded_by: "María",
        },
        {
          id: "asset-4",
          project_id: "proj-1",
          name: "Audio_master.wav",
          type: "audio",
          size_bytes: 52428800,
          created_at: "2025-03-10T14:00:00Z",
          uploaded_by: "Carlos",
        },
      ]),
    });
  });

  page.route("**/api/assets/types", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { type: "script", label: "Script" },
        { type: "storyboard", label: "Storyboard" },
        { type: "footage", label: "Footage" },
        { type: "audio", label: "Audio" },
        { type: "graphic", label: "Graphic" },
        { type: "thumbnail", label: "Thumbnail" },
        { type: "export", label: "Export" },
      ]),
    });
  });
}

test.describe("Asset library", () => {
  test("renders mocked assets with correct names and sizes", async ({ page }) => {
    setupAssetMocks(page);
    await page.goto("/");

    await expect(page.getByText("Biblioteca de Assets").first()).toBeVisible();
    await expect(page.getByText("Guion_v1.pdf").first()).toBeVisible();
    await expect(page.getByText("246 KB").first()).toBeVisible();
    await expect(page.getByText("Storyboard_A.jpg").first()).toBeVisible();
    await expect(page.getByText("1.0 MB").first()).toBeVisible();
    await expect(page.getByText("Footage_001.mp4").first()).toBeVisible();
    await expect(page.getByText("2.1 GB").first()).toBeVisible();
  });

  test("filters assets by type when clicking filter buttons", async ({ page }) => {
    setupAssetMocks(page);
    await page.goto("/");

    await expect(page.getByText("Todos").first()).toBeVisible();
    await expect(page.getByText("script").first()).toBeVisible();

    // Click script filter — only script asset should remain visible
    await page.getByText("script").first().click();
    await expect(page.getByText("Guion_v1.pdf").first()).toBeVisible();
    await expect(page.getByText("Storyboard_A.jpg")).toHaveCount(0);
    await expect(page.getByText("Footage_001.mp4")).toHaveCount(0);

    // Click footage filter — only footage asset should remain visible
    await page.getByText("footage").first().click();
    await expect(page.getByText("Footage_001.mp4").first()).toBeVisible();
    await expect(page.getByText("Guion_v1.pdf")).toHaveCount(0);
    await expect(page.getByText("Audio_master.wav")).toHaveCount(0);
  });
});
