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
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls />
        </>
      ) : (
        <>
          {/* Flat front orthographic camera */}
          <OrthographicCamera
            makeDefault
            position={[0, 0, 10]}
            zoom={80}
          />
          {/* no lights needed for basic line / basic materials */}
        </>
      )}

      {data.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </>
  );
}