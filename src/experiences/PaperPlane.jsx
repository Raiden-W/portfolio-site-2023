import * as THREE from "three";
import { useRef, useMemo, useEffect, useState } from "react";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import paperPlaneVert from "./shaders/paperPlanePhong.vert";
import paperPlanFrag from "./shaders/paperPlanePhong.frag";
import { useGLTF } from "@react-three/drei";
import { gsap } from "gsap";
import appStateManager from "../utils/appStateManager";
import { useThree } from "@react-three/fiber";

useGLTF.preload("./model/jetPlane-draco.glb");

export default function PaperPlane({
	setGeo,
	setMat,
	squareMeshRef,
	cloudAniValRef,
}) {
	const jetPlaneModel = useGLTF("./model/jetPlane-draco.glb");
	const camera = useThree((s) => s.camera);

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
			emissive: 0xffffff,
			metalness: 1,
			roughness: 0,
			flatShading: true,
			// wireframe:true
		});

		return material;
	}, []);

	const jetGeo = useMemo(() => {
		if (jetPlaneModel) {
			return jetPlaneModel.scene.children[0].geometry;
		}
		return null;
	}, [jetPlaneModel]);

	const rotateLevel1 = Math.PI / 2.3;
	const rotateLevel2 = Math.PI / 1.8;
	const rotateLevel3 = Math.PI * 0.85;

	const [temValueSt, setTemValue] = useState(0);
	const temValueRef = useRef();

	const squareToJet = (onCompleteFunction) => {
		setGeo(jetGeo);
		setMat(planeMat);
		gsap.to(camera.position, { y: 4, z: 7, duration: 0.5, delay: 0.3 });
		gsap.to(camera.rotation, { x: -Math.PI / 6, duration: 0.5, delay: 0.3 });
		gsap.to(planeMat.emissive, {
			r: 0,
			g: 0,
			b: 0,
			duration: 0.3,
			ease: "power3",
			onStart: () => {},
		});
		gsap.to(squareMeshRef.current.rotation, {
			x: -Math.PI / 2,
			z: Math.PI / 4,
			duration: 0.5,
		});
		gsap.to(temValueRef, {
			current: 1,
			duration: 1,
			onUpdate: () => {
				setTemValue(temValueRef.current);
				cloudAniValRef.current = temValueRef.current;
			},
			onComplete: () => {
				onCompleteFunction();
			},
		});
	};

	const jetToSquare = (onCompleteFunction) => {
		gsap.to(camera.position, { x: 0, y: 0, z: 5, duration: 0.5 });
		gsap.to(camera.rotation, { x: 0, duration: 0.5 });
		gsap.to(planeMat.emissive, {
			r: 1,
			g: 1,
			b: 1,
			duration: 0.3,
			delay: 0.7,
			ease: "power3.in",
		});
		gsap.to(squareMeshRef.current.rotation, {
			x: 0,
			z: 0,
			duration: 0.5,
		});
		gsap.to(temValueRef, {
			current: 0,
			duration: 1,
			onUpdate: () => {
				setTemValue(temValueRef.current);
				cloudAniValRef.current = temValueRef.current;
			},
			onComplete: () => {
				onCompleteFunction();
			},
		});
	};

	useEffect(() => {
		appStateManager.send("init some context", {
			squareToJet,
			jetToSquare,
		});
	}, []);

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
		const rL1 = gsap.utils.interpolate(0, rotateLevel1, temValueSt);
		const rL2 = gsap.utils.interpolate(0, rotateLevel2, temValueSt);
		const rL3 = gsap.utils.interpolate(0, rotateLevel3, temValueSt);
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
	}, [temValueSt]);

	return <></>;
}
