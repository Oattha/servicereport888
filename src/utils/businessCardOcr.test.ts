import assert from "node:assert/strict";
import test from "node:test";
import { extractBusinessCardFields } from "./businessCardOcr";

test("extracts Thai company name and multi-line Thai address", () => {
  const result = extractBusinessCardFields(`
    บริษัท ตัวอย่าง เซอร์วิส จำกัด
    นายทดสอบ งานดี
    ที่อยู่ 99/9 หมู่ 5 ถนนบางนา-ตราด
    แขวงบางนา เขตบางนา กรุงเทพฯ 10260
    โทร. 02-000-0000
  `);
  assert.equal(result.companyName, "บริษัท ตัวอย่าง เซอร์วิส จำกัด");
  assert.equal(result.companyAddress, "99/9 หมู่ 5 ถนนบางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260");
});

test("extracts English company name and address without contact details", () => {
  const result = extractBusinessCardFields(`
    KFC SERVICES CO., LTD.
    John Example
    Address: 123 Test Road, Bangna District
    Bangkok 10260 Thailand
    Tel: 02 000 0000
    email@example.com
  `);
  assert.equal(result.companyName, "KFC SERVICES CO., LTD.");
  assert.equal(result.companyAddress, "123 Test Road, Bangna District Bangkok 10260 Thailand");
});

test("returns empty address when the card has no address-like line", () => {
  const result = extractBusinessCardFields("ACME COMPANY LIMITED\nJane Doe\nTel: 080-000-0000");
  assert.equal(result.companyName, "ACME COMPANY LIMITED");
  assert.equal(result.companyAddress, "");
});
