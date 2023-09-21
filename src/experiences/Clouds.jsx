import { Cloud, Sky, Environment } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";

export function MovingCloud({ position, animVal }) {
	const cloudRef = useRef();
	useFrame((_, delta) => {
		const custDelta = delta * animVal;
		if (animVal > 0) {
			cloudRef.current.position.z += custDelta * 20;
			if (cloudRef.current.position.z > 10) cloudRef.current.position.z = -80;
			const scale = 1 - Math.pow((-cloudRef.current.position.z + 10) / 90, 2);
			cloudRef.current.scale.setScalar(scale);
		}
	});
	const { widthRandom, depthRandom } = useMemo(() => {
		return {
			widthRandom: 5 + (Math.random() * 2 - 1) * 0.3,
			depthRandom: 1.2 + (Math.random() * 2 - 1) * 0.3,
		};
	}, []);
	return (
		<group ref={cloudRef} position={position}>
			<Cloud
				width={widthRandom}
				depth={depthRandom}
				speed={0.2}
				opacity={0.5}
			/>
		</group>
	);
}

export default function Clouds(props) {
	return (
		<>
			<Suspense fallback={null}>
				<MovingCloud position={[1, 6, -5]} {...props} />
				<MovingCloud position={[5, -6, -8]} {...props} />
				<MovingCloud position={[-6, 2, -10]} {...props} />
				<MovingCloud position={[-2, -6, -30]} {...props} />
				<MovingCloud position={[-4, 5, -35]} {...props} />
				<MovingCloud position={[2, 6, -40]} {...props} />
				<MovingCloud position={[4, -6, -50]} {...props} />
				<MovingCloud position={[-5, 2, -55]} {...props} />
				<MovingCloud position={[-3, -6, -65]} {...props} />
				<MovingCloud position={[-2, 5, -75]} {...props} />
			</Suspense>
			<Environment frames={1} resolution={256} background={true} blur={1}>
				<Sky
					azimuth={0.5}
					turbidity={1}
					rayleigh={0.3}
					inclination={0.5}
					distance={1000}
				/>
			</Environment>
		</>
	);
}
