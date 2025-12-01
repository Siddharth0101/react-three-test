import BoxObj from "./BoxObj";
import SphereObj from "./SphereObj";

export const objectComponentMap = {
  box: BoxObj,
  sphere: SphereObj,
};

export function getObjectComponent(type) {
  return objectComponentMap[type] || null;
}
