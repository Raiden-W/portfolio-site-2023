import { Lathe, shaderMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import tunnelFlyingFrag from "../experiences/shaders/tunnelFlying.frag";
import tunnelFlyingVert from "../experiences/shaders/tunnelFlying.Vert";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import gsap from "gsap";

const seed = Math.random() * 100;

const TunnelFlyingMat = shaderMaterial(
	{
		uTime: 0,
		uSeed: seed,
		uDynamic: 1,
	},
	tunnelFlyingVert,
	tunnelFlyingFrag
);

extend({ TunnelFlyingMat });

export default function Tunnel() {
	const matRef = useRef();

	const points = useMemo(() => {
		const ps = [];
		for (let i = 0; i < 12; i = i + 0.25) {
			ps.push(
				new THREE.Vector2(
					Math.sin(Math.pow(i * 0.06 - 1.05, 4) + 0.03) * 10,
					i * 2 - 3
				)
			);
		}
		return ps;
	}, []);

	useFrame((_, delta) => {
		matRef.current.uTime += delta;
	});

	const isFlying = useSelector(appStateManager, (s) =>
		s.matches("Jet Idle/ Aeras Closed")
	);

	useEffect(() => {
		if (isFlying) {
			gsap.to(matRef.current, { uDynamic: 1, duration: 1 });
		} else {
			gsap.to(matRef.current, { uDynamic: 0, duration: 1 });
		}
	}, [isFlying]);

	return (
		<Lathe args={[points, 90, 0, Math.PI * 2]} rotation-x={-Math.PI / 2}>
			<tunnelFlyingMat
				key={TunnelFlyingMat.key}
				ref={matRef}
				// wireframe
				side={THREE.BackSide}
			/>
		</Lathe>
	);
}
