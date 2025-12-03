// src/components/objects/index.js
import BoxObj from "./BoxObj";
import SphereObj from "./SphereObj";
import LineObj from "./LineObj";

export const objectComponentMap = {
  box: BoxObj,
  sphere: SphereObj,
  line: LineObj,
};

export function getObjectComponent(type) {
  return objectComponentMap[type] || null;
}
