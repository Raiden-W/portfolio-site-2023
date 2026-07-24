import { useThree } from "@react-three/fiber";
import appStateManager from "../utils/appStateManager";
import { useCallback, useEffect, useMemo } from "react";
import gsap from "gsap";

export default function CanvasControl({
	canvasContainerRef,
	squareMeshRef,
	ifVertical,
}) {
	const viewport = useThree((s) => s.viewport);
	const camera = useThree((s) => s.camera);

	const smoothCameraX = useMemo(
		() =>
			gsap.quickTo(camera.position, "x", {
				duration: 0.8,
				ease: "power2",
			}),
		[camera]
	);
	const smoothCameraY = useMemo(
		() =>
			gsap.quickTo(camera.position, "y", {
				duration: 0.8,
				ease: "power2",
			}),
		[camera]
	);

	const pauseSmoothCamera = useCallback(() => {
		smoothCameraX.tween.pause();
		smoothCameraY.tween.pause();
	}, [smoothCameraX, smoothCameraY]);

	const resumeSmoothCamera = useCallback(() => {
		smoothCameraX.tween.invalidate();
		smoothCameraY.tween.invalidate();
	}, [smoothCameraX, smoothCameraY]);

	const mouseMoveCamera = useCallback(
		(e) => {
			const canvasW = canvasContainerRef.current.clientWidth;
			const canvasH = canvasContainerRef.current.clientHeight;
			const factor = 0.005;
			const unitX = e.clientX / canvasW - 0.5;
			const unitY = 1 - e.clientY / canvasH - 0.5;
			smoothCameraX(unitX * canvasW * factor);
			smoothCameraY(unitY * canvasH * factor + 3);
		},
		[canvasContainerRef, smoothCameraX, smoothCameraY]
	);

	const touchMoveCamera = useCallback(
		(e) => {
			e.preventDefault();
			const touch = e.changedTouches[0];
			const canvasW = canvasContainerRef.current.clientWidth;
			const canvasH = canvasContainerRef.current.clientHeight;
			const factor = 0.005;
			const unitX = touch.clientX / canvasW - 0.5;
			const unitY = 1 - touch.clientY / canvasH - 0.5;
			smoothCameraX(unitX * canvasW * factor);
			smoothCameraY(unitY * canvasH * factor + 3);
		},
		[canvasContainerRef, smoothCameraX, smoothCameraY]
	);

	const addMoveCamera = useCallback(() => {
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
	}, [canvasContainerRef, mouseMoveCamera, touchMoveCamera]);

	const removeMoveCamera = useCallback(() => {
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
	}, [canvasContainerRef, mouseMoveCamera, touchMoveCamera]);

	const updateCanvasLayout = useCallback(
		(worksAreaWidth, infoAreaWidth) => {
			if (ifVertical) {
				const newPosY =
					viewport.getCurrentViewport().height *
					(worksAreaWidth - infoAreaWidth * 1.5) *
					0.01 *
					0.5;
				squareMeshRef.current.position.y = -newPosY;
				squareMeshRef.current.position.x = 0;
				squareMeshRef.current.scale.setScalar(0.65);
				return;
			}

			const newPosX =
				viewport.getCurrentViewport().width *
				(worksAreaWidth - infoAreaWidth) *
				0.01 *
				0.5;
			squareMeshRef.current.position.x = newPosX;
			squareMeshRef.current.position.y = 0;
			squareMeshRef.current.scale.setScalar(1);
		},
		[ifVertical, squareMeshRef, viewport]
	);

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
			updateCanvasLayout,
		});
	}, [
		addMoveCamera,
		pauseSmoothCamera,
		removeMoveCamera,
		resumeSmoothCamera,
		squareMeshRef,
		updateCanvasLayout,
	]);

	useEffect(() => {
		const state = appStateManager.getSnapshot?.() ?? appStateManager.state;
		updateCanvasLayout(state.context.worksAreaWidth, state.context.infoAreaWidth);
	}, [updateCanvasLayout]);

	return <></>;
}
