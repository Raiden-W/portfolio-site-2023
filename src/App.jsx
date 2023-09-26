import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useEffect, useRef, useState } from "react";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";

function App() {
	const [openingCanvasSt, setOpeningCanvas] = useState(null);

	const canvasContainerRef = useRef();

	return (
		<>
			<WorksArea />
			<InfoArea />
			<div className="canvas-container" ref={canvasContainerRef}>
				<Canvas
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
					<MyScene
						openingCanvas={openingCanvasSt}
						canvasContainerRef={canvasContainerRef}
					/>
				</Canvas>
			</div>
			{/* <Opening setOpeningCanvas={setOpeningCanvas} /> */}
		</>
	);
}

export default App;
