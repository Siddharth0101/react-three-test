// src/ui/ProjectManager.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// We need a way to set the entire scene state
// For this, we'll use a simple approach with the store

export default function ProjectManager({ onLoad }) {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("My Floor Plan");
  const [savedProjects, setSavedProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("floorplanner_projects") || "{}");
    } catch {
      return {};
    }
  });

  const objects = useSelector((s) => s.scene.objects);
  const settings = useSelector((s) => s.settings);

  const handleSave = () => {
    const name = projectName.trim() || "Untitled";
    const project = {
      name,
      objects,
      settings,
      savedAt: new Date().toISOString(),
    };

    const projects = { ...savedProjects, [name]: project };
    localStorage.setItem("floorplanner_projects", JSON.stringify(projects));
    setSavedProjects(projects);
    alert(`Project "${name}" saved!`);
  };

  const handleLoad = (name) => {
    const project = savedProjects[name];
    if (project && onLoad) {
      onLoad(project);
      setIsOpen(false);
    }
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete project "${name}"?`)) {
      const projects = { ...savedProjects };
      delete projects[name];
      localStorage.setItem("floorplanner_projects", JSON.stringify(projects));
      setSavedProjects(projects);
    }
  };

  const handleExportJSON = () => {
    const data = {
      name: projectName,
      objects,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.objects && onLoad) {
          onLoad({ objects: data.objects, settings: data.settings });
          setProjectName(data.name || "Imported Project");
          setIsOpen(false);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const projectList = Object.values(savedProjects).sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  return (
    <>
      {/* Project button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 200,
          left: 16,
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
          zIndex: 999997,
          transition: "all 0.2s ease",
        }}
        title="Project Manager"
      >
        <span>📁</span> Project
      </button>

      {/* Project panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 240,
            left: 16,
            width: "300px",
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
            }}
          >
            📁 Project Manager
          </div>

          <div style={{ padding: "16px" }}>
            {/* Project name input */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#666", display: "block", marginBottom: "4px" }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <ActionButton onClick={handleSave} primary>
                💾 Save
              </ActionButton>
              <ActionButton onClick={handleExportJSON}>
                📤 Export
              </ActionButton>
              <label style={{ flex: 1 }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: "none" }}
                />
                <ActionButton as="span">📥 Import</ActionButton>
              </label>
            </div>

            {/* Saved projects list */}
            {projectList.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", fontWeight: 600 }}>
                  Saved Projects
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {projectList.map((project) => (
                    <div
                      key={project.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        background: "#f8f8f8",
                        borderRadius: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#333" }}>
                          {project.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          {project.objects?.length || 0} objects • {new Date(project.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => handleLoad(project.name)}
                          style={{
                            padding: "4px 8px",
                            background: "#1a1a2e",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(project.name)}
                          style={{
                            padding: "4px 8px",
                            background: "#ff5252",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ActionButton({ children, onClick, primary, as = "button" }) {
  const Component = as;
  return (
    <Component
      onClick={onClick}
      style={{
        flex: 1,
        padding: "8px",
        background: primary ? "#1a1a2e" : "#f0f0f0",
        color: primary ? "white" : "#333",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
      }}
    >
      {children}
    </Component>
  );
}

