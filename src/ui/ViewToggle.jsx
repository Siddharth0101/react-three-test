import { useDispatch, useSelector } from "react-redux";
import { setMode } from "../store/viewModeSlice";

export default function ViewToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.viewMode.mode);

  const modes = [
    { id: "2d", label: "2D Plan", icon: "📐" },
    { id: "3d", label: "3D View", icon: "🏠" },
    { id: "walkthrough", label: "Walkthrough", icon: "🚶" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        display: "flex",
        gap: "4px",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "6px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => dispatch(setMode(m.id))}
          style={{
            padding: "8px 16px",
            background: mode === m.id ? "#1a1a2e" : "transparent",
            color: mode === m.id ? "white" : "#1a1a2e",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: mode === m.id ? 600 : 400,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ fontSize: "16px" }}>{m.icon}</span>
          {m.label}
        </button>
      ))}

      {/* Instructions for walkthrough mode */}
      {mode === "walkthrough" && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            background: "rgba(26, 26, 46, 0.95)",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          <strong>Click to look around</strong> • WASD or Arrows to move • ESC
          to unlock mouse
        </div>
      )}
    </div>
  );
}
