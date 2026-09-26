// Records the real app using a dedicated, synthetic submission database.
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('../submission');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  recordVideo: {
    dir: path.join(output, 'recording-temp'),
    size: { width: 1440, height: 1200 },
  },
});
const page = await context.newPage();
const base = 'http://localhost:3002';
const api = 'http://localhost:8002';
let ruleId;
let auth;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function caption(title, message, seconds = 18) {
  await page.evaluate(
    ({ title, message }) => {
      let panel = document.getElementById('walkthrough-caption');
      if (!panel) {
        panel = document.createElement('section');
        panel.id = 'walkthrough-caption';
        panel.style.cssText =
          'position:fixed;bottom:0;left:0;right:0;padding:20px 40px;background:#102e27;color:white;z-index:2147483647;font:18px/1.6 Arial;box-shadow:0 -3px 20px #0002;pointer-events:none';
        document.body.append(panel);
        document.body.style.paddingBottom = '150px';
      }
      panel.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = title;
      heading.style.cssText = 'display:block;font-size:23px;color:#bdeacb';
      const body = document.createElement('div');
      body.textContent = message;
      panel.append(heading, body);
    },
    { title, message },
  );
  console.log(title);
  await delay(seconds * 1000);
}
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await caption(
    'MoneyBeing | Loan Eligibility & Lead Management',
    'Architecture: Next.js + TypeScript + Tailwind → FastAPI + Pydantic → SQLAlchemy + PostgreSQL. JWT protects admin APIs. This walkthrough uses synthetic data only.',
    20,
  );
  let mobile = Number(`9${Date.now().toString().slice(-9)}`);
  while (
    550 +
      (createHash('sha256')
        .update(`moneybeing-demo:${mobile}:1995-05-12`)
        .digest()
        .readUInt32BE(0) %
        301) <
    700
  )
    mobile++;
  await page.getByLabel('Full name').fill('Walkthrough Demo');
  await page.getByLabel('Mobile number').fill(String(mobile));
  await page.getByLabel('Email address').fill('walkthrough@example.com');
  await page.getByLabel('Date of birth').fill('1995-05-12');
  await page.getByLabel('City', { exact: true }).fill('Bengaluru');
  await page.getByLabel('Pincode').fill('560001');
  await page.getByLabel('Loan type').selectOption('Home Loan');
  await page.getByLabel('Employment type').selectOption('Salaried');
  await page.getByLabel('Monthly income').fill('75000');
  await page.getByLabel('Loan amount required').fill('4000000');
  await page.getByLabel('Property value').fill('6000000');
  await page.getByRole('checkbox').check();
  await caption(
    '01 | Customer application and validation',
    'Required fields, email/mobile/pincode formats, date of birth, positive amounts and explicit consent are validated in both the browser and the API.',
    18,
  );
  await page.getByRole('button', { name: 'Check eligibility' }).click();
  await page
    .getByRole('heading', { name: 'Your eligibility assessment' })
    .waitFor();
  await caption(
    '02 | Mock credit score → BRE → database',
    'The mock generates a repeatable score from mobile and DOB. Active database rules determine eligibility. The saved result appears here; this is not a real CIBIL score.',
    20,
  );
  await page
    .getByRole('button', { name: 'Submit another application' })
    .click();
  await page.getByLabel('Full name').fill('Walkthrough Demo');
  await page.getByLabel('Mobile number').fill(String(mobile));
  await page.getByLabel('Email address').fill('walkthrough@example.com');
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
  await page.getByText('Lead already exists', { exact: true }).waitFor();
  await caption(
    '03 | Duplicate protection',
    'Submitting the same mobile returns HTTP 409: Lead already exists. A unique database constraint also prevents duplicates from concurrent requests.',
    15,
  );
  await page.goto(`${base}/login`);
  await page.getByLabel('Email address').fill('admin@moneybeing.local');
  await page.getByLabel('Password').fill('MoneyBeing@123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('heading', { name: 'Overview' }).waitFor();
  await page.getByText('Eligibility breakdown', { exact: true }).waitFor();
  await caption(
    '04 | JWT-protected admin dashboard',
    'Total, eligible and rejected leads plus average credit score come from PostgreSQL. The chart summarizes decisions. Unavailable scores are excluded from the average.',
    20,
  );
  await page
    .getByRole('link', { name: 'Lead management', exact: true })
    .click();
  await page
    .getByRole('cell', { name: 'Walkthrough Demo', exact: true })
    .waitFor();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await delay(1000);
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Search name or mobile' })
    .fill(String(mobile));
  await page.getByRole('button', { name: 'View', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Excel' }).click();
  await (await download).saveAs(path.join(output, 'demo-leads.xlsx'));
  await caption(
    '05 | Search, pagination, lead detail and Excel export',
    'The table shows all required columns. Search and filters run on the API; pagination limits each page. Export downloads the currently filtered records as a real XLSX workbook.',
    20,
  );
  await page.getByRole('link', { name: 'Business rules', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Minimum age', exact: true })
    .waitFor();
  await caption(
    '06 | Rules are database records',
    'These five rules were seeded once. Every application loads active rules from PostgreSQL. The 80% property rule uses a reference field; no eligibility threshold is hardcoded in Python.',
    20,
  );
  await page.getByRole('button', { name: 'Add rule' }).click();
  await page
    .getByLabel('Rule name', { exact: true })
    .fill('Walkthrough income check');
  await page
    .getByRole('combobox', { name: 'Field', exact: true })
    .selectOption('monthly_income');
  await page.getByLabel('Threshold value').fill('80000');
  await page
    .getByLabel('Rejection message')
    .fill('Monthly Income below walkthrough requirement');
  await page.getByRole('button', { name: 'Save rule' }).click();
  const card = page
    .locator('section.rule-card')
    .filter({ hasText: 'Walkthrough income check' });
  await card.waitFor();
  const token = await page.evaluate(() =>
    sessionStorage.getItem('moneybeing_access_token'),
  );
  auth = { Authorization: `Bearer ${token}` };
  const rules = await (
    await context.request.get(`${api}/api/rules`, { headers: auth })
  ).json();
  ruleId = rules.find((r) => r.rule_name === 'Walkthrough income check').id;
  const payload = {
    full_name: 'New Rule Demo',
    mobile: String(mobile + 1),
    email: 'newrule@example.com',
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
  const response = await context.request.post(`${api}/api/leads`, {
    data: payload,
  });
  if (response.status() !== 201)
    throw new Error(`Demo application failed: ${response.status()}`);
  const result = await response.json();
  await page.goto(`${base}/leads?id=${result.lead_id}`);
  await page.getByRole('region', { name: 'Lead details' }).waitFor();
  await page
    .getByText('Monthly Income below walkthrough requirement', { exact: true })
    .scrollIntoViewIfNeeded();
  await caption(
    '07 | New rule applied immediately',
    'After saving the ₹80,000 income rule, a new ₹75,000-income application is rejected with this configured message. No code change, backend restart or redeploy was needed.',
    22,
  );
  await page.goto(`${base}/rules`);
  const saved = page
    .locator('section.rule-card')
    .filter({ hasText: 'Walkthrough income check' });
  await saved.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Threshold value').fill('30000');
  await page.getByRole('button', { name: 'Save rule' }).click();
  await delay(700);
  page.once('dialog', (dialog) => dialog.accept());
  await saved.getByRole('button', { name: 'Delete', exact: true }).click();
  await saved.waitFor({ state: 'detached' });
  ruleId = undefined;
  await caption(
    '08 | Edit and delete; historical decisions stay intact',
    'The temporary rule was edited and deleted through the admin UI. Existing leads keep their original decision, rejection reasons and evaluated-rule snapshot.',
    18,
  );
  await page.goto(`${api}/docs`);
  await page
    .getByText('MoneyBeing Loan Eligibility & Lead Management', {
      exact: false,
    })
    .first()
    .waitFor();
  await caption(
    '09 | REST API and handoff',
    'POST /api/leads returns status, lead_id, credit_score and bre_status. Swagger, Postman, SQL dump and setup instructions are included. Provider failures save a null score and explicit manual-review reason.',
    20,
  );
  console.log('Walkthrough complete.');
} finally {
  if (ruleId && auth)
    await context.request
      .delete(`${api}/api/rules/${ruleId}`, { headers: auth })
      .catch(() => {});
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(output, 'walkthrough.webm'));
  await video.delete();
  await browser.close();
}
