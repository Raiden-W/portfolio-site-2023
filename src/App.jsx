import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useEffect, useRef } from "react";
// import { Perf } from "r3f-perf";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";
import appStateManager from "./utils/appStateManager";

function App() {
	const canvasContainerRef = useRef();
	const wrapperRef = useRef();

	useEffect(() => {
		const updateHeight = () => {
			wrapperRef.current.style.height = `${window.innerHeight}px`;
		};
		const disablePinch = (e) => {
			if (e.touches.length > 1) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		window.addEventListener("resize", updateHeight, true);
		wrapperRef.current.addEventListener("touchstart", disablePinch, true);
		wrapperRef.current.addEventListener("touchmove", disablePinch, true);

		return () => {
			window.removeEventListener("resize", updateHeight, true);
		};
	}, []);

	return (
		<div ref={wrapperRef}>
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
		</div>
	);
}

export default App;
