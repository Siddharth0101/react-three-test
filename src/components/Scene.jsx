// src/components/Scene.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";

import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  startLine,
  addLinePoint,
  resetLine,
} from "../store/toolSlice";

import LinePreview from "./objects/LinePreview";
import LineObj from "./objects/LineObj";

export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);
  const tool = useSelector((s) => s.tool);
  const dispatch = useDispatch();

  const { camera, gl } = useThree();

  // local state to store finished lines
  const [drawnLines, setDrawnLines] = useState([]);
  // mouse position in world space for preview
  const [mousePoint, setMousePoint] = useState(null);

  // Convert screen coords to world coords on Z=0 plane
  function getWorldPoint(event) {
    const raycaster = new THREE.Raycaster();
    const point = new THREE.Vector3();

    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera({ x, y }, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
    raycaster.ray.intersectPlane(plane, point);

    return [point.x, point.y, 0];
  }

  // Click handler for line tool
  function handleCanvasClick(e) {
    if (mode !== "2d") return;
    if (tool.selectedTool !== "line") return;

    const p = getWorldPoint(e);

    // Auto-close if near the first point
    if (tool.currentPoints.length >= 2) {
      const [fx, fy] = tool.currentPoints[0];
      const [x, y] = p;

      const dist = Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);

      // more generous distance so user can close shape easily
      if (dist < 0.3) {
        const closedPoints = [...tool.currentPoints, tool.currentPoints[0]];

        // save closed polyline as permanent line object
        setDrawnLines((prev) => [
          ...prev,
          {
            id: "line-" + Date.now(),
            type: "line",
            points: closedPoints,
          },
        ]);

        dispatch(resetLine());
        setMousePoint(null);
        return;
      }
    }

    if (!tool.isDrawing) {
      dispatch(startLine(p));
    } else {
      dispatch(addLinePoint(p));
    }
  }

  // Mouse move handler for preview
  function handleCanvasMove(e) {
    if (mode !== "2d") return;
    if (tool.selectedTool !== "line") return;
    if (!tool.isDrawing || tool.currentPoints.length === 0) return;

    const p = getWorldPoint(e);
    setMousePoint(p);
  }

  return (
    <>
      {/* Background */}
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
            zoom={80}
          />

          <OrbitControls
            makeDefault={false}
            enableRotate={false}
            enablePan={true}
            enableZoom={true}
            zoomSpeed={0.5}
            panSpeed={0.5}
            minZoom={20}
            maxZoom={200}
          />

          {/* Invisible big plane to catch clicks & moves */}
          <mesh
            position={[0, 0, 0]}
            onPointerDown={handleCanvasClick}
            onPointerMove={handleCanvasMove}
          >
            <planeGeometry args={[10000, 10000]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </>
      )}

      {/* Objects from JSON */}
      {data.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}

      {/* Already-drawn permanent lines */}
      {drawnLines.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}

      {/* Current polyline segments while drawing (previous lines visible) */}
      {tool.isDrawing &&
        tool.currentPoints.length >= 2 &&
        mode === "2d" && (
          <LineObj points={tool.currentPoints} />
        )}

      {/* Preview from last point -> mouse */}
      {tool.isDrawing && mousePoint && mode === "2d" && (
        <LinePreview mousePoint={mousePoint} />
      )}
    </>
  );
}