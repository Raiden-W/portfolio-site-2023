import { useEffect, useMemo, useRef, useState } from "react";
import "./Work.scss";
import { useDrag } from "@use-gesture/react";
import { gsap } from "gsap";

const mediaOffsetMargin = 32;

function Work({
	title = "Unknown Title",
	mediaSet = [],
	techTools = "Unity Three.js Node.js React",
	description = "Bah Lah Bah Lah Bah Lah Bah Lah",
	viewLink,
	repoLink,
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
					right: 0,
				};
			},
			rubberband: 0.2,
		}
	);

	return (
		<div className="work">
			<h2 className="work__title">{title}</h2>
			<div className="work__media-set" {...bind()}>
				<div className="work__media-set-container" ref={mediaContainerRef}>
					{mediaSet.map((media) => (
						<div key={media.id} className="work__media-set-container-item">
							{media.type === "video" ? (
								<video muted autoPlay loop src={media.url}></video>
							) : (
								<img draggable="false" src={media.url} />
							)}
						</div>
					))}
				</div>
			</div>
			<p className="work__tech-tools">{techTools}</p>
			<p className="work__description">{description}</p>
			<div className="work__links-container">
				{viewLink && (
					<a target="_blank" href={viewLink}>
						Visit Site <span>&#8594;</span>
					</a>
				)}
				{repoLink && (
					<a target="_blank" href={repoLink}>
						GitHub Repo <span>&#8594;</span>
					</a>
				)}
			</div>
		</div>
	);
}

export default Work;
