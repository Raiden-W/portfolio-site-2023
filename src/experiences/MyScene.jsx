import { CubeCamera, OrbitControls } from "@react-three/drei";
import Cloth from "./Cloth";
import Clouds from "./Clouds";
import { useEffect, useState, useRef } from "react";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import PaperPlane from "./PaperPlane";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import CanvasControl from "./CanvasControl";
import Tunnel from "../components/Tunnel";
import gsap from "gsap";

export default function MyScene(props) {
	const cloudAniValRef = useRef(0);
	const squareMeshRef = useRef();
	const colorRef = useRef();

	const [geoSt, setGeo] = useState({});
	const [matSt, setMat] = useState({});

	const [effectOnSt, setEffectOn] = useState(false);

	useEffect(() => {
		appStateManager.send("init some context", {
			setGeo,
			setMat,
			squareMeshRef,
		});
	}, []);

	const isFlying = useSelector(appStateManager, (s) =>
		s.matches("Jet Idle/ Aeras Closed")
	);

	useEffect(() => {
		if (isFlying) {
			gsap.to(colorRef.current, { r: 1, g: 1, b: 1, duration: 1 });
			setEffectOn(true);
		} else {
			gsap.to(colorRef.current, { r: 0.12, g: 0.12, b: 0.12, duration: 1 });
			// setEffectOn(false);
		}
	}, [isFlying]);

	return (
		<>
			<color ref={colorRef} args={["rgb(12%,12%,12%)"]} attach="background" />
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
			{/* <Clouds cloudAniValRef={cloudAniValRef} /> */}
			<CanvasControl {...props} />
			{/* <OrbitControls /> */}
			<ambientLight color="white" intensity={0.5} />
			<directionalLight intensity={0.6} color="white" position={[0, 3, 3]} />
			{/* <pointLight intensity={0.8} color="white" position={[3, 3, 0]} /> */}

			<EffectComposer enabled={effectOnSt}>
				<Bloom
					luminanceThreshold={0.1}
					luminanceSmoothing={0.8}
					height={500}
					intensity={2}
				/>
				<Vignette eskil={false} offset={0.2} darkness={0.7} />
			</EffectComposer>
		</>
	);
}
