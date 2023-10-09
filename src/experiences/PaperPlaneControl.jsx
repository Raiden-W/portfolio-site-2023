import * as THREE from "three";
import { useRef, useMemo, useEffect } from "react";
import { useControls } from "leva";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import paperPlaneVert from "./shaders/paperPlanePhong.vert";
import paperPlanFrag from "./shaders/paperPlanePhong.frag";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";

useGLTF.preload("./model/jetPlane-draco.glb");

export default function PaperPlaneControl({ setAnimVal }) {
	const paperPlaneMatRef = useRef();
	// const depthMat = useRef();
	const meshRef = useRef();

	// const [planeValSt, setPlaneVal] = useState(0);

	const jetPlaneModel = useGLTF("./model/jetPlane-draco.glb");

	const planeMat = useMemo(() => {
		const material = new CustomShaderMaterial({
			baseMaterial: THREE.MeshStandardMaterial,
			uniforms: {
				uRotateL1: { value: new THREE.Matrix4() },
				uRotateL2Left: { value: new THREE.Matrix4() },
				uRotateL2Right: { value: new THREE.Matrix4() },
				uRotateL3Left: { value: new THREE.Matrix4() },
				uRotateL3Right: { value: new THREE.Matrix4() },
			},
			vertexShader: paperPlaneVert,
			fragmentShader: paperPlanFrag,
			silent: true,
			side: THREE.DoubleSide,
			color: 0xd3d3d3,
			metalness: 1,
			roughness: 0,
			flatShading: true,
			// wireframe:true
		});

		return material;
	}, []);

	useEffect(() => {
		if (jetPlaneModel)
			meshRef.current.geometry = jetPlaneModel.scene.children[0].geometry;
		meshRef.current.material = planeMat;
	}, [jetPlaneModel]);

	const [{ temValue, toPlane, rotateLevel1, rotateLevel2, rotateLevel3 }, set] =
		useControls(() => ({
			temValue: {
				value: 0,
				min: 0,
				max: 1,
				step: 0.01,
			},
			toPlane: false,
			rotateLevel1: {
				value: Math.PI / 2.3,
				min: 0,
				max: Math.PI / 2.2,
				step: 0.01,
			},
			rotateLevel2: {
				value: Math.PI / 1.8,
				min: 0,
				max: Math.PI / 1.6,
				step: 0.01,
			},
			rotateLevel3: {
				value: Math.PI * 0.85,
				min: -Math.PI * 0.93,
				max: Math.PI * 0.85,
				step: 0.01,
			},
		}));

	useEffect(() => {
		const aniVal = { v: temValue };
		if (toPlane) {
			gsap.to(meshRef.current.rotation, {
				x: -Math.PI / 2,
				z: Math.PI / 4,
			});
			gsap.to(aniVal, {
				v: 1,
				duration: 1,
				onUpdate: () => {
					set({ temValue: aniVal.v });
					setAnimVal(aniVal.v);
				},
			});
		} else {
			gsap.to(meshRef.current.rotation, {
				x: 0,
				z: 0,
			});
			gsap.to(aniVal, {
				v: 0,
				duration: 1,
				onUpdate: () => {
					set({ temValue: aniVal.v });
					setAnimVal(aniVal.v);
				},
			});
		}
	}, [toPlane]);

	const {
		axisL1Trans,
		axisL2TransLeft,
		axisL2TransRight,
		axisL3TransLeft,
		axisL3TransRight,
	} = useMemo(() => {
		return {
			axisL1Trans: new THREE.Matrix4().makeRotationZ(Math.PI / 4),
			axisL2TransLeft: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 3)
				.setPosition(Math.sin(Math.PI / 12) / Math.sin(Math.PI / 4), 0, 0),
			axisL2TransRight: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 6)
				.setPosition(-Math.sin(Math.PI / 12) / Math.sin(Math.PI / 4), 0, 0),
			axisL3TransLeft: new THREE.Matrix4()
				.makeRotationZ((5 * Math.PI) / 12)
				.setPosition(Math.sin(Math.PI / 6) / Math.sin(Math.PI / 4), 0, 0),
			axisL3TransRight: new THREE.Matrix4()
				.makeRotationZ(Math.PI / 12)
				.setPosition(-Math.sin(Math.PI / 6) / Math.sin(Math.PI / 4), 0, 0),
		};
	}, []);

	useEffect(() => {
		const rL1 = gsap.utils.interpolate(0, rotateLevel1, temValue);
		const rL2 = gsap.utils.interpolate(0, rotateLevel2, temValue);
		const rL3 = gsap.utils.interpolate(0, rotateLevel3, temValue);
		// //conner creases
		const rotateL3Left = planeMat.uniforms.uRotateL3Left.value;
		const rotateL3Right = planeMat.uniforms.uRotateL3Right.value;
		rotateL3Left.makeRotationY(-rL3).multiply(axisL3TransLeft);
		rotateL3Left.premultiply(axisL3TransLeft.invert());
		axisL3TransLeft.invert();
		rotateL3Right.makeRotationY(rL3).multiply(axisL3TransRight);
		rotateL3Right.premultiply(axisL3TransRight.invert());
		axisL3TransRight.invert();

		//side creases
		const rotateL2Left = planeMat.uniforms.uRotateL2Left.value;
		const rotateL2Right = planeMat.uniforms.uRotateL2Right.value;
		rotateL2Left.makeRotationY(-rL2).multiply(axisL2TransLeft);
		rotateL2Left.premultiply(axisL2TransLeft.invert());
		axisL2TransLeft.invert();
		rotateL2Right.makeRotationY(rL2).multiply(axisL2TransRight);
		rotateL2Right.premultiply(axisL2TransRight.invert());
		axisL2TransRight.invert();

		// //middle crease
		const rotateL1 = planeMat.uniforms.uRotateL1.value;
		rotateL1.makeRotationY(rL1).multiply(axisL1Trans);
		rotateL1.premultiply(axisL1Trans.invert());
		axisL1Trans.invert();
	}, [rotateLevel1, rotateLevel2, rotateLevel3, temValue]);

	return (
		<>
			<mesh ref={meshRef}></mesh>
		</>
	);
}
