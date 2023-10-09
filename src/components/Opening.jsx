import "./Openning.scss";
import html2canvas from "html2canvas";
import { useEffect, useRef } from "react";
import appStateManager from "../utils/appStateManager";

export default function Opening() {
	const openingRef = useRef();
	const text2Ref = useRef();
	const text4Ref = useRef();

	useEffect(() => {
		text2Ref.current.addEventListener("mousedown", getScreenShot);
		text4Ref.current.addEventListener("mousedown", getScreenShot);
		openingRef.current.addEventListener("mouseup", handleMouseUp);
	}, []);

	const getScreenShot = async (e) => {
		const pointPos = {
			x: e.clientX / window.innerWidth,
			y: 1 - e.clientY / window.innerHeight,
		};

		appStateManager.send("mouse down opening", {
			pointPos,
			openningDom: openingRef.current,
			html2canvas,
		});

		text2Ref.current.removeEventListener("mousedown", getScreenShot);
		text4Ref.current.removeEventListener("mousedown", getScreenShot);
	};

	const handleMouseUp = (e) => {
		appStateManager.send("mouse up opening");
	};

	return (
		<>
			<div className="opening scroll" ref={openingRef}>
				<div className="opening__text">
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
				</div>
				<div className="opening__text" ref={text2Ref}>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
				</div>
				<div className="opening__text">
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
				</div>
				<div className="opening__text" ref={text4Ref}>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
				</div>
			</div>
		</>
	);
}
