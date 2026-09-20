import { expect, test } from "@playwright/test";

test("reset is explicit and returns demo progress to the guest state", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Username", { exact: true }).fill("reset_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.goto("/guide");
  await page.getByRole("button", { name: "Reset demo progress" }).click();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hey, reset_owl.");
  await page.goto("/guide");
  await page.getByRole("button", { name: "Reset demo progress" }).click();
  await page.getByRole("button", { name: "Yes, reset demo" }).click();
  await expect(page.getByText("Your demo progress has been reset.", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your curiosity.");
});
