export default function BoxObj({ transform, material, props }) {
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
    width = 1,
    height = 1,
    depth = 1,
  } = props || {};

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} {...materialRest} />
    </mesh>
  );
}
