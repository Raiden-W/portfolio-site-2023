import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useState } from "react";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";

function App() {
	const [openingCanvasSt, setOpeningCanvas] = useState(null);

	return (
		<>
			<WorksArea />
			<div className="canvas-container">
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
					<MyScene openingCanvas={openingCanvasSt} />
				</Canvas>
			</div>
			<InfoArea />
			{/* <Opening setOpeningCanvas={setOpeningCanvas} /> */}
		</>
	);
}

export default App;
