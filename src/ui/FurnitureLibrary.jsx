// src/ui/FurnitureLibrary.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTool } from "../store/toolSlice";
import { FURNITURE_TYPES } from "../components/objects/FurnitureObj";

const CATEGORIES = {
  living: { label: "Living Room", icon: "🛋️" },
  bedroom: { label: "Bedroom", icon: "🛏️" },
  dining: { label: "Dining", icon: "🍽️" },
  kitchen: { label: "Kitchen", icon: "🍳" },
  bathroom: { label: "Bathroom", icon: "🚿" },
  office: { label: "Office", icon: "💼" },
  decor: { label: "Decor", icon: "🪴" },
};

export default function FurnitureLibrary() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("living");
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);

  if (mode !== "2d") return null;

  const furnitureInCategory = Object.entries(FURNITURE_TYPES).filter(
    ([_, config]) => config.category === selectedCategory
  );

  const handleSelectFurniture = (type) => {
    setSelectedFurniture(type);
    dispatch(selectTool({ tool: "furniture", furnitureType: type }));
    setIsOpen(false);
  };

  return (
    <>
      {/* Furniture Library Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 70,
          right: 16,
          padding: "8px 14px",
          borderRadius: "10px",
          background: isOpen ? "#1a1a2e" : "rgba(255, 255, 255, 0.95)",
          color: isOpen ? "white" : "#1a1a2e",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          zIndex: 999998,
          transition: "all 0.2s ease",
        }}
      >
        <span>🪑</span> Furniture
      </button>

      {/* Library Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 110,
            right: 16,
            width: "320px",
            maxHeight: "70vh",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 999998,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              fontWeight: 700,
              fontSize: "15px",
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🪑 Furniture Library</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              padding: "12px",
              borderBottom: "1px solid #eee",
            }}
          >
            {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: selectedCategory === key ? "#1a1a2e" : "#f0f0f0",
                  color: selectedCategory === key ? "white" : "#333",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.15s",
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Furniture Grid */}
          <div
            style={{
              padding: "12px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              {furnitureInCategory.map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleSelectFurniture(type)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "10px",
                    border: selectedFurniture === type 
                      ? "2px solid #2196F3" 
                      : "1px solid #e0e0e0",
                    background: selectedFurniture === type 
                      ? "#E3F2FD" 
                      : "white",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.15s",
                  }}
                >
                  {/* Furniture Preview */}
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      background: config.color,
                      borderRadius: config.shape === "circle" ? "50%" : "4px",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "#333" }}>
                    {config.label}
                  </div>
                  <div style={{ fontSize: "9px", color: "#888" }}>
                    {config.width}m × {config.depth}m
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div
            style={{
              padding: "12px",
              background: "#f8f8f8",
              borderTop: "1px solid #eee",
              fontSize: "11px",
              color: "#666",
              textAlign: "center",
            }}
          >
            💡 Click on an item, then click on the canvas to place it
          </div>
        </div>
      )}
    </>
  );
}

