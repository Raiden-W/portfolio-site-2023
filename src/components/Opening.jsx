import html2canvas from "html2canvas";
import { useCallback, useEffect, useRef } from "react";
import LandingPage from "./landing/LandingPage";
import appStateManager from "../utils/appStateManager";

function eventPoint(event, triggerElement) {
	if (event?.changedTouches?.length) {
		const touch = event.changedTouches[0];
		return { clientX: touch.clientX, clientY: touch.clientY };
	}

	if (typeof event?.clientX === "number" && typeof event?.clientY === "number") {
		return { clientX: event.clientX, clientY: event.clientY };
	}

	if (triggerElement) {
		const rect = triggerElement.getBoundingClientRect();
		return {
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2,
		};
	}

	return {
		clientX: window.innerWidth / 2,
		clientY: window.innerHeight / 2,
	};
}

export default function Opening() {
	const openingRef = useRef(null);
	const hasEnteredRef = useRef(false);
	const activePointerIdRef = useRef(null);

	const handlePointerRelease = useCallback((event) => {
		if (
			activePointerIdRef.current !== null &&
			event.pointerId !== activePointerIdRef.current
		) {
			return;
		}

		const state = appStateManager.getSnapshot();
		if (state.matches("Cloth Grabing")) {
			appStateManager.send("mouse up canvas");
		} else if (state.matches("Cloning Opening")) {
			appStateManager.send("mouse up opening");
		}

		window.removeEventListener("pointerup", handlePointerRelease, true);
		window.removeEventListener("pointercancel", handlePointerRelease, true);
		activePointerIdRef.current = null;
	}, []);

	const cloneOpeningDom = useCallback(async () => {
		const openingDom = openingRef.current;

		if (!openingDom) {
			return;
		}

		const clonedOpeningDom = openingDom.cloneNode(true);
		clonedOpeningDom.style.position = "fixed";
		clonedOpeningDom.style.left = "0";
		clonedOpeningDom.style.top = "0";
		clonedOpeningDom.style.width = `${window.innerWidth}px`;
		clonedOpeningDom.style.height = `${window.innerHeight}px`;
		clonedOpeningDom.style.zIndex = "-1";
		clonedOpeningDom.style.pointerEvents = "none";

		document.body.appendChild(clonedOpeningDom);

		try {
			const canvas = await html2canvas(clonedOpeningDom, {
				logging: false,
				width: window.innerWidth,
				height: window.innerHeight,
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			});
			appStateManager.send("clone finished", { clonedCanvas: canvas });
		} catch (error) {
			console.log(error);
		} finally {
			clonedOpeningDom.remove();
		}
	}, []);

	const enter3D = useCallback(
		({ event, triggerElement } = {}) => {
			if (hasEnteredRef.current) {
				return;
			}

			hasEnteredRef.current = true;

			const { clientX, clientY } = eventPoint(event, triggerElement);
			const pointPos = {
				x: clientX / window.innerWidth,
				y: 1 - clientY / window.innerHeight,
			};

			appStateManager.send("mouse down opening", {
				pointPos,
				cloneOpeningDom,
			});

			if (event?.type === "pointerdown") {
				activePointerIdRef.current = event.pointerId;
				window.addEventListener("pointerup", handlePointerRelease, true);
				window.addEventListener("pointercancel", handlePointerRelease, true);
			} else {
				appStateManager.send("mouse up opening");
			}
		},
		[cloneOpeningDom, handlePointerRelease]
	);

	useEffect(() => {
		appStateManager.send("init some context", {
			openningDom: openingRef.current,
		});

		return () => {
			window.removeEventListener("pointerup", handlePointerRelease, true);
			window.removeEventListener("pointercancel", handlePointerRelease, true);
			activePointerIdRef.current = null;
		};
	}, [handlePointerRelease]);

	return (
		<div ref={openingRef}>
			<LandingPage onEnter3D={enter3D} />
		</div>
	);
}
