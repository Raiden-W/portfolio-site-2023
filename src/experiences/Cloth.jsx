import { Plane } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as CANNON from "cannon-es";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { myEventEmitter } from "../utils/EventEmitter";

export default function Cloth({ openingCanvas }) {
	const state = useThree();

	const clothGeoRef = useRef();
	const planeRef = useRef();

	const isGrabing = useRef(false);
	const isPhysics = useRef(false);

	const [clothTextureSt, setClothTexture] = useState(null);

	useEffect(() => {
		if (openingCanvas) {
			setClothTexture(new THREE.CanvasTexture(openingCanvas));
			isGrabing.current = true;
			setTimeout(() => {
				isPhysics.current = true;
			}, 20);
			myEventEmitter.emit("TextureReady");
		}
	}, [openingCanvas]);

	const clothPhysics = useMemo(() => {
		const world = new CANNON.World();
		world.gravity.set(0, -1, 0);
		//defualt iteration number is 10
		// world.solver.iterations = 15;

		const Nx = 15;
		const Ny = 15;
		const clothMass = 0.1;
		const clothInitWidth = state.viewport.width;
		const clothInitHeight = state.viewport.height;
		const initDistX = clothInitWidth / Nx;
		const initDistY = clothInitHeight / Ny;
		const dist = initDistY * 0.8;

		const shape = new CANNON.Sphere(0.17);

		const particles = [];

		for (let i = 0; i < Nx + 1; i++) {
			particles.push([]);
			for (let j = 0; j < Ny + 1; j++) {
				const particle = new CANNON.Body({
					// mass: j === Ny ? 0 : clothMass,
					mass: i === 6 && j === 8 ? 0 : clothMass,
					shape,
				});
				particle.position.set(
					(i - Nx / 2) * initDistX,
					(j - Ny / 2) * initDistY,
					0
				);
				particle.velocity.set(0, 0, 0.01 * (Ny - j));

				particles[i].push(particle);
				world.addBody(particle);
			}
		}

		const connect = (i1, j1, i2, j2) => {
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
				if (i < Nx) connect(i, j, i + 1, j);
				if (j < Ny) connect(i, j, i, j + 1);
			}
		}

		const updateClothGeo = () => {
			for (let i = 0; i < Nx + 1; i++) {
				for (let j = 0; j < Ny + 1; j++) {
					const index = j * (Nx + 1) + i;

					const positionAttribute = clothGeoRef.current.attributes.position;

					const position = particles[i][Ny - j].position;

					positionAttribute.setXYZ(index, position.x, position.y, position.z);

					positionAttribute.needsUpdate = true;

					clothGeoRef.current.computeVertexNormals();
				}
			}
		};

		return { Nx, Ny, world, updateClothGeo, particles };
	}, []);

	const grabPositionHandler = (e) => {
		if (isGrabing.current) {
			clothPhysics.particles[6][8].position.x = e.point.x;
			clothPhysics.particles[6][8].position.y = e.point.y;
		}
	};

	useFrame(() => {
		if (isPhysics.current) {
			clothPhysics.world.fixedStep();
			clothPhysics.updateClothGeo();
		}
	});

	return (
		<>
			<Plane
				visible={false}
				args={[15, 10]}
				ref={planeRef}
				onPointerMove={grabPositionHandler}
				onPointerDown={() => {
					isGrabing.current = true;
				}}
				onPointerUp={() => {
					isGrabing.current = false;
				}}
			/>
			<mesh>
				<planeGeometry
					args={[
						state.viewport.width,
						state.viewport.height,
						clothPhysics.Nx,
						clothPhysics.Ny,
					]}
					ref={clothGeoRef}
				/>
				{clothTextureSt ? (
					<meshPhongMaterial
						map={clothTextureSt}
						specular="#b0b0b0"
						shininess={18}
						side={THREE.DoubleSide}
					></meshPhongMaterial>
				) : null}
			</mesh>
		</>
	);
}
