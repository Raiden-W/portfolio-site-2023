import { useEffect, useRef, useState } from "react";
import "./WorksArea.scss";
import { useWidthStore } from "../utils/GlobalStore";
import { useGetWorks } from "../utils/serviceHooks";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Work from "./Work";

function WorksArea() {
	const areaWidthSt = useWidthStore((state) => state.worksAreaWSt);
	const areaActiveSt = useWidthStore((state) => state.worksAreaActiveSt);

	const openWorksArea = useWidthStore((state) => state.openWorksArea);
	const closeWorksArea = useWidthStore((state) => state.closeWorksArea);

	const containerRef = useRef();

	const [windowWidthSt, setWindowWidth] = useState(window.innerWidth);

	const { worksDataSt } = useGetWorks();

	useEffect(() => {
		const updateWindowWidth = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", updateWindowWidth);

		return () => {
			window.removeEventListener("resize", updateWindowWidth);
		};
	}, []);

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
				<SimpleBar style={{ maxHeight: "100%" }}>
					{worksDataSt.map((workData) => (
						<Work
							windowWidth={windowWidthSt}
							key={workData.id}
							title={workData.title}
							techTools={workData.techTools}
							description={workData.description}
							externalLinks={workData.externalLinks}
							mediaSet={workData.mediaSet}
						/>
					))}
				</SimpleBar>
			</div>
		</div>
	);
}

export default WorksArea;
