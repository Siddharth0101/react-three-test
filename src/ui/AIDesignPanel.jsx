// src/ui/AIDesignPanel.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadProject, clearObjects } from "../store/sceneSlice";
import { generateFloorPlan, EXAMPLE_PROMPTS } from "../services/aiService";

const STORAGE_KEY = "floorplanner_ai_config";

// Default API keys - loaded from environment variables
const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const DEFAULT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

export default function AIDesignPanel() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.settings);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lastGenerated, setLastGenerated] = useState(null);
  
  // AI Configuration - Groq as default (FREE)
  const [provider, setProvider] = useState("groq");
  const [groqKey, setGroqKey] = useState(DEFAULT_GROQ_KEY);
  const [geminiKey, setGeminiKey] = useState(DEFAULT_GEMINI_KEY);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [localEndpoint, setLocalEndpoint] = useState("http://localhost:11434/api/chat");
  const [localModel, setLocalModel] = useState("llama2");

  // Load saved config
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        setProvider(config.provider || "groq");
        setGroqKey(config.groqKey || DEFAULT_GROQ_KEY);
        setGeminiKey(config.geminiKey || DEFAULT_GEMINI_KEY);
        setOpenaiKey(config.openaiKey || "");
        setAnthropicKey(config.anthropicKey || "");
        setLocalEndpoint(config.localEndpoint || "http://localhost:11434/api/chat");
        setLocalModel(config.localModel || "llama2");
      } else {
        // Save default config with Groq key
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          provider: "groq",
          groqKey: DEFAULT_GROQ_KEY,
          geminiKey: DEFAULT_GEMINI_KEY,
          openaiKey: "",
          anthropicKey: "",
          localEndpoint: "http://localhost:11434/api/chat",
          localModel: "llama2",
        }));
      }
    } catch (e) {
      console.error("Failed to load AI config:", e);
    }
  }, []);

  // Save config when changed
  const saveConfig = () => {
    const config = { provider, groqKey, geminiKey, openaiKey, anthropicKey, localEndpoint, localModel };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setIsSettingsOpen(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description");
      return;
    }

    // Check if API key is configured
    if (provider === "groq" && !groqKey) {
      setError("Please add your free Groq API key in settings. Get it at console.groq.com");
      setIsSettingsOpen(true);
      return;
    }
    if (provider === "gemini" && !geminiKey) {
      setError("Please configure your Google Gemini API key in settings");
      setIsSettingsOpen(true);
      return;
    }
    if (provider === "openai" && !openaiKey) {
      setError("Please configure your OpenAI API key in settings");
      setIsSettingsOpen(true);
      return;
    }
    if (provider === "anthropic" && !anthropicKey) {
      setError("Please configure your Anthropic API key in settings");
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result = await generateFloorPlan(
        prompt,
        { provider, groqKey, geminiKey, openaiKey, anthropicKey, localEndpoint, localModel },
        settings
      );

      if (result.success) {
        // Clear existing objects and load new ones
        dispatch(clearObjects());
        dispatch(loadProject(result.objects));
        setLastGenerated({
          name: result.name,
          prompt,
          objectCount: result.objects.length,
        });
        setError("");
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const getProviderInfo = () => {
    switch (provider) {
      case "groq":
        return { name: "Groq (Llama 3.3)", color: "#F55036", bg: "#FEF2F0" };
      case "gemini":
        return { name: "Google Gemini", color: "#4285F4", bg: "#E8F0FE" };
      case "openai":
        return { name: "OpenAI GPT-4", color: "#10A37F", bg: "#E6F7F1" };
      case "anthropic":
        return { name: "Claude", color: "#D97706", bg: "#FEF3E2" };
      default:
        return { name: "Local AI", color: "#6B7280", bg: "#F3F4F6" };
    }
  };

  const providerInfo = getProviderInfo();

  // Toggle button (always visible)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 110,
          left: 20,
          zIndex: 999996,
          padding: "10px 16px",
          background: "linear-gradient(135deg, #F55036 0%, #FF8A65 100%)",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "0 4px 15px rgba(245, 80, 54, 0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 6px 20px rgba(245, 80, 54, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 15px rgba(245, 80, 54, 0.4)";
        }}
      >
        <span style={{ fontSize: 18 }}>✨</span>
        AI Design
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 110,
        left: 20,
        zIndex: 999996,
        width: 380,
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
        background: "white",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, #F55036 0%, #FF8A65 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <span style={{ fontWeight: 600, fontSize: 15 }}>AI Floor Plan Generator</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div style={{ padding: 16, background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#333" }}>
            AI Provider Settings
          </div>

          {/* Provider Selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              <option value="groq">🚀 Groq - Llama 3.3 (FREE & Fast!)</option>
              <option value="gemini">🌟 Google Gemini</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="local">Local (Ollama/LM Studio)</option>
            </select>
          </div>

          {/* Provider-specific settings */}
          {provider === "groq" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                Groq API Key (FREE)
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                Get your <strong>FREE</strong> key from{" "}
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: "#F55036" }}>
                  console.groq.com/keys
                </a>
              </div>
              {groqKey === DEFAULT_GROQ_KEY && (
                <div style={{ fontSize: 11, color: "#2e7d32", marginTop: 4 }}>
                  ✓ Using pre-configured API key
                </div>
              )}
              <div style={{ 
                fontSize: 11, 
                color: "#2e7d32", 
                marginTop: 6,
                padding: "6px 8px",
                background: "#e8f5e9",
                borderRadius: 4,
              }}>
                ✨ Groq offers generous FREE tier with very fast inference!
              </div>
            </div>
          )}

          {provider === "gemini" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                Get your key from{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#4285F4" }}>
                  Google AI Studio
                </a>
              </div>
            </div>
          )}

          {provider === "openai" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                Get your key from{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: "#10A37F" }}>
                  platform.openai.com
                </a>
              </div>
            </div>
          )}

          {provider === "anthropic" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                Anthropic API Key
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                Get your key from{" "}
                <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" style={{ color: "#D97706" }}>
                  console.anthropic.com
                </a>
              </div>
            </div>
          )}

          {provider === "local" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/api/chat"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
                  Model Name
                </label>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="llama2"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </>
          )}

          <button
            onClick={saveConfig}
            style={{
              width: "100%",
              padding: "10px",
              background: "#F55036",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: 16 }}>
        {/* Provider indicator */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 6, 
          marginBottom: 12,
          padding: "6px 10px",
          background: providerInfo.bg,
          borderRadius: 6,
          fontSize: 12,
          color: providerInfo.color
        }}>
          <span>🚀</span>
          <span>Powered by {providerInfo.name}</span>
          {provider === "groq" && <span style={{ marginLeft: "auto", fontSize: 10, background: "#22c55e", color: "white", padding: "2px 6px", borderRadius: 4 }}>FREE</span>}
        </div>

        {/* Prompt Input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>
            Describe your floor plan
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Modern 2 bedroom apartment with open kitchen, living room, and bathroom..."
            style={{
              width: "100%",
              height: 80,
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 13,
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleGenerate();
              }
            }}
          />
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
            Press Ctrl+Enter to generate
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          style={{
            width: "100%",
            padding: "12px",
            background: isGenerating
              ? "#ccc"
              : "linear-gradient(135deg, #F55036 0%, #FF8A65 100%)",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: isGenerating ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {isGenerating ? (
            <>
              <span style={{ 
                display: "inline-block", 
                animation: "spin 1s linear infinite",
              }}>
                ⏳
              </span>
              Generating...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Floor Plan
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div
            style={{
              padding: "10px 12px",
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: 6,
              color: "#c00",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {/* Success Display */}
        {lastGenerated && (
          <div
            style={{
              padding: "10px 12px",
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: 6,
              color: "#2e7d32",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ Generated: {lastGenerated.name}</div>
            <div>Created {lastGenerated.objectCount} objects from your description.</div>
          </div>
        )}

        {/* Example Prompts */}
        <div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            💡 Try these examples:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EXAMPLE_PROMPTS.slice(0, 4).map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                style={{
                  padding: "6px 10px",
                  background: "#f0f0f0",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  color: "#555",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
                onMouseLeave={(e) => (e.target.style.background = "#f0f0f0")}
              >
                {example.length > 35 ? example.slice(0, 35) + "..." : example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
