import { expect, test } from "@playwright/test";

test("theme follows the system, persists an override, and responds to system changes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(246, 248, 245)",
  );
  await page.getByLabel("Color theme", { exact: true }).selectOption("dark");
  await page.reload();
  await expect(page.getByLabel("Color theme", { exact: true })).toHaveValue(
    "dark",
  );
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(18, 25, 20)",
  );
  await page.getByLabel("Color theme", { exact: true }).selectOption("system");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(246, 248, 245)",
  );
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(18, 25, 20)",
  );
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  expect(errors).toEqual([]);
});

test("signing out returns to the guest home and the same username can return", async ({
  page,
  isMobile,
}) => {
  await page.goto("/signup");
  await page.getByLabel("Username", { exact: true }).fill("returning_owl");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  if (isMobile)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out of demo" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your curiosity.",
  );
  await page.goto("/signup");
  await expect(page.getByLabel("Username", { exact: true })).toHaveValue(
    "returning_owl",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hey, returning_owl.",
  );
});
