// src/ui/ActionBar.jsx
import { useDispatch, useSelector } from "react-redux";
import { undo, redo, clearObjects } from "../store/sceneSlice";

export default function ActionBar() {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.scene.history);
  const future = useSelector((s) => s.scene.future);
  const objects = useSelector((s) => s.scene.objects);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const hasObjects = objects.length > 0;

  return (
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
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "6px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
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

      {/* Clear button */}
      {hasObjects && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            padding: "6px",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <ActionButton
            icon="🗑"
            label="Clear All"
            onClick={() => {
              if (window.confirm("Clear all objects? This action can be undone.")) {
                dispatch(clearObjects());
              }
            }}
            danger
          />
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, shortcut, onClick, disabled, danger }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      style={{
        padding: "8px 12px",
        background: disabled
          ? "#f5f5f5"
          : danger
          ? "#fff5f5"
          : "white",
        color: disabled
          ? "#ccc"
          : danger
          ? "#d32f2f"
          : "#1a1a2e",
        border: "none",
        borderRadius: "6px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.15s ease",
        fontWeight: 500,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.background = danger ? "#ffebee" : "#f0f0f0";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.background = danger ? "#fff5f5" : "white";
        }
      }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: "12px" }}>{label}</span>
    </button>
  );
}

