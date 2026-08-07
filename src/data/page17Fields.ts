import type {
  Page17BuildingTypeKey,
  Page17BuildingTypeState,
  Page17PartyDetails,
  Page17PartyFieldKey,
  Page17PartyOverrides
} from "../types";

export const page17PartyFields: Array<{
  key: Page17PartyFieldKey;
  label: string;
  maxLength: number;
}> = [
  { key: "name", label: "ชื่อ", maxLength: 80 },
  { key: "house_number", label: "บ้านเลขที่", maxLength: 30 },
  { key: "moo", label: "หมู่", maxLength: 20 },
  { key: "road", label: "ถนน", maxLength: 80 },
  { key: "subdistrict", label: "ตำบล / แขวง", maxLength: 60 },
  { key: "district", label: "อำเภอ / เขต", maxLength: 60 },
  { key: "province", label: "จังหวัด", maxLength: 60 },
  { key: "postal_code", label: "รหัสไปรษณีย์", maxLength: 10 }
];

export const page17BuildingTypeOptions: Array<{
  key: Page17BuildingTypeKey;
  label: string;
  mcid: number;
  defaultChecked: boolean;
}> = [
  { key: "high_rise", label: "อาคารสูง", mcid: 83, defaultChecked: false },
  { key: "extra_large", label: "อาคารขนาดใหญ่พิเศษ", mcid: 87, defaultChecked: false },
  { key: "assembly", label: "อาคารชุมนุมคน", mcid: 90, defaultChecked: false },
  { key: "theater", label: "โรงมหรสพตามกฎหมายว่าด้วยการควบคุมอาคาร", mcid: 92, defaultChecked: false },
  {
    key: "hotel_80_rooms",
    label: "โรงแรมตามกฎหมายว่าด้วยโรงแรม ที่มีจำนวนห้องพักตั้งแต่ 80 ห้องขึ้นไป",
    mcid: 94,
    defaultChecked: false
  },
  {
    key: "entertainment_venue_200_sqm",
    label: "สถานบริการตามกฎหมายว่าด้วยสถานบริการ ที่มีพื้นที่ตั้งแต่ 200 ตารางเมตรขึ้นไป",
    mcid: 98,
    defaultChecked: false
  },
  {
    key: "residential_2000_sqm",
    label: "อาคารชุดหรืออาคารอยู่อาศัยรวม ที่มีพื้นที่ตั้งแต่ 2,000 ตารางเมตรขึ้นไป",
    mcid: 102,
    defaultChecked: false
  },
  {
    key: "factory_5000_sqm",
    label: "โรงงานสูงมากกว่า 1 ชั้นและมีพื้นที่ใช้สอยตั้งแต่ 5,000 ตารางเมตรขึ้นไป",
    mcid: 107,
    defaultChecked: false
  },
  { key: "other", label: "อื่น ๆ (ระบุ)", mcid: 117, defaultChecked: true }
];

export const defaultPage17BuildingTypes = Object.fromEntries(
  page17BuildingTypeOptions.map((option) => [option.key, option.defaultChecked])
) as Page17BuildingTypeState;

function extractAddressPart(address: string, pattern: RegExp) {
  return pattern.exec(address)?.[1]?.trim() ?? "";
}

export function getPage17CoverDefaults(fieldValues: Record<string, string>): Page17PartyDetails {
  const address = fieldValues.building_address ?? "";
  return {
    name: fieldValues.owner_company?.trim() ?? "",
    house_number: extractAddressPart(address, /(?:ตั้งอยู่)?เลขที่\s*([^\s]+)/),
    moo: extractAddressPart(address, /หมู่(?:ที่)?\s*([^\s]+)/),
    road: extractAddressPart(address, /ถนน\s*(.*?)(?=\s*ตำบล\/แขวง|\s*แขวง|\s*ตำบล|$)/),
    subdistrict: extractAddressPart(address, /(?:ตำบล\/แขวง|ตำบล|แขวง)\s*([^\s]+)/),
    district: extractAddressPart(address, /(?:อำเภอ\/เขต|อำเภอ|เขต)\s*([^\s]+)/),
    province: extractAddressPart(address, /จังหวัด\s*([^\s]+)/),
    postal_code: extractAddressPart(address, /รหัสไปรษณีย์\s*(\d{5})/)
  };
}

export function resolvePage17Party(
  fieldValues: Record<string, string>,
  overrides: Page17PartyOverrides
): Page17PartyDetails {
  const defaults = getPage17CoverDefaults(fieldValues);
  return Object.fromEntries(
    page17PartyFields.map((field) => [field.key, overrides[field.key] ?? defaults[field.key]])
  ) as Page17PartyDetails;
}
