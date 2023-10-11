import { useEffect, useRef } from "react";
import "./InfoArea.scss";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import SimpleBar from "simplebar-react";

function InfoArea() {
	const containerRef = useRef();

	const infoAreaWidthSt = useSelector(
		appStateManager,
		(s) => s.context.infoAreaWidth
	);

	useEffect(() => {
		appStateManager.send("init some context", {
			infoDom: containerRef.current,
		});
	}, []);

	return (
		<div className="info-area" style={{ width: `${infoAreaWidthSt}%` }}>
			<div
				className="info-area__bar"
				onClick={() => {
					appStateManager.send("info bar click");
				}}
			>
				<span>about</span>
			</div>
			<div className="info-area__container" ref={containerRef}>
				<SimpleBar style={{ maxHeight: "100%" }}>
					Info Info Info Info Info Info Info Info Info Info Info Info Info Info
					Info Info Info Info Info Info Info Info Info Info
				</SimpleBar>
			</div>
		</div>
	);
}

export default InfoArea;
