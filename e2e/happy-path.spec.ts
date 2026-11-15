import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const PLANT_PHOTO = fileURLToPath(new URL('./fixtures/plant.jpg', import.meta.url));
const PASSWORD = 'correct-horse-battery';

test('a new user registers a plant, cares for it, then switches language and theme', async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Your plants, alive and talking',
  );

  await page.getByRole('link', { name: 'Sign up' }).first().click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await expect(page.getByText('No plants yet')).toBeVisible();

  await page.getByRole('button', { name: 'Add my first plant' }).click();
  await page.getByLabel('Choose a photo').setInputFiles(PLANT_PHOTO);
  await expect(page.getByAltText('Preview of the selected plant photo')).toBeVisible();
  await page.getByRole('button', { name: 'Identify my plant' }).click();

  await expect(page.getByText(/We found Monstera/)).toBeVisible();
  await page.getByRole('button', { name: 'Meet my plant' }).click();

  await expect(page).toHaveURL(/\/en\/plants\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Monstera');
  await expect(page.getByText(/I feel great today/)).toBeVisible();

  await page.getByRole('button', { name: 'Water' }).click();
  await expect(page.getByText(/Glug glug/)).toBeVisible();

  await page.getByRole('button', { name: 'Spanish' }).click();
  await expect(page).toHaveURL(/\/es\/plants\//);
  await expect(page.getByRole('button', { name: 'Regar' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  await page.getByRole('button', { name: 'Tema oscuro' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Tema claro' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.getByRole('link', { name: 'Iniciar sesión' }).first()).toBeVisible();
});

test('anonymous visitors are sent to the login page for protected routes', async ({ page }) => {
  await page.goto('/es/dashboard');

  await expect(page).toHaveURL(/\/es\/login$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenido de nuevo');
});
