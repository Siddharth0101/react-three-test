export default function SphereObj({ transform, material, props }) {
  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = transform || {};

  const {
    color = "#ffffff",
    ...materialRest
  } = material || {};

  const {
    radius = 0.5,
    widthSegments = 32,
    heightSegments = 32,
  } = props || {};

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshStandardMaterial color={color} {...materialRest} />
    </mesh>
  );
}
