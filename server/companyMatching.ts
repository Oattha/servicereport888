export function normalizeCompanyName(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("th-TH")
    .replace(/บริษัท\s*จำกัด\s*\(\s*มหาชน\s*\)/g, "")
    .replace(/บริษัท\s*มหาชน\s*จำกัด/g, "")
    .replace(/บริษัท\s*จำกัด/g, "")
    .replace(/ห้างหุ้นส่วน\s*จำกัด/g, "")
    .replace(/บริษัท|บจก\.?|บมจ\.?|จำกัด|มหาชน/g, "")
    .replace(/\b(?:public\s+company\s+limited|company\s+limited|co\.?\s*,?\s*ltd\.?|limited|ltd\.?|plc\.?)\b/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "");
}

function bigrams(value: string) {
  if (value.length < 2) return new Set([value]);
  const result = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    result.add(value.slice(index, index + 2));
  }
  return result;
}

export function companyNameSimilarity(left: string, right: string) {
  const normalizedLeft = normalizeCompanyName(left);
  const normalizedRight = normalizeCompanyName(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;

  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
    const lengthRatio = Math.min(normalizedLeft.length, normalizedRight.length)
      / Math.max(normalizedLeft.length, normalizedRight.length);
    return 0.78 + (lengthRatio * 0.17);
  }

  const leftPairs = bigrams(normalizedLeft);
  const rightPairs = bigrams(normalizedRight);
  let overlap = 0;
  leftPairs.forEach((pair) => {
    if (rightPairs.has(pair)) overlap += 1;
  });
  return (2 * overlap) / (leftPairs.size + rightPairs.size);
}

export function normalizeBuildingName(value: string) {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("th-TH")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "");
}
