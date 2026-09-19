import { expect, test } from "@playwright/test";

test("dashboard explains guest access and starts a new learner at zero", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Join the demo" }).click();
  await page.getByLabel("Username", { exact: true }).fill("campus_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hey, campus_owl.");
  const progress = page.getByRole("region", { name: "Demo learning progress" });
  await expect(progress).toContainText("0 days");
  await expect(page.getByRole("progressbar", { name: "Progress to next level" })).toHaveAttribute("value", "0");
  await page.getByRole("link", { name: "View lab", exact: true }).click();
  await expect(page).toHaveURL(/\/labs\/cookie-monster$/);
});
