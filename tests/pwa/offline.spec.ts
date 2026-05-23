import { expect, test } from "@playwright/test";

test("production app shell and problem route remain usable offline after caching", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DSA Coach" })).toBeVisible();

  await page.goto("/problem/foundations-bonus-01");
  await expect(page.getByRole("heading", { name: "Running Maximum" })).toBeVisible();
  await page.locator(".workspace-editor .cm-content").click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await page.keyboard.type("def running_maximum(nums):\n    return [max(nums[:i + 1]) for i in range(len(nums))]\n");
  await page.getByRole("button", { name: /Run.*visible tests/i }).click();
  await expect(page.getByText("Pass: rises and plateaus")).toBeVisible({ timeout: 60_000 });

  await page.goto("/");
  await page.goto("/problem/foundations-bonus-01");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Running Maximum" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Run.*visible tests/i })).toBeVisible();
});
