// App.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./components/Scene";

export default function App() {
  return (
    <Canvas
      camera={{ position: [5, 5, 5] }}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Scene />
    </Canvas>

  );
}