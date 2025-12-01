// components/objects/BoxObj.jsx
import { useSelector } from "react-redux";
import * as THREE from "three";

export default function BoxObj({ transform, props }) {
  const mode = useSelector((state) => state.viewMode.mode);

  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1]
  } = transform || {};

  const {
    width = 1,
    height = 1,
    depth = 1
  } = props || {};

  // BOX 2D MODE – PERFECT SQUARE BORDER
if (mode === "2d") {
  const halfW = width / 2;
  const halfH = height / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-halfW, -halfH);
  shape.lineTo(halfW, -halfH);
  shape.lineTo(halfW, halfH);
  shape.lineTo(-halfW, halfH);
  shape.lineTo(-halfW, -halfH);

  const geometry = new THREE.ShapeGeometry(shape);

  return (
    <group position={position} scale={scale}>
      <line>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial color="#000000" linewidth={2} />
      </line>
    </group>
  );
}

  // 3D mode
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}