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
const isVerticalLayout = () =>
	window.matchMedia("(orientation: portrait)").matches ||
	window.innerWidth <= breakWidth * 16;

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
	const [ifVerticalSt, setIfVertical] = useState(isVerticalLayout);

	const loadFont = async () => {
		await fontFace.load();
		setFontLoaded(true);
	};

	useEffect(() => {
		loadFont();
		const wrapper = wrapperRef.current;

		const handleResize = () => {
			wrapper.style.height = `${window.innerHeight}px`;
			setIfVertical(isVerticalLayout());
		};

		const disablePinch = (e) => {
			if (e.touches.length > 1) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize, true);
		wrapper.addEventListener("touchstart", disablePinch, true);
		wrapper.addEventListener("touchmove", disablePinch, true);

		return () => {
			window.removeEventListener("resize", handleResize, true);
			wrapper.removeEventListener("touchstart", disablePinch, true);
			wrapper.removeEventListener("touchmove", disablePinch, true);
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
