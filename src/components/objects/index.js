// src/components/objects/index.js
import BoxObj from "./BoxObj";
import SphereObj from "./SphereObj";
import ExtrudedShapeObj from "./ExtrudedShapeObj";
import WallObj from "./WallObj";
import DoorObj from "./DoorObj";
import WindowObj from "./WindowObj";
import FurnitureObj from "./FurnitureObj";
import TextObj from "./TextObj";

export const objectComponentMap = {
  box: BoxObj,
  sphere: SphereObj,
  extruded: ExtrudedShapeObj,
  wall: WallObj,
  door: DoorObj,
  window: WindowObj,
  furniture: FurnitureObj,
  text: TextObj,
};

export function getObjectComponent(type) {
  return objectComponentMap[type] || null;
}
