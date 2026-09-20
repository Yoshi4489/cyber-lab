import { expect, test } from "@playwright/test";

test("paths and profile clearly explain their preview scope", async ({
  page,
}) => {
  for (const route of ["/paths", "/profile"]) {
    await page.goto(route);
    await expect(
      page.getByText("Preview · coming in a later phase", { exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Explore the sample labs" }).click();
    await expect(page).toHaveURL(/\/labs$/);
  }
  await page.goto("/paths/web-security");
  await expect(page).toHaveURL(/\/paths$/);
});
