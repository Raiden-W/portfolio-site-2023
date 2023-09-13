import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, TorusKnot } from "@react-three/drei";
import Cloth from "./Cloth";
import PaperPlane from "./PaperPlane";
import PaperPlanePhong from "./PaperPlanePhong";
import Clouds from "./Clouds";
import { useState } from "react";

export default function MyScene(props) {
	const [animValSt, setAnimVal] = useState(0);
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
				// style={{ background: "grey" }}
			>
				{/* <color args={["lightgrey"]} attach="background" /> */}
				{/* <Cloth {...props} /> */}
				{/* <PaperPlane /> */}
				<PaperPlanePhong setAnimVal={setAnimVal} />
				<Clouds animVal={animValSt} />
				<OrbitControls />
				{/* {/* <ambientLight color="white" intensity={0.5} /> */}
				{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}
				<directionalLight intensity={0.5} color="white" position={[0, 3, 0]} />
			</Canvas>
		</div>
	);
}
