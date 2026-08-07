import type {
  Page18CheckboxKey,
  Page18CheckboxState,
  Page18MaterialDetails,
  Page18MaterialKey,
  Page18TextState
} from "../types";

export const page18CheckboxGroups: Array<{
  key: "building_info" | "building_use" | "materials";
  label: string;
  options: Array<{
    key: Page18CheckboxKey;
    label: string;
    mcid: number;
    defaultChecked: boolean;
  }>;
}> = [
  {
    key: "building_info",
    label: "3.3 ข้อมูลอาคาร",
    options: [
      { key: "has_above_ground_floors", label: "จำนวนชั้นของอาคารเหนือพื้นดิน", mcid: 24, defaultChecked: true },
      { key: "has_basement_floors", label: "จำนวนชั้นใต้ดิน", mcid: 32, defaultChecked: false },
      { key: "has_access_road", label: "ถนนเข้าสู่อาคารกว้าง", mcid: 40, defaultChecked: true },
      { key: "has_other_building_info", label: "อื่น ๆ (ระบุ)", mcid: 48, defaultChecked: false }
    ]
  },
  {
    key: "building_use",
    label: "4. ลักษณะการใช้งานหรือการประกอบกิจกรรมของอาคาร",
    options: [
      { key: "uses_permitted_purpose", label: "ตามที่ได้รับอนุญาตให้ใช้เป็น", mcid: 66, defaultChecked: true },
      { key: "uses_current_purpose", label: "การใช้งานปัจจุบันใช้เป็น", mcid: 76, defaultChecked: true }
    ]
  },
  {
    key: "materials",
    label: "5. การเก็บรักษาวัตถุหรือเชื้อเพลิงที่อาจเป็นอันตราย",
    options: [
      { key: "stores_flammable_material", label: "วัตถุติดไฟ", mcid: 110, defaultChecked: false },
      { key: "stores_hazardous_material", label: "วัตถุอันตราย", mcid: 130, defaultChecked: false },
      { key: "stores_combustible_material", label: "วัตถุเชื้อเพลิง", mcid: 152, defaultChecked: false },
      { key: "stores_fuel_oil", label: "น้ำมันเชื้อเพลิง", mcid: 170, defaultChecked: false },
      { key: "stores_gas", label: "ก๊าซ", mcid: 188, defaultChecked: false },
      { key: "stores_chemical", label: "สารเคมี", mcid: 202, defaultChecked: false },
      { key: "stores_other_material", label: "อื่น ๆ (ระบุ)", mcid: 222, defaultChecked: false }
    ]
  }
];

export const page18CheckboxOptions = page18CheckboxGroups.flatMap((group) => group.options);

export const defaultPage18Checks = Object.fromEntries(
  page18CheckboxOptions.map((option) => [option.key, option.defaultChecked])
) as Page18CheckboxState;

export const defaultPage18Text: Page18TextState = {
  structureDescription: "อาคารคอนกรีตเสริมเหล็กสูง 2 ชั้น",
  aboveGroundFloors: "2",
  basementFloors: "-",
  accessRoadWidth: "6",
  otherBuildingInfo: "",
  permittedUse: "อาคารโรงงานและสำนักงาน",
  currentUse: "อาคารโรงงานและสำนักงาน",
  otherMaterial: ""
};

export const page18MaterialRows: Array<{
  key: Page18MaterialKey;
  checkboxKey: Page18CheckboxKey;
  label: string;
}> = [
  { key: "flammable", checkboxKey: "stores_flammable_material", label: "วัตถุติดไฟ" },
  { key: "hazardous", checkboxKey: "stores_hazardous_material", label: "วัตถุอันตราย" },
  { key: "combustible", checkboxKey: "stores_combustible_material", label: "วัตถุเชื้อเพลิง" },
  { key: "fuel_oil", checkboxKey: "stores_fuel_oil", label: "น้ำมันเชื้อเพลิง" },
  { key: "gas", checkboxKey: "stores_gas", label: "ก๊าซ" },
  { key: "chemical", checkboxKey: "stores_chemical", label: "สารเคมี" }
];

export const defaultPage18Materials = Object.fromEntries(
  page18MaterialRows.map((row) => [row.key, { type: "", quantity: "", storage: "" }])
) as Page18MaterialDetails;
