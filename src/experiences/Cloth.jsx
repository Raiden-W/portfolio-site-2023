import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";

export default function Cloth({ setGeo, setMat }) {
	const viewport = useThree((state) => state.viewport);

	const initParticlePos = useRef([]);

	const [activePlaneSt, setActivePlane] = useState(true);

	const { clothGrabInitPos, clonedCanvas, currState } = useSelector(
		appStateManager,
		(s) => {
			return {
				clothGrabInitPos: s.context.clothGrabInitPos,
				clonedCanvas: s.context.clonedCanvas,
				currState: s.value,
			};
		}
	);

	const clothPhysics = useMemo(() => {
		const world = new CANNON.World();
		world.gravity.set(0, -2, 0);
		//defualt iteration number is 10
		world.solver.iterations = 8;
		world.allowSleep = true;

		const Nx = 15;
		const Ny = 15;
		const clothMass = 0.01;
		const clothInitWidth = viewport.width;
		const clothInitHeight = viewport.height;
		const initDistX = clothInitWidth / Nx;
		const initDistY = clothInitHeight / Ny;
		const distX = initDistX * (initDistX > initDistY ? 0.5 : 0.7);
		const distY = initDistY * (initDistX > initDistY ? 0.6 : 0.5);
		// const resetDist = distX < distY ? distX : distY;
		const resetDist = 2 / Nx;

		const limitBase = initDistX > initDistY ? distX : distY;

		const shape = new CANNON.Sphere(limitBase * 0.6);

		const particles = [];

		for (let i = 0; i < Nx + 1; i++) {
			particles.push([]);
			initParticlePos.current.push([]);
			for (let j = 0; j < Ny + 1; j++) {
				const particle = new CANNON.Body({
					mass: clothMass,
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

		const updateClothGeo = () => {
			const positionAttribute = squareGeo.attributes.position;
			for (let i = 0; i < Nx + 1; i++) {
				for (let j = 0; j < Ny + 1; j++) {
					const index = j * (Nx + 1) + i;
					const position = particles[i][Ny - j].position;
					positionAttribute.setXYZ(index, position.x, position.y, position.z);
				}
			}
			positionAttribute.needsUpdate = true;
			squareGeo.computeVertexNormals();
		};

		const centerPos =
			particles[Math.floor(Nx / 2)][Math.floor(Ny / 2)].position;

		return {
			Nx,
			Ny,
			clothInitWidth,
			clothInitHeight,
			clothMass,
			world,
			updateClothGeo,
			particles,
			centerPos,
		};
	}, []);

	const squareGeo = useMemo(() => {
		return new THREE.PlaneGeometry(
			clothPhysics.clothInitWidth,
			clothPhysics.clothInitHeight,
			clothPhysics.Nx,
			clothPhysics.Ny
		);
	}, []);

	const squareMat = useMemo(() => {
		return new THREE.MeshPhongMaterial({
			specular: "#6c6c6c",
			shininess: 18,
			side: THREE.DoubleSide,
			emissive: "#000000",
		});
	}, []);

	useEffect(() => {
		setGeo(squareGeo);
		appStateManager.send("init some context", { squareGeo, squareMat });
	}, []);

	useEffect(() => {
		//set canvas texture to cloth
		if (clonedCanvas) {
			squareMat.map = new THREE.CanvasTexture(clonedCanvas);
			squareMat.needsUpdate = true;
			setMat(squareMat);
			appStateManager.send("set cloth texture");
		}
	}, [clonedCanvas]);

	const staticParticle = useMemo(() => {
		//init static particle
		if (clothGrabInitPos) {
			const iStatic = Math.round(clothGrabInitPos.x * clothPhysics.Nx);
			const jStatic = Math.round(clothGrabInitPos.y * clothPhysics.Ny);
			const theParticle = clothPhysics.particles[iStatic][jStatic];
			theParticle.mass = 0;
			theParticle.updateMassProperties();
			return theParticle;
		} else {
			return clothPhysics.particles[0][0];
		}
	}, [clothGrabInitPos]);

	const updateGrabingParticlePos = (e) => {
		if (currState === "Cloth Grabing") {
			staticParticle.position.x = e.point.x;
			staticParticle.position.y = e.point.y;
		}
	};

	const setFreeCloth = () => {
		staticParticle.mass = clothPhysics.clothMass;
		staticParticle.updateMassProperties();
		staticParticle.type = 1;
	};

	useEffect(() => {
		if (currState === "Cloth Falling") {
			setTimeout(() => {
				setFreeCloth();
			}, [100]);
		}
	}, [currState]);

	const clothToSquareGeoTrans = () => {
		const Nx = clothPhysics.Nx;
		const Ny = clothPhysics.Ny;
		const positionAttribute = squareGeo.attributes.position;
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
					duration: 0.7,
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
							squareGeo.computeVertexNormals();
						}
					},
				});
			}
		}
		gsap.to(squareMat.emissive, {
			r: 1,
			b: 1,
			g: 1,
			duration: 0.5,
			ease: "power3.in",
			delay: 0.5,
			onComplete: () => {
				appStateManager.send("cloth to square finished");
				squareMat.map.dispose();
				squareMat.map = null;
			},
		});
		setActivePlane(false);
	};

	useFrame(() => {
		if (currState === "Cloth Grabing" || currState === "Cloth Falling") {
			clothPhysics.world.fixedStep();
			clothPhysics.updateClothGeo();

			if (currState === "Cloth Falling") {
				if (
					clothPhysics.centerPos.y < -viewport.height * 0.7 ||
					clothPhysics.centerPos.y > viewport.height * 0.7 ||
					clothPhysics.centerPos.x < -viewport.width * 0.6 ||
					clothPhysics.centerPos.x > viewport.width * 0.6
				) {
					clothToSquareGeoTrans();
					appStateManager.send("cloth nearly out");
				}
			}
		}
	});

	return (
		<>
			{/* plane to catch the mouse raycast */}
			{activePlaneSt && (
				<Plane
					visible={false}
					args={[viewport.width, viewport.height]}
					onPointerMove={updateGrabingParticlePos}
					onPointerUp={() => {
						appStateManager.send("mouse up canvas");
					}}
				/>
			)}
		</>
	);
}
