import { useEffect, useMemo, useRef, useState } from "react";
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
	workId,
	mediaSet = [],
	techTools = "Boring tech stuff",
	description = "Bah Lah Bah Lah Bah Lah Bah Lah",
	externalLinks = [],
	windowWidth,
	foldOtherWorks,
}) {
	const mediaContainerRef = useRef();
	const borderLeftRef = useRef(-300);
	const mediaOffsetXRef = useRef(0);

	const workRef = useRef();

	const mediaContainerWidth = useMemo(
		() =>
			mediaContainerRef.current
				? Number(
						getComputedStyle(mediaContainerRef.current).width.replace("px", "")
				  )
				: 300,
		[mediaContainerRef.current]
	);

	const smoothTo = useMemo(() => {
		if (mediaContainerRef.current) {
			return gsap.quickTo(mediaContainerRef.current, "x", {
				duration: 0.3,
				ease: "circ",
			});
		} else return () => {};
	}, [mediaContainerRef.current]);

	useEffect(() => {
		borderLeftRef.current = -(
			mediaContainerWidth -
			60 * 0.01 * window.innerWidth
		);
		if (mediaOffsetXRef.current < borderLeftRef.current - mediaOffsetMargin) {
			smoothTo(borderLeftRef.current - mediaOffsetMargin);
		}
	}, [mediaContainerWidth, windowWidth]);

	const bind = useDrag(
		({ offset: [ox] }) => {
			smoothTo(ox);
			mediaOffsetXRef.current = ox;
		},
		{
			bounds: () => {
				return {
					left: borderLeftRef.current - mediaOffsetMargin,
					right: 0,
				};
			},
			rubberband: 0.2,
		}
	);

	const handleDropDown = () => {
		const classList = workRef.current.classList;
		if (classList.contains("fold")) {
			foldOtherWorks();
			classList.replace("fold", "unfold");
		} else {
			classList.replace("unfold", "fold");
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
					<h2 className="work__header-title">{title}</h2>
					<img
						className="work__header-arrow"
						src={arrowIcon}
						alt="arrow icon"
					/>
				</div>
				<p className="work__header-sub">{sub}</p>
			</header>
			<div className="work__foldable">
				<div className="work__media-set" {...bind()}>
					<div className="work__media-set-container" ref={mediaContainerRef}>
						{mediaSet.map((media) => (
							<div key={media.id} className="work__media-set-container-item">
								{media.type === "video" ? (
									<video muted autoPlay loop src={media.url} />
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
				<ReactMarkdown className="work__description">
					{description}
				</ReactMarkdown>
				<div className="work__links-container">
					{externalLinks.map((link) => (
						<a target="_blank" href={link.url} key={link.id}>
							{link.displayedText} <span>&#8594;</span>
						</a>
					))}
				</div>
			</div>
		</div>
	);
}

export default Work;
