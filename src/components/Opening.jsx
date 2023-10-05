import "./Openning.scss";
import html2canvas from "html2canvas";
import { useEffect, useRef } from "react";
import { myEventEmitter } from "../utils/EventEmitter";

export default function Opening({ setOpeningOutput }) {
	const openingRef = useRef();
	const text2Ref = useRef();
	const text4Ref = useRef();

	useEffect(() => {
		text2Ref.current.addEventListener("mousedown", getScreenShot);
		text4Ref.current.addEventListener("mousedown", getScreenShot);
	}, []);

	const getScreenShot = async (e) => {
		const pEleOrigList = openingRef.current.querySelectorAll("p");

		const clonedOpeningDom = openingRef.current.cloneNode(true);
		const pEleClonedList = clonedOpeningDom.querySelectorAll("p");

		clonedOpeningDom.classList.remove("scroll");

		pEleOrigList.forEach((ele, i) => {
			const style = window.getComputedStyle(ele);
			const matrix = new WebKitCSSMatrix(style.transform);
			const translateX = matrix.m41;
			pEleClonedList[i].style.transform = `translateX(${translateX}px)`;
		});

		text2Ref.current.removeEventListener("mousedown", getScreenShot);
		text4Ref.current.removeEventListener("mousedown", getScreenShot);

		const canvas = await captureHTML(clonedOpeningDom);
		const pointPos = {
			x: e.clientX / window.innerWidth,
			y: 1 - e.clientY / window.innerHeight,
		};
		setOpeningOutput({ canvas, pointPos });
	};

	const captureHTML = async (domElement) => {
		let canvas = null;
		document.body.appendChild(domElement);
		domElement.style.zIndex = "-1";
		try {
			canvas = await html2canvas(domElement, { logging: false });

			//remove temporary cloned Dom
			domElement.remove();

			myEventEmitter.once("TextureReady", () => {
				//remove the original Dom
				openingRef.current.remove();
				myEventEmitter.removeAllListeners("TextureReady");
			});
		} catch (error) {
			console.log(error);
		}
		return canvas;
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
