// src/components/Scene.jsx
import React from "react";
import { useSelector } from "react-redux";
import data from "../data/scene.json";

import ObjectRenderer from "./ObjectRenderer";

import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";


export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);

  const renderObjects = () => (
    <>
      {data.objects.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
    </>
  );

  return (
    <>
      <color attach="background" args={[mode === "2d" ? "#ffffff" : "#000000"]} />

      {mode === "3d" ? (
        <>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls />
          {renderObjects()}
        </>
      ) : (
        <>
          <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={80} />

          <OrbitControls
            enableRotate={false}
            enablePan
            enableZoom
            zoomSpeed={0.5}
            panSpeed={0.5}
            minZoom={20}
            maxZoom={200}
          />

          <mesh>
            <planeGeometry args={[10000, 10000]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          {renderObjects()}
        </>
      )}
    </>
  );
}