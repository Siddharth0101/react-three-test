import data from "../data/scene.json";
import ObjectRenderer from "./ObjectRenderer";
import { OrbitControls } from "@react-three/drei";

export default function Scene() {
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />

      {data.objects.map((obj) => (
        <ObjectRenderer key={obj.id} obj={obj} />
      ))}
    </>
  );
}
