import { useRef } from "react";
import "./InfoArea.scss";
import { useWidthStore } from "../utils/GlobalStore";

function InfoArea() {
	const areaWidthSt = useWidthStore((state) => state.infoAreaWSt);
	const areaActiveSt = useWidthStore((state) => state.infoAreaActiveSt);

	const openInfoArea = useWidthStore((state) => state.openInfoArea);
	const closeInfoArea = useWidthStore((state) => state.closeInfoArea);

	const containerRef = useRef();

	const activeInfoBar = () => {
		areaActiveSt
			? closeInfoArea(containerRef.current)
			: openInfoArea(containerRef.current);
	};

	return (
		<div className="info-area" style={{ width: `${areaWidthSt}%` }}>
			<div className="info-area__bar" onClick={activeInfoBar}>
				<span>about</span>
			</div>
			<div className="info-area__container" ref={containerRef}>
				Info Info Info Info Info Info Info Info
			</div>
		</div>
	);
}

export default InfoArea;
