// components/objects/SphereObj.jsx
import { useSelector } from "react-redux";
import * as THREE from "three";

export default function SphereObj({ transform, props }) {
  const mode = useSelector((state) => state.viewMode.mode);

  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = transform || {};

  const {
    radius = 0.5,
    widthSegments = 32,
    heightSegments = 32,
  } = props || {};

  if (mode === "2d") {
    // circle border: ring (stroke)
    return (
      <mesh position={position} rotation={rotation} scale={scale}>
        {/* inner radius slightly smaller so it looks like just a thin ring */}
        <ringGeometry args={[radius * 0.9, radius, 64]} />
        <meshBasicMaterial
          color="#000000"
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  // 3D: solid white sphere
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}