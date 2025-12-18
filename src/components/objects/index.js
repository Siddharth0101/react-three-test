// src/components/objects/index.js
import BoxObj from "./BoxObj";
import SphereObj from "./SphereObj";
import ExtrudedShapeObj from "./ExtrudedShapeObj";

export const objectComponentMap = {
  box: BoxObj,
  sphere: SphereObj,
  extruded: ExtrudedShapeObj,
};

export function getObjectComponent(type) {
  return objectComponentMap[type] || null;
}
