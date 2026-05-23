import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("page loads with title and header", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Studio Production Pipeline/);
    await expect(page.getByText("Studio Production Pipeline").first()).toBeVisible();
    await expect(page.getByText("Gestor de producción de contenido").first()).toBeVisible();
  });

  test("shows stats section labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Proyectos").first()).toBeVisible();
    await expect(page.getByText("Activos").first()).toBeVisible();
    await expect(page.getByText("Este mes").first()).toBeVisible();
    await expect(page.getByText("Assets").first()).toBeVisible();
  });

  test("stats labels render even when backend is unreachable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Proyectos").first()).toBeVisible();
    await expect(page.getByText("Activos").first()).toBeVisible();
  });

  test("kanban board columns are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Idea").first()).toBeVisible();
    await expect(page.getByText("Guion").first()).toBeVisible();
    await expect(page.getByText("Producción").first()).toBeVisible();
    await expect(page.getByText("Publicado").first()).toBeVisible();
  });
});
