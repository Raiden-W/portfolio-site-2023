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
		appStateManager.send("init some context", {
			openningDom: openingRef.current,
		});
	}, []);

	const getScreenShot = (e) => {
		const pointPos = {
			x: e.clientX / window.innerWidth,
			y: 1 - e.clientY / window.innerHeight,
		};

		appStateManager.send("mouse down opening", {
			pointPos,
			cloneOpeningDom,
		});

		text2Ref.current.removeEventListener("mousedown", getScreenShot);
		text4Ref.current.removeEventListener("mousedown", getScreenShot);
	};

	const cloneOpeningDom = async () => {
		const openningDom = openingRef.current;
		const pEleOrigList = openningDom.querySelectorAll("p");

		const clonedOpeningDom = openningDom.cloneNode(true);
		const pEleClonedList = clonedOpeningDom.querySelectorAll("p");

		clonedOpeningDom.classList.remove("scroll");

		pEleOrigList.forEach((ele, i) => {
			const style = window.getComputedStyle(ele);
			const matrix = new WebKitCSSMatrix(style.transform);
			const translateX = matrix.m41;
			pEleClonedList[i].style.transform = `translateX(${translateX}px)`;
		});

		let canvas = null;
		document.body.appendChild(clonedOpeningDom);
		clonedOpeningDom.style.zIndex = "-1";

		try {
			canvas = await html2canvas(clonedOpeningDom, { logging: false });
			clonedOpeningDom.remove();
			appStateManager.send("clone finished", { clonedCanvas: canvas });
		} catch (error) {
			console.log(error);
		}
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
