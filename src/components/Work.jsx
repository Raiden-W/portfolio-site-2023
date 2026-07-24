import { useEffect, useMemo, useRef } from "react";
import "./Work.scss";
import { useDrag } from "@use-gesture/react";
import { gsap } from "gsap";
import ReactMarkdown from "react-markdown";
import appStateManager from "../utils/appStateManager";
import arrowIcon from "../assets/arrow.svg";

const mediaOffsetMargin = 32;

function Work({
	title = "Unknown Title",
	sub = "*",
	category,
	showCategory = false,
	isChinese = false,
	workId,
	mediaSet = [],
	techTools = "Boring tech stuff",
	description = "Bah Lah Bah Lah Bah Lah Bah Lah",
	externalLinks = [],
	windowWidth,
	ifVertical,
	workAreaActive,
	foldOtherWorks,
	setIfAnyUnfold,
	setExpandedWorkId,
	stopAllVideos,
}) {
	const categoryLabels = {
		commercial: isChinese ? "商业项目" : "Commercial",
		exploration: isChinese ? "个人探索" : "Exploration",
		sandbox: isChinese ? "沙盒实验" : "Sandbox",
	};
	const categoryLabel = categoryLabels[category];

	const mediaContainerRef = useRef();
	const borderLeftRef = useRef(-300);
	const borderRightRef = useRef(0);
	const mediaOffsetXRef = useRef(0);
	const mediaContainerWidthRef = useRef(0);

	const workRef = useRef();
	const videosRef = useRef();

	useEffect(() => {
		videosRef.current = mediaContainerRef.current.querySelectorAll("video");
	}, []);

	useEffect(() => {
		const mediaContainerWidth = Number(
			getComputedStyle(mediaContainerRef.current).width.replace("px", "")
		);
		mediaContainerWidthRef.current = mediaContainerWidth;
	}, [windowWidth, workAreaActive, ifVertical]);

	useEffect(() => {
		const diff = ifVertical
			? mediaContainerWidthRef.current - windowWidth
			: mediaContainerWidthRef.current - 60 * 0.01 * windowWidth;

		if (diff >= -mediaOffsetMargin * 2) {
			borderLeftRef.current = -diff - mediaOffsetMargin;
			borderRightRef.current = 0;
		} else {
			borderLeftRef.current = 0;
			borderRightRef.current = -diff - mediaOffsetMargin;
		}
		if (mediaOffsetXRef.current < borderLeftRef.current) {
			smoothTo(borderLeftRef.current);
		}
	}, [windowWidth, mediaContainerWidthRef.current, workAreaActive, ifVertical]);

	const smoothTo = useMemo(() => {
		if (mediaContainerRef.current) {
			return gsap.quickTo(mediaContainerRef.current, "x", {
				duration: 0.3,
				ease: "circ",
			});
		} else return () => {};
	}, [mediaContainerRef.current, workAreaActive, ifVertical]);

	const bind = useDrag(
		({ offset: [ox] }) => {
			smoothTo(ox);
			mediaOffsetXRef.current = ox;
		},
		{
			bounds: () => {
				return {
					left: borderLeftRef.current,
					right: borderRightRef.current,
				};
			},
			rubberband: 0.2,
		}
	);

	const handleDropDown = () => {
		const classList = workRef.current.classList;
		//open this work
		if (classList.contains("fold")) {
			//close other works and stop all videos
			foldOtherWorks();
			setIfAnyUnfold(true);
			setExpandedWorkId(workId);
			stopAllVideos();

			classList.replace("fold", "unfold");
			videosRef.current.forEach((video) => {
				video.play();
			});
			//close this work
		} else {
			classList.replace("unfold", "fold");
			setIfAnyUnfold(false);
			setExpandedWorkId(null);
			videosRef.current.forEach((video) => {
				video.pause();
			});
		}
	};

	return (
		<div
			className="work fold"
			ref={workRef}
			onMouseEnter={() => {
				appStateManager.send("enter one work", { workId });
			}}
		>
			<header className="work__header" onClick={handleDropDown}>
				<div className="work__header-flexbox">
					<h2 className="work__header-title cms-copy">{title}</h2>
					<img
						className="work__header-arrow"
						src={arrowIcon}
						alt="arrow icon"
					/>
				</div>
				<div className="work__header-sub-row">
					<p className="work__header-sub cms-copy">{sub}</p>
					{showCategory && categoryLabel && (
						<span className="work__header-category cms-copy">
							{categoryLabel}
						</span>
					)}
				</div>
			</header>
			<div className="work__foldable">
				<div className="work__media-set" {...bind()}>
					<div className="work__media-set-container" ref={mediaContainerRef}>
						{mediaSet.map((media) => (
							<div key={media.id} className="work__media-set-container-item">
								{media.type === "video" ? (
									<video
										muted
										loop
										src={media.url}
										playsInline
										preload="metadata"
										controls={false}
									/>
								) : (
									<img
										draggable="false"
										src={media.url}
										alt={media.alternativeText}
									/>
								)}
							</div>
						))}
					</div>
				</div>
				<p className="work__tech-tools">{techTools}</p>
				<ReactMarkdown className="work__description cms-copy">
					{description}
				</ReactMarkdown>
				<div className="work__links-container cms-copy">
					{externalLinks.map((link) => (
						<a target="_blank" rel="noreferrer" href={link.url} key={link.id}>
							{link.displayedText} <span>&#8594;</span>
						</a>
					))}
				</div>
			</div>
		</div>
	);
}

export default Work;
