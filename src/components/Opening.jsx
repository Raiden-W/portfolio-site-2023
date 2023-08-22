import html2canvas from "html2canvas";
import { useEffect, useRef } from "react";
import { myEventEmitter } from "../utils/EventEmitter";

export default function Opening({ setOpeningCanvas }) {
	const openingRef = useRef();
	const text2Ref = useRef();
	const text4Ref = useRef();

	useEffect(() => {
		text2Ref.current.addEventListener("mousedown", getScreenShot);
		text4Ref.current.addEventListener("mousedown", getScreenShot);
	}, []);

	const getScreenShot = () => {
		const pEleOrigList = openingRef.current.querySelectorAll("p");

		const clonedOpeningDom = openingRef.current.cloneNode(true);
		const pEleClonedList = clonedOpeningDom.querySelectorAll("p");

		for (const dom of clonedOpeningDom.children) {
			dom.classList.remove("scroll");
		}

		pEleOrigList.forEach((ele, i) => {
			const style = window.getComputedStyle(ele);
			const matrix = new WebKitCSSMatrix(style.transform);
			const translateX = matrix.m41;
			pEleClonedList[i].style.transform = `translateX(${translateX}px)`;
		});

		captureHTML(clonedOpeningDom);

		text2Ref.current.removeEventListener("mousedown", getScreenShot);
		text4Ref.current.removeEventListener("mousedown", getScreenShot);
	};

	const captureHTML = async (domElement) => {
		document.body.appendChild(domElement);
		domElement.style.zIndex = "-1";
		try {
			const canvas = await html2canvas(domElement);
			//remove temporary cloned Dom
			domElement.remove();

			setOpeningCanvas(canvas);
			// myEventEmitter.emit("OpeningEnd");
			myEventEmitter.once("TextureReady", () => {
				//remove the original Dom
				openingRef.current.remove();
				myEventEmitter.removeAllListeners("TextureReady");
			});
		} catch (error) {
			console.log(error);
		}
	};

	const removeAllClicks = () => {
		text2Ref.current.removeEventListener();
	};

	return (
		<>
			<div className="opening" ref={openingRef}>
				<div className="scroll text text-1">
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
				</div>
				<div className="scroll text text-2" ref={text2Ref}>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
				</div>
				<div className="scroll text text-3">
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
					<p>guess what I am, a plain html or a soft cloth&nbsp;</p>
				</div>
				<div className="scroll text text-4" ref={text4Ref}>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
					<p>press me and see what you get, figure it out youself&nbsp;</p>
				</div>
			</div>
		</>
	);
}
