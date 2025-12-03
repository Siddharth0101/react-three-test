import { useDispatch, useSelector } from "react-redux";
import { selectLineTool, selectDefaultTool } from "../store/toolSlice";

export default function BottomPanel() {
  const dispatch = useDispatch();
  const selectedTool = useSelector(s => s.tool.selectedTool);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#f0f0f0",
        padding: "10px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        zIndex: 999999
      }}
    >
      <button
        onClick={() => dispatch(selectDefaultTool())}
        style={{
          padding: "6px 14px",
          background: selectedTool === "select" ? "#d0d0d0" : "white",
          border: "1px solid black"
        }}
      >
        Select
      </button>

      <button
        onClick={() => dispatch(selectLineTool())}
        style={{
          padding: "6px 14px",
          background: selectedTool === "line" ? "#d0d0d0" : "white",
          border: "1px solid black"
        }}
      >
        Line
      </button>
    </div>
  );
}