import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { tr } from "../../apps/web/src/i18n/tr";

async function openApp(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: tr.start, exact: true }).click();
  await expect(page.getByRole("heading", { name: tr.today, exact: true })).toBeVisible();
}
async function addEvent(page: Page, title = "Demo review") {
  await page.getByRole("button", { name: tr.add, exact: true }).first().click();
  await page.getByLabel(tr.title, { exact: true }).fill(title);
  await page.getByLabel(tr.flexibleLabel).check();
  await page.getByRole("button", { name: tr.save, exact: true }).click();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
}

test("create, complete, preserve history and undo soft deletion", async ({ page }) => {
  await openApp(page);
  await addEvent(page);
  await page.getByRole("button", { name: new RegExp(`^${tr.complete}`) }).click();
  await page.getByRole("button", { name: tr.more, exact: true }).click();
  await page.getByRole("button", { name: tr.history, exact: true }).click();
  await expect(page.getByText("Demo review", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: tr.today, exact: true }).click();
  await page
    .getByRole("button", { name: new RegExp(`^${tr.edit}`) })
    .first()
    .click();
  await page.getByRole("button", { name: tr.remove, exact: true }).click();
  await page.getByRole("button", { name: tr.confirmDelete, exact: true }).click();
  await page.getByRole("button", { name: tr.more, exact: true }).click();
  await page.getByRole("button", { name: tr.undo, exact: true }).click();
  await page.getByRole("button", { name: tr.today, exact: true }).click();
  await expect(page.getByText("Demo review", { exact: true })).toBeVisible();
});

test("dirty form navigation is confirmed and cancellation preserves text", async ({ page }) => {
  await openApp(page);
  await page.getByRole("button", { name: tr.add, exact: true }).first().click();
  await page.getByLabel(tr.title, { exact: true }).fill("Unsaved draft");
  await page.getByRole("button", { name: tr.close, exact: true }).click();
  await expect(page.getByRole("heading", { name: tr.discardTitle })).toBeVisible();
  await page.getByRole("button", { name: tr.stay, exact: true }).click();
  await expect(page.getByLabel(tr.title, { exact: true })).toHaveValue("Unsaved draft");
});

test("encrypted file round trip and wrong-password failure preserve records", async ({
  page,
}, info) => {
  await openApp(page);
  await addEvent(page, "Backup demo");
  await page.getByRole("button", { name: tr.more, exact: true }).click();
  await page.getByRole("button", { name: tr.export, exact: true }).click();
  await page.getByLabel(tr.password, { exact: true }).fill("fictional-password");
  await page.getByLabel(tr.passwordAgain, { exact: true }).fill("fictional-password");
  await page.getByRole("button", { name: tr.export, exact: true }).last().click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: tr.download, exact: true }).click();
  const file = info.outputPath("demo.gungun");
  await (await download).saveAs(file);
  await page.getByRole("button", { name: tr.restore, exact: true }).click();
  await page.getByLabel(tr.backupFile).setInputFiles(file);
  await page.getByLabel(tr.password, { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: tr.checkFile, exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(tr.cryptoError);
  await page.getByLabel(tr.password, { exact: true }).fill("fictional-password");
  await page.getByRole("button", { name: tr.checkFile, exact: true }).click();
  await expect(page.getByRole("heading", { name: tr.preview, exact: true })).toBeVisible();
  await page.getByRole("button", { name: tr.overwrite, exact: true }).click();
  await page.getByRole("button", { name: tr.confirmOverwrite, exact: true }).click();
  await expect(page.getByText(tr.restored, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: tr.today, exact: true }).click();
  await expect(page.getByText("Backup demo", { exact: true })).toBeVisible();
});

test("installed app reloads and writes offline without runtime network", async ({
  page,
  context,
}) => {
  await openApp(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await addEvent(page, "Offline demo");
  await page.reload();
  await expect(page.getByText("Offline demo", { exact: true })).toBeVisible();
});

for (const width of [360, 412])
  for (const theme of ["cool", "paper", "balanced"] as const)
    for (const appearance of ["light", "dark"] as const) {
      test(`mobile ${width} ${theme} ${appearance}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 900 });
        await openApp(page);
        await page.getByRole("button", { name: tr.more, exact: true }).click();
        await page.getByRole("combobox", { name: tr.theme, exact: true }).selectOption(theme);
        await page
          .getByRole("combobox", { name: tr.appearance, exact: true })
          .selectOption(appearance);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute("data-appearance", appearance);
        await page.getByRole("button", { name: tr.today, exact: true }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const results = await new AxeBuilder({ page }).analyze();
        expect(
          results.violations.filter((v) => v.impact === "critical" || v.impact === "serious"),
        ).toEqual([]);
        await page.screenshot({ path: info.outputPath("screen.png"), fullPage: true });
      });
    }
