// src/ui/SelectionInfo.jsx
import { useDispatch, useSelector } from "react-redux";
import { removeObject, duplicateObject } from "../store/sceneSlice";
import { clearSelection } from "../store/toolSlice";
import { FURNITURE_TYPES } from "../components/objects/FurnitureObj";

export default function SelectionInfo() {
  const dispatch = useDispatch();
  const selectedId = useSelector((s) => s.tool.selectedObjectId);
  const objects = useSelector((s) => s.scene.objects);
  const mode = useSelector((s) => s.viewMode.mode);

  const selectedObject = objects.find((o) => o.id === selectedId);

  if (!selectedObject || mode !== "2d") return null;

  const handleDelete = () => {
    dispatch(removeObject(selectedId));
    dispatch(clearSelection());
  };

  const handleDuplicate = () => {
    dispatch(duplicateObject(selectedId));
  };

  // Get object-specific info
  const getObjectInfo = () => {
    switch (selectedObject.type) {
      case "wall": {
        const dx = selectedObject.end[0] - selectedObject.start[0];
        const dy = selectedObject.end[1] - selectedObject.start[1];
        const length = Math.sqrt(dx * dx + dy * dy);
        return [
          { label: "Length", value: `${length.toFixed(2)}m` },
          { label: "Height", value: `${selectedObject.height}m` },
          { label: "Thickness", value: `${(selectedObject.thickness * 100).toFixed(0)}cm` },
        ];
      }
      case "door":
        return [
          { label: "Width", value: `${selectedObject.width}m` },
          { label: "Height", value: `${selectedObject.height}m` },
          { label: "Position", value: `${(selectedObject.position * 100).toFixed(0)}%` },
        ];
      case "window":
        return [
          { label: "Width", value: `${selectedObject.width}m` },
          { label: "Height", value: `${selectedObject.height}m` },
          { label: "Sill Height", value: `${selectedObject.sillHeight}m` },
        ];
      case "furniture": {
        const config = FURNITURE_TYPES[selectedObject.furnitureType] || {};
        return [
          { label: "Type", value: config.label || selectedObject.furnitureType },
          { label: "Size", value: `${config.width}m × ${config.depth}m` },
        ];
      }
      case "text":
        return [
          { label: "Text", value: selectedObject.text?.substring(0, 15) + "..." },
        ];
      default:
        return [];
    }
  };

  const objectInfo = getObjectInfo();
  const typeLabels = { 
    wall: "🧱 Wall", 
    door: "🚪 Door", 
    window: "🪟 Window",
    furniture: "🪑 Furniture",
    text: "📝 Text",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 110,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(26, 26, 46, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        gap: "20px",
        color: "white",
      }}
    >
      {/* Object type */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>
          {typeLabels[selectedObject.type] || selectedObject.type}
        </span>
        <span style={{ fontSize: "11px", color: "#888", fontFamily: "monospace" }}>
          {selectedObject.id}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.2)" }} />

      {/* Object info */}
      {objectInfo.map((info, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#888", marginBottom: "2px" }}>
            {info.label}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 500 }}>{info.value}</div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.2)" }} />

      {/* Duplicate button */}
      <button
        onClick={handleDuplicate}
        title="Duplicate (Ctrl+D)"
        style={{
          padding: "6px 12px",
          background: "rgba(255,255,255,0.15)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        📋 Duplicate
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        title="Delete (Del)"
        style={{
          padding: "6px 12px",
          background: "#ff5252",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        🗑 Delete
      </button>

      {/* Close button */}
      <button
        onClick={() => dispatch(clearSelection())}
        style={{
          padding: "4px 8px",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

