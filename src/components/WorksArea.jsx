import { useEffect, useRef, useState } from "react";
import "./WorksArea.scss";
import { useGetWorks } from "../utils/serviceHooks";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Work from "./Work";
import arrowIcon from "../assets/arrow.svg";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";

function WorksArea() {
	const containerRef = useRef();

	const [windowWidthSt, setWindowWidth] = useState(window.innerWidth);
	const [allVideosSt, setAllVideosSt] = useState();

	const { worksDataSt } = useGetWorks();

	const worksAreaWidthSt = useSelector(
		appStateManager,
		(s) => s.context.worksAreaWidth
	);

	useEffect(() => {
		const updateWindowWidth = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", updateWindowWidth);

		appStateManager.send("init some context", {
			worksDom: containerRef.current,
		});

		return () => {
			window.removeEventListener("resize", updateWindowWidth);
		};
	}, []);

	useEffect(() => {
		if (worksDataSt.length > 0) {
			const allVideos = containerRef.current.querySelectorAll("video");
			setAllVideosSt(allVideos);
		}
	}, [worksDataSt]);

	const foldOtherWorks = () => {
		Array.from(containerRef.current.children).forEach((e) => {
			if (e.classList.contains("unfold")) {
				e.classList.replace("unfold", "fold");
			}
		});
	};

	const stopAllVideos = () => {
		allVideosSt.forEach((video) => {
			video.pause();
		});
	};

	return (
		<div className="works-area" style={{ width: `${worksAreaWidthSt}%` }}>
			<div
				className="works-area__bar"
				onClick={() => {
					appStateManager.send("works bar click");
				}}
			>
				<span>works</span>
				<div
					className={
						worksAreaWidthSt > 0
							? "works-area__bar-arrow unfold"
							: "works-area__bar-arrow"
					}
				>
					<img src={arrowIcon} alt="arrow icon" />
					<img src={arrowIcon} alt="arrow icon" />
				</div>
			</div>
			<SimpleBar style={{ maxHeight: "100%" }}>
				<div className="works-area__container" ref={containerRef}>
					{worksDataSt.map((workData) => (
						<Work
							windowWidth={windowWidthSt}
							worksAreaWidth={worksAreaWidthSt}
							key={workData.id}
							workId={workData.id}
							title={workData.title}
							sub={workData.sub}
							techTools={workData.techTools}
							description={workData.description}
							externalLinks={workData.externalLinks}
							mediaSet={workData.mediaSet}
							foldOtherWorks={foldOtherWorks}
							stopAllVideos={stopAllVideos}
						/>
					))}
				</div>
			</SimpleBar>
		</div>
	);
}

export default WorksArea;
