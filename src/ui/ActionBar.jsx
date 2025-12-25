// src/ui/ActionBar.jsx
import { useDispatch, useSelector } from "react-redux";
import { undo, redo, clearObjects, duplicateObject, removeObject } from "../store/sceneSlice";
import { clearSelection } from "../store/toolSlice";
import { useState } from "react";

export default function ActionBar() {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.scene.history);
  const future = useSelector((s) => s.scene.future);
  const objects = useSelector((s) => s.scene.objects);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const hasObjects = objects.length > 0;
  const hasSelection = !!selectedObjectId;

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    dispatch(clearObjects());
    dispatch(clearSelection());
    setShowClearConfirm(false);
  };

  const handleDuplicate = () => {
    if (selectedObjectId) {
      dispatch(duplicateObject(selectedObjectId));
    }
  };

  const handleDelete = () => {
    if (selectedObjectId) {
      dispatch(removeObject(selectedObjectId));
      dispatch(clearSelection());
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 999998,
        }}
      >
        {/* Undo/Redo buttons */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            padding: "6px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <ActionButton
            icon="↩"
            label="Undo"
            shortcut="Ctrl+Z"
            onClick={() => dispatch(undo())}
            disabled={!canUndo}
          />
          <ActionButton
            icon="↪"
            label="Redo"
            shortcut="Ctrl+Y"
            onClick={() => dispatch(redo())}
            disabled={!canRedo}
          />
        </div>

        {/* Selection actions */}
        {hasSelection && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              padding: "6px",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <ActionButton
              icon="📋"
              label="Duplicate"
              shortcut="Ctrl+D"
              onClick={handleDuplicate}
            />
            <ActionButton
              icon="🗑"
              label="Delete"
              shortcut="Del"
              onClick={handleDelete}
              danger
            />
          </div>
        )}

        {/* Clear button */}
        {hasObjects && !hasSelection && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              padding: "6px",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <ActionButton
              icon="🗑"
              label="Clear All"
              onClick={handleClear}
              danger
            />
          </div>
        )}

        {/* Object count */}
        {hasObjects && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#666",
              fontWeight: 500,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {objects.length} object{objects.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              zIndex: 999999,
            }}
            onClick={() => setShowClearConfirm(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 1000000,
              maxWidth: "360px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600, color: "#1a1a2e" }}>
              Clear All Objects?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
              This will remove all {objects.length} objects from your floor plan. 
              You can undo this action.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f5f5f5",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                style={{
                  padding: "10px 20px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ActionButton({ icon, label, shortcut, onClick, disabled, danger }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "10px 14px",
        background: disabled
          ? "#f8f8f8"
          : danger && isHovered
          ? "#fef2f2"
          : isHovered
          ? "#f0f0f0"
          : "white",
        color: disabled
          ? "#ccc"
          : danger
          ? "#dc2626"
          : "#1a1a2e",
        border: "none",
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.15s ease",
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: "15px" }}>{icon}</span>
      <span style={{ fontSize: "13px" }}>{label}</span>
    </button>
  );
}
