// src/components/objects/WindowObj.jsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function WindowObj({
  wallId,
  position,
  width: widthProp = 1.0,
  height: heightProp = 1.2,
  sillHeight: sillHeightProp = 0.9,
  props, // AI-generated format
}) {
  const mode = useSelector((s) => s.viewMode.mode);
  const walls = useSelector((s) =>
    s.scene.objects.filter((o) => o.type === "wall")
  );

  // Handle both formats
  const width = props?.width || widthProp;
  const height = props?.height || heightProp;
  const sillHeight = props?.sillHeight || sillHeightProp;

  // Find the wall this window belongs to
  const wall = walls.find((w) => w.id === (props?.wallId || wallId));

  const windowGeometry = useMemo(() => {
    // If we have direct coordinates from AI, use them
    if (props?.x !== undefined && props?.y !== undefined) {
      const angle = props.angle || 0;
      return {
        x: props.x,
        y: props.y,
        angle,
        wallLength: 1,
        wallThickness: 0.15,
        wallHeight: 3,
      };
    }

    // Otherwise, calculate from wall
    if (!wall) return null;

    // Get wall coordinates (handle both formats)
    const x1 = wall.props?.x1 ?? wall.start?.[0] ?? 0;
    const y1 = wall.props?.y1 ?? wall.start?.[1] ?? 0;
    const x2 = wall.props?.x2 ?? wall.end?.[0] ?? 0;
    const y2 = wall.props?.y2 ?? wall.end?.[1] ?? 0;

    // Wall direction
    const dx = x2 - x1;
    const dy = y2 - y1;
    const wallLength = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Window center position along wall (0-1)
    const winX = x1 + dx * position;
    const winY = y1 + dy * position;

    return {
      x: winX,
      y: winY,
      angle,
      wallLength,
      wallThickness: wall.props?.thickness || wall.thickness || 0.15,
      wallHeight: wall.props?.height || wall.height || 3,
    };
  }, [wall, position, props]);

  if (!windowGeometry) return null;

  const { x, y, angle, wallThickness, wallHeight } = windowGeometry;
  const halfWidth = width / 2;

  // 2D mode - show window symbol
  if (mode === "2d") {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;
    const offset = wallThickness * 0.5;

    return (
      <group>
        {/* Window opening (gap in wall) */}
        <mesh position={[x, y, 0.02]} rotation={[0, 0, angle]}>
          <planeGeometry args={[width + 0.02, wallThickness * 3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Window frame outline */}
        <Line
          points={[
            [x - cos * halfWidth - nx * offset, y - sin * halfWidth - ny * offset, 0.1],
            [x + cos * halfWidth - nx * offset, y + sin * halfWidth - ny * offset, 0.1],
            [x + cos * halfWidth + nx * offset, y + sin * halfWidth + ny * offset, 0.1],
            [x - cos * halfWidth + nx * offset, y - sin * halfWidth + ny * offset, 0.1],
            [x - cos * halfWidth - nx * offset, y - sin * halfWidth - ny * offset, 0.1],
          ]}
          color="#4a90d9"
          lineWidth={2}
          worldUnits={false}
        />

        {/* Glass fill */}
        <mesh position={[x, y, 0.08]} rotation={[0, 0, angle]}>
          <planeGeometry args={[width - 0.04, wallThickness * 0.9]} />
          <meshBasicMaterial color="#b8d4ed" transparent opacity={0.5} />
        </mesh>

        {/* Center vertical mullion */}
        <Line
          points={[
            [x - nx * offset, y - ny * offset, 0.12],
            [x + nx * offset, y + ny * offset, 0.12],
          ]}
          color="#4a90d9"
          lineWidth={1.5}
          worldUnits={false}
        />

        {/* Center horizontal mullion */}
        <Line
          points={[
            [x - cos * halfWidth, y - sin * halfWidth, 0.12],
            [x + cos * halfWidth, y + sin * halfWidth, 0.12],
          ]}
          color="#4a90d9"
          lineWidth={1.5}
          worldUnits={false}
        />
      </group>
    );
  }

  // 3D mode - detailed window with frame and glass
  const frameDepth = wallThickness + 0.05;
  const frameThickness = 0.05;
  const actualHeight = Math.min(height, wallHeight - sillHeight);
  const centerY = sillHeight + actualHeight / 2;
  const glassThickness = 0.008;
  const mullionSize = 0.025;

  return (
    <group position={[x, 0, y]} rotation={[0, -angle, 0]}>
      {/* Outer frame - top */}
      <mesh position={[0, sillHeight + actualHeight + frameThickness / 2, 0]}>
        <boxGeometry
          args={[width + frameThickness * 2, frameThickness, frameDepth]}
        />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>

      {/* Outer frame - bottom (sill) */}
      <mesh position={[0, sillHeight - frameThickness / 2, frameDepth / 4]}>
        <boxGeometry
          args={[width + frameThickness * 2.5, frameThickness, frameDepth * 1.3]}
        />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>

      {/* Outer frame - left */}
      <mesh position={[-halfWidth - frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, actualHeight, frameDepth]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>

      {/* Outer frame - right */}
      <mesh position={[halfWidth + frameThickness / 2, centerY, 0]}>
        <boxGeometry args={[frameThickness, actualHeight, frameDepth]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>

      {/* Inner frame - creates depth effect */}
      <mesh position={[0, centerY, 0]}>
        <boxGeometry
          args={[width - 0.02, actualHeight - 0.02, frameDepth - 0.02]}
        />
        <meshStandardMaterial color="#d0d0d0" roughness={0.5} />
      </mesh>

      {/* Glass pane - outer */}
      <mesh position={[0, centerY, frameDepth / 2 - 0.01]}>
        <planeGeometry args={[width - 0.04, actualHeight - 0.04]} />
        <meshStandardMaterial
          color="#a8d4f0"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Glass pane - inner (double glazing effect) */}
      <mesh position={[0, centerY, -frameDepth / 2 + 0.01]}>
        <planeGeometry args={[width - 0.04, actualHeight - 0.04]} />
        <meshStandardMaterial
          color="#a8d4f0"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Vertical mullion (center divider) */}
      <mesh position={[0, centerY, 0]}>
        <boxGeometry args={[mullionSize, actualHeight - 0.02, frameDepth - 0.01]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
      </mesh>

      {/* Horizontal mullion (center divider) */}
      <mesh position={[0, centerY, 0]}>
        <boxGeometry args={[width - 0.02, mullionSize, frameDepth - 0.01]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
      </mesh>

      {/* Window latch/handle */}
      <mesh position={[0, centerY - actualHeight * 0.2, frameDepth / 2 + 0.015]}>
        <boxGeometry args={[0.08, 0.025, 0.025]} />
        <meshStandardMaterial
          color="#808080"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Decorative inner sill */}
      <mesh position={[0, sillHeight + 0.01, frameDepth / 2 + 0.03]}>
        <boxGeometry args={[width - 0.02, 0.02, 0.06]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
      </mesh>
    </group>
  );
}
