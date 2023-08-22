import "./App.css";
import MyScene from "./experiences/MyScene";
import Opening from "./components/Opening";
import { useState } from "react";

function App() {
	const [openingCanvasSt, setOpeningCanvas] = useState(null);

	return (
		<>
			<MyScene openingCanvas={openingCanvasSt} />
			<Opening setOpeningCanvas={setOpeningCanvas} />
		</>
	);
}

export default App;
