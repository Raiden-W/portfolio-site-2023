import "./App.css";
import { Canvas } from "@react-three/fiber";
import Experience from "./experiences/Experience";

function App() {
	return (
		<>
			<Canvas
				className="my-canvas"
				camera={{
					fov: 45,
					near: 0.1,
					far: 200,
					position: [-4, 3, 6],
				}}
			>
				<Experience />
				<ambientLight intensity={0.1} />
				<directionalLight color="red" position={[0, 0, 5]} />
			</Canvas>
		</>
	);
}

export default App;
