import { OrbitControls } from "@react-three/drei";
import Cloth from "./Cloth";
import Clouds from "./Clouds";
import { useEffect, useState, useRef } from "react";
import PaperPlane from "./PaperPlane";
import appStateManager from "../utils/appStateManager";
import CanvasControl from "./CanvasControl";

export default function MyScene(props) {
	const cloudAniValRef = useRef(0);

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

	return (
		<>
			{/* <color args={["lightgrey"]} attach="background" /> */}

			<CanvasControl {...props} />
			<mesh ref={squareMeshRef}>
				<primitive object={geoSt} />
				<primitive object={matSt} />
			</mesh>
			<Cloth setGeo={setGeo} setMat={setMat} />
			<PaperPlane
				setGeo={setGeo}
				setMat={setMat}
				squareMeshRef={squareMeshRef}
				cloudAniValRef={cloudAniValRef}
			/>
			<Clouds cloudAniValRef={cloudAniValRef} />
			{/* <OrbitControls /> */}
			<ambientLight color="white" intensity={1} />
			<directionalLight intensity={1} color="white" position={[0, 0, 3]} />
			{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}
		</>
	);
}
