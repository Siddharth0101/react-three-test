// src/components/tools/TextTool.jsx
import { useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useDispatch, useSelector } from "react-redux";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { addText } from "../../store/sceneSlice";
import { selectDefaultTool } from "../../store/toolSlice";

export default function TextTool() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);
  const { camera, raycaster, pointer } = useThree();

  const [clickPos, setClickPos] = useState(null);
  const [cursorPos, setCursorPos] = useState([0, 0]);
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(0.2);

  const isActive = selectedTool === "text";

  // Get world position from pointer
  const getWorldPosition = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return [intersection.x, intersection.y];
  }, [camera, raycaster, pointer]);

  // Update cursor position
  useEffect(() => {
    if (!isActive || mode !== "2d") return;

    const interval = setInterval(() => {
      const pos = getWorldPosition();
      setCursorPos(pos);
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, mode, getWorldPosition]);

  const handleClick = useCallback(
    (event) => {
      if (!isActive || clickPos) return;
      event.stopPropagation();
      setClickPos(cursorPos);
    },
    [isActive, clickPos, cursorPos]
  );

  const handleSubmit = useCallback(() => {
    if (!inputText.trim() || !clickPos) return;

    dispatch(
      addText({
        text: inputText.trim(),
        position: clickPos,
        fontSize,
        color: "#333333",
      })
    );

    setInputText("");
    setClickPos(null);
  }, [dispatch, inputText, clickPos, fontSize]);

  const handleCancel = useCallback(() => {
    setInputText("");
    setClickPos(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel]
  );

  if (!isActive || mode !== "2d") return null;

  return (
    <group>
      {/* Click catcher */}
      {!clickPos && (
        <mesh position={[0, 0, 0.01]} onClick={handleClick}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}

      {/* Cursor preview */}
      {!clickPos && (
        <group position={[cursorPos[0], cursorPos[1], 0.3]}>
          <Text
            fontSize={fontSize}
            color="#666666"
            anchorX="left"
            anchorY="middle"
          >
            Aa
          </Text>
          <mesh position={[fontSize * 1.2, 0, -0.01]}>
            <planeGeometry args={[0.02, fontSize * 1.2]} />
            <meshBasicMaterial color="#2563eb" />
          </mesh>
        </group>
      )}

      {/* Text input popup */}
      {clickPos && (
        <Html position={[clickPos[0], clickPos[1], 0.5]} center>
          <div
            style={{
              background: "white",
              padding: "12px",
              borderRadius: "10px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              minWidth: "240px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "8px", fontWeight: 600, fontSize: "13px", color: "#333" }}>
              Add Text Annotation
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Enter text..."
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "8px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>Size:</label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: "11px", color: "#999", width: "40px" }}>
                {(fontSize * 100).toFixed(0)}cm
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: inputText.trim() ? "#2563eb" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: inputText.trim() ? "pointer" : "not-allowed",
                  fontWeight: 500,
                  fontSize: "13px",
                }}
              >
                Add
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

