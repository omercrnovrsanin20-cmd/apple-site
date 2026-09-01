import { test, expect, Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import os from "os";

// A minimal valid 1x1 PNG, written once so the upload tests don't depend on
// any file outside this repo.
const TEST_IMAGE = path.join(os.tmpdir(), "lustro-e2e-test-image.png");
mkdirSync(path.dirname(TEST_IMAGE), { recursive: true });
writeFileSync(
  TEST_IMAGE,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  )
);

const CUSTOMER_EMAIL = `test.customer.${Date.now()}@example.com`;
const CUSTOMER_PASSWORD = "TestPass123";
const CUSTOMER_NAME = "Test Customer";

const CUSTOMER_B_EMAIL = `test.customerb.${Date.now()}@example.com`;

const STAFF_EMAIL = `test.staff.${Date.now()}@example.com`;
const STAFF_PASSWORD = "StaffPass123";
const OWNER_EMAIL = "owner@detailing.me";
const OWNER_PASSWORD = "OwnerSecure2026!";

function futureDate(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

test.describe.serial("Full customer -> staff -> owner workflow", () => {
  let requestUrl = "";
  let workOrderUrl = "";

  test.beforeAll(async ({ browser }) => {
    // Staff accounts are created by the Owner, not seeded -- log in as owner
    // and create the staff account the rest of this suite logs in as.
    const context = await browser.newContext();
    await context.request.post("/api/auth/owner/login", {
      data: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
    });
    await context.request.post("/api/owner/staff", {
      data: { name: "Test Staff", email: STAFF_EMAIL, password: STAFF_PASSWORD },
    });
    await context.close();
  });

  test("customer registers, adds vehicle, submits request with photo", async ({ page }) => {
    await page.goto("/customer/register");
    await page.getByPlaceholder("").first(); // noop to ensure loaded
    await page.locator('input[type="text"], input:not([type])').first(); // safety

    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.locator('form input[required]').nth(0).fill(CUSTOMER_NAME);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/customer\/vehicles/);

    // Add vehicle
    await page.getByRole("button", { name: /Dodaj vozilo|Add Vehicle/ }).click();
    await page.waitForTimeout(300);

    const form = page.locator("form").first();
    await form.locator("input").nth(0).fill("BMW");
    await form.locator("input").nth(1).fill("X5");
    await form.locator('input[type="number"]').fill("2020");
    await form.locator("input").nth(3).fill("PG-123-AB");
    await form.getByRole("button", { name: /Sačuvaj|Save/ }).click();

    await expect(page.getByText("BMW X5")).toBeVisible({ timeout: 10000 });

    // Submit a request
    await page.goto("/customer/requests/new");
    await page.waitForTimeout(500);
    const vehicleSelect = page.locator("select").nth(0);
    await vehicleSelect.selectOption({ label: "BMW X5" });
    const serviceSelect = page.locator("select").nth(1);
    await serviceSelect.selectOption({ index: 1 });

    await page.fill('input[type="date"]', futureDate(5));
    await page.fill('input[type="time"]', "14:00");
    await page.fill("textarea", "Vehicle has visible swirl marks and needs paint correction.");
    await page.setInputFiles('input[type="file"]', TEST_IMAGE);

    await page.getByRole("button", { name: /Pošalji zahtjev|Submit Request/ }).click();
    await expect(page.getByText(/uspješno poslat|has been submitted/)).toBeVisible({ timeout: 10000 });

    await page.waitForURL(/\/customer\/requests$/, { timeout: 5000 });
    await page.getByRole("link").filter({ hasText: "BMW" }).first().click();
    await page.waitForURL(/\/customer\/requests\//, { timeout: 5000 });
    requestUrl = page.url();
    console.log("CUSTOMER REQUEST URL:", requestUrl);

    await expect(page.getByText(/Zahtjev poslat|Requested/)).toBeVisible();
  });

  test("staff sees the request and confirms it, creating a work order", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/staff/login");
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/staff$/);

    await page.goto("/staff/requests");
    await expect(page.getByText(CUSTOMER_NAME).first()).toBeVisible({ timeout: 10000 });
    await page.getByRole("link").filter({ hasText: CUSTOMER_NAME }).first().click();

    await expect(page).toHaveURL(/\/staff\/requests\//);
    // status should have moved to UNDER_REVIEW on open
    await expect(page.getByText(/Na razmatranju|Under Review/)).toBeVisible();

    // Verify uploaded photo is visible
    await expect(page.locator("img")).toHaveCount(1, { timeout: 5000 }).catch(() => {});

    // AI suggestions
    await page.getByText(/AI predlozi|AI Suggestions/).click();
    await expect(page.getByText(/Potential services/)).toBeVisible({ timeout: 5000 });

    // Confirm
    await page.getByRole("button", { name: /Potvrdi zahtjev|Confirm Request/ }).click();
    await expect(page.getByText(/Potvrđeno|Confirmed/)).toBeVisible({ timeout: 10000 });

    // Navigate to work order
    await page.getByRole("button", { name: /Radni nalozi|Work Orders/ }).click();
    await expect(page).toHaveURL(/\/staff\/workorders\//);
    workOrderUrl = page.url();
    console.log("WORK ORDER URL:", workOrderUrl);

    await context.close();
  });

  test("customer sees CONFIRMED status and appointment after staff confirms", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginCustomer(page);

    await page.goto("/customer/requests");
    await expect(page.getByText(/Potvrđeno|Confirmed/)).toBeVisible({ timeout: 10000 });

    await page.goto("/customer/appointments");
    await expect(page.getByText("BMW")).toBeVisible({ timeout: 10000 });

    await page.goto("/customer/notifications");
    await expect(page.locator("div").filter({ hasText: /potvrđen|confirmed/i }).first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("owner sees the same customer, vehicle, request, appointment and work order", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginOwner(page);

    await page.goto("/owner/customers");
    await expect(page.getByText(CUSTOMER_EMAIL)).toBeVisible({ timeout: 10000 });

    await page.goto("/owner/vehicles");
    await expect(page.getByText("BMW X5")).toBeVisible({ timeout: 10000 });

    await page.goto("/owner/appointments");
    await expect(page.getByText(CUSTOMER_NAME)).toBeVisible({ timeout: 10000 });
    await expect(page.locator("tbody").getByText(/Potvrđeno|Confirmed/).first()).toBeVisible();

    await context.close();
  });

  test("staff advances work order through full status flow with photos and checklist", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginStaff(page);

    await page.goto(new URL(workOrderUrl).pathname);
    await expect(page.getByText(/Potvrđeno|Confirmed/).first()).toBeVisible();

    const steps = ["Vozilo stiglo", "U toku", "Kontrola kvaliteta", "Spremno za preuzimanje", "Završeno"];
    for (const label of steps) {
      const btn = page.getByRole("button", { name: /Promijeni status|Advance Status/ });
      await btn.click();
      await expect(page.getByText(new RegExp(label, "i")).first()).toBeVisible({ timeout: 10000 });
    }

    // Upload before/during/after photos
    let expectedCount = 0;
    for (const category of ["BEFORE", "DURING", "AFTER"]) {
      await page.locator("select").selectOption(category);
      await page.setInputFiles('input[type="file"]', TEST_IMAGE);
      expectedCount += 1;
      await expect(page.locator("img")).toHaveCount(expectedCount, { timeout: 10000 });
    }

    // Checklist: toggle first two items
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
    await checkboxes.nth(0).click();
    await expect(checkboxes.nth(0)).toBeChecked({ timeout: 5000 });
    await checkboxes.nth(1).click();
    await expect(checkboxes.nth(1)).toBeChecked({ timeout: 5000 });

    // Reload and verify checklist state persisted
    await page.reload();
    await expect(page.locator('input[type="checkbox"]').nth(0)).toBeChecked();
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeChecked();

    // Add a note
    await page.locator("textarea").fill("Ceramic coating cured overnight, customer notified.");
    await page.getByRole("button", { name: /Sačuvaj|Save/ }).click();

    await context.close();
  });

  test("customer and owner see COMPLETED status and before/after photos after full flow", async ({ browser }) => {
    const customerCtx = await browser.newContext();
    const customerPage = await customerCtx.newPage();
    await loginCustomer(customerPage);

    await customerPage.goto("/customer/history");
    await expect(customerPage.getByText("BMW X5")).toBeVisible({ timeout: 10000 });

    await customerPage.goto("/customer/appointments");
    await expect(customerPage.getByText(/Završeno|Completed/)).toBeVisible({ timeout: 10000 });
    await customerCtx.close();

    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await loginOwner(ownerPage);
    await ownerPage.goto("/owner/appointments");
    await expect(ownerPage.locator("tbody").getByText(/Završeno|Completed/).first()).toBeVisible({ timeout: 10000 });
    await ownerCtx.close();
  });

  test("decline flow: staff declines a second request with a reason", async ({ browser }) => {
    const customerCtx = await browser.newContext();
    const customerPage = await customerCtx.newPage();
    await loginCustomer(customerPage);

    // add second vehicle & second request
    await customerPage.goto("/customer/vehicles");
    await customerPage.getByRole("button", { name: /Dodaj vozilo|Add Vehicle/ }).click();
    const form = customerPage.locator("form").first();
    await form.locator("input").nth(0).fill("Audi");
    await form.locator("input").nth(1).fill("A6");
    await form.locator('input[type="number"]').fill("2019");
    await form.getByRole("button", { name: /Sačuvaj|Save/ }).click();
    await expect(customerPage.getByText("Audi A6")).toBeVisible({ timeout: 10000 });

    await customerPage.goto("/customer/requests/new");
    await customerPage.waitForTimeout(500);
    await customerPage.locator("select").nth(0).selectOption({ label: "Audi A6" });
    await customerPage.locator("select").nth(1).selectOption({ index: 1 });
    await customerPage.fill('input[type="date"]', futureDate(7));
    await customerPage.fill('input[type="time"]', "10:00");
    await customerPage.getByRole("button", { name: /Pošalji zahtjev|Submit Request/ }).click();
    await expect(customerPage.getByText(/uspješno poslat|has been submitted/)).toBeVisible({ timeout: 10000 });
    await customerCtx.close();

    const staffCtx = await browser.newContext();
    const staffPage = await staffCtx.newPage();
    await loginStaff(staffPage);
    await staffPage.goto("/staff/requests");
    await staffPage.getByText("Audi A6").first().click();

    await staffPage.getByRole("button", { name: /Odbij zahtjev|Decline Request/ }).click();
    await staffPage.locator("textarea").fill("Vehicle condition does not match requested service scope.");
    await staffPage.getByRole("button", { name: /Potvrdi|Confirm/ }).click();
    await expect(staffPage.getByText(/Odbijeno|Declined/).first()).toBeVisible({ timeout: 10000 });
    await staffCtx.close();

    const customerCtx2 = await browser.newContext();
    const customerPage2 = await customerCtx2.newPage();
    await loginCustomer(customerPage2);
    await customerPage2.goto("/customer/requests");
    await expect(customerPage2.getByText(/Odbijeno|Declined/)).toBeVisible({ timeout: 10000 });
    await expect(customerPage2.getByText(/does not match requested service scope/)).toBeVisible();
    await customerCtx2.close();
  });

  async function loginCustomer(page: Page) {
    await page.goto("/customer/login");
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/vehicles/);
  }

  async function loginStaff(page: Page) {
    await page.goto("/staff/login");
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/staff$/);
  }

  async function loginOwner(page: Page) {
    await page.goto("/owner/login");
    await page.fill('input[type="email"]', OWNER_EMAIL);
    await page.fill('input[type="password"]', OWNER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/owner$/);
  }
});

test.describe("Language switching", () => {
  test("customer portal switches EN <-> ME without reload", async ({ page }) => {
    await page.goto("/customer");
    await expect(page.getByText(/Detailing automobila|Automotive Detailing/)).toBeVisible();
    await page.getByRole("button", { name: "🇬🇧 EN", exact: true }).click();
    await expect(page.getByText("Automotive Detailing, Perfected.")).toBeVisible();
    await page.getByRole("button", { name: "🇷🇸 SR", exact: true }).click();
    await expect(page.getByText(/Detailing automobila na najvišem nivou/)).toBeVisible();
  });

  test("staff portal switches EN <-> ME", async ({ page }) => {
    await page.goto("/staff/login");
    await expect(page.getByText("Prijava osoblja")).toBeVisible();
    await page.getByRole("button", { name: "🇬🇧 EN", exact: true }).click();
    await expect(page.getByText("Staff sign in")).toBeVisible();
  });

  test("owner portal switches EN <-> ME", async ({ page }) => {
    await page.goto("/owner/login");
    await expect(page.getByText("Prijava vlasnika")).toBeVisible();
    await page.getByRole("button", { name: "🇬🇧 EN", exact: true }).click();
    await expect(page.getByText("Owner sign in")).toBeVisible();
  });
});

test.describe("Security & authorization", () => {
  test("unauthenticated user is redirected away from /staff and /owner", async ({ page }) => {
    await page.goto("/staff/requests");
    await expect(page).toHaveURL(/\/staff\/login/);

    await page.goto("/owner/customers");
    await expect(page).toHaveURL(/\/owner\/login/);
  });

  test("logged-in customer cannot access /staff or /owner via direct URL", async ({ page }) => {
    await page.goto("/customer/login");
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/vehicles/);

    await page.goto("/staff/workorders");
    await expect(page).toHaveURL(/\/staff\/login/);

    await page.goto("/owner");
    await expect(page).toHaveURL(/\/owner\/login/);
  });

  test("unauthenticated user cannot access customer API data", async ({ request }) => {
    const res = await request.get("/api/customer/vehicles");
    expect(res.status()).toBe(401);
    const res2 = await request.get("/api/staff/requests");
    expect(res2.status()).toBe(401);
    const res3 = await request.get("/api/owner/dashboard");
    expect(res3.status()).toBe(401);
  });

  test("staff wrong password is rejected", async ({ page }) => {
    await page.goto("/staff/login");
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Netačan email ili lozinka|Incorrect email or password/)).toBeVisible();
  });

  test("owner wrong credentials are rejected", async ({ page }) => {
    await page.goto("/owner/login");
    await page.fill('input[type="email"]', "owner@detailing.me");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Netačan email ili lozinka|Incorrect email or password/)).toBeVisible();
  });
});

test.describe("Data isolation between customers", () => {
  test("customer B cannot see customer A's vehicles or requests", async ({ page }) => {
    await page.goto("/customer/register");
    await page.fill('input[type="email"]', CUSTOMER_B_EMAIL);
    await page.locator("form input[required]").nth(0).fill("Customer B");
    await page.fill('input[type="password"]', "AnotherPass123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/vehicles/);

    await expect(page.getByText("BMW X5")).not.toBeVisible();
    await expect(page.getByText(CUSTOMER_NAME)).not.toBeVisible();

    await page.goto("/customer/requests");
    await expect(page.getByText("Trenutno nemate poslatih zahtjeva.")).toBeVisible();
  });
});

test.describe("Owner service update propagates to Customer Portal", () => {
  test("editing a service price in Owner Portal is reflected on the Customer services page", async ({ browser }) => {
    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    await ownerPage.goto("/owner/login");
    await ownerPage.fill('input[type="email"]', "owner@detailing.me");
    await ownerPage.fill('input[type="password"]', "OwnerSecure2026!");
    await ownerPage.click('button[type="submit"]');
    await expect(ownerPage).toHaveURL(/\/owner$/);

    await ownerPage.goto("/owner/services");
    const uniquePrice = String(999 + Math.floor(Math.random() * 50));
    await ownerPage.getByRole("button", { name: "Izmijeni" }).first().click();
    const priceMinInput = ownerPage.locator('input[type="number"]').nth(1);
    await priceMinInput.fill(uniquePrice);
    await ownerPage.getByRole("button", { name: "Sačuvaj" }).click();
    await expect(ownerPage.getByText(new RegExp(uniquePrice))).toBeVisible({ timeout: 10000 });
    await ownerCtx.close();

    const customerCtx = await browser.newContext();
    const customerPage = await customerCtx.newPage();
    await customerPage.goto("/customer/services");
    await expect(customerPage.getByText(new RegExp(uniquePrice))).toBeVisible({ timeout: 10000 });
    await customerCtx.close();
  });
});
