import { shaderMaterial, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useGetHeroImages } from "../utils/serviceHooks";
import * as THREE from "three";
import appStateManager from "../utils/appStateManager";
import squareWorkVert from "./shaders/squareWork.vert";
import squareWorkFrag from "./shaders/squareWork.frag";
import squareInfoVert from "./shaders/squareInfo.vert";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { useFrame, useThree } from "@react-three/fiber";
import { prewarmMaterials } from "./prewarmMaterials";

const seed = Math.random() * 100;

const SquareWorkMat = shaderMaterial(
	{
		uTime: 0,
		uTransition: 0,
		uEmissive: 1,
		uTextureCurr: new THREE.Texture(),
		uTextureCurrRatioHW: 1,
		uTextureNext: new THREE.Texture(),
		uTextureNextRatioHW: 1,
		uSeed: seed,
	},
	squareWorkVert,
	squareWorkFrag
);

const squareInfoMat = new CustomShaderMaterial({
	baseMaterial: THREE.MeshPhongMaterial,
	uniforms: {
		uTime: { value: 0 },
		uTextureDepth: { value: new THREE.Texture() },
		uSeed: { value: Math.random() * 100 },
		uWave: { value: 1 },
	},
	vertexShader: squareInfoVert,
	silent: true,
	color: 0x82807d,
	emissive: 0xffffff,
	specular: 0x7f7d7a,
	shininess: 27,
	flatShading: true,
});

const infoGeo = new THREE.PlaneGeometry(2, 2, 75, 150);

export default function SquareDisplay() {
	const { heroImagesDataSt } = useGetHeroImages();
	const camera = useThree((state) => state.camera);
	const renderer = useThree((state) => state.gl);
	const scene = useThree((state) => state.scene);

	const squareWorkMat = useMemo(() => {
		return new SquareWorkMat();
	}, []);

	const imageUrls = useMemo(() => {
		if (heroImagesDataSt) {
			return heroImagesDataSt.map((ele) => ele.url);
		} else return [];
	}, [heroImagesDataSt]);

	const heroImageTextures = useTexture(imageUrls);

	const profileDepthTexture = useTexture("./img/depth_s.png");

	useEffect(() => {
		if (profileDepthTexture) {
			squareInfoMat.transparent = true;
			squareInfoMat.uniforms.uTextureDepth.value = profileDepthTexture;
		}
	}, [profileDepthTexture]);

	const heroImages = useMemo(() => {
		if (heroImageTextures.length > 0) {
			return heroImagesDataSt.map((data, index) => ({
				texture: heroImageTextures[index],
				workId: data.workId,
				ratioHW: data.height / data.width,
			}));
		} else return null;
	}, [heroImageTextures]);

	useEffect(() => {
		if (squareWorkMat && heroImages) {
			squareWorkMat.transparent = true;
			squareWorkMat.uTextureCurr = heroImages[0].texture;
			squareWorkMat.uTextureCurrRatioHW = heroImages[0].ratioHW;
			squareWorkMat.uTextureNext = heroImages[1].texture;
			squareWorkMat.uTextureNextRatioHW = heroImages[1].ratioHW;
			squareWorkMat.currWorkId = 1;
			appStateManager.send("init some context", {
				heroImages,
				squareWorkMat,
				squareInfoMat,
				infoGeo,
			});

			const workPrewarmGeo = new THREE.PlaneGeometry(2, 2);
			prewarmMaterials({
				renderer,
				scene,
				camera,
				entries: [
					{ geometry: workPrewarmGeo, material: squareWorkMat },
					{ geometry: infoGeo, material: squareInfoMat },
				],
			});
			workPrewarmGeo.dispose();
		}
	}, [camera, heroImages, renderer, scene, squareWorkMat]);

	useFrame((_, delta) => {
		squareWorkMat.uTime += delta;
		squareInfoMat.uniforms.uTime.value += delta;
	});

	return null;
}
