import { test, expect } from '@playwright/test';

test('Check homepage loads', async ({ page }) => {
  await page.goto('http://localhost:5173'); // your frontend

  await expect(page).toHaveTitle(/PathPilot/);
});