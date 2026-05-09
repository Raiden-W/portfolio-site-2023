import { useEffect, useState } from "react";

export default function LoadingPage({ fontLoadedSt, testSt, apiErrorSt }) {
	const [showTextSt, setShowText] = useState(false);
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowText(true);
		}, 1000);

		return () => {
			clearTimeout(timer);
		};
	}, []);
	return (
		<div
			className={
				fontLoadedSt && testSt ? "loading-page loaded" : "loading-page"
			}
		>
			{apiErrorSt ? (
				<p>
					Cannot connect to the content server. Check VITE_BASE_API_URL and
					make sure the local Strapi server is running.
				</p>
			) : showTextSt ? (
				<p>The server side might be warming up. It can take 10+ seconds...</p>
			) : null}
		</div>
	);
}
