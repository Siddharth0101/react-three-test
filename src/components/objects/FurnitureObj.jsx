// src/components/objects/FurnitureObj.jsx
import { useMemo, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { selectObject, setDraggingObject } from "../../store/toolSlice";
import { updateObject } from "../../store/sceneSlice";

// Furniture type definitions with shapes, colors, and visual details
const FURNITURE_TYPES = {
  // Living Room
  sofa: { 
    width: 2.0, depth: 0.9, height: 0.85, 
    color: "#6B8E23", accentColor: "#556B2F", cushionColor: "#7BA428",
    label: "Sofa", shape: "sofa", category: "living"
  },
  armchair: { 
    width: 0.9, depth: 0.85, height: 0.85, 
    color: "#8B7355", accentColor: "#6B5344", cushionColor: "#9D8466",
    label: "Armchair", shape: "armchair", category: "living"
  },
  coffeeTable: { 
    width: 1.2, depth: 0.6, height: 0.45, 
    color: "#8B4513", accentColor: "#5D2E0C", 
    label: "Coffee Table", shape: "coffeeTable", category: "living"
  },
  tvStand: { 
    width: 1.5, depth: 0.45, height: 0.5, 
    color: "#2F2F2F", accentColor: "#1A1A1A", screenColor: "#111",
    label: "TV Stand", shape: "tvStand", category: "living"
  },
  bookshelf: { 
    width: 1.0, depth: 0.35, height: 2.0, 
    color: "#8B4513", accentColor: "#6B3410", bookColors: ["#8B0000", "#00008B", "#006400", "#4B0082"],
    label: "Bookshelf", shape: "bookshelf", category: "living"
  },
  
  // Bedroom
  bedSingle: { 
    width: 1.0, depth: 2.0, height: 0.5, 
    color: "#8B4513", accentColor: "#6B3410", beddingColor: "#4169E1", pillowColor: "#F5F5F5",
    label: "Single Bed", shape: "bed", category: "bedroom"
  },
  bedDouble: { 
    width: 1.6, depth: 2.0, height: 0.5, 
    color: "#8B4513", accentColor: "#6B3410", beddingColor: "#4169E1", pillowColor: "#F5F5F5",
    label: "Double Bed", shape: "bed", category: "bedroom"
  },
  bedKing: { 
    width: 2.0, depth: 2.1, height: 0.5, 
    color: "#8B4513", accentColor: "#6B3410", beddingColor: "#4169E1", pillowColor: "#F5F5F5",
    label: "King Bed", shape: "bed", category: "bedroom"
  },
  wardrobe: { 
    width: 1.2, depth: 0.6, height: 2.2, 
    color: "#D2691E", accentColor: "#A0522D", handleColor: "#C0C0C0",
    label: "Wardrobe", shape: "wardrobe", category: "bedroom"
  },
  dresser: { 
    width: 1.0, depth: 0.5, height: 0.8, 
    color: "#8B4513", accentColor: "#6B3410", handleColor: "#C0C0C0",
    label: "Dresser", shape: "dresser", category: "bedroom"
  },
  nightstand: { 
    width: 0.5, depth: 0.4, height: 0.55, 
    color: "#8B4513", accentColor: "#6B3410", handleColor: "#C0C0C0",
    label: "Nightstand", shape: "nightstand", category: "bedroom"
  },
  
  // Dining
  diningTable: { 
    width: 1.8, depth: 0.9, height: 0.75, 
    color: "#8B4513", accentColor: "#5D2E0C", 
    label: "Dining Table", shape: "diningTable", category: "dining"
  },
  diningTableRound: { 
    width: 1.2, depth: 1.2, height: 0.75, 
    color: "#8B4513", accentColor: "#5D2E0C",
    label: "Round Table", shape: "roundTable", category: "dining"
  },
  chair: { 
    width: 0.45, depth: 0.45, height: 0.9, 
    color: "#D2691E", accentColor: "#A0522D", seatColor: "#8B4513",
    label: "Chair", shape: "chair", category: "dining"
  },
  
  // Kitchen
  stove: { 
    width: 0.6, depth: 0.6, height: 0.9, 
    color: "#2F2F2F", accentColor: "#1A1A1A", burnerColor: "#333",
    label: "Stove", shape: "stove", category: "kitchen"
  },
  refrigerator: { 
    width: 0.8, depth: 0.7, height: 1.8, 
    color: "#C0C0C0", accentColor: "#A0A0A0", handleColor: "#808080",
    label: "Refrigerator", shape: "refrigerator", category: "kitchen"
  },
  sink: { 
    width: 0.6, depth: 0.5, height: 0.9, 
    color: "#B8B8B8", accentColor: "#909090", basinColor: "#D3D3D3", faucetColor: "#C0C0C0",
    label: "Sink", shape: "sink", category: "kitchen"
  },
  kitchenIsland: { 
    width: 1.5, depth: 0.8, height: 0.9, 
    color: "#A0522D", accentColor: "#8B4513", topColor: "#D3D3D3",
    label: "Kitchen Island", shape: "kitchenIsland", category: "kitchen"
  },
  
  // Bathroom
  toilet: { 
    width: 0.4, depth: 0.7, height: 0.45, 
    color: "#F5F5F5", accentColor: "#E8E8E8", seatColor: "#FFFFFF",
    label: "Toilet", shape: "toilet", category: "bathroom"
  },
  bathtub: { 
    width: 0.8, depth: 1.7, height: 0.6, 
    color: "#F5F5F5", accentColor: "#E8E8E8", innerColor: "#E0FFFF", faucetColor: "#C0C0C0",
    label: "Bathtub", shape: "bathtub", category: "bathroom"
  },
  shower: { 
    width: 0.9, depth: 0.9, height: 2.1, 
    color: "#ADD8E6", accentColor: "#87CEEB", floorColor: "#D3D3D3",
    label: "Shower", shape: "shower", category: "bathroom"
  },
  vanity: { 
    width: 0.8, depth: 0.5, height: 0.85, 
    color: "#F5F5F5", accentColor: "#E8E8E8", mirrorColor: "#87CEEB", sinkColor: "#D3D3D3",
    label: "Vanity", shape: "vanity", category: "bathroom"
  },
  
  // Office
  desk: { 
    width: 1.4, depth: 0.7, height: 0.75, 
    color: "#8B4513", accentColor: "#6B3410", 
    label: "Desk", shape: "desk", category: "office"
  },
  officeChair: { 
    width: 0.6, depth: 0.6, height: 1.1, 
    color: "#2F2F2F", accentColor: "#1A1A1A", seatColor: "#333",
    label: "Office Chair", shape: "officeChair", category: "office"
  },
  filingCabinet: { 
    width: 0.45, depth: 0.6, height: 1.0, 
    color: "#808080", accentColor: "#606060", handleColor: "#404040",
    label: "Filing Cabinet", shape: "filingCabinet", category: "office"
  },
  
  // Plants & Decor
  plant: { 
    width: 0.4, depth: 0.4, height: 1.0, 
    color: "#228B22", accentColor: "#006400", potColor: "#8B4513",
    label: "Plant", shape: "plant", category: "decor"
  },
  rug: { 
    width: 2.0, depth: 1.5, height: 0.02, 
    color: "#B22222", accentColor: "#8B0000", patternColor: "#DAA520",
    label: "Rug", shape: "rug", category: "decor"
  },
};

export { FURNITURE_TYPES };

// 2D rendering components
function Sofa2D({ width, depth, config, isSelected }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Back cushion */}
      <mesh position={[0, depth / 2 - 0.12, 0.01]}>
        <planeGeometry args={[width - 0.1, 0.2]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Seat cushions (3 sections) */}
      {[-width/3, 0, width/3].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, -0.05, 0.01]}>
          <planeGeometry args={[width/3 - 0.05, depth - 0.3]} />
          <meshBasicMaterial color={config.cushionColor} />
        </mesh>
      ))}
      {/* Armrests */}
      <mesh position={[-width/2 + 0.08, 0, 0.02]}>
        <planeGeometry args={[0.12, depth]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      <mesh position={[width/2 - 0.08, 0, 0.02]}>
        <planeGeometry args={[0.12, depth]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
    </group>
  );
}

function Armchair2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Back cushion */}
      <mesh position={[0, depth / 2 - 0.12, 0.01]}>
        <planeGeometry args={[width - 0.25, 0.18]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, -0.05, 0.01]}>
        <planeGeometry args={[width - 0.25, depth - 0.35]} />
        <meshBasicMaterial color={config.cushionColor} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-width/2 + 0.1, 0, 0.02]}>
        <planeGeometry args={[0.15, depth]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      <mesh position={[width/2 - 0.1, 0, 0.02]}>
        <planeGeometry args={[0.15, depth]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
    </group>
  );
}

function CoffeeTable2D({ width, depth, config }) {
  return (
    <group>
      {/* Table top */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Wood grain lines */}
      {[-0.15, 0, 0.15].map((yOffset, i) => (
        <mesh key={i} position={[0, yOffset, 0.01]}>
          <planeGeometry args={[width - 0.1, 0.02]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
      {/* Legs (corners) */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([xDir, yDir], i) => (
        <mesh key={i} position={[xDir * (width/2 - 0.06), yDir * (depth/2 - 0.06), 0.02]}>
          <circleGeometry args={[0.04, 8]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
    </group>
  );
}

function Bed2D({ width, depth, config }) {
  const pillowCount = width > 1.5 ? 2 : 1;
  const pillowWidth = (width - 0.2) / pillowCount - 0.05;
  
  return (
    <group>
      {/* Mattress/bedding */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.beddingColor} />
      </mesh>
      {/* Blanket fold line */}
      <mesh position={[0, depth * 0.15, 0.01]}>
        <planeGeometry args={[width - 0.1, 0.03]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Pillows */}
      {Array.from({ length: pillowCount }).map((_, i) => {
        const xOffset = pillowCount === 1 ? 0 : (i - 0.5) * (pillowWidth + 0.1);
        return (
          <group key={i} position={[xOffset, depth / 2 - 0.25, 0.01]}>
            <mesh>
              <planeGeometry args={[pillowWidth, 0.35]} />
              <meshBasicMaterial color={config.pillowColor} />
            </mesh>
            {/* Pillow crease */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[pillowWidth - 0.1, 0.02]} />
              <meshBasicMaterial color="#E8E8E8" />
            </mesh>
          </group>
        );
      })}
      {/* Headboard */}
      <mesh position={[0, depth / 2 + 0.06, 0.02]}>
        <planeGeometry args={[width, 0.1]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color={config.color} linewidth={2} />
      </lineSegments>
    </group>
  );
}

function Wardrobe2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Door division */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.02, depth - 0.05]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.08, 0, 0.02]}>
        <planeGeometry args={[0.04, 0.15]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
      <mesh position={[0.08, 0, 0.02]}>
        <planeGeometry args={[0.04, 0.15]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
    </group>
  );
}

function Dresser2D({ width, depth, config }) {
  const drawers = 3;
  const drawerHeight = (depth - 0.1) / drawers;
  
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Drawers */}
      {Array.from({ length: drawers }).map((_, i) => {
        const yPos = (depth/2 - 0.05) - (i + 0.5) * drawerHeight;
        return (
          <group key={i} position={[0, yPos, 0.01]}>
            <mesh>
              <planeGeometry args={[width - 0.06, drawerHeight - 0.03]} />
              <meshBasicMaterial color={config.accentColor} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.15, 0.03]} />
              <meshBasicMaterial color={config.handleColor} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Nightstand2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Drawer */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.06, depth/2 - 0.03]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
    </group>
  );
}

function DiningTable2D({ width, depth, config }) {
  return (
    <group>
      {/* Table top */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Wood grain pattern */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((yOffset, i) => (
        <mesh key={i} position={[0, yOffset, 0.01]}>
          <planeGeometry args={[width - 0.15, 0.015]} />
          <meshBasicMaterial color={config.accentColor} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([xDir, yDir], i) => (
        <mesh key={i} position={[xDir * (width/2 - 0.12), yDir * (depth/2 - 0.1), 0.02]}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
    </group>
  );
}

function RoundTable2D({ width, depth, config }) {
  const radius = width / 2;
  return (
    <group>
      {/* Table top */}
      <mesh>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Center pedestal */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[radius * 0.3, 16]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
    </group>
  );
}

function Chair2D({ width, depth, config }) {
  return (
    <group>
      {/* Seat */}
      <mesh>
        <planeGeometry args={[width, depth * 0.6]} />
        <meshBasicMaterial color={config.seatColor} />
      </mesh>
      {/* Back */}
      <mesh position={[0, depth * 0.35, 0.01]}>
        <planeGeometry args={[width - 0.05, depth * 0.25]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Back slats */}
      {[-0.1, 0, 0.1].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, depth * 0.35, 0.02]}>
          <planeGeometry args={[0.03, depth * 0.2]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-1, -1], [1, -1], [1, 0.3], [-1, 0.3]].map(([xDir, yPos], i) => (
        <mesh key={i} position={[xDir * (width/2 - 0.04), depth * yPos * 0.5, 0.02]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
    </group>
  );
}

function Stove2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Burners (4 circles) */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([xDir, yDir], i) => (
        <group key={i} position={[xDir * 0.12, yDir * 0.12, 0.01]}>
          <mesh>
            <circleGeometry args={[0.08, 24]} />
            <meshBasicMaterial color={config.burnerColor} />
          </mesh>
          {/* Inner ring */}
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.03, 0.05, 16]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
      {/* Control panel */}
      <mesh position={[0, depth/2 - 0.06, 0.02]}>
        <planeGeometry args={[width - 0.05, 0.08]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function Refrigerator2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Freezer section (top) */}
      <mesh position={[0, depth/2 - 0.15, 0.01]}>
        <planeGeometry args={[width - 0.04, 0.25]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Door division */}
      <mesh position={[0, -0.05, 0.01]}>
        <planeGeometry args={[width - 0.04, 0.02]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
      {/* Handles */}
      <mesh position={[width/2 - 0.08, depth/4, 0.02]}>
        <planeGeometry args={[0.03, 0.15]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
      <mesh position={[width/2 - 0.08, -depth/4, 0.02]}>
        <planeGeometry args={[0.03, 0.2]} />
        <meshBasicMaterial color={config.handleColor} />
      </mesh>
    </group>
  );
}

function Sink2D({ width, depth, config }) {
  return (
    <group>
      {/* Counter */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.1, depth - 0.15]} />
        <meshBasicMaterial color={config.basinColor} />
      </mesh>
      {/* Drain */}
      <mesh position={[0, -0.05, 0.02]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#666" />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, depth/2 - 0.08, 0.02]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={config.faucetColor} />
      </mesh>
      <mesh position={[0, depth/2 - 0.14, 0.02]}>
        <planeGeometry args={[0.02, 0.08]} />
        <meshBasicMaterial color={config.faucetColor} />
      </mesh>
    </group>
  );
}

function KitchenIsland2D({ width, depth, config }) {
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width + 0.04, depth + 0.04]} />
        <meshBasicMaterial color={config.topColor} />
      </mesh>
      {/* Cabinet doors */}
      {[-width/4, width/4].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 0, 0.02]}>
          <planeGeometry args={[width/2 - 0.08, depth - 0.1]} />
          <meshBasicMaterial color={config.color} />
        </mesh>
      ))}
      {/* Handles */}
      {[-width/4, width/4].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 0, 0.03]}>
          <planeGeometry args={[0.12, 0.03]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      ))}
    </group>
  );
}

function Toilet2D({ width, depth, config }) {
  return (
    <group>
      {/* Tank (rectangle at back) */}
      <mesh position={[0, depth/2 - 0.12, 0]}>
        <planeGeometry args={[width + 0.02, 0.2]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Bowl (oval) */}
      <mesh position={[0, -0.05, 0.01]}>
        <circleGeometry args={[width/2, 32]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, -0.05, 0.02]}>
        <ringGeometry args={[width/2 - 0.06, width/2 - 0.02, 32]} />
        <meshBasicMaterial color={config.seatColor} />
      </mesh>
      {/* Lid hinge area */}
      <mesh position={[0, 0.08, 0.02]}>
        <planeGeometry args={[width - 0.05, 0.04]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
    </group>
  );
}

function Bathtub2D({ width, depth, config }) {
  return (
    <group>
      {/* Outer tub */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Inner basin */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.12, depth - 0.12]} />
        <meshBasicMaterial color={config.innerColor} />
      </mesh>
      {/* Faucet end indicator */}
      <mesh position={[0, -depth/2 + 0.1, 0.02]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color={config.faucetColor} />
      </mesh>
      {/* Drain */}
      <mesh position={[0, -depth/4, 0.02]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#666" />
      </mesh>
    </group>
  );
}

function Shower2D({ width, depth, config }) {
  return (
    <group>
      {/* Floor/base */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.floorColor} />
      </mesh>
      {/* Glass walls indication */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color={config.color} linewidth={2} />
      </lineSegments>
      {/* Drain */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color="#666" />
      </mesh>
      {/* Shower head indicator */}
      <mesh position={[0, depth/2 - 0.1, 0.02]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#C0C0C0" />
      </mesh>
    </group>
  );
}

function Vanity2D({ width, depth, config }) {
  return (
    <group>
      {/* Cabinet */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Sink basin */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[width * 0.3, 24]} />
        <meshBasicMaterial color={config.sinkColor} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, depth/2 - 0.08, 0.02]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#C0C0C0" />
      </mesh>
      {/* Cabinet doors */}
      <mesh position={[0, -depth/4, 0.01]}>
        <planeGeometry args={[width - 0.06, depth/2 - 0.04]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -depth/4, 0.02]}>
        <planeGeometry args={[0.1, 0.02]} />
        <meshBasicMaterial color="#888" />
      </mesh>
    </group>
  );
}

function Desk2D({ width, depth, config }) {
  return (
    <group>
      {/* Desktop */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Drawer section */}
      <mesh position={[width/2 - 0.2, 0, 0.01]}>
        <planeGeometry args={[0.35, depth - 0.05]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Drawer handles */}
      {[0.1, -0.1].map((yOffset, i) => (
        <mesh key={i} position={[width/2 - 0.2, yOffset, 0.02]}>
          <planeGeometry args={[0.1, 0.02]} />
          <meshBasicMaterial color="#888" />
        </mesh>
      ))}
      {/* Leg space */}
      <mesh position={[-width/4, 0, 0.01]}>
        <planeGeometry args={[width/2 - 0.1, depth - 0.1]} />
        <meshBasicMaterial color={config.color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function OfficeChair2D({ width, depth, config }) {
  return (
    <group>
      {/* Seat (circle) */}
      <mesh>
        <circleGeometry args={[width/2, 32]} />
        <meshBasicMaterial color={config.seatColor} />
      </mesh>
      {/* Back (arc) */}
      <mesh position={[0, depth * 0.35, 0.01]}>
        <planeGeometry args={[width - 0.1, 0.15]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Base star (5 points) */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.sin(rad) * 0.2, Math.cos(rad) * 0.2 - 0.1, 0.02]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial color="#444" />
          </mesh>
        );
      })}
    </group>
  );
}

function FilingCabinet2D({ width, depth, config }) {
  const drawers = 3;
  const drawerHeight = (depth - 0.08) / drawers;
  
  return (
    <group>
      {/* Main body */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Drawers */}
      {Array.from({ length: drawers }).map((_, i) => {
        const yPos = (depth/2 - 0.04) - (i + 0.5) * drawerHeight;
        return (
          <group key={i} position={[0, yPos, 0.01]}>
            <mesh>
              <planeGeometry args={[width - 0.04, drawerHeight - 0.02]} />
              <meshBasicMaterial color={config.accentColor} />
            </mesh>
            {/* Handle */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[0.08, 0.02]} />
              <meshBasicMaterial color={config.handleColor} />
            </mesh>
            {/* Label holder */}
            <mesh position={[0, -drawerHeight/4, 0.01]}>
              <planeGeometry args={[0.12, 0.04]} />
              <meshBasicMaterial color="#ddd" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Plant2D({ width, depth, config }) {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, -depth/4, 0]}>
        <planeGeometry args={[width * 0.6, depth * 0.5]} />
        <meshBasicMaterial color={config.potColor} />
      </mesh>
      {/* Foliage (multiple circles) */}
      {[
        [0, 0.15, 0.12],
        [-0.08, 0.08, 0.08],
        [0.08, 0.08, 0.08],
        [-0.05, 0.2, 0.06],
        [0.05, 0.2, 0.06],
      ].map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0.01 + i * 0.002]}>
          <circleGeometry args={[r, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? config.color : config.accentColor} />
        </mesh>
      ))}
    </group>
  );
}

function Rug2D({ width, depth, config }) {
  return (
    <group>
      {/* Main rug */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(width - 0.1, depth - 0.1)]} />
        <lineBasicMaterial color={config.patternColor} />
      </lineSegments>
      {/* Pattern - geometric design */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width * 0.5, depth * 0.5]} />
        <meshBasicMaterial color={config.accentColor} />
      </mesh>
      {/* Center medallion */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[Math.min(width, depth) * 0.15, 16]} />
        <meshBasicMaterial color={config.patternColor} />
      </mesh>
    </group>
  );
}

function TvStand2D({ width, depth, config }) {
  return (
    <group>
      {/* Main cabinet */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Shelves/doors */}
      {[-width/3, 0, width/3].map((xOffset, i) => (
        <mesh key={i} position={[xOffset, 0, 0.01]}>
          <planeGeometry args={[width/3 - 0.04, depth - 0.04]} />
          <meshBasicMaterial color={config.accentColor} />
        </mesh>
      ))}
      {/* TV indicator on top */}
      <mesh position={[0, depth/2 + 0.05, 0.02]}>
        <planeGeometry args={[width * 0.8, 0.04]} />
        <meshBasicMaterial color={config.screenColor} />
      </mesh>
    </group>
  );
}

function Bookshelf2D({ width, depth, config }) {
  const shelves = 5;
  const shelfHeight = (depth - 0.1) / shelves;
  
  return (
    <group>
      {/* Frame */}
      <mesh>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      {/* Shelves with books */}
      {Array.from({ length: shelves }).map((_, i) => {
        const yPos = (depth/2 - 0.05) - (i + 0.5) * shelfHeight;
        return (
          <group key={i} position={[0, yPos, 0.01]}>
            {/* Shelf */}
            <mesh position={[0, -shelfHeight/2 + 0.02, 0]}>
              <planeGeometry args={[width - 0.04, 0.02]} />
              <meshBasicMaterial color={config.accentColor} />
            </mesh>
            {/* Books (random colors) */}
            {Array.from({ length: 5 }).map((_, j) => {
              const bookWidth = 0.06 + Math.random() * 0.04;
              const xPos = -width/2 + 0.08 + j * 0.12;
              const bookColor = config.bookColors[j % config.bookColors.length];
              return (
                <mesh key={j} position={[xPos, 0, 0.01]}>
                  <planeGeometry args={[bookWidth, shelfHeight - 0.04]} />
                  <meshBasicMaterial color={bookColor} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// Snap value to grid
const snapToGrid = (value, gridSize, enabled) => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

// Main component
export default function FurnitureObj({ 
  id, 
  furnitureType: furnitureTypeProp, 
  position: positionProp, 
  rotation: rotationProp = 0,
  customWidth,
  customDepth,
  props, // AI-generated format
}) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const snapEnabled = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  
  const { camera, raycaster, pointer } = useThree();
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState([0, 0]);
  const [dragPosition, setDragPosition] = useState(null);
  const groupRef = useRef();
  
  // Handle both formats: direct props or nested props object
  const furnitureType = props?.furnitureType || furnitureTypeProp;
  const basePosition = props?.position || positionProp || [0, 0];
  const rotation = props?.rotation ?? rotationProp;
  
  // Use drag position while dragging, otherwise use base position
  const position = dragPosition || basePosition;
  
  const isSelected = selectedObjectId === id;
  const config = FURNITURE_TYPES[furnitureType] || FURNITURE_TYPES.chair;
  
  const width = customWidth || config.width;
  const depth = customDepth || config.depth;
  const height = config.height;

  // Get world position from pointer
  const getWorldPosition = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return [intersection.x, intersection.y];
  }, [camera, raycaster, pointer]);

  const handlePointerDown = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      
      // Select the object
      dispatch(selectObject(id));
      
      // Start dragging - notify globally to disable canvas panning
      dispatch(setDraggingObject(true));
      
      const worldPos = getWorldPosition();
      setDragOffset([worldPos[0] - basePosition[0], worldPos[1] - basePosition[1]]);
      setIsDragging(true);
      setDragPosition(basePosition);
      
      // Capture pointer for drag
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || selectedTool !== "select") return;
    
    const worldPos = getWorldPosition();
    let newX = worldPos[0] - dragOffset[0];
    let newY = worldPos[1] - dragOffset[1];
    
    // Apply grid snapping
    newX = snapToGrid(newX, gridSize, snapEnabled);
    newY = snapToGrid(newY, gridSize, snapEnabled);
    
    setDragPosition([newX, newY]);
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      // Release pointer capture
      e.target.releasePointerCapture(e.pointerId);
      
      // Stop dragging - re-enable canvas panning
      dispatch(setDraggingObject(false));
      
      // Update the object position in the store
      if (dragPosition && (dragPosition[0] !== basePosition[0] || dragPosition[1] !== basePosition[1])) {
        // Handle both formats: direct position or props.position (AI-generated)
        if (props?.position) {
          // AI-generated format - update props.position
          dispatch(updateObject({
            id,
            updates: { 
              props: { 
                ...props, 
                position: dragPosition 
              } 
            },
          }));
        } else {
          // Direct format - update position directly
          dispatch(updateObject({
            id,
            updates: { position: dragPosition },
          }));
        }
      }
      
      setIsDragging(false);
      setDragPosition(null);
    }
  };

  const handleClick = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      dispatch(selectObject(id));
    }
  };

  // 2D view - render detailed furniture representations
  if (mode === "2d") {
    const shape = config.shape;
    
    // Map shape types to components
    const ShapeComponent = {
      sofa: Sofa2D,
      armchair: Armchair2D,
      coffeeTable: CoffeeTable2D,
      bed: Bed2D,
      wardrobe: Wardrobe2D,
      dresser: Dresser2D,
      nightstand: Nightstand2D,
      diningTable: DiningTable2D,
      roundTable: RoundTable2D,
      chair: Chair2D,
      stove: Stove2D,
      refrigerator: Refrigerator2D,
      sink: Sink2D,
      kitchenIsland: KitchenIsland2D,
      toilet: Toilet2D,
      bathtub: Bathtub2D,
      shower: Shower2D,
      vanity: Vanity2D,
      desk: Desk2D,
      officeChair: OfficeChair2D,
      filingCabinet: FilingCabinet2D,
      plant: Plant2D,
      rug: Rug2D,
      tvStand: TvStand2D,
      bookshelf: Bookshelf2D,
    }[shape];

    return (
      <group 
        ref={groupRef}
        position={[position[0], position[1], isDragging ? 0.5 : 0.1]} 
        rotation={[0, 0, rotation]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOver={() => { if (selectedTool === "select") document.body.style.cursor = "move"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
        userData={{ id, isSelectable: true }}
      >
        {/* Selection highlight */}
        {isSelected && (
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[width + 0.15, depth + 0.15]} />
            <meshBasicMaterial color={isDragging ? "#4CAF50" : "#2196F3"} transparent opacity={isDragging ? 0.5 : 0.3} />
          </mesh>
        )}
        
        {/* Drag handles when selected */}
        {isSelected && !isDragging && (
          <>
            {/* Corner handles */}
            {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([xDir, yDir], i) => (
              <mesh key={i} position={[xDir * (width/2 + 0.05), yDir * (depth/2 + 0.05), 0.1]}>
                <circleGeometry args={[0.06, 8]} />
                <meshBasicMaterial color="#2196F3" />
              </mesh>
            ))}
          </>
        )}

        {/* Render the specific furniture shape */}
        {ShapeComponent ? (
          <ShapeComponent width={width} depth={depth} config={config} isSelected={isSelected} />
        ) : (
          // Fallback rectangle
          <mesh>
            <planeGeometry args={[width, depth]} />
            <meshBasicMaterial color={config.color} />
          </mesh>
        )}

        {/* Direction indicator */}
        <mesh position={[0, depth / 2 - 0.03, 0.05]}>
          <planeGeometry args={[width * 0.25, 0.025]} />
          <meshBasicMaterial color="#333" />
        </mesh>
      </group>
    );
  }

  // 3D view - enhanced furniture rendering
  return (
    <group position={[position[0], height / 2, position[1]]} rotation={[0, -rotation, 0]}>
      {config.shape === "sofa" ? (
        <group>
          {/* Base */}
          <mesh position={[0, -height * 0.3, 0]}>
            <boxGeometry args={[width, height * 0.4, depth]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Back */}
          <mesh position={[0, height * 0.1, -depth * 0.35]}>
            <boxGeometry args={[width, height * 0.6, depth * 0.3]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          {/* Armrests */}
          <mesh position={[-width/2 + 0.08, 0, 0]}>
            <boxGeometry args={[0.15, height * 0.5, depth]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          <mesh position={[width/2 - 0.08, 0, 0]}>
            <boxGeometry args={[0.15, height * 0.5, depth]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          {/* Cushions */}
          {[-width/3, 0, width/3].map((x, i) => (
            <mesh key={i} position={[x, 0.05, 0.05]}>
              <boxGeometry args={[width/3 - 0.05, height * 0.25, depth * 0.6]} />
              <meshStandardMaterial color={config.cushionColor} />
            </mesh>
          ))}
        </group>
      ) : config.shape === "bed" ? (
        <group>
          {/* Frame base */}
          <mesh position={[0, -height * 0.35, 0]}>
            <boxGeometry args={[width, height * 0.3, depth]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width - 0.05, height * 0.4, depth - 0.05]} />
            <meshStandardMaterial color={config.beddingColor} />
          </mesh>
          {/* Blanket */}
          <mesh position={[0, height * 0.22, depth * 0.15]}>
            <boxGeometry args={[width - 0.08, height * 0.05, depth * 0.6]} />
            <meshStandardMaterial color={config.beddingColor} />
          </mesh>
          {/* Pillows */}
          <mesh position={[0, height * 0.3, -depth * 0.35]}>
            <boxGeometry args={[width - 0.2, height * 0.15, 0.3]} />
            <meshStandardMaterial color={config.pillowColor} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, height * 0.5, -depth / 2 + 0.05]}>
            <boxGeometry args={[width, height * 0.8, 0.1]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
        </group>
      ) : config.shape === "toilet" ? (
        <group>
          {/* Tank */}
          <mesh position={[0, height * 0.3, -depth * 0.3]}>
            <boxGeometry args={[width, height * 0.5, 0.2]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Bowl */}
          <mesh position={[0, -height * 0.15, 0.05]}>
            <cylinderGeometry args={[width * 0.45, width * 0.4, height * 0.5, 32]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Seat */}
          <mesh position={[0, height * 0.15, 0.05]}>
            <cylinderGeometry args={[width * 0.48, width * 0.48, 0.05, 32]} />
            <meshStandardMaterial color={config.seatColor} />
          </mesh>
        </group>
      ) : config.shape === "refrigerator" ? (
        <group>
          {/* Main body */}
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={config.color} metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Door seam */}
          <mesh position={[0, height * 0.15, depth/2 + 0.01]}>
            <boxGeometry args={[width - 0.02, 0.02, 0.01]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          {/* Handles */}
          <mesh position={[width/2 - 0.06, height * 0.3, depth/2 + 0.02]}>
            <boxGeometry args={[0.03, 0.2, 0.03]} />
            <meshStandardMaterial color={config.handleColor} metalness={0.5} />
          </mesh>
          <mesh position={[width/2 - 0.06, -height * 0.2, depth/2 + 0.02]}>
            <boxGeometry args={[0.03, 0.25, 0.03]} />
            <meshStandardMaterial color={config.handleColor} metalness={0.5} />
          </mesh>
        </group>
      ) : config.shape === "roundTable" ? (
        <group>
          {/* Table top */}
          <mesh position={[0, height * 0.45, 0]}>
            <cylinderGeometry args={[width/2, width/2, 0.05, 32]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Pedestal */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.12, height * 0.9, 16]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          {/* Base */}
          <mesh position={[0, -height * 0.45, 0]}>
            <cylinderGeometry args={[width * 0.3, width * 0.35, 0.05, 32]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
        </group>
      ) : config.shape === "plant" ? (
        <group>
          {/* Pot */}
          <mesh position={[0, -height * 0.35, 0]}>
            <cylinderGeometry args={[width * 0.25, width * 0.2, height * 0.3, 16]} />
            <meshStandardMaterial color={config.potColor} />
          </mesh>
          {/* Foliage sphere cluster */}
          <mesh position={[0, height * 0.15, 0]}>
            <sphereGeometry args={[width * 0.4, 16, 16]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          <mesh position={[-0.08, height * 0.25, 0.05]}>
            <sphereGeometry args={[width * 0.25, 12, 12]} />
            <meshStandardMaterial color={config.accentColor} />
          </mesh>
          <mesh position={[0.1, height * 0.2, -0.05]}>
            <sphereGeometry args={[width * 0.28, 12, 12]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
        </group>
      ) : config.shape === "officeChair" ? (
        <group>
          {/* Seat */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[width * 0.45, width * 0.45, 0.08, 32]} />
            <meshStandardMaterial color={config.seatColor} />
          </mesh>
          {/* Back */}
          <mesh position={[0, height * 0.25, -depth * 0.35]}>
            <boxGeometry args={[width * 0.8, height * 0.45, 0.08]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, -height * 0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.04, height * 0.4, 16]} />
            <meshStandardMaterial color="#333" metalness={0.5} />
          </mesh>
          {/* Base star */}
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.sin(rad) * 0.2, -height * 0.45, Math.cos(rad) * 0.2]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            );
          })}
        </group>
      ) : (
        // Default box for other furniture
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
    </group>
  );
}
