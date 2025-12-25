// src/ui/ObjectPropertiesPanel.jsx
import { useSelector, useDispatch } from "react-redux";
import { updateObject, removeObject, duplicateObject } from "../store/sceneSlice";
import { clearSelection } from "../store/toolSlice";
import { useState, useEffect } from "react";

export default function ObjectPropertiesPanel() {
  const dispatch = useDispatch();
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const objects = useSelector((s) => s.scene.objects);
  const mode = useSelector((s) => s.viewMode.mode);

  const selectedObject = objects.find((o) => o.id === selectedObjectId);
  
  const [localValues, setLocalValues] = useState({});

  // Update local values when selection changes
  useEffect(() => {
    if (selectedObject) {
      setLocalValues({ ...selectedObject });
    } else {
      setLocalValues({});
    }
  }, [selectedObject]);

  if (!selectedObject || mode !== "2d") return null;

  const handleUpdate = (field, value) => {
    const newValues = { ...localValues, [field]: value };
    setLocalValues(newValues);
    dispatch(updateObject({ id: selectedObjectId, updates: { [field]: value } }));
  };

  const handleDelete = () => {
    dispatch(removeObject(selectedObjectId));
    dispatch(clearSelection());
  };

  const handleDuplicate = () => {
    dispatch(duplicateObject(selectedObjectId));
  };

  const renderWallProperties = () => (
    <>
      <PropertyGroup label="Dimensions">
        <PropertyInput
          label="Height"
          value={localValues.height || 3}
          onChange={(v) => handleUpdate("height", parseFloat(v))}
          type="number"
          min={1}
          max={10}
          step={0.1}
          unit="m"
        />
        <PropertyInput
          label="Thickness"
          value={(localValues.thickness || 0.15) * 100}
          onChange={(v) => handleUpdate("thickness", parseFloat(v) / 100)}
          type="number"
          min={5}
          max={50}
          step={1}
          unit="cm"
        />
      </PropertyGroup>
      <PropertyGroup label="Position">
        <div style={{ fontSize: "12px", color: "#666" }}>
          Start: ({localValues.start?.[0]?.toFixed(2) || 0}, {localValues.start?.[1]?.toFixed(2) || 0})
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          End: ({localValues.end?.[0]?.toFixed(2) || 0}, {localValues.end?.[1]?.toFixed(2) || 0})
        </div>
      </PropertyGroup>
    </>
  );

  const renderDoorProperties = () => (
    <>
      <PropertyGroup label="Dimensions">
        <PropertyInput
          label="Width"
          value={(localValues.width || 0.9) * 100}
          onChange={(v) => handleUpdate("width", parseFloat(v) / 100)}
          type="number"
          min={60}
          max={150}
          step={5}
          unit="cm"
        />
        <PropertyInput
          label="Height"
          value={(localValues.height || 2.1) * 100}
          onChange={(v) => handleUpdate("height", parseFloat(v) / 100)}
          type="number"
          min={180}
          max={280}
          step={5}
          unit="cm"
        />
      </PropertyGroup>
      <PropertyGroup label="Position">
        <PropertyInput
          label="Position on wall"
          value={(localValues.position || 0.5) * 100}
          onChange={(v) => handleUpdate("position", parseFloat(v) / 100)}
          type="number"
          min={10}
          max={90}
          step={1}
          unit="%"
        />
      </PropertyGroup>
    </>
  );

  const renderWindowProperties = () => (
    <>
      <PropertyGroup label="Dimensions">
        <PropertyInput
          label="Width"
          value={(localValues.width || 1.0) * 100}
          onChange={(v) => handleUpdate("width", parseFloat(v) / 100)}
          type="number"
          min={40}
          max={200}
          step={5}
          unit="cm"
        />
        <PropertyInput
          label="Height"
          value={(localValues.height || 1.2) * 100}
          onChange={(v) => handleUpdate("height", parseFloat(v) / 100)}
          type="number"
          min={40}
          max={200}
          step={5}
          unit="cm"
        />
        <PropertyInput
          label="Sill Height"
          value={(localValues.sillHeight || 0.9) * 100}
          onChange={(v) => handleUpdate("sillHeight", parseFloat(v) / 100)}
          type="number"
          min={0}
          max={150}
          step={5}
          unit="cm"
        />
      </PropertyGroup>
    </>
  );

  const renderFurnitureProperties = () => (
    <>
      <PropertyGroup label="Transform">
        <PropertyInput
          label="Rotation"
          value={((localValues.rotation || 0) * 180 / Math.PI)}
          onChange={(v) => handleUpdate("rotation", parseFloat(v) * Math.PI / 180)}
          type="number"
          min={0}
          max={360}
          step={15}
          unit="°"
        />
      </PropertyGroup>
      <PropertyGroup label="Position">
        <div style={{ fontSize: "12px", color: "#666" }}>
          X: {localValues.position?.[0]?.toFixed(2) || 0}m, Y: {localValues.position?.[1]?.toFixed(2) || 0}m
        </div>
      </PropertyGroup>
    </>
  );

  const renderTextProperties = () => (
    <>
      <PropertyGroup label="Content">
        <textarea
          value={localValues.text || ""}
          onChange={(e) => handleUpdate("text", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "13px",
            resize: "vertical",
            minHeight: "60px",
            fontFamily: "inherit",
          }}
        />
      </PropertyGroup>
      <PropertyGroup label="Style">
        <PropertyInput
          label="Font Size"
          value={(localValues.fontSize || 0.2) * 100}
          onChange={(v) => handleUpdate("fontSize", parseFloat(v) / 100)}
          type="number"
          min={10}
          max={100}
          step={5}
          unit="cm"
        />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "12px", color: "#666", flex: 1 }}>Color</label>
          <input
            type="color"
            value={localValues.color || "#333333"}
            onChange={(e) => handleUpdate("color", e.target.value)}
            style={{
              width: "60px",
              height: "28px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      </PropertyGroup>
    </>
  );

  const renderProperties = () => {
    switch (selectedObject.type) {
      case "wall":
        return renderWallProperties();
      case "door":
        return renderDoorProperties();
      case "window":
        return renderWindowProperties();
      case "furniture":
        return renderFurnitureProperties();
      case "text":
        return renderTextProperties();
      default:
        return <div style={{ fontSize: "12px", color: "#999" }}>No properties available</div>;
    }
  };

  const getTypeIcon = () => {
    switch (selectedObject.type) {
      case "wall": return "▭";
      case "door": return "🚪";
      case "window": return "🪟";
      case "furniture": return "🛋️";
      case "text": return "T";
      default: return "📦";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 240,
        left: 16,
        width: "280px",
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: 999998,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{getTypeIcon()}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a2e" }}>
            {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}
          </div>
          <div style={{ fontSize: "11px", color: "#999" }}>
            {selectedObjectId}
          </div>
        </div>
        <button
          onClick={() => dispatch(clearSelection())}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            fontSize: "18px",
            color: "#999",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          ×
        </button>
      </div>

      {/* Properties */}
      <div style={{ padding: "12px 16px" }}>
        {renderProperties()}
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={handleDuplicate}
          style={{
            flex: 1,
            padding: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#1a1a2e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          📋 Duplicate
        </button>
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#dc2626",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

function PropertyGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

function PropertyInput({ label, value, onChange, type = "text", min, max, step, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label style={{ fontSize: "12px", color: "#666", flex: 1 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          style={{
            width: "70px",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "13px",
            textAlign: "right",
          }}
        />
        {unit && (
          <span style={{ fontSize: "11px", color: "#999", width: "24px" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

