import Opening from "./components/Opening";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useSelector } from "@xstate/react";
import WorksArea from "./components/WorksArea";
import InfoArea from "./components/InfoArea";
import LoadingPage from "./components/LoadingPage";
import { useGetTest } from "./utils/serviceHooks";
import languageStateManager from "./utils/languageStateManager";
import "./App.scss";

const ExperienceCanvas = lazy(() => import("./experiences/ExperienceCanvas"));
const fontFace = new FontFace("Koulen", "url(/font/Koulen/Koulen-Regular.ttf)");
document.fonts.add(fontFace);

const breakWidth = 50; //unit - em

function App() {
	const canvasContainerRef = useRef();
	const wrapperRef = useRef();

	const { testSt, errorSt: apiErrorSt } = useGetTest();
	const contentLocaleSt = useSelector(
		languageStateManager,
		(state) =>
			state.context.currentLocale ??
			state.context.requestedLocale ??
			state.context.defaultLocale
	);
	const [fontLoadedSt, setFontLoaded] = useState(false);
	const [ifVerticalSt, setIfVertical] = useState(false);

	const loadFont = async () => {
		await fontFace.load();
		setFontLoaded(true);
	};

	useEffect(() => {
		loadFont();

		const handleResize = () => {
			wrapperRef.current.style.height = `${window.innerHeight}px`;

			const portrait = window.matchMedia("(orientation: portrait)").matches;
			if (portrait || window.innerWidth <= breakWidth * 16) {
				setIfVertical(true);
			} else {
				setIfVertical(false);
			}
		};

		const disablePinch = (e) => {
			if (e.touches.length > 1) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		window.addEventListener("resize", handleResize, true);
		wrapperRef.current.addEventListener("touchstart", disablePinch, true);
		wrapperRef.current.addEventListener("touchmove", disablePinch, true);

		return () => {
			window.removeEventListener("resize", handleResize, true);
		};
	}, []);

	useEffect(() => {
		document.documentElement.lang = contentLocaleSt;
	}, [contentLocaleSt]);

	return (
		<div
			ref={wrapperRef}
			className="app-wrapper"
			data-locale={contentLocaleSt}
		>
			{testSt && (
				<>
					<WorksArea ifVertical={ifVerticalSt} />
					<InfoArea ifVertical={ifVerticalSt} />
					<Suspense fallback={null}>
						<ExperienceCanvas
							canvasContainerRef={canvasContainerRef}
							ifVertical={ifVerticalSt}
						/>
					</Suspense>
				</>
			)}
			{fontLoadedSt && testSt && <Opening />}
			<LoadingPage
				fontLoadedSt={fontLoadedSt}
				testSt={testSt}
				apiErrorSt={apiErrorSt}
			/>
		</div>
	);
}

export default App;
