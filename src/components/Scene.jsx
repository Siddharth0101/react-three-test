// src/components/Scene.jsx
import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFrame, useThree } from "@react-three/fiber";
import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";
import WallTool from "./tools/WallTool";
import DoorWindowTool from "./tools/DoorWindowTool";
import FirstPersonControls from "./FirstPersonControls";
import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
  Grid,
  Sky,
  Environment,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { clearSelection } from "../store/toolSlice";
import CursorPosition from "../ui/CursorPosition";
import FurnitureTool from "./tools/FurnitureTool";
import MiniMap from "../ui/MiniMap";

// Adaptive grid component for 2D mode
function AdaptiveGrid2D() {
  const { camera } = useThree();
  const [gridConfig, setGridConfig] = useState({
    cellSize: 0.25,
    sectionSize: 1,
  });

  useFrame(() => {
    const zoom = camera.zoom;

    let cellSize, sectionSize;

    if (zoom < 30) {
      cellSize = 1;
      sectionSize = 5;
    } else if (zoom < 60) {
      cellSize = 0.5;
      sectionSize = 2;
    } else if (zoom < 120) {
      cellSize = 0.25;
      sectionSize = 1;
    } else if (zoom < 250) {
      cellSize = 0.1;
      sectionSize = 0.5;
    } else {
      cellSize = 0.05;
      sectionSize = 0.25;
    }

    if (
      cellSize !== gridConfig.cellSize ||
      sectionSize !== gridConfig.sectionSize
    ) {
      setGridConfig({ cellSize, sectionSize });
    }
  });

  return (
    <Grid
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.1]}
      args={[200, 200]}
      cellSize={gridConfig.cellSize}
      sectionSize={gridConfig.sectionSize}
      cellThickness={0.6}
      sectionThickness={1.2}
      cellColor="#d0d0d0"
      sectionColor="#a0a0a0"
      fadeDistance={100}
      fadeStrength={1}
      infiniteGrid={true}
    />
  );
}

// Floor component for walkthrough mode
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#b8a99a" roughness={0.8} />
    </mesh>
  );
}

export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);
  const sceneObjects = useSelector((s) => s.scene.objects);
  const controls3dRef = useRef();
  const controls2dRef = useRef();

  useEffect(() => {
    if (controls3dRef.current) {
      controls3dRef.current.zoomToCursor = true;
    }
  }, [mode]);

  useEffect(() => {
    if (controls2dRef.current) {
      controls2dRef.current.zoomToCursor = true;
    }
  }, [mode]);

  const renderStaticObjects = () => (
    <>
      {data.objects.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
    </>
  );

  const renderDynamicObjects = () => (
    <>
      {sceneObjects.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
    </>
  );

  // 3D Orbit View
  if (mode === "3d") {
    return (
      <>
        <color attach="background" args={["#101010"]} />
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls
          ref={controls3dRef}
          makeDefault
          zoomToCursor
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />

        <Grid
          position={[0, -0.01, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#2a2a2a"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#4a4a4a"
          fadeDistance={80}
          fadeStrength={0.5}
          infiniteGrid
        />

        {renderStaticObjects()}
        {renderDynamicObjects()}
      </>
    );
  }

  // Walkthrough / First Person View
  if (mode === "walkthrough") {
    return (
      <>
        <color attach="background" args={["#87ceeb"]} />
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={1000} />
        <FirstPersonControls />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <hemisphereLight
          skyColor="#87ceeb"
          groundColor="#8b7355"
          intensity={0.4}
        />

        {/* Sky */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0.5}
          azimuth={0.25}
        />

        {/* Floor */}
        <Floor />

        {/* Subtle grid on floor */}
        <Grid
          position={[0, 0.01, 0]}
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.3}
          cellColor="#9a8a7a"
          sectionSize={5}
          sectionThickness={0.8}
          sectionColor="#7a6a5a"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid
        />

        {renderStaticObjects()}
        {renderDynamicObjects()}
      </>
    );
  }

  // 2D Plan View (default)
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={80} />
      <OrbitControls
        ref={controls2dRef}
        enableRotate={false}
        enablePan
        enableZoom
        zoomSpeed={0.8}
        minZoom={10}
        maxZoom={500}
        zoomToCursor
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      <AdaptiveGrid2D />

      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {renderStaticObjects()}
      {renderDynamicObjects()}

      <WallTool />
      <DoorWindowTool />
      <FurnitureTool />
      
      {/* Zoom Controls UI */}
      <ZoomControlsUI />
      
      {/* Cursor Position Display */}
      <CursorPosition />
      
      {/* Mini Map */}
      <MiniMap />
    </>
  );
}

// Zoom Controls Component
function ZoomControlsUI() {
  const { camera } = useThree();

  const handleZoomIn = () => {
    if (camera.zoom < 500) {
      camera.zoom = Math.min(camera.zoom * 1.3, 500);
      camera.updateProjectionMatrix();
    }
  };

  const handleZoomOut = () => {
    if (camera.zoom > 10) {
      camera.zoom = Math.max(camera.zoom / 1.3, 10);
      camera.updateProjectionMatrix();
    }
  };

  const handleResetView = () => {
    camera.zoom = 80;
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();
  };

  return (
    <Html
      calculatePosition={() => [0, 0]}
      style={{
        position: "fixed",
        bottom: "80px",
        left: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "6px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <ZoomBtn onClick={handleZoomIn} title="Zoom In">+</ZoomBtn>
        <ZoomBtn onClick={handleResetView} title="Reset View" small>⟲</ZoomBtn>
        <ZoomBtn onClick={handleZoomOut} title="Zoom Out">−</ZoomBtn>
      </div>
    </Html>
  );
}

function ZoomBtn({ onClick, title, children, small }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: "32px",
        height: "32px",
        border: "none",
        borderRadius: "6px",
        background: "white",
        color: "#1a1a2e",
        fontSize: small ? "14px" : "20px",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
      onMouseLeave={(e) => (e.target.style.background = "white")}
    >
      {children}
    </button>
  );
}
