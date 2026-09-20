import { expect, test } from "@playwright/test";

test("guest home introduces the demo and returning learners see their dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your curiosity.");
  await page.getByRole("link", { name: "Join the demo", exact: true }).click();
  await page.getByLabel("Username", { exact: true }).fill("home_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hey, home_owl.");
});
