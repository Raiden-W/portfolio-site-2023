import { OrbitControls } from "@react-three/drei";
import Cloth from "./Cloth";
import PaperPlaneControl from "./PaperPlaneControl";
import Clouds from "./Clouds";
import { useEffect, useState, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useWidthStore } from "../utils/GlobalStore";
import PaperPlane from "./PaperPlane";
import appStateManager from "../utils/appStateManager";

export default function MyScene({ canvasContainerRef }) {
	const [animValSt, setAnimVal] = useState(0);

	const [geoSt, setGeo] = useState({});
	const [matSt, setMat] = useState({});
	const squareMeshRef = useRef();

	useEffect(() => {
		appStateManager.send("init some context", {
			setGeo,
			setMat,
			squareMeshRef,
		});
	}, []);

	const setSize = useThree((state) => state.setSize);

	const areaWidthSt = useWidthStore((state) => state.canvasWSt);
	const worksAreaWidthSt = useWidthStore((state) => state.worksAreaWSt);

	useEffect(() => {
		setSize(areaWidthSt * 0.01 * window.innerWidth, window.innerHeight, true);
		canvasContainerRef.current.style.width = `${areaWidthSt}%`;
		canvasContainerRef.current.style.left = `${worksAreaWidthSt}%`;
	}, [areaWidthSt]);

	return (
		<>
			{/* <color args={["lightgrey"]} attach="background" /> */}
			{/* <PaperPlaneControl setAnimVal={setAnimVal} /> */}

			<mesh ref={squareMeshRef}>
				<primitive object={geoSt} />
				<primitive object={matSt} />
			</mesh>
			<Cloth setGeo={setGeo} setMat={setMat} />
			<PaperPlane
				setGeo={setGeo}
				setMat={setMat}
				squareMeshRef={squareMeshRef}
				setAnimVal={setAnimVal}
			/>
			{/* <Clouds animVal={animValSt} /> */}
			<OrbitControls />
			<ambientLight color="white" intensity={1} />
			<directionalLight intensity={1} color="white" position={[0, 0, 3]} />
			{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}
		</>
	);
}
