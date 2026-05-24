import { test, expect } from "@playwright/test";

test.describe("Layout", () => {
  test("html lang attribute is set to es", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "es");
  });

  test("header has sticky positioning", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toHaveCSS("position", "sticky");
  });

  test("page has dark background", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe("rgb(11, 15, 25)");
  });
});
