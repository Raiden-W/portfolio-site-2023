import { CubeCamera, OrbitControls } from "@react-three/drei";
import Cloth from "./Cloth";
import { useEffect, useState, useRef } from "react";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import PaperPlane from "./PaperPlane";
import appStateManager from "../utils/appStateManager";
import CanvasControl from "./CanvasControl";
import Tunnel from "../components/Tunnel";
import SquareDisplay from "./SquareDisplay";

export default function MyScene(props) {
	const cloudAniValRef = useRef(0);
	const squareMeshRef = useRef();
	const colorRef = useRef();

	const [geoSt, setGeo] = useState({});
	const [matSt, setMat] = useState({});

	const [effectOnSt, setEffectOn] = useState(false);

	useEffect(() => {
		colorRef.current.convertLinearToSRGB();
		appStateManager.send("init some context", {
			setGeo,
			setMat,
			squareMeshRef,
			bgColor: colorRef.current,
			setEffectOn,
		});
	}, []);

	return (
		<>
			<color ref={colorRef} args={[0x1f1f1f]} attach="background" />
			<Tunnel />
			<mesh ref={squareMeshRef}>
				<primitive object={geoSt} />
				<primitive object={matSt} />
			</mesh>
			<Cloth setGeo={setGeo} setMat={setMat} squareMeshRef={squareMeshRef} />
			<CubeCamera frames={Infinity} resolution={512}>
				{(texture) => (
					<PaperPlane
						setGeo={setGeo}
						setMat={setMat}
						squareMeshRef={squareMeshRef}
						cloudAniValRef={cloudAniValRef}
						envMap={texture}
					/>
				)}
			</CubeCamera>
			<SquareDisplay />
			<CanvasControl {...props} />
			{/* <OrbitControls /> */}
			<ambientLight color="white" intensity={0.5} />
			<directionalLight intensity={0.6} color="white" position={[0, 2.5, 3]} />

			<EffectComposer enabled={effectOnSt}>
				<Bloom
					luminanceThreshold={0.2}
					luminanceSmoothing={0.5}
					height={500}
					intensity={2}
				/>
				<Vignette eskil={false} offset={0.2} darkness={0.7} />
			</EffectComposer>
		</>
	);
}
