import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useEffect, useRef, useState } from "react";
// import { Perf } from "r3f-perf";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";
import LoadingPage from "./components/LoadingPage";
import appStateManager from "./utils/appStateManager";
import { useGetTest } from "./utils/serviceHooks";
import "./App.scss";

const fontFace = new FontFace("Koulen", "url(/font/Koulen/Koulen-Regular.ttf)");
document.fonts.add(fontFace);

const breakWidth = 50; //unit - em

function App() {
	const canvasContainerRef = useRef();
	const wrapperRef = useRef();

	const { testSt } = useGetTest();
	const [fontLoadedSt, setFontLoaded] = useState(false);
	const [ifVerticalSt, setIfVertical] = useState(false);

	const loadFont = async () => {
		await fontFace.load();
		setFontLoaded(true);
	};

	useEffect(() => {
		loadFont();

		const handleResize = () => {
			wrapperRef.current.style.height = `${window.innerHeight}px`;

			const portrait = window.matchMedia("(orientation: portrait)").matches;
			if (portrait || window.innerWidth <= breakWidth * 16) {
				setIfVertical(true);
			} else {
				setIfVertical(false);
			}
		};

		const disablePinch = (e) => {
			if (e.touches.length > 1) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		window.addEventListener("resize", handleResize, true);
		wrapperRef.current.addEventListener("touchstart", disablePinch, true);
		wrapperRef.current.addEventListener("touchmove", disablePinch, true);

		return () => {
			window.removeEventListener("resize", handleResize, true);
		};
	}, []);

	return (
		<div ref={wrapperRef} className="app-wrapper">
			{testSt && (
				<>
					<WorksArea ifVertical={ifVerticalSt} />
					<InfoArea ifVertical={ifVerticalSt} />
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
							<MyScene
								canvasContainerRef={canvasContainerRef}
								ifVertical={ifVerticalSt}
							/>
						</Canvas>
					</div>
				</>
			)}
			{fontLoadedSt && <Opening />}
			<LoadingPage fontLoadedSt={fontLoadedSt} testSt={testSt} />
		</div>
	);
}

export default App;
