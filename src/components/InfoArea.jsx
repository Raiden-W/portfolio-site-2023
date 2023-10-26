import { useEffect, useRef, useMemo } from "react";
import "./InfoArea.scss";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import SimpleBar from "simplebar-react";
import ReactMarkdown from "react-markdown";
import { useGetInfo } from "../utils/serviceHooks";
import { useDrag } from "@use-gesture/react";
import arrowIcon from "../assets/arrow.svg";
import gsap from "gsap";

const controlRadius = 100;
const joystickRadius = controlRadius * 0.65;
const restrictDist = controlRadius - joystickRadius;

function InfoArea() {
	const containerRef = useRef();
	const joystickRef = useRef();

	const { infoDataSt } = useGetInfo();

	const infoAreaWidthSt = useSelector(
		appStateManager,
		(s) => s.context.infoAreaWidth
	);

	useEffect(() => {
		appStateManager.send("init some context", {
			infoDom: containerRef.current,
		});
	}, []);

	const smoothToX = useMemo(() => {
		if (joystickRef.current) {
			return gsap.quickTo(joystickRef.current, "x", {
				duration: 0.2,
				ease: "circ",
			});
		} else return () => {};
	}, [joystickRef.current]);

	const smoothToY = useMemo(() => {
		if (joystickRef.current) {
			return gsap.quickTo(joystickRef.current, "y", {
				duration: 0.2,
				ease: "circ",
			});
		} else return () => {};
	}, [joystickRef.current]);

	const bind = useDrag(({ down, movement: [mX, mY] }) => {
		let restrictX = mX;
		let restrictY = mY;
		const dist = Math.sqrt(mX * mX + mY * mY);
		if (dist > restrictDist) {
			restrictX = (restrictDist / dist) * mX;
			restrictY = (restrictDist / dist) * mY;
		}
		if (down) {
			smoothToX(restrictX);
			smoothToY(restrictY);
			appStateManager.send("joystick moves", { x: restrictX, y: restrictY });
		} else {
			smoothToX.tween.pause();
			smoothToY.tween.pause();
			smoothToX.tween.invalidate();
			smoothToY.tween.invalidate();
			gsap.to(joystickRef.current, {
				x: 0,
				y: 0,
				duration: 0.2,
				onStart: () => {
					setTimeout(() => {
						appStateManager.send("joystick moves", { x: 0, y: 0 });
					}, 100);
				},
			});
		}
	});

	return (
		<div className="info-area" style={{ width: `${infoAreaWidthSt}%` }}>
			<div
				className="info-area__bar"
				onClick={() => {
					appStateManager.send("info bar click");
				}}
			>
				<span>about</span>
				<img
					className={
						infoAreaWidthSt > 0
							? "info-area__bar-arrow unfold"
							: "info-area__bar-arrow"
					}
					src={arrowIcon}
					alt="arrow icon"
				/>
			</div>
			<SimpleBar style={{ maxHeight: "100%" }}>
				<div className="info-area__container" ref={containerRef}>
					{infoDataSt && (
						<div className="info">
							<h2 className="info__header">{infoDataSt.title}</h2>
							<div className="info__body">
								<ReactMarkdown className="info-description">
									{infoDataSt.description}
								</ReactMarkdown>
								<ul className="info-contact-links">
									{infoDataSt.contactLinks.map((comp) => {
										return (
											<li key={comp.id}>
												{comp.type === "text" ? (
													<p>{comp.displayedText}</p>
												) : comp.type === "link" ? (
													<a target="_blank" href={comp.url}>
														{comp.displayedText}
														<span>&#8594;</span>
													</a>
												) : null}
											</li>
										);
									})}
								</ul>
							</div>
							<div className="info__controller">
								<div className="border-line">
									<div
										className="movement-scope"
										style={{
											fontSize: `${controlRadius * 2}px`,
										}}
									>
										<div
											className="joystick"
											ref={joystickRef}
											{...bind()}
											style={{ fontSize: `${joystickRadius * 2}px` }}
										>
											<div className="circle-pat">
												<div className="line-pat side" />
												<div className="middle">
													<div className="line-pat" />
													<span>move me</span>
													<div className="line-pat" />
												</div>
												<div className="line-pat side" />
											</div>
										</div>
									</div>
								</div>
							</div>
							<p className="info__footer">{infoDataSt.foot}</p>
						</div>
					)}
				</div>
			</SimpleBar>
		</div>
	);
}

export default InfoArea;
