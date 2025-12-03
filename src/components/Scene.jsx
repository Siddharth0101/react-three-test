// Scene.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";

import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera
} from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import {
  startLine,
  addLinePoint,
  resetLine
} from "../store/toolSlice";

import LinePreview from "./objects/LinePreview";

export default function Scene() {
  const mode = useSelector((s) => s.viewMode.mode);
  const tool = useSelector((s) => s.tool);
  const dispatch = useDispatch();

  const { camera, mouse } = useThree();

  // mousePoint for preview line
  const [mousePoint, setMousePoint] = useState(null);

  // Convert screen click to XY world coords (Z=0 plane)
  function getWorldPoint(event) {
    const raycaster = new THREE.Raycaster();
    const point = new THREE.Vector3();

    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    mouse.x = x;
    mouse.y = y;

    raycaster.setFromCamera(mouse, camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z=0 plane
    raycaster.ray.intersectPlane(plane, point);

    return [point.x, point.y, 0];
  }

  // Handle clicks for line-drawing
  function handleCanvasClick(e) {
     console.log("CLICK RECEIVED");
    if (mode !== "2d") return;
    if (tool.selectedTool !== "line") return;

    const p = getWorldPoint(e);

    // AUTO CLOSE: if click near first point
    if (tool.currentPoints.length >= 2) {
      const [fx, fy] = tool.currentPoints[0];
      const [x, y] = p;

      const dist = Math.sqrt((fx - x) ** 2 + (fy - y) ** 2);
      if (dist < 0.1) {
        // add first point again to close
        dispatch(addLinePoint(tool.currentPoints[0]));
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

  // Handle mouse movement → preview line point
  function handleCanvasMove(e) {
    if (tool.isDrawing && tool.currentPoints.length > 0) {
      const p = getWorldPoint(e);
      setMousePoint(p);
    }
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
          {/* 3D MODE */}
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls />
        </>
      ) : (
        <>
          {/* 2D MODE */}
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

          {/* Attach pointer handlers ONLY in 2D mode */}
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

      {/* Render scene objects from JSON */}
      {data.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}

      {/* PREVIEW LINE (only when drawing) */}
      {tool.isDrawing && mousePoint && mode === "2d" && (
        <LinePreview mousePoint={mousePoint} />
      )}
    </>
  );
}