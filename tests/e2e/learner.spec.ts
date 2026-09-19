import { expect, test } from "@playwright/test";

test("demo username validates and returns to the selected lab", async ({ page }) => {
  await page.goto("/signup?lab=cookie-monster");
  await page.getByLabel("Username", { exact: true }).fill("bad name");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#username-error")).toContainText("Use 2–24");
  await page.getByLabel("Username", { exact: true }).fill("curious_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/labs\/cookie-monster$/);
  await page.goto("/signup");
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue("curious_owl");
  await page.reload();
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue("curious_owl");
});

test("malformed saved data recovers and return destinations cannot leave the site", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("ciscoku:learner:v1", '{"version":99}'));
  await page.goto("/signup?lab=https://example.com");
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue("");
  await page.getByLabel("Username", { exact: true }).fill("safe_learner");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
