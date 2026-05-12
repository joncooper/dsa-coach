import { expect, test } from "@playwright/test";

test("production app shell and problem route remain usable offline after caching", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DSA Coach" })).toBeVisible();

  await page.goto("/problem/foundations-bonus-01");
  await expect(page.getByRole("heading", { name: "Count Scores At Least Threshold: Foundations" })).toBeVisible();
  await page.locator(".workspace-editor .cm-content").click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def foundations_bonus_01(nums, threshold):\n    return sum(1 for value in nums if value >= threshold)\n");
  await page.getByRole("button", { name: /Run.*visible tests/i }).click();
  await expect(page.getByText("Pass: mixed threshold")).toBeVisible({ timeout: 60_000 });

  await page.goto("/");
  await page.goto("/problem/foundations-bonus-01");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Count Scores At Least Threshold: Foundations" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Run.*visible tests/i })).toBeVisible();
});
