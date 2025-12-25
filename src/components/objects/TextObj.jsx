// src/components/objects/TextObj.jsx
import { useSelector, useDispatch } from "react-redux";
import { Text } from "@react-three/drei";
import { selectObject } from "../../store/toolSlice";

export default function TextObj({
  id,
  text,
  position = [0, 0],
  fontSize = 0.2,
  color = "#333333",
  props,
}) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);

  const isSelected = selectedObjectId === id;

  // Get values from props if provided (AI format)
  const displayText = props?.text || text;
  const displayPosition = props?.position || position;
  const displayFontSize = props?.fontSize || fontSize;
  const displayColor = props?.color || color;

  const handleClick = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      dispatch(selectObject(id));
    }
  };

  // 2D mode
  if (mode === "2d") {
    return (
      <group onClick={handleClick}>
        {/* Selection background */}
        {isSelected && (
          <mesh position={[displayPosition[0], displayPosition[1], 0.08]}>
            <planeGeometry args={[displayText.length * displayFontSize * 0.6 + 0.1, displayFontSize * 1.4]} />
            <meshBasicMaterial color="#2563eb" transparent opacity={0.15} />
          </mesh>
        )}
        
        {/* Text */}
        <Text
          position={[displayPosition[0], displayPosition[1], 0.1]}
          fontSize={displayFontSize}
          color={isSelected ? "#2563eb" : displayColor}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {displayText}
        </Text>

        {/* Selection border */}
        {isSelected && (
          <mesh position={[displayPosition[0], displayPosition[1], 0.09]}>
            <ringGeometry args={[
              Math.max(displayText.length * displayFontSize * 0.3, 0.15),
              Math.max(displayText.length * displayFontSize * 0.3, 0.15) + 0.02,
              4
            ]} />
            <meshBasicMaterial color="#2563eb" />
          </mesh>
        )}
      </group>
    );
  }

  // 3D mode - floating text
  return (
    <group position={[displayPosition[0], 1.5, displayPosition[1]]}>
      <Text
        fontSize={displayFontSize * 2}
        color={displayColor}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        {displayText}
      </Text>
    </group>
  );
}
