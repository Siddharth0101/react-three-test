import { Canvas } from "@react-three/fiber";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Scene from "./components/Scene";
import ViewToggle from "./ui/ViewToggle";

export default function App() {
  return (
    <Provider store={store}>
      <ViewToggle />
      <Canvas style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        inset: 0,
        zIndex: 1
      }}>
        <Scene />
      </Canvas>
    </Provider>
  );
}