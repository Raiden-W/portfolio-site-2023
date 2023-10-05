import { OrbitControls, TorusKnot } from "@react-three/drei";
import Cloth from "./Cloth";
import PaperPlanePhong from "./PaperPlanePhong";
import Clouds from "./Clouds";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useWidthStore } from "../utils/GlobalStore";

export default function MyScene({ openingOutputSt, canvasContainerRef }) {
	const [animValSt, setAnimVal] = useState(0);

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
			<Cloth openingOutputSt={openingOutputSt} />
			{/* <PaperPlanePhong setAnimVal={setAnimVal} />
			<Clouds animVal={animValSt} /> */}
			{/* <OrbitControls /> */}
			<ambientLight color="white" intensity={1} />
			<directionalLight intensity={1} color="white" position={[0, 0, 3]} />
			{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}
		</>
	);
}
