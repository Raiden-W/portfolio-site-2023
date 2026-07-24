import * as THREE from "three";

export const prewarmMaterials = ({
	renderer,
	scene,
	camera,
	entries,
}) => {
	const meshes = entries.map(
		({ geometry, material }) => new THREE.Mesh(geometry, material)
	);

	try {
		scene.add(...meshes);
		renderer.compile(scene, camera);
	} finally {
		scene.remove(...meshes);
	}
};
