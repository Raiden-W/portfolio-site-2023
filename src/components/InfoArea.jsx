import { useRef } from "react";
import "./InfoArea.scss";
import { useWidthStore } from "../utils/GlobalStore";

function InfoArea() {
	const areaWidthSt = useWidthStore((state) => state.infoAreaWSt);
	const areaActiveSt = useWidthStore((state) => state.infoAreaActiveSt);

	const openInfoArea = useWidthStore((state) => state.openInfoArea);
	const closeInfoArea = useWidthStore((state) => state.closeInfoArea);

	const activeInfoBar = () => {
		areaActiveSt ? closeInfoArea() : openInfoArea();
	};

	return (
		<div className="info-area" style={{ width: `${areaWidthSt}%` }}>
			<div className="info-bar" onClick={activeInfoBar}>
				<span>about</span>
			</div>
			{/* <p className="works-area__contatiner--tem">
				aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
			</p> */}
		</div>
	);
}

export default InfoArea;
