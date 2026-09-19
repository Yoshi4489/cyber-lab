import { expect, test } from "@playwright/test";

test("catalog combines search, category and difficulty; empty state can recover", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to the range." }),
  ).toBeVisible();
  await expect(page.locator(".lab-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Web security", exact: true }).click();
  await expect(page.locator(".lab-card")).toHaveCount(3);
  await page.getByLabel("Difficulty", { exact: true }).selectOption("Easy");
  await expect(page.locator(".lab-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Cookie Monster" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search labs" }).fill("not-a-lab");
  await expect(
    page.getByRole("heading", { name: "No labs found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".lab-card")).toHaveCount(12);
  await page.getByLabel("Sort labs").selectOption("shortest");
  await expect(page.locator(".lab-card").first()).toContainText("First Steps in Linux");
  expect(errors).toEqual([]);
});

test("bookmarks persist across navigation and reload, then can be removed", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Save Cookie Monster", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unsave Cookie Monster", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved");
  await expect(page.locator(".lab-card")).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Cookie Monster" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Unsave Cookie Monster", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keep your next challenge close." }),
  ).toBeVisible();
});

test("lab and path links lead to briefings with a demo entry point", async ({
  page,
}) => {
  await page.goto("/paths");
  await page
    .getByRole("link", { name: "Web security foundations", exact: true })
    .click();
  await expect(page.locator(".path-step")).toHaveCount(3);
  await page.getByRole("link", { name: "Cookie Monster", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cookie Monster.",
  );
  await expect(
    page.getByRole("heading", { name: "What you’ll learn" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start Lab" }),
  ).toHaveAttribute("href", "/signup?lab=cookie-monster");
  await page
    .getByRole("button", { name: "Save Cookie Monster", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unsave Cookie Monster", exact: true }),
  ).toBeVisible();
  const response = await page.goto("/labs/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This trail goes quiet." }),
  ).toBeVisible();
});

test("navigation and layout work at the current viewport", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) {
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "Navigation" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: "Learning paths" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Find your direction." }),
    ).toBeVisible();
    await menu.click();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  } else {
    await page.getByRole("button", { name: "List view" }).click();
    await expect(page.locator(".lab-grid")).toHaveClass(/lab-list/);
    await page.getByRole("button", { name: "Grid view" }).click();
    await expect(page.locator(".lab-grid")).not.toHaveClass(/lab-list/);
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Learning paths" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Find your direction." }),
    ).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("connection check reaches the backend through the server adapter", async ({
  page,
  request,
}) => {
  await request.post("http://127.0.0.1:4101/scenario/healthy");
  await page.goto("/guide");
  await page.getByRole("button", { name: "Check connection" }).click();
  await expect(page.getByRole("status")).toContainText(
    "The backend API is reachable",
  );
  const response = await request.get("/api/backend-status");
  expect(await response.json()).toEqual({ status: "reachable" });
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("connection boundary rejects wrong services, errors, and redirects without exposing upstream data", async ({
  request,
}) => {
  try {
    for (const scenario of ["invalid", "error", "redirect"]) {
      await request.post(`http://127.0.0.1:4101/scenario/${scenario}`);
      const response = await request.get("/api/backend-status");
      expect(await response.json()).toEqual({ status: "unavailable" });
    }
  } finally {
    await request.post("http://127.0.0.1:4101/scenario/healthy");
  }
});
