import { useRef } from "react";
import "./WorksArea.scss";
import { useWidthStore } from "../utils/GlobalStore";
import Work from "./Work";

function WorksArea() {
	const areaWidthSt = useWidthStore((state) => state.worksAreaWSt);
	const areaActiveSt = useWidthStore((state) => state.worksAreaActiveSt);

	const openWorksArea = useWidthStore((state) => state.openWorksArea);
	const closeWorksArea = useWidthStore((state) => state.closeWorksArea);

	const containerRef = useRef();

	const activeWroksArea = () => {
		areaActiveSt
			? closeWorksArea(containerRef.current)
			: openWorksArea(containerRef.current);
	};

	return (
		<div className="works-area" style={{ width: `${areaWidthSt}%` }}>
			<div className="works-area__bar" onClick={activeWroksArea}>
				<span>works</span>
				<div className="works-area__bar-logo"></div>
			</div>
			<div className="works-area__container" ref={containerRef}>
				<Work />
			</div>
		</div>
	);
}

export default WorksArea;
