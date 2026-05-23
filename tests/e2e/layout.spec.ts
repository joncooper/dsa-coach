import { expect, test } from "@playwright/test";

const routes = [
  ["/", "DSA Coach"],
  ["/chapter/foundations", "Foundations"],
  ["/lesson/foundations-lesson", "Foundations"],
  ["/quiz/foundations-quiz", "Foundations Quiz"],
  ["/problem/sum-positive-readings", "Sum Positive Readings"],
  ["/problem/foundations-bonus-01", "Running Maximum"]
] as const;

for (const [route, heading] of routes) {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    test(`renders ${route} at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
      await expect(page.screenshot({ fullPage: false })).resolves.toBeTruthy();
      const primaryControls = page.getByRole("button");
      const count = await primaryControls.count();
      for (let index = 0; index < Math.min(count, 4); index += 1) {
        const box = await primaryControls.nth(index).boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(20);
          expect(box.height).toBeGreaterThan(20);
        }
      }
    });
  }
}
