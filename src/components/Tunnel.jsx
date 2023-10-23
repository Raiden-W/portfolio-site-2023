import { Lathe, shaderMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import tunnelFrag from "../experiences/shaders/tunnel.frag";
import tunnelVert from "../experiences/shaders/tunnel.Vert";
import appStateManager from "../utils/appStateManager";

const seed = Math.random() * 100;

const TunnelMat = shaderMaterial(
	{
		uTime: 0,
		uSeed: seed,
		uDynamic: 0,
	},
	tunnelVert,
	tunnelFrag
);

extend({ TunnelMat });

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

	useEffect(() => {
		appStateManager.send("init some context", { tunnelMat: matRef.current });
	}, []);

	return (
		<Lathe args={[points, 90, 0, Math.PI * 2]} rotation-x={-Math.PI / 2}>
			<tunnelMat
				key={TunnelMat.key}
				ref={matRef}
				// wireframe
				side={THREE.BackSide}
			/>
		</Lathe>
	);
}
