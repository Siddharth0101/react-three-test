// src/components/objects/DoorObj.jsx
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Line } from "@react-three/drei";
import * as THREE from "three";

export default function DoorObj({
  wallId,
  position,
  width: widthProp = 0.9,
  height: heightProp = 2.1,
  props, // AI-generated format
}) {
  const mode = useSelector((s) => s.viewMode.mode);
  const walls = useSelector((s) =>
    s.scene.objects.filter((o) => o.type === "wall")
  );

  // Handle both formats:
  // 1. wallId + position (from door tool)
  // 2. props.x, y, angle, width (from AI)
  const width = props?.width || widthProp;
  const height = props?.height || heightProp;

  // Find the wall this door belongs to
  const wall = walls.find((w) => w.id === (props?.wallId || wallId));

  const doorGeometry = useMemo(() => {
    // If we have direct coordinates from AI, use them
    if (props?.x !== undefined && props?.y !== undefined) {
      const angle = props.angle || 0;
      return {
        x: props.x,
        y: props.y,
        angle,
        wallLength: 1,
        nx: -Math.sin(angle),
        ny: Math.cos(angle),
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

    // Door center position along wall (0-1)
    const doorX = x1 + dx * position;
    const doorY = y1 + dy * position;

    // Normal vector for door swing indication
    const nx = -dy / wallLength;
    const ny = dx / wallLength;

    return {
      x: doorX,
      y: doorY,
      angle,
      wallLength,
      nx,
      ny,
      wallThickness: wall.props?.thickness || wall.thickness || 0.15,
      wallHeight: wall.props?.height || wall.height || 3,
    };
  }, [wall, position, props]);

  if (!doorGeometry) return null;

  const { x, y, angle, wallThickness, wallHeight } = doorGeometry;
  const halfWidth = width / 2;

  // 2D mode - show door symbol
  if (mode === "2d") {
    // Door swing arc points
    const arcPoints = [];
    const arcSegments = 20;
    const swingAngle = Math.PI / 2;
    const startAngle = angle;

    for (let i = 0; i <= arcSegments; i++) {
      const t = (i / arcSegments) * swingAngle;
      arcPoints.push([
        x - Math.cos(angle) * halfWidth + Math.cos(startAngle + t) * width,
        y - Math.sin(angle) * halfWidth + Math.sin(startAngle + t) * width,
        0.15,
      ]);
    }

    return (
      <group>
        {/* Door opening (gap in wall) - white rectangle to cover wall */}
        <mesh position={[x, y, 0.02]} rotation={[0, 0, angle]}>
          <planeGeometry args={[width + 0.02, wallThickness * 3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Door jamb left */}
        <mesh
          position={[
            x - Math.cos(angle) * (halfWidth + 0.02),
            y - Math.sin(angle) * (halfWidth + 0.02),
            0.1,
          ]}
          rotation={[0, 0, angle]}
        >
          <planeGeometry args={[0.04, wallThickness * 1.2]} />
          <meshBasicMaterial color="#5c4033" />
        </mesh>

        {/* Door jamb right */}
        <mesh
          position={[
            x + Math.cos(angle) * (halfWidth + 0.02),
            y + Math.sin(angle) * (halfWidth + 0.02),
            0.1,
          ]}
          rotation={[0, 0, angle]}
        >
          <planeGeometry args={[0.04, wallThickness * 1.2]} />
          <meshBasicMaterial color="#5c4033" />
        </mesh>

        {/* Door panel (closed position shown as line) */}
        <Line
          points={[
            [
              x - Math.cos(angle) * halfWidth,
              y - Math.sin(angle) * halfWidth,
              0.15,
            ],
            [
              x - Math.cos(angle) * halfWidth + Math.cos(angle) * width,
              y - Math.sin(angle) * halfWidth + Math.sin(angle) * width,
              0.15,
            ],
          ]}
          color="#8b5a2b"
          lineWidth={3}
          worldUnits={false}
        />

        {/* Door swing arc */}
        <Line
          points={arcPoints}
          color="#8b5a2b"
          lineWidth={1}
          worldUnits={false}
          dashed
          dashSize={0.08}
          gapSize={0.04}
        />
      </group>
    );
  }

  // 3D mode - detailed door with frame and panels
  const frameThickness = 0.06;
  const actualHeight = Math.min(height, wallHeight);
  const doorThickness = 0.045;
  const panelInset = 0.012;

  return (
    <group position={[x, 0, y]} rotation={[0, -angle, 0]}>
      {/* Door frame - top */}
      <mesh position={[0, actualHeight + frameThickness / 2, 0]}>
        <boxGeometry
          args={[width + frameThickness * 2, frameThickness, wallThickness + 0.02]}
        />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>

      {/* Door frame - left */}
      <mesh position={[-halfWidth - frameThickness / 2, actualHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, actualHeight, wallThickness + 0.02]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>

      {/* Door frame - right */}
      <mesh position={[halfWidth + frameThickness / 2, actualHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, actualHeight, wallThickness + 0.02]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>

      {/* Door panel - closed position */}
      <group
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      >
        {/* Main door panel */}
        <mesh position={[0, actualHeight / 2, 0]}>
          <boxGeometry args={[width - 0.02, actualHeight - 0.02, doorThickness]} />
          <meshStandardMaterial color="#8b6914" roughness={0.6} />
        </mesh>

        {/* Top panel inset - front */}
        <mesh position={[0, actualHeight * 0.72, doorThickness / 2 + 0.001]}>
          <boxGeometry args={[width * 0.65, actualHeight * 0.3, panelInset]} />
          <meshStandardMaterial color="#6b4f12" roughness={0.5} />
        </mesh>

        {/* Top panel inset - back */}
        <mesh position={[0, actualHeight * 0.72, -doorThickness / 2 - 0.001]}>
          <boxGeometry args={[width * 0.65, actualHeight * 0.3, panelInset]} />
          <meshStandardMaterial color="#6b4f12" roughness={0.5} />
        </mesh>

        {/* Bottom panel inset - front */}
        <mesh position={[0, actualHeight * 0.32, doorThickness / 2 + 0.001]}>
          <boxGeometry args={[width * 0.65, actualHeight * 0.38, panelInset]} />
          <meshStandardMaterial color="#6b4f12" roughness={0.5} />
        </mesh>

        {/* Bottom panel inset - back */}
        <mesh position={[0, actualHeight * 0.32, -doorThickness / 2 - 0.001]}>
          <boxGeometry args={[width * 0.65, actualHeight * 0.38, panelInset]} />
          <meshStandardMaterial color="#6b4f12" roughness={0.5} />
        </mesh>

        {/* Door handle - front */}
        <mesh position={[halfWidth - 0.1, actualHeight * 0.48, doorThickness / 2 + 0.025]}>
          <boxGeometry args={[0.1, 0.025, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Door handle plate - front */}
        <mesh position={[halfWidth - 0.1, actualHeight * 0.48, doorThickness / 2 + 0.006]}>
          <boxGeometry args={[0.04, 0.1, 0.012]} />
          <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Door handle - back */}
        <mesh position={[halfWidth - 0.1, actualHeight * 0.48, -doorThickness / 2 - 0.025]}>
          <boxGeometry args={[0.1, 0.025, 0.04]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Door handle plate - back */}
        <mesh position={[halfWidth - 0.1, actualHeight * 0.48, -doorThickness / 2 - 0.006]}>
          <boxGeometry args={[0.04, 0.1, 0.012]} />
          <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Threshold */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[width + 0.04, 0.02, wallThickness + 0.04]} />
        <meshStandardMaterial color="#3d2817" roughness={0.8} />
      </mesh>
    </group>
  );
}
