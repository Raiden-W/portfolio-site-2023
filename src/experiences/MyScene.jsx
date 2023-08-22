import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import Cloth from "./Cloth";

export default function MyScene(props) {
	return (
		<div id="canvas-container" visible="false">
			<Canvas
				className="my-canvas"
				camera={{
					fov: 50,
					near: 0.1,
					far: 500,
					position: [0, 0, 5],
				}}
				gl={{
					outputColorSpace: "srgb-linear",
					toneMapping: THREE.LinearToneMapping,
				}}
				style={{ background: "grey" }}
			>
				<Cloth {...props} />
				{/* <OrbitControls /> */}
				<ambientLight color="white" intensity={1} />
				<directionalLight intensity={0.5} color="white" position={[0, 0, 5]} />
			</Canvas>
		</div>
	);
}
