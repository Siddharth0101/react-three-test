// src/ui/MiniMap.jsx
import { useSelector } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo } from "react";

export default function MiniMap() {
  const mode = useSelector((s) => s.viewMode.mode);
  const objects = useSelector((s) => s.scene.objects);
  const { camera } = useThree();

  // Helper to extract wall coordinates - handles both formats
  const getWallCoords = (wall) => {
    // Format 1: start/end arrays (from wall tool)
    if (wall.start && wall.end && Array.isArray(wall.start) && Array.isArray(wall.end)) {
      return {
        x1: wall.start[0],
        y1: wall.start[1],
        x2: wall.end[0],
        y2: wall.end[1],
      };
    }
    // Format 2: props.x1,y1,x2,y2 (from AI)
    if (wall.props && typeof wall.props.x1 === 'number') {
      return {
        x1: wall.props.x1,
        y1: wall.props.y1,
        x2: wall.props.x2,
        y2: wall.props.y2,
      };
    }
    return null;
  };

  const mapData = useMemo(() => {
    const walls = objects.filter((o) => o.type === "wall");
    const furniture = objects.filter((o) => o.type === "furniture");
    
    if (walls.length === 0 && furniture.length === 0) return null;

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    // Process walls with normalized coordinates
    const processedWalls = [];
    walls.forEach((wall) => {
      const coords = getWallCoords(wall);
      if (coords && !isNaN(coords.x1) && !isNaN(coords.y1) && !isNaN(coords.x2) && !isNaN(coords.y2)) {
        processedWalls.push(coords);
        minX = Math.min(minX, coords.x1, coords.x2);
        maxX = Math.max(maxX, coords.x1, coords.x2);
        minY = Math.min(minY, coords.y1, coords.y2);
        maxY = Math.max(maxY, coords.y1, coords.y2);
      }
    });

    // Process furniture - handle both f.position and f.props.position formats
    const processedFurniture = [];
    furniture.forEach((f) => {
      const pos = f.position || f.props?.position;
      if (pos && Array.isArray(pos) && pos.length >= 2 && !isNaN(pos[0]) && !isNaN(pos[1])) {
        processedFurniture.push({ x: pos[0], y: pos[1] });
        minX = Math.min(minX, pos[0]);
        maxX = Math.max(maxX, pos[0]);
        minY = Math.min(minY, pos[1]);
        maxY = Math.max(maxY, pos[1]);
      }
    });

    // If no valid walls or furniture, return null
    if (processedWalls.length === 0 && processedFurniture.length === 0) return null;
    
    // If bounds are still infinite (no valid data), return null
    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) return null;

    const padding = 2;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;
    const mapSize = 150;
    const scale = mapSize / Math.max(worldWidth, worldHeight);

    return { minX, minY, maxX, maxY, worldWidth, worldHeight, scale, mapSize, walls: processedWalls, furniture: processedFurniture };
  }, [objects]);

  if (mode !== "2d" || !mapData) return null;

  const { minX, minY, scale, mapSize, walls, furniture } = mapData;

  // Transform world to map coordinates
  const toMapX = (x) => (x - minX) * scale;
  const toMapY = (y) => mapSize - (y - minY) * scale;

  // Camera viewport indicator
  const camX = toMapX(camera.position.x);
  const camY = toMapY(camera.position.y);
  const viewWidth = (window.innerWidth / camera.zoom) * scale * 0.5;
  const viewHeight = (window.innerHeight / camera.zoom) * scale * 0.5;

  return (
    <Html
      calculatePosition={() => [0, 0]}
      style={{
        position: "fixed",
        bottom: "140px",
        right: "16px",
      }}
    >
      <div
        style={{
          width: `${mapSize}px`,
          height: `${mapSize}px`,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Title */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            left: "8px",
            fontSize: "9px",
            color: "#888",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Mini Map
        </div>

        {/* SVG content */}
        <svg
          width={mapSize}
          height={mapSize}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Walls - now using normalized coords {x1, y1, x2, y2} */}
          {walls.map((wall, i) => (
            <line
              key={`wall-${i}`}
              x1={toMapX(wall.x1)}
              y1={toMapY(wall.y1)}
              x2={toMapX(wall.x2)}
              y2={toMapY(wall.y2)}
              stroke="#1a1a2e"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Furniture - now using normalized {x, y} */}
          {furniture.map((f, i) => (
            <rect
              key={`furn-${i}`}
              x={toMapX(f.x) - 3}
              y={toMapY(f.y) - 3}
              width="6"
              height="6"
              fill="#8B4513"
              rx="1"
            />
          ))}

          {/* Viewport indicator */}
          <rect
            x={camX - viewWidth / 2}
            y={camY - viewHeight / 2}
            width={viewWidth}
            height={viewHeight}
            fill="rgba(33, 150, 243, 0.15)"
            stroke="#2196F3"
            strokeWidth="1.5"
            rx="2"
          />

          {/* Center dot */}
          <circle
            cx={camX}
            cy={camY}
            r="3"
            fill="#2196F3"
          />
        </svg>
      </div>
    </Html>
  );
}

