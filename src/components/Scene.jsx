// src/components/Scene.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import data from "../data/scene.json";

import ObjectRenderer from "./ObjectRenderer";
import LinePreview from "./objects/LinePreview";
import LineObj from "./objects/LineObj";

import {
  OrthographicCamera,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";

import {
  startLine,
  addLinePoint,
  resetLine,
} from "../store/toolSlice";

export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);
  const tool = useSelector((s) => s.tool);
  const dispatch = useDispatch();

  const [drawnLines, setDrawnLines] = useState([]);
  const [mousePoint, setMousePoint] = useState(null);

  const handleCanvasClick = (e) => {
    if (mode !== "2d") return;
    if (tool.selectedTool !== "line") return;

    const p = [e.point.x, e.point.y, e.point.z];

    if (tool.currentPoints.length >= 2) {
      const [fx, fy] = tool.currentPoints[0];
      const [x, y] = p;
      const dist = Math.hypot(fx - x, fy - y);

      if (dist < 0.3) {
        const closed = [...tool.currentPoints, tool.currentPoints[0]];
        setDrawnLines((prev) => [
          ...prev,
          { id: "line-" + Date.now(), type: "line", points: closed },
        ]);
        dispatch(resetLine());
        setMousePoint(null);
        return;
      }
    }

    !tool.isDrawing ? dispatch(startLine(p)) : dispatch(addLinePoint(p));
  };

  const handleCanvasMove = (e) => {
    if (mode !== "2d") return;
    if (tool.selectedTool !== "line") return;
    if (!tool.isDrawing) return;
    if (tool.currentPoints.length === 0) return;

    setMousePoint([e.point.x, e.point.y, e.point.z]);
  };

  const renderObjects = () => (
    <>
      {data.objects.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
      {drawnLines.map((o) => (
        <ObjectRenderer key={o.id} obj={o} />
      ))}
      {tool.isDrawing && tool.currentPoints.length >= 2 && mode === "2d" && (
        <LineObj points={tool.currentPoints} />
      )}
      {tool.isDrawing && mousePoint && mode === "2d" && (
        <LinePreview mousePoint={mousePoint} />
      )}
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

          <mesh onPointerDown={handleCanvasClick} onPointerMove={handleCanvasMove}>
            <planeGeometry args={[10000, 10000]} />
            <meshBasicMaterial visible={false} />
          </mesh>

          {renderObjects()}
        </>
      )}
    </>
  );
}