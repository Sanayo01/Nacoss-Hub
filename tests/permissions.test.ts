import assert from "node:assert/strict";
import test from "node:test";
import { can } from "@/config/permissions";
import { EXECUTIVES_LIST } from "@/config/executives";

test("capabilities are granted by office and denied otherwise", () => {
  assert.equal(can("president", "audit.view"), true);
  assert.equal(can("vice-president", "audit.view"), true);
  assert.equal(can("general-secretary", "audit.view"), true);
  assert.equal(can("assistant-general-secretary", "audit.view"), false);
  assert.equal(can("assistant-general-secretary", "approvals.decide"), false);
  assert.equal(can("not-an-office", "office.access"), false);
  assert.equal(can(null, "office.access"), false);
});

test("four power-office capabilities are restricted by office", () => {
  assert.equal(can("president", "president.manage"), true);
  assert.equal(can("vice-president", "president.manage"), false);
  assert.equal(can("vice-president", "vp.coordinate"), true);
  assert.equal(can("general-secretary", "gensec.minutes.approve"), true);
  assert.equal(can("assistant-general-secretary", "gensec.minutes.approve"), false);
  assert.equal(can("assistant-general-secretary", "ags.minutes.draft"), true);
  for (const { officeSlug } of EXECUTIVES_LIST) {
    assert.equal(can(officeSlug, "motions.vote"), true);
  }
  assert.equal(can("president", "gensec.documents.manage"), false);
  assert.equal(can("general-secretary", "president.delegate"), false);
});

test("PRO, Software Director, Social Secretary, and Treasurer capabilities are office-scoped", () => {
  assert.equal(can("pro", "pro.studio"), true);
  assert.equal(can("president", "pro.studio"), false);
  assert.equal(can("pro", "pro.assets"), true);
  assert.equal(can("software-director", "software.board"), true);
  assert.equal(can("pro", "software.board"), false);
  assert.equal(can("software-director", "software.technical-change"), true);
  assert.equal(can("social-secretary", "social.events"), true);
  assert.equal(can("social-secretary", "social.volunteers"), true);
  assert.equal(can("social-secretary", "software.board"), false);
  assert.equal(can("treasurer", "budget.approve"), true);
  assert.equal(can("social-secretary", "budget.approve"), false);
});

test("remaining-office and confidential-case capabilities are scoped to the expected offices", () => {
  for (const { officeSlug } of EXECUTIVES_LIST) {
    assert.equal(can(officeSlug, "welfare.cases.view"), officeSlug === "president" || officeSlug === "welfare-secretary");
    assert.equal(can(officeSlug, "welfare.cases.manage"), officeSlug === "president" || officeSlug === "welfare-secretary");
    assert.equal(can(officeSlug, "finance.dues.manage"), officeSlug === "financial-secretary");
    assert.equal(can(officeSlug, "finance.queries.view"), officeSlug === "financial-secretary");
    assert.equal(can(officeSlug, "treasury.ledger.manage"), officeSlug === "treasurer");
    assert.equal(can(officeSlug, "sports.manage"), officeSlug === "sports-secretary");
    assert.equal(can(officeSlug, "pro.reminders.view"), officeSlug === "pro");
    assert.equal(can(officeSlug, "serious.submit"), true);
  }
  for (const office of ["general-secretary", "vice-president", "assistant-general-secretary", "financial-secretary", "treasurer", "sports-secretary", "social-secretary", "software-director", "pro"] as const) {
    assert.equal(can(office, "welfare.cases.view"), false);
  }
});
