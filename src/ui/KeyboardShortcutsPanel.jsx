// src/ui/KeyboardShortcutsPanel.jsx
import { useState, useEffect } from "react";

export default function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle with ? key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    {
      category: "Tools",
      items: [
        { keys: ["V"], description: "Select tool" },
        { keys: ["W"], description: "Wall tool" },
        { keys: ["D"], description: "Door tool" },
        { keys: ["N"], description: "Window tool" },
        { keys: ["T"], description: "Text tool" },
        { keys: ["M"], description: "Measure tool" },
        { keys: ["Esc"], description: "Cancel / Deselect" },
      ],
    },
    {
      category: "Edit",
      items: [
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Y"], description: "Redo" },
        { keys: ["Ctrl", "D"], description: "Duplicate selected" },
        { keys: ["Del"], description: "Delete selected" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { keys: ["Scroll"], description: "Zoom in/out" },
        { keys: ["Click + Drag"], description: "Pan view (2D)" },
        { keys: ["Right Click + Drag"], description: "Rotate view (3D)" },
      ],
    },
    {
      category: "Help",
      items: [
        { keys: ["?"], description: "Toggle this panel" },
      ],
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 46,
          right: 16,
          width: "36px",
          height: "36px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          fontWeight: 600,
          color: "#666",
          zIndex: 999997,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1a1a2e";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
          e.currentTarget.style.color = "#666";
        }}
        title="Keyboard Shortcuts (?)"
      >
        ?
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 999998,
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: "16px",
          padding: "28px 32px",
          zIndex: 999999,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "520px",
          width: "90vw",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}
              >
                {section.category}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {item.description}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {item.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              background: "white",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontFamily: "SF Mono, Monaco, monospace",
                              fontWeight: 500,
                              color: "#333",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {key}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span style={{ margin: "0 2px", color: "#999" }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid #eee",
            fontSize: "12px",
            color: "#999",
            textAlign: "center",
          }}
        >
          Press <kbd style={{ padding: "2px 6px", background: "#f0f0f0", borderRadius: "4px" }}>?</kbd> to toggle this panel
        </div>
      </div>
    </>
  );
}

