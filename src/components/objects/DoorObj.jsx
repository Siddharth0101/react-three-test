// src/components/objects/DoorObj.jsx
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { selectObject } from "../../store/toolSlice";

export default function DoorObj({
  id,
  wallId,
  position,
  width: widthProp = 0.9,
  height: heightProp = 2.1,
  swingDirection = 1, // 1 = inward, -1 = outward
  hingeSide = "left", // "left" or "right"
  props, // AI-generated format
}) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const walls = useSelector((s) =>
    s.scene.objects.filter((o) => o.type === "wall")
  );

  const isSelected = selectedObjectId === id;
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
        wallThickness: props?.thickness || 0.15,
        wallHeight: props?.wallHeight || 3,
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
    
    if (wallLength === 0) return null;
    
    const angle = Math.atan2(dy, dx);

    // Unit direction vector along wall
    const ux = dx / wallLength;
    const uy = dy / wallLength;

    // Door center position along wall (position is 0-1 along wall)
    const doorX = x1 + dx * position;
    const doorY = y1 + dy * position;

    // Normal vector (perpendicular to wall, for swing direction)
    const nx = -uy;
    const ny = ux;

    return {
      x: doorX,
      y: doorY,
      angle,
      wallLength,
      ux,
      uy,
      nx,
      ny,
      wallThickness: wall.props?.thickness || wall.thickness || 0.15,
      wallHeight: wall.props?.height || wall.height || 3,
    };
  }, [wall, position, props]);

  if (!doorGeometry) return null;

  const { x, y, angle, wallThickness, wallHeight, nx, ny, ux, uy } = doorGeometry;
  const halfWidth = width / 2;

  // Handle click for selection
  const handleClick = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      dispatch(selectObject(id));
    }
  };

  // 2D mode - show door symbol with proper architectural representation
  if (mode === "2d") {
    // Hinge position (left or right side of door)
    const hingeOffset = hingeSide === "left" ? -halfWidth : halfWidth;
    const hingeX = x + Math.cos(angle) * hingeOffset;
    const hingeY = y + Math.sin(angle) * hingeOffset;
    
    // Door swing direction
    const swingDir = swingDirection * (hingeSide === "left" ? 1 : -1);
    
    // Door swing arc points - starts from hinge
    const arcPoints = [];
    const arcSegments = 24;
    const swingAngle = Math.PI / 2;
    
    // Calculate end point of door when open (90 degrees from wall)
    for (let i = 0; i <= arcSegments; i++) {
      const t = (i / arcSegments) * swingAngle * swingDir;
      const doorEndAngle = angle + (hingeSide === "left" ? 0 : Math.PI);
      arcPoints.push([
        hingeX + Math.cos(doorEndAngle + t) * width,
        hingeY + Math.sin(doorEndAngle + t) * width,
        0.15,
      ]);
    }

    // Door panel line (closed position)
    const doorStartX = hingeX;
    const doorStartY = hingeY;
    const doorEndX = x + Math.cos(angle) * (hingeSide === "left" ? halfWidth : -halfWidth);
    const doorEndY = y + Math.sin(angle) * (hingeSide === "left" ? halfWidth : -halfWidth);

    const doorColor = isSelected ? "#2563eb" : "#5c4033";
    const arcColor = isSelected ? "#60a5fa" : "#8b5a2b";

    return (
      <group onClick={handleClick}>
        {/* Selection highlight */}
        {isSelected && (
          <mesh position={[x, y, 0.01]} rotation={[0, 0, angle]}>
            <planeGeometry args={[width + 0.15, wallThickness * 3.5]} />
            <meshBasicMaterial color="#2563eb" transparent opacity={0.15} />
          </mesh>
        )}

        {/* Door opening (gap in wall) - white rectangle to cover wall */}
        <mesh position={[x, y, 0.02]} rotation={[0, 0, angle]}>
          <planeGeometry args={[width + 0.04, wallThickness * 3]} />
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
          <planeGeometry args={[0.05, wallThickness * 1.3]} />
          <meshBasicMaterial color={doorColor} />
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
          <planeGeometry args={[0.05, wallThickness * 1.3]} />
          <meshBasicMaterial color={doorColor} />
        </mesh>

        {/* Door panel (closed position shown as thick line) */}
        <Line
          points={[
            [doorStartX, doorStartY, 0.15],
            [doorEndX, doorEndY, 0.15],
          ]}
          color={doorColor}
          lineWidth={4}
          worldUnits={false}
        />

        {/* Hinge indicator */}
        <mesh position={[hingeX, hingeY, 0.18]}>
          <circleGeometry args={[0.04, 12]} />
          <meshBasicMaterial color={doorColor} />
        </mesh>

        {/* Door swing arc */}
        <Line
          points={arcPoints}
          color={arcColor}
          lineWidth={1.5}
          worldUnits={false}
          dashed
          dashSize={0.06}
          gapSize={0.03}
        />

        {/* Door at open position (faint) */}
        <Line
          points={[
            [hingeX, hingeY, 0.12],
            [arcPoints[arcPoints.length - 1][0], arcPoints[arcPoints.length - 1][1], 0.12],
          ]}
          color={arcColor}
          lineWidth={2}
          worldUnits={false}
          transparent
          opacity={0.4}
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
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
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
