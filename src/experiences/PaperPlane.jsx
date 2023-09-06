import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useControls } from "leva";
import paperPlaneFrag from "./shaders/paperPlane.frag";
import paperPlaneVert from "./shaders/paperPlane.vert";

const PaperPlaneMat = shaderMaterial(
	{
		rotateL1: new THREE.Matrix4(),
		rotateL2Left: new THREE.Matrix4(),
		rotateL2Right: new THREE.Matrix4(),
		rotateL3Left: new THREE.Matrix4(),
		rotateL3Right: new THREE.Matrix4(),
	},
	paperPlaneVert,
	paperPlaneFrag
);

extend({ PaperPlaneMat });

export default function PaperPlane() {
	const paperPlaneMatRef = useRef();

	const { rotateLevel1, rotateLevel2, rotateLevel3 } = useControls({
		rotateLevel1: {
			value: 0,
			min: 0,
			max: Math.PI / 2.3,
			step: 0.01,
		},
		rotateLevel2: {
			value: 0,
			min: 0,
			max: Math.PI / 1.8,
			step: 0.01,
		},
		rotateLevel3: {
			value: 0,
			min: -Math.PI * 0.85,
			max: Math.PI * 0.95,
			step: 0.01,
		},
	});

	const {
		rotateL1Trans,
		axisL1Trans,
		rotateL2TransLeft,
		rotateL2TransRight,
		axisL2TransLeft,
		axisL2TransRight,
		rotateL3TransLeft,
		rotateL3TransRight,
		axisL3TransLeft,
		axisL3TransRight,
	} = useMemo(() => {
		return {
			rotateL1Trans: new THREE.Matrix4(),
			axisL1Trans: new THREE.Matrix4().makeRotationZ(Math.PI / 4),
			rotateL2TransLeft: new THREE.Matrix4(),
			rotateL2TransRight: new THREE.Matrix4(),
			axisL2TransLeft: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 3)
				.setPosition(Math.sin(Math.PI / 12) / Math.sin(Math.PI / 4), 0, 0),
			axisL2TransRight: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 6)
				.setPosition(-Math.sin(Math.PI / 12) / Math.sin(Math.PI / 4), 0, 0),
			rotateL3TransLeft: new THREE.Matrix4(),
			rotateL3TransRight: new THREE.Matrix4(),
			axisL3TransLeft: new THREE.Matrix4()
				.makeRotationZ((5 * Math.PI) / 12)
				.setPosition(Math.sin(Math.PI / 6) / Math.sin(Math.PI / 4), 0, 0),
			axisL3TransRight: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 12)
				.setPosition(-Math.sin(Math.PI / 6) / Math.sin(Math.PI / 4), 0, 0),
		};
	}, []);

	// useFrame(({ clock }) => {
	// });

	useEffect(() => {
		//conner creases
		rotateL3TransLeft.makeRotationY(rotateLevel3).multiply(axisL3TransLeft);
		rotateL3TransLeft.premultiply(axisL3TransLeft.invert());
		axisL3TransLeft.invert();
		rotateL3TransRight.makeRotationY(-rotateLevel3).multiply(axisL3TransRight);
		rotateL3TransRight.premultiply(axisL3TransRight.invert());
		axisL3TransRight.invert();

		paperPlaneMatRef.current.rotateL3Left = rotateL3TransLeft;
		paperPlaneMatRef.current.rotateL3Right = rotateL3TransRight;

		//side creases
		rotateL2TransLeft.makeRotationY(-rotateLevel2).multiply(axisL2TransLeft);
		rotateL2TransLeft.premultiply(axisL2TransLeft.invert());
		axisL2TransLeft.invert();
		rotateL2TransRight.makeRotationY(rotateLevel2).multiply(axisL2TransRight);
		rotateL2TransRight.premultiply(axisL2TransRight.invert());
		axisL2TransRight.invert();

		paperPlaneMatRef.current.rotateL2Left = rotateL2TransLeft;
		paperPlaneMatRef.current.rotateL2Right = rotateL2TransRight;
		//middle crease
		rotateL1Trans.makeRotationY(rotateLevel1).multiply(axisL1Trans);
		rotateL1Trans.premultiply(axisL1Trans.invert());
		axisL1Trans.invert();

		paperPlaneMatRef.current.rotateL1 = rotateL1Trans;
	}, [rotateLevel1, rotateLevel2, rotateLevel3]);

	return (
		<>
			<mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
				<planeGeometry args={[2, 2, 100, 100]} />
				<paperPlaneMat
					//key to enable hot-reload for shader updates
					key={PaperPlaneMat.key}
					ref={paperPlaneMatRef}
					side={THREE.DoubleSide}
					// wireframe={true}
				/>
			</mesh>
		</>
	);
}
