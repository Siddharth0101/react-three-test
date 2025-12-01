// Scene.jsx
import React from "react";
import { useSelector } from "react-redux";
import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera
} from "@react-three/drei";

export default function Scene() {
  const mode = useSelector((state) => state.viewMode.mode);

  return (
    <>
      {/* Background: white in 2D, black in 3D */}
      <color
        attach="background"
        args={mode === "2d" ? ["#ffffff"] : ["#000000"]}
      />

      {mode === "3d" ? (
        <>
          {/* ===== 3D MODE ===== */}
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls />
        </>
      ) : (
        <>
          {/* ===== 2D MODE ===== */}
          <OrthographicCamera
            makeDefault
            position={[0, 0, 10]}
            zoom={80}     // base zoom level
          />

          <OrbitControls
            makeDefault={false} // IMPORTANT — so it doesn't override camera
            enableRotate={false}
            enablePan={true}
            enableZoom={true}
            zoomSpeed={0.5}
            panSpeed={0.5}
            minZoom={20}
            maxZoom={200}
          />
        </>
      )}

      {/* Render scene objects */}
      {data.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </>
  );
}