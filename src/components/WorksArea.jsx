import { useEffect, useMemo, useRef, useState } from "react";
import "./WorksArea.scss";
import { useGetWorks } from "../utils/serviceHooks";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Work from "./Work";
import arrowIcon from "../assets/arrow.svg";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import gsap from "gsap";

function WorksArea(props) {
	const containerRef = useRef();
	const areaRef = useRef();

	const [windowWidthSt, setWindowWidth] = useState(window.innerWidth);
	const [allVideosSt, setAllVideosSt] = useState();
	const [ifAnyUnfoldSt, setIfAnyUnfold] = useState(false);

	const { worksDataSt } = useGetWorks();

	const workAreaActiveSt = useSelector(
		appStateManager,
		(s) => s.context.workAreaActive
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
		if (!workAreaActiveSt) {
			foldOtherWorks();
			setIfAnyUnfold(false);
		}
	}, [workAreaActiveSt]);

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
		<div className="works-area" ref={areaRef}>
			<Resize areaRef={areaRef} ifAnyUnfold={ifAnyUnfoldSt} {...props} />
			<div
				className="works-area__bar"
				onClick={() => {
					appStateManager.send("works bar click");
				}}
			>
				<span>works</span>
				<div
					className={
						workAreaActiveSt
							? "works-area__bar-arrow unfold"
							: "works-area__bar-arrow"
					}
				>
					<img src={arrowIcon} alt="arrow icon" />
					<img src={arrowIcon} alt="arrow icon" />
				</div>
			</div>

			<SimpleBar style={{ height: "100%" }}>
				<div className="works-area__container" ref={containerRef}>
					{worksDataSt.map((workData) => (
						<Work
							windowWidth={windowWidthSt}
							workAreaActive={workAreaActiveSt}
							key={workData.id}
							workId={workData.id}
							title={workData.title}
							sub={workData.sub}
							techTools={workData.techTools}
							description={workData.description}
							externalLinks={workData.externalLinks}
							mediaSet={workData.mediaSet}
							foldOtherWorks={foldOtherWorks}
							setIfAnyUnfold={setIfAnyUnfold}
							stopAllVideos={stopAllVideos}
							{...props}
						/>
					))}
				</div>
			</SimpleBar>
		</div>
	);
}

export default WorksArea;

const Resize = ({ areaRef, ifVertical, ifAnyUnfold }) => {
	const worksAreaWidthSt = useSelector(
		appStateManager,
		(s) => s.context.worksAreaWidth
	);

	useEffect(() => {
		if (!ifVertical) {
			areaRef.current.style.width = `${worksAreaWidthSt}%`;
			areaRef.current.style.height = "100%";
		} else {
			if (ifAnyUnfold) {
				gsap.to(areaRef.current.style, {
					height: `${worksAreaWidthSt / 0.6}%`,
					duration: 0.3,
					delay: 1.2,
					ease: "power4.in",
				});
			} else {
				gsap.to(areaRef.current.style, {
					height: `${worksAreaWidthSt}%`,
					duration: 0.3,
				});
			}
			areaRef.current.style.width = "100%";
		}
	}, [worksAreaWidthSt, ifVertical, ifAnyUnfold]);

	return null;
};
