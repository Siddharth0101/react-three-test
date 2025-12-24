// src/ui/SettingsPanel.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSnapToGrid,
  setGridSize,
  toggleShowMeasurements,
  setDefaultWallHeight,
} from "../store/settingsSlice";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.settings);

  return (
    <>
      {/* Settings toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 16,
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: isOpen ? "#1a1a2e" : "rgba(255, 255, 255, 0.95)",
          color: isOpen ? "white" : "#1a1a2e",
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999998,
          transition: "all 0.2s ease",
        }}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Settings panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 70,
            width: "280px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            border: "1px solid rgba(0,0,0,0.1)",
            zIndex: 999998,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              fontWeight: 700,
              fontSize: "15px",
              color: "#1a1a2e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚙️</span> Settings
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Grid Section */}
            <SettingSection title="Grid & Snapping">
              <ToggleSetting
                label="Snap to Grid"
                checked={settings.snapToGrid}
                onChange={() => dispatch(toggleSnapToGrid())}
              />
              <SelectSetting
                label="Grid Size"
                value={settings.gridSize}
                options={[
                  { value: 0.1, label: "10cm" },
                  { value: 0.25, label: "25cm" },
                  { value: 0.5, label: "50cm" },
                  { value: 1, label: "1m" },
                ]}
                onChange={(v) => dispatch(setGridSize(parseFloat(v)))}
              />
              <ToggleSetting
                label="Show Measurements"
                checked={settings.showMeasurements}
                onChange={() => dispatch(toggleShowMeasurements())}
              />
            </SettingSection>

            {/* Wall Defaults */}
            <SettingSection title="Wall Defaults">
              <SelectSetting
                label="Wall Height"
                value={settings.defaultWallHeight}
                options={[
                  { value: 2.4, label: "2.4m" },
                  { value: 2.7, label: "2.7m" },
                  { value: 3, label: "3m" },
                  { value: 3.5, label: "3.5m" },
                  { value: 4, label: "4m" },
                ]}
                onChange={(v) => dispatch(setDefaultWallHeight(parseFloat(v)))}
              />
            </SettingSection>

            {/* Keyboard Shortcuts */}
            <SettingSection title="Keyboard Shortcuts">
              <ShortcutRow keys="W" action="Wall tool" />
              <ShortcutRow keys="D" action="Door tool" />
              <ShortcutRow keys="N" action="Window tool" />
              <ShortcutRow keys="V / Esc" action="Select tool" />
              <ShortcutRow keys="Delete" action="Delete selected" />
              <ShortcutRow keys="Ctrl+Z" action="Undo" />
              <ShortcutRow keys="Ctrl+Y" action="Redo" />
            </SettingSection>
          </div>
        </div>
      )}
    </>
  );
}

function SettingSection({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#888",
          textTransform: "uppercase",
          marginBottom: "8px",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
}

function ToggleSetting({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "6px 0",
      }}
    >
      <span style={{ fontSize: "13px", color: "#333" }}>{label}</span>
      <div
        onClick={onChange}
        style={{
          width: "40px",
          height: "22px",
          background: checked ? "#4CAF50" : "#ddd",
          borderRadius: "11px",
          position: "relative",
          transition: "background 0.2s",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "20px" : "2px",
            width: "18px",
            height: "18px",
            background: "white",
            borderRadius: "50%",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </label>
  );
}

function SelectSetting({ label, value, options, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
      }}
    >
      <span style={{ fontSize: "13px", color: "#333" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "4px 8px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          background: "#f8f8f8",
          fontSize: "12px",
          cursor: "pointer",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ShortcutRow({ keys, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        padding: "4px 0",
      }}
    >
      <span style={{ color: "#666" }}>{action}</span>
      <kbd
        style={{
          background: "#f0f0f0",
          padding: "2px 8px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "11px",
          border: "1px solid #ddd",
        }}
      >
        {keys}
      </kbd>
    </div>
  );
}

