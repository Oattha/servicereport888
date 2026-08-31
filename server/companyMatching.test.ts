import assert from "node:assert/strict";
import test from "node:test";
import { companyNameSimilarity, normalizeBuildingName, normalizeCompanyName } from "./companyMatching";

test("normalizes common Thai company prefixes, suffixes, punctuation and spacing", () => {
  const variants = [
    "บริษัท บางชันเยนเนอรัลเซอร์วิสเมนส์ จำกัด",
    "บจก.บางชันเยนเนอรัลเซอร์วิสเมนส์",
    "บางชัน เยนเนอรัล เซอร์วิสเมนส์ จำกัด"
  ];
  assert.deepEqual(new Set(variants.map(normalizeCompanyName)).size, 1);
});

test("normalization is case-insensitive for English company names", () => {
  assert.equal(normalizeCompanyName("ACME Co., Ltd."), normalizeCompanyName("acme company limited"));
});

test("similar company names receive a high score while unrelated names do not", () => {
  assert.equal(companyNameSimilarity("บริษัท เอซีเอ็มอี จำกัด", "บจก. เอซีเอ็มอี"), 1);
  assert.ok(companyNameSimilarity("บริษัท ทดสอบ เซอร์วิส จำกัด", "ทดสอบเซอร์วิส") > 0.9);
  assert.ok(companyNameSimilarity("บริษัท ทดสอบ จำกัด", "บริษัท คนละแห่ง จำกัด") < 0.5);
});

test("building names ignore spacing and punctuation", () => {
  assert.equal(normalizeBuildingName("อาคาร WS-1"), normalizeBuildingName("อาคาร ws 1"));
});
