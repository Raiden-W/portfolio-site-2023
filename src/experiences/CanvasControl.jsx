import { useThree } from "@react-three/fiber";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import { useCallback, useEffect } from "react";
import gsap from "gsap";

export default function CanvasControl({
	canvasContainerRef,
	squareMeshRef,
	ifVertical,
}) {
	const setSize = useThree((s) => s.setSize);
	const viewport = useThree((s) => s.viewport);
	const camera = useThree((s) => s.camera);

	const { canvasWidthSt, worksAreaWidthSt, infoAreaWidthSt } = useSelector(
		appStateManager,
		(s) => ({
			canvasWidthSt: s.context.canvasWidth,
			worksAreaWidthSt: s.context.worksAreaWidth,
			infoAreaWidthSt: s.context.infoAreaWidth,
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

	const pauseSmoothCamera = () => {
		smoothCameraX.tween.pause();
		smoothCameraY.tween.pause();
	};

	const resumeSmoothCamera = () => {
		smoothCameraX.tween.invalidate();
		smoothCameraY.tween.invalidate();
	};

	const mouseMoveCamera = useCallback((e) => {
		const canvasW = canvasContainerRef.current.clientWidth;
		const canvasH = canvasContainerRef.current.clientHeight;
		const factor = 0.005;
		const unitX = e.clientX / canvasW - 0.5;
		const unitY = 1 - e.clientY / canvasH - 0.5;
		smoothCameraX(unitX * canvasW * factor);
		smoothCameraY(unitY * canvasH * factor + 3);
	}, []);

	const touchMoveCamera = useCallback((e) => {
		e.preventDefault();
		const touch = e.changedTouches[0];
		const canvasW = canvasContainerRef.current.clientWidth;
		const canvasH = canvasContainerRef.current.clientHeight;
		const factor = 0.005;
		const unitX = touch.clientX / canvasW - 0.5;
		const unitY = 1 - touch.clientY / canvasH - 0.5;
		smoothCameraX(unitX * canvasW * factor);
		smoothCameraY(unitY * canvasH * factor + 3);
	}, []);

	const addMoveCamera = () => {
		canvasContainerRef.current.addEventListener(
			"mousemove",
			mouseMoveCamera,
			true
		);
		canvasContainerRef.current.addEventListener(
			"touchstart",
			touchMoveCamera,
			true
		);
		canvasContainerRef.current.addEventListener(
			"touchmove",
			touchMoveCamera,
			true
		);
	};

	const removeMoveCamera = () => {
		canvasContainerRef.current.removeEventListener(
			"mousemove",
			mouseMoveCamera,
			true
		);
		canvasContainerRef.current.removeEventListener(
			"touchstart",
			touchMoveCamera,
			true
		);
		canvasContainerRef.current.removeEventListener(
			"touchmove",
			touchMoveCamera,
			true
		);
	};

	useEffect(() => {
		const smoothProfileX = gsap.quickTo(squareMeshRef.current.rotation, "x", {
			duration: 1.5,
			ease: "power3.out",
		});

		const smoothProfileY = gsap.quickTo(squareMeshRef.current.rotation, "y", {
			duration: 1.5,
			ease: "power3.out",
		});

		const pauseSmoothProfile = () => {
			smoothProfileX.tween.pause();
			smoothProfileY.tween.pause();
		};

		const resumeSmoothProfile = () => {
			smoothProfileX.tween.invalidate();
			smoothProfileY.tween.invalidate();
		};

		appStateManager.send("init some context", {
			addMoveCamera,
			removeMoveCamera,
			pauseSmoothCamera,
			resumeSmoothCamera,
			smoothProfileX,
			smoothProfileY,
			pauseSmoothProfile,
			resumeSmoothProfile,
		});
	}, []);

	useEffect(() => {
		//# expensive solution deals with canvas and div size
		// setSize(canvasWidthSt * 0.01 * window.innerWidth, window.innerHeight);
		// canvasContainerRef.current.style.width = `${canvasWidthSt}%`;
		// canvasContainerRef.current.style.left = `${worksAreaWidthSt}%`;

		//# cheap solution deals with mesh pos
		if (ifVertical) {
			const newPosY =
				viewport.getCurrentViewport().height *
				(worksAreaWidthSt - infoAreaWidthSt * 1.5) *
				0.01 *
				0.5;
			squareMeshRef.current.position.y = -newPosY;
			squareMeshRef.current.position.x = 0;
			squareMeshRef.current.scale.setScalar(0.65);
		} else {
			const newPosX =
				viewport.getCurrentViewport().width *
				(worksAreaWidthSt - infoAreaWidthSt) *
				0.01 *
				0.5;
			squareMeshRef.current.position.x = newPosX;
			squareMeshRef.current.position.y = 0;
			squareMeshRef.current.scale.setScalar(1);
		}
	}, [worksAreaWidthSt, infoAreaWidthSt, viewport, ifVertical]);

	return <></>;
}
