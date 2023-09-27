import { useEffect, useMemo, useRef, useState } from "react";
import "./Work.scss";
import { useDrag } from "@use-gesture/react";
import { gsap } from "gsap";

const mediaOffsetMargin = 10;

function Work({
	workTitle = "Unknown Title",
	workMedia = "Blank",
	workTechTools = "Unity Three.js Node.js React",
	workDescription = "Bah Lah Bah Lah Bah Lah Bah Lah",
	workViewLink = "/",
	workRepoLink = "https://www.github.com",
	windowWidth,
}) {
	const mediaContainerRef = useRef();
	const borderLeftRef = useRef(-300);
	const mediaOffsetXRef = useRef(0);

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
		({ offset: [ox, _] }) => {
			smoothTo(ox);
			mediaOffsetXRef.current = ox;
		},
		{
			bounds: () => {
				return {
					left: borderLeftRef.current - mediaOffsetMargin,
					right: mediaOffsetMargin,
				};
			},
			rubberband: 0.2,
		}
	);

	return (
		<div className="work">
			<h3 className="work__title">{workTitle}</h3>
			<div className="work__media" {...bind()}>
				<div className="work__media-container" ref={mediaContainerRef}>
					{[...Array(5)].map((_, i) => {
						return (
							<div key={i} className="work__media-item">
								{i + 1}
							</div>
						);
					})}
				</div>
			</div>
			<p className="work__tech-tools">{workTechTools}</p>
			<p className="work__description">{workDescription}</p>
			<div className="work__links-container">
				<a target="_blank" href={workViewLink}>
					Visit Site
				</a>
				<a target="_blank" href={workRepoLink}>
					Repo Link
				</a>
			</div>
		</div>
	);
}

export default Work;
