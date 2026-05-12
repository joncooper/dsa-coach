import { expect, test, type Page } from "@playwright/test";

async function openCodeTabIfMobile(page: Page) {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width > 1050) return;
  const tabs = page.locator(".mobile-workspace-tabs");
  await expect(tabs).toBeVisible();
  const codeTab = tabs.getByRole("button", { name: "code" });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await codeTab.click({ force: true });
    if (await page.locator(".workspace-editor.active .cm-content").isVisible().catch(() => false)) {
      return;
    }
  }
  await expect(page.locator(".workspace-editor.active .cm-content")).toBeVisible();
}

function editor(page: Page) {
  const viewport = page.viewportSize();
  return viewport && viewport.width <= 1050 ? page.locator(".workspace-editor.active .cm-content") : page.locator(".workspace-editor .cm-content");
}

test("loads dashboard and opens a problem", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DSA Coach" })).toBeVisible();
  await page.getByRole("link", { name: /Foundations/ }).first().click();
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await page.getByRole("link", { name: /Sum Positive Readings/ }).click();
  await expect(page.getByRole("heading", { name: "Sum Positive Readings" })).toBeVisible();
  await openCodeTabIfMobile(page);
  await expect(page.getByRole("button", { name: /Run.*visible tests/i })).toBeVisible();
});

test("opens a quiz on mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/chapter/foundations");
  await page.getByRole("link", { name: /Foundations Quiz/ }).click();
  await expect(page.getByRole("heading", { name: "Foundations Quiz" })).toBeVisible();
});

test("solves a guided problem with keyboard shortcut", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Hardware keyboard shortcuts are covered in desktop; mobile uses tab and button flows.");
  await page.goto("/problem/sum-positive-readings");
  await openCodeTabIfMobile(page);
  await editor(page).click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def sum_positive_readings(readings):\n    return sum(value for value in readings if value > 0)\n");
  await page.keyboard.press("Control+Enter");
  await expect(page.getByText("Pass: mixed readings")).toBeVisible({ timeout: 60_000 });
});

test("opens and solves a runnable bonus problem", async ({ page }) => {
  await page.goto("/chapter/foundations");
  await expect(page.getByRole("heading", { name: "Runnable Bonus Drills" })).toBeVisible();
  await page.getByRole("link", { name: /Count Scores At Least Threshold: Foundations/ }).click();
  await expect(page.getByRole("heading", { name: "Count Scores At Least Threshold: Foundations" })).toBeVisible();
  await openCodeTabIfMobile(page);
  await editor(page).click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def foundations_bonus_01(nums, threshold):\n    return sum(1 for value in nums if value >= threshold)\n");
  await page.getByRole("button", { name: /Submit/ }).click();
  await expect(page.getByText("2/2 hidden tests passed")).toBeVisible({ timeout: 60_000 });
});

test("reveals hints, solution, and hidden diagnostics", async ({ page }) => {
  await page.goto("/problem/foundations-bonus-01");
  await page.getByRole("button", { name: "Reveal hint" }).click();
  await expect(page.getByText("Hint 1:")).toBeVisible();
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(page.getByRole("heading", { name: "Solution" })).toBeVisible();
  await expect(page.locator(".solution-box code").filter({ hasText: "def foundations_bonus_01" })).toBeVisible();
  await openCodeTabIfMobile(page);
  await editor(page).click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def foundations_bonus_01(nums, threshold):\n    return 0\n");
  await page.getByRole("button", { name: /Submit/ }).click();
  await expect(page.getByRole("button", { name: "Reveal hidden diagnostics" })).toBeVisible({ timeout: 60_000 });
  await page.getByRole("button", { name: "Reveal hidden diagnostics" }).click();
  await expect(page.locator(".result-diff").first().getByText("Expected")).toBeVisible();
  await expect(page.locator(".result-diff").first().getByText("Actual")).toBeVisible();
});

test("uses mobile problem tabs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/problem/sum-positive-readings");
  await page.getByRole("button", { name: "code" }).click();
  await expect(editor(page)).toBeVisible();
  await page.getByRole("button", { name: "results" }).click();
  await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  await page.getByRole("button", { name: "notes" }).click();
  await expect(page.getByLabel("Notes")).toBeVisible();
  await page.getByRole("button", { name: "scratch" }).click();
  await expect(page.getByRole("heading", { name: "Python scratchpad" })).toBeVisible();
});

test("uses focus mode and sidebar collapse", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Sidebar collapse is a desktop workspace control.");
  await page.goto("/problem/sum-positive-readings");
  await page.getByRole("button", { name: "Collapse nav" }).click();
  await expect(page.getByPlaceholder("Search")).toBeHidden();
  await page.getByRole("button", { name: "Focus" }).click();
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Exit focus" })).toBeVisible();
});

test("persists study workspace controls and shows run history", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Run history and dock resizing are desktop workspace controls.");
  await page.goto("/problem/sum-positive-readings");

  await page.getByRole("button", { name: "Star problem" }).click();
  await expect(page.getByRole("button", { name: "Starred" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Starred" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Starred Problems" })).toBeVisible();
  await page.locator(".starred-panel").getByRole("link", { name: /Sum Positive Readings/ }).click();
  await expect(page.getByRole("heading", { name: "Sum Positive Readings" })).toBeVisible();

  await page.getByRole("button", { name: "Full prompt" }).click();
  await expect(page.getByRole("button", { name: "Compact prompt" })).toBeVisible();

  await page.locator(".toolbar-menu summary").click();
  await expect(page.getByText("Submit all tests")).toBeVisible();

  const beforeDock = await page.locator(".workspace-bottom").boundingBox();
  await page.getByRole("separator", { name: "Resize output dock" }).focus();
  await page.keyboard.press("ArrowUp");
  const afterDock = await page.locator(".workspace-bottom").boundingBox();
  expect(afterDock?.height ?? 0).toBeGreaterThan(beforeDock?.height ?? 0);

  await page.getByRole("tab", { name: "scratchpad" }).click();
  await page.locator(".scratchpad-panel .cm-content").click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("print(sum([2, 3]))\n");
  await page.getByRole("button", { name: "Run scratchpad" }).click();
  await expect(page.locator(".scratchpad-output")).toContainText("5", { timeout: 60_000 });

  await editor(page).click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def sum_positive_readings(readings):\n    return sum(value for value in readings if value > 0)\n");
  await page.getByRole("button", { name: /Run.*visible tests/i }).click();
  await expect(page.getByText("Pass: mixed readings")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("tab", { name: /history/ }).click();
  await expect(page.getByRole("heading", { name: "Run history" })).toBeVisible();
  await expect(page.locator(".history-item").first()).toContainText("Passed");
});

test("exports progress after a completion", async ({ page }) => {
  await page.goto("/lesson/foundations-lesson");
  await page.getByRole("button", { name: "Mark complete" }).click();
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("dsa-coach-backup");
});
