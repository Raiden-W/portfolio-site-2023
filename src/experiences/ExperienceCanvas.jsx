import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./MyScene";
import appStateManager from "../utils/appStateManager";

export default function ExperienceCanvas({ canvasContainerRef, ifVertical }) {
	return (
		<div
			className="canvas-container"
			ref={canvasContainerRef}
			onClick={() => {
				appStateManager.send("canvas click");
			}}
		>
			<Canvas
				camera={{
					fov: 50,
					near: 0.1,
					far: 500,
					position: [0, 0, 4.5],
				}}
				gl={{
					outputColorSpace: "srgb-linear",
					toneMapping: THREE.LinearToneMapping,
				}}
			>
				<MyScene
					canvasContainerRef={canvasContainerRef}
					ifVertical={ifVertical}
				/>
			</Canvas>
		</div>
	);
}
