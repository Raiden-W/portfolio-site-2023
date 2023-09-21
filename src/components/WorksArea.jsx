import { useRef } from "react";
import "./WorksArea.scss";
import { useWidthStore } from "../utils/GlobalStore";

function WorksArea() {
	const areaWidthSt = useWidthStore((state) => state.worksAreaWSt);
	const areaActiveSt = useWidthStore((state) => state.worksAreaActiveSt);

	const openWorksArea = useWidthStore((state) => state.openWorksArea);
	const closeWorksArea = useWidthStore((state) => state.closeWorksArea);

	const activeWroksArea = () => {
		areaActiveSt ? closeWorksArea() : openWorksArea();
	};

	return (
		<div className="works-area" style={{ width: `${areaWidthSt}%` }}>
			<div className="works-bar" onClick={activeWroksArea}>
				<span>works</span>
				<div className="works-logo"></div>
			</div>
			{/* <p className="works-area__contatiner--tem">
				aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
			</p> */}
		</div>
	);
}

export default WorksArea;
