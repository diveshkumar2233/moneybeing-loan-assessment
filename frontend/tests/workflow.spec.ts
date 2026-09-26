import { test, expect } from '@playwright/test';

// Run only against a dedicated assessment/test database: this creates applications.
test('application, duplicate rejection, admin review and dynamic rule editing', async ({
  page,
  request,
}) => {
  const mobile = `9${Date.now().toString().slice(-9)}`;
  const name = `Browser Test ${mobile}`;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.screenshot({
    path: 'test-results/application-desktop.png',
    fullPage: true,
  });
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Mobile number').fill(mobile);
  await page.getByLabel('Email address').fill('browser@example.com');
  await page.getByLabel('Date of birth').fill('1995-05-12');
  await page.getByLabel('City', { exact: true }).fill('Bengaluru');
  await page.getByLabel('Pincode').fill('560001');
  await page.getByLabel('Loan type').selectOption('Home Loan');
  await page.getByLabel('Employment type').selectOption('Salaried');
  await page.getByLabel('Monthly income').fill('75000');
  await page.getByLabel('Loan amount required').fill('4000000');
  await page.getByLabel('Property value').fill('6000000');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(page.getByRole('heading', { name: 'Your eligibility assessment' })).toBeVisible();
  const result = await page.getByRole('status').innerText();
  expect(result.toLowerCase()).toContain('application received');
  const payload = {
    full_name: name,
    mobile,
    email: 'browser@example.com',
    date_of_birth: '1995-05-12',
    city: 'Bengaluru',
    pincode: '560001',
    loan_type: 'Home Loan',
    employment_type: 'Salaried',
    monthly_income: 75000,
    loan_amount: 4000000,
    property_value: 6000000,
    consent: true,
  };
  const duplicate = await request.post('http://localhost:8000/api/leads', {
    data: payload,
  });
  expect(duplicate.status()).toBe(409);
  expect((await duplicate.json()).detail).toBe('Lead already exists');
  await page.getByRole('link', { name: 'Admin sign in' }).click();
  await page.getByLabel('Email address').fill('admin@moneybeing.local');
  await page.getByLabel('Password').fill('MoneyBeing@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await page
    .getByRole('link', { name: 'Lead management', exact: true })
    .click();
  await page
    .getByRole('textbox', { name: 'Search name or mobile' })
    .fill(mobile);
  await expect(page.getByRole('cell', { name, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Lead details' }),
  ).toContainText('browser@example.com');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Excel' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    'moneybeing-leads.xlsx',
  );
  await page.getByRole('link', { name: 'Business rules', exact: true }).click();
  const ruleName = `Browser rule ${mobile}`;
  await page.getByRole('button', { name: 'Add rule' }).click();
  await page.getByLabel('Rule name', { exact: true }).fill(ruleName);
  await page
    .getByRole('combobox', { name: 'Field', exact: true })
    .selectOption('monthly_income');
  await page.getByLabel('Threshold value').fill('999999');
  await page
    .getByLabel('Rejection message')
    .fill('Browser rule requires higher income');
  await page.getByRole('button', { name: 'Save rule' }).click();
  const card = page.locator('section.rule-card').filter({ hasText: ruleName });
  await expect(card).toBeVisible();
  const rejected = await request.post('http://localhost:8000/api/leads', {
    data: { ...payload, mobile: String(Number(mobile) + 1) },
  });
  expect(rejected.status()).toBe(201);
  expect(JSON.parse(rejected.headers()['x-rejection-reasons'])).toContain(
    'Browser rule requires higher income',
  );
  await card.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Threshold value').fill('1');
  await page.getByRole('button', { name: 'Save rule' }).click();
  await expect(card.locator('.rule-expression')).toContainText('1.00');
  const updated = await request.post('http://localhost:8000/api/leads', {
    data: { ...payload, mobile: String(Number(mobile) + 2) },
  });
  expect(updated.status()).toBe(201);
  expect(JSON.parse(updated.headers()['x-rejection-reasons'])).not.toContain(
    'Browser rule requires higher income',
  );
  page.once('dialog', (dialog) => dialog.accept());
  await card.getByRole('button', { name: 'Delete' }).click();
  await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('mobile form fits viewport and validates required input', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({
    path: 'test-results/application-mobile.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await expect(page.getByLabel('Full name')).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
