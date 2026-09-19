import { expect, test } from "@playwright/test";

test("leaderboard distinguishes fictional users from the demo learner and updates XP", async ({ page }) => {
  await page.goto("/leaderboard");
  await expect(page.getByText(/This is not a live university leaderboard/)).toBeVisible();
  await page.getByRole("link", { name: "Join the demo" }).click();
  await page.getByLabel("Username", { exact: true }).fill("ranking_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.goto("/leaderboard");
  const row = page.getByRole("row").filter({ hasText: "ranking_owl" });
  await expect(row).toContainText("#8");
  await page.goto("/labs/cookie-monster");
  await page.getByRole("button", { name: "Start Lab" }).click();
  await page.getByRole("button", { name: "Finish Lab", exact: true }).click();
  await page.goto("/leaderboard");
  await expect(row).toContainText("#7");
  await expect(row.getByRole("cell").last()).toHaveText("100");
  await expect(page.getByRole("row").filter({ hasText: "hello_otter" })).toContainText("#7");
});
