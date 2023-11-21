import "./Openning.scss";
import html2canvas from "html2canvas";
import { useCallback, useEffect, useRef } from "react";
import appStateManager from "../utils/appStateManager";

export default function Opening() {
	const openingRef = useRef();

	const grabableNodes = () => {
		const nodeList = openingRef.current.querySelectorAll(".grabable");
		return Array.from(nodeList);
	};

	const getScreenShot = useCallback((e) => {
		e.preventDefault();

		let clientX = 0;
		let clientY = 0;

		if (e.changedTouches) {
			const touch = e.changedTouches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = e.clientX;
			clientY = e.clientY;
		}

		const pointPos = {
			x: clientX / window.innerWidth,
			y: 1 - clientY / window.innerHeight,
		};

		appStateManager.send("mouse down opening", {
			pointPos,
			cloneOpeningDom,
		});

		grabableNodes().forEach((node) => {
			node.removeEventListener("mousedown", getScreenShot, true);
			node.removeEventListener("touchstart", getScreenShot, true);
		});
		window.removeEventListener("resize", handleHeightChange, true);
	}, []);

	const handleMouseUp = useCallback(() => {
		appStateManager.send("mouse up opening");
		grabableNodes().forEach((node) => {
			node.removeEventListener("mouseup", handleMouseUp, true);
			node.removeEventListener("touchend", handleMouseUp, true);
		});
	}, []);

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
			// const translateY = matrix.m42;
			const caculatedTransform = `translateX(${translateX}px)`;
			pEleClonedList[i].style.transform = caculatedTransform;
			pEleClonedList[i].style.color = style.color;
			pEleClonedList[i].style.top = "0";
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

	const handleHeightChange = useCallback(() => {
		const textLinesNum = openingRef.current.children.length;
		const totalHeight = Math.max(400, window.innerHeight);
		openingRef.current.style.fontSize = `${
			(totalHeight / textLinesNum) * 0.8
		}px`;
	}, []);

	useEffect(() => {
		grabableNodes().forEach((node) => {
			node.addEventListener("mousedown", getScreenShot, true);
			node.addEventListener("touchstart", getScreenShot, true);
			node.addEventListener("mouseup", handleMouseUp, true);
			node.addEventListener("touchend", handleMouseUp, true);
		});

		// handleHeightChange();
		window.addEventListener("resize", handleHeightChange, true);

		appStateManager.send("init some context", {
			openningDom: openingRef.current,
		});
	}, []);

	return (
		<>
			<div
				className="opening scroll"
				ref={openingRef}
				style={{ fontSize: `${(window.innerHeight / 7) * 0.8}px` }}
			>
				<div className="opening__text">
					<p>why stay in a 2D plane while you can throw it into 3D&nbsp;</p>
					<p>why stay in a 2D plane while you can throw it into 3D&nbsp;</p>
				</div>
				<div className="opening__text grabable">
					<p>
						<span>click</span> - tear - off - grab - <span>click</span> - tear -
						off - grab - &nbsp;
					</p>
					<p>
						<span>click</span> - tear - off - grab - <span>click</span> - tear -
						off - grab - &nbsp;
					</p>
				</div>
				<div className="opening__text">
					<p>while you can throw it into 3D why stay in a 2D plane&nbsp;</p>
					<p>while you can throw it into 3D why stay in a 2D plane&nbsp;</p>
				</div>
				<div className="opening__text grabable">
					<p>
						grab - click - <span>tear - off</span> - grab - click -{" "}
						<span>tear - off</span> -&nbsp;
					</p>
					<p>
						grab - click - <span>tear - off</span> - grab - click -{" "}
						<span>tear - off</span> -&nbsp;
					</p>
				</div>
				<div className="opening__text">
					<p>throw it into 3D why stay in a 2D plane while you can&nbsp;</p>
					<p>throw it into 3D why stay in a 2D plane while you can&nbsp;</p>
				</div>
				<div className="opening__text grabable">
					<p>
						off - <span>grab</span> - click - tear - off - <span>grab</span> -
						click - tear -&nbsp;
					</p>
					<p>
						off - <span>grab</span> - click - tear - off - <span>grab</span> -
						click - tear -&nbsp;
					</p>
				</div>
				<div className="opening__text">
					<p>in a 2D plane while you can throw it into 3D why stay&nbsp;</p>
					<p>in a 2D plane while you can throw it into 3D why stay&nbsp;</p>
				</div>
			</div>
		</>
	);
}
