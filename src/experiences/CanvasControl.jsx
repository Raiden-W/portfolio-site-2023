import { useThree } from "@react-three/fiber";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import { useCallback, useEffect } from "react";
import gsap from "gsap";

export default function CanvasControl({ canvasContainerRef }) {
	const setSize = useThree((s) => s.setSize);
	const camera = useThree((s) => s.camera);

	const { canvasWidthSt, worksAreaWidthSt } = useSelector(
		appStateManager,
		(s) => ({
			canvasWidthSt: s.context.canvasWidth,
			worksAreaWidthSt: s.context.worksAreaWidth,
		})
	);

	const smoothCameraX = gsap.quickTo(camera.position, "x", {
		duration: 0.8,
		ease: "power2",
	});
	const smoothCameraY = gsap.quickTo(camera.position, "y", {
		duration: 0.8,
		ease: "power2",
	});

	const moveCamera = useCallback((e) => {
		const canvasW = canvasContainerRef.current.clientWidth;
		const canvasH = canvasContainerRef.current.clientHeight;
		const factor = 0.01;
		const unitX = e.clientX / canvasW - 0.5;
		const unitY = 1 - e.clientY / canvasH - 0.5;
		smoothCameraX(unitX * canvasW * factor);
		smoothCameraY(unitY * canvasH * factor + 4);
	}, []);

	const addMoveCamera = () => {
		canvasContainerRef.current.addEventListener("mousemove", moveCamera, true);
	};

	const removeMoveCamera = () => {
		canvasContainerRef.current.removeEventListener(
			"mousemove",
			moveCamera,
			true
		);
	};

	const pauseSmoothCamera = () => {
		smoothCameraX.tween.pause();
		smoothCameraY.tween.pause();
	};

	const resumeSmoothCamera = () => {
		smoothCameraX.tween.invalidate();
		smoothCameraY.tween.invalidate();
	};

	useEffect(() => {
		appStateManager.send("init some context", {
			addMoveCamera,
			removeMoveCamera,
			pauseSmoothCamera,
			resumeSmoothCamera,
		});
	}, []);

	useEffect(() => {
		setSize(canvasWidthSt * 0.01 * window.innerWidth, window.innerHeight, true);
		canvasContainerRef.current.style.width = `${canvasWidthSt}%`;
		canvasContainerRef.current.style.left = `${worksAreaWidthSt}%`;
	}, [canvasWidthSt]);

	return <></>;
}
