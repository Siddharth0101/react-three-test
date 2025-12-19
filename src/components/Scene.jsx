// src/components/Scene.jsx
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";
import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
  Grid,
} from "@react-three/drei";
import * as THREE from "three";

export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);
  const controls3dRef = useRef();
  const controls2dRef = useRef();

  // Enable zoom to cursor for 3D controls
  useEffect(() => {
    if (controls3dRef.current) {
      // drei's OrbitControls ref gives direct access to the controls instance
      const controls = controls3dRef.current;
      if (controls) {
        controls.zoomToCursor = true;
      }
    }
  }, [mode]);

  // Enable zoom to cursor for 2D controls
  useEffect(() => {
    if (controls2dRef.current) {
      // drei's OrbitControls ref gives direct access to the controls instance
      const controls = controls2dRef.current;
      if (controls) {
        controls.zoomToCursor = true;
      }
    }
  }, [mode]);

  const renderObjects = () => (
    <>
      {data.objects.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
    </>
  );

  return (
    <>
      <color attach="background" args={[mode === "2d" ? "#ffffff" : "#101010"]} />

      {mode === "3d" ? (
        <>
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
          
          {renderObjects()}
        </>
      ) : (
        <>
          <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={80} />
          <OrbitControls
            ref={controls2dRef}
            enableRotate={false}
            enablePan
            enableZoom
            zoomSpeed={0.8}
            minZoom={20}
            maxZoom={200}
            zoomToCursor
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />

          <Grid
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, -0.1]}
            args={[200, 200]}
            cellSize={0.25}
            sectionSize={1}
            cellThickness={0.8}
            sectionThickness={1.5}
            cellColor="#e0e0e0"
            sectionColor="#b0b0b0"
            fadeDistance={200}
            fadeStrength={0.4}
            infiniteGrid={true}
          />

          <mesh position={[0, 0, -0.2]}>
            <planeGeometry args={[1000, 1000]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          {renderObjects()}
        </>
      )}
    </>
  );
}