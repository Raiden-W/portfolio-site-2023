import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { myEventEmitter } from "../utils/EventEmitter";
import gsap from "gsap";

export default function Cloth({ openingOutputSt }) {
	const state = useThree();

	const clothGeoRef = useRef();
	const clothMeshRef = useRef();

	const initParticlePos = useRef([]);

	const isGrabing = useRef(false);
	const isPhysics = useRef(false);
	const isClothFree = useRef(false);

	const [clothTextureSt, setClothTexture] = useState(null);
	const [activePlaneSt, setActivePlane] = useState(true);

	const clothPhysics = useMemo(() => {
		const world = new CANNON.World();
		world.gravity.set(0, -2, 0);
		//defualt iteration number is 10
		world.solver.iterations = 15;

		const Nx = 15;
		const Ny = 15;
		const clothMass = 0.01;
		const clothInitWidth = state.viewport.width;
		const clothInitHeight = state.viewport.height;
		const initDistX = clothInitWidth / Nx;
		const initDistY = clothInitHeight / Ny;
		const distX = initDistX * (initDistX > initDistY ? 0.5 : 0.7);
		const distY = initDistY * (initDistX > initDistY ? 0.6 : 0.5);
		// const resetDist = distX < distY ? distX : distY;
		const resetDist = 2 / Nx;

		const limitBase = initDistX > initDistY ? distX : distY;

		const shape = new CANNON.Sphere(limitBase * 0.6);

		const particles = [];

		const initClothPhysics = (iStatic, jStatic) => {
			for (let i = 0; i < Nx + 1; i++) {
				particles.push([]);
				initParticlePos.current.push([]);
				for (let j = 0; j < Ny + 1; j++) {
					const particle = new CANNON.Body({
						mass: i === iStatic && j === jStatic ? 0 : clothMass,
						shape,
					});
					particle.position.set(
						(i - Nx / 2) * initDistX,
						(j - Ny / 2) * initDistY,
						0
					);

					initParticlePos.current[i][j] = {
						x: (i - Nx / 2) * resetDist,
						y: (j - Ny / 2) * resetDist,
					};
					particle.velocity.set(0, 0, 0.01 * (Ny - j));

					particles[i].push(particle);
					world.addBody(particle);
				}
			}

			const connect = (i1, j1, i2, j2, dist) => {
				world.addConstraint(
					new CANNON.DistanceConstraint(
						particles[i1][j1],
						particles[i2][j2],
						dist
					)
				);
			};

			for (let i = 0; i < Nx + 1; i++) {
				for (let j = 0; j < Ny + 1; j++) {
					if (i < Nx) connect(i, j, i + 1, j, distX);
					if (j < Ny) connect(i, j, i, j + 1, distY);
				}
			}
		};

		const updateClothGeo = () => {
			const positionAttribute = clothGeoRef.current.attributes.position;
			for (let i = 0; i < Nx + 1; i++) {
				for (let j = 0; j < Ny + 1; j++) {
					const index = j * (Nx + 1) + i;
					const position = particles[i][Ny - j].position;
					positionAttribute.setXYZ(index, position.x, position.y, position.z);
				}
			}
			positionAttribute.needsUpdate = true;
			clothGeoRef.current.computeVertexNormals();
		};

		return {
			Nx,
			Ny,
			clothInitWidth,
			clothInitHeight,
			clothMass,
			world,
			updateClothGeo,
			initClothPhysics,
			particles,
		};
	}, []);

	const { iStatic, jStatic } = useMemo(() => {
		if (openingOutputSt) {
			setClothTexture(new THREE.CanvasTexture(openingOutputSt.canvas));

			const iStatic = Math.round(openingOutputSt.pointPos.x * clothPhysics.Nx);
			const jStatic = Math.round(openingOutputSt.pointPos.y * clothPhysics.Ny);

			clothPhysics.initClothPhysics(iStatic, jStatic);

			isGrabing.current = true;
			setTimeout(() => {
				isPhysics.current = true;
			}, 20);
			myEventEmitter.emit("TextureReady");
			return { iStatic, jStatic };
		} else {
			return { iStatic: 0, jStatic: 0 };
		}
	}, [openingOutputSt]);

	const grabPositionHandler = (e) => {
		if (isGrabing.current) {
			const staticParticle = clothPhysics.particles[iStatic][jStatic];
			staticParticle.position.x = e.point.x;
			staticParticle.position.y = e.point.y;
		}
	};

	const setFreeCloth = () => {
		const staticParticle = clothPhysics.particles[iStatic][jStatic];
		staticParticle.mass = clothPhysics.clothMass;
		staticParticle.updateMassProperties();
		staticParticle.type = 1;
	};

	const resetClothGeo = () => {
		const Nx = clothPhysics.Nx;
		const Ny = clothPhysics.Ny;
		const positionAttribute = clothGeoRef.current.attributes.position;
		for (let i = 0; i < Nx + 1; i++) {
			for (let j = 0; j < Ny + 1; j++) {
				const index = j * (Nx + 1) + i;
				const targetPos = initParticlePos.current[i][Ny - j];
				const currPos = {
					currPosX: positionAttribute.getX(index),
					currPosY: positionAttribute.getY(index),
					currPosZ: positionAttribute.getZ(index),
				};

				gsap.to(currPos, {
					currPosX: targetPos.x,
					currPosY: targetPos.y,
					currPosZ: 0,
					duration: 1,
					ease: "expo.inOut",
					onUpdate: () => {
						positionAttribute.setXYZ(
							index,
							currPos.currPosX,
							currPos.currPosY,
							currPos.currPosZ
						);
						if (i === Nx && j === Ny) {
							positionAttribute.needsUpdate = true;
							clothGeoRef.current.computeVertexNormals();
						}
					},
				});
			}
		}
		setActivePlane(false);
	};

	// const rotateClothMesh = () => {
	// 	gsap.to(clothMeshRef.current.rotation, {
	// 		x: -Math.PI / 2.5,
	// 		duration: 1.5,
	// 		ease: "expo.inOut",
	// 	});
	// };

	useFrame(() => {
		if (isPhysics.current) {
			clothPhysics.world.fixedStep();
			clothPhysics.updateClothGeo();
		}
		if (isClothFree.current) {
			const centerParticle =
				clothPhysics.particles[Math.floor(clothPhysics.Nx / 2)][
					Math.floor(clothPhysics.Ny / 2)
				];
			if (
				centerParticle.position.y < -state.viewport.height * 0.9 ||
				centerParticle.position.y > state.viewport.height * 0.8 ||
				centerParticle.position.x < -state.viewport.width * 0.7 ||
				centerParticle.position.x > state.viewport.width * 0.7
			) {
				isPhysics.current = false;
				isClothFree.current = false;
				resetClothGeo();
				// rotateClothMesh();
			}
		}
	});

	return (
		<>
			{/* plane to catch the mouse raycast */}
			{activePlaneSt && (
				<Plane
					visible={false}
					args={[15, 10]}
					onPointerMove={grabPositionHandler}
					onPointerUp={() => {
						isGrabing.current = false;
						setFreeCloth();
						isClothFree.current = true;
					}}
				/>
			)}
			<mesh ref={clothMeshRef}>
				<planeGeometry
					args={[
						clothPhysics.clothInitWidth,
						clothPhysics.clothInitHeight,
						clothPhysics.Nx,
						clothPhysics.Ny,
					]}
					ref={clothGeoRef}
				/>
				{clothTextureSt ? (
					<meshPhongMaterial
						map={clothTextureSt}
						specular="#6c6c6c"
						shininess={18}
						side={THREE.DoubleSide}
						// wireframe
					></meshPhongMaterial>
				) : null}
			</mesh>
		</>
	);
}
