// src/components/objects/TextObj.jsx
import { useSelector, useDispatch } from "react-redux";
import { Text } from "@react-three/drei";
import { selectObject } from "../../store/toolSlice";

export default function TextObj({ 
  id, 
  text, 
  position, 
  fontSize = 0.2, 
  color = "#333333",
  rotation = 0,
}) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  
  const isSelected = selectedObjectId === id;

  const handleClick = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      dispatch(selectObject(id));
    }
  };

  if (mode !== "2d") return null;

  return (
    <group 
      position={[position[0], position[1], 0.5]} 
      rotation={[0, 0, rotation]}
      onClick={handleClick}
    >
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[text.length * fontSize * 0.6, fontSize * 1.5]} />
          <meshBasicMaterial color="#2196F3" transparent opacity={0.2} />
        </mesh>
      )}
      
      <Text
        fontSize={fontSize}
        color={isSelected ? "#2196F3" : color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {text}
      </Text>
    </group>
  );
}

