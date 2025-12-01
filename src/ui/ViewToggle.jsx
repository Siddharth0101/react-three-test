import { useDispatch, useSelector } from "react-redux";
import { toggleMode } from "../store/viewModeSlice";

export default function ViewToggle() {
    const dispatch = useDispatch();
    const mode = useSelector(state => state.viewMode.mode);

    return (
        <button
            onClick={() => dispatch(toggleMode())}
            style={{
                position: "fixed",
                top: 20,
                left: 20,
                zIndex: 999999,
                background: "white",
                border: "1px solid black",
                padding: "6px 14px"
            }}
        >
            Switch to {mode === "3d" ? "2D" : "3D"}
        </button>
    );
}
