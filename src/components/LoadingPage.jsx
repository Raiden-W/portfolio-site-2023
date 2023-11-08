import { useEffect, useState } from "react";

export default function LoadingPage({ fontLoadedSt, testSt }) {
	const [showTextSt, setShowText] = useState(false);
	useEffect(() => {
		setTimeout(() => {
			setShowText(true);
		}, 1000);
	}, []);
	return (
		<div
			className={
				fontLoadedSt && testSt ? "loading-page loaded" : "loading-page"
			}
		>
			{showTextSt && (
				<p>The server side might be warming up. It can take 10+ seconds...</p>
			)}
		</div>
	);
}
