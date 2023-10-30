import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useRef } from "react";
import { Perf } from "r3f-perf";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";
import appStateManager from "./utils/appStateManager";
import Div100vh from "react-div-100vh";

function App() {
	const canvasContainerRef = useRef();

	return (
		<Div100vh>
			<WorksArea />
			<InfoArea />
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
					{/* <Perf position="top-left" /> */}
					<MyScene canvasContainerRef={canvasContainerRef} />
				</Canvas>
			</div>
			<Opening />
		</Div100vh>
	);
}

export default App;
