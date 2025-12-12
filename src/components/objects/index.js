// src/components/objects/index.js
import BoxObj from "./BoxObj";
import SphereObj from "./SphereObj";
import LineObj from "./LineObj";
import ExtrudedShapeObj from "./ExtrudedShapeObj";

export const objectComponentMap = {
  box: BoxObj,
  sphere: SphereObj,
  line: LineObj,
  extruded: ExtrudedShapeObj,
};

export function getObjectComponent(type) {
  return objectComponentMap[type] || null;
}
