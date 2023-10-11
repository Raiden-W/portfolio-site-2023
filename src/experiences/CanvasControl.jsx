import { useThree } from "@react-three/fiber";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import { useEffect } from "react";

export default function CanvasControl({ canvasContainerRef }) {
	const setSize = useThree((state) => state.setSize);

	const { canvasWidthSt, worksAreaWidthSt } = useSelector(
		appStateManager,
		(s) => ({
			canvasWidthSt: s.context.canvasWidth,
			worksAreaWidthSt: s.context.worksAreaWidth,
		})
	);

	useEffect(() => {
		setSize(canvasWidthSt * 0.01 * window.innerWidth, window.innerHeight, true);
		canvasContainerRef.current.style.width = `${canvasWidthSt}%`;
		canvasContainerRef.current.style.left = `${worksAreaWidthSt}%`;
	}, [canvasWidthSt]);

	return <></>;
}
