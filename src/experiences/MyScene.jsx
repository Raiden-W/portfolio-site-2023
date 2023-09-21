import { OrbitControls, TorusKnot } from "@react-three/drei";
import Cloth from "./Cloth";
import PaperPlanePhong from "./PaperPlanePhong";
import Clouds from "./Clouds";
import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useWidthStore } from "../utils/GlobalStore";

export default function MyScene({ openingCanvas }) {
	const [animValSt, setAnimVal] = useState(0);
	const areaWidthSt = useWidthStore((state) => state.canvasWSt);
	const setSize = useThree((state) => state.setSize);

	const canvasContainer = useMemo(
		() => document.querySelector(".canvas-container"),
		[]
	);

	useEffect(() => {
		setSize(areaWidthSt * 0.01 * window.innerWidth, window.innerHeight, true);
		canvasContainer.style.width = `${areaWidthSt}%`;
	}, [areaWidthSt]);

	return (
		<>
			{/* <color args={["lightgrey"]} attach="background" /> */}

			{/* <Cloth openingCanvas={openingCanvas} /> */}

			<PaperPlanePhong setAnimVal={setAnimVal} />
			<Clouds animVal={animValSt} />
			<OrbitControls />

			<ambientLight color="white" intensity={1} />
			<directionalLight intensity={0.5} color="white" position={[0, 0, 3]} />
			{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}
		</>
	);
}
