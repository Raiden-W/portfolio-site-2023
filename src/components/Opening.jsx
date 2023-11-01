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

	useEffect(() => {
		grabableNodes().forEach((node) => {
			node.addEventListener("mousedown", getScreenShot, true);
			node.addEventListener("touchstart", getScreenShot, true);
			node.addEventListener("mouseup", handleMouseUp, true);
			node.addEventListener("touchend", handleMouseUp, true);
		});
		appStateManager.send("init some context", {
			openningDom: openingRef.current,
		});
	}, []);

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

	const textNum = 5;

	return (
		<>
			<div
				className="opening scroll"
				ref={openingRef}
				style={{ fontSize: `${(100 / textNum) * 0.9}vh` }}
			>
				<div className="opening__text">
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
				</div>
				<div className="opening__text grabable">
					<span>
						tear off the flat plane and see the the other dimension&nbsp;
					</span>
					<span>
						tear off the flat plane and see the the other dimension&nbsp;
					</span>
				</div>
				<div className="opening__text">
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
				</div>
				<div className="opening__text grabable">
					<span>
						tear off the flat plane and see the the other dimension&nbsp;
					</span>
					<span>
						tear off the flat plane and see the the other dimension&nbsp;
					</span>
				</div>
				<div className="opening__text">
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
					<span>
						why stay in a 2D plane while you can throw it into 3D&nbsp;
					</span>
				</div>
			</div>
		</>
	);
}
