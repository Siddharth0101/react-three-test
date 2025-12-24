// src/components/FirstPersonControls.jsx
import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Constants
const EYE_HEIGHT = 1.65;
const MOVE_SPEED = 3;
const LOOK_SPEED = 0.002;

export default function FirstPersonControls() {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const isLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, 5);
    camera.rotation.set(0, 0, 0);
    euler.current.setFromQuaternion(camera.quaternion);
  }, [camera]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.code] = true;
    };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Pointer lock for mouse look
  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (e) => {
      if (!isLocked.current) return;

      euler.current.y -= e.movementX * LOOK_SPEED;
      euler.current.x -= e.movementY * LOOK_SPEED;

      // Clamp vertical rotation
      euler.current.x = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, euler.current.x)
      );

      camera.quaternion.setFromEuler(euler.current);
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("pointerlockchange", handleLockChange);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("pointerlockchange", handleLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [gl, camera]);

  // Movement update each frame
  useFrame((_, delta) => {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Get forward direction (ignore vertical component)
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    // Get right direction
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    const velocity = new THREE.Vector3();

    // WASD / Arrow movement
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) {
      velocity.add(direction);
    }
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) {
      velocity.sub(direction);
    }
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) {
      velocity.sub(right);
    }
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) {
      velocity.add(right);
    }

    // Normalize and apply speed
    if (velocity.length() > 0) {
      velocity.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.add(velocity);
    }

    // Keep at eye height
    camera.position.y = EYE_HEIGHT;
  });

  return null;
}
