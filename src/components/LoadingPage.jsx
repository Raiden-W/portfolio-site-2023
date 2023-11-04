export default function LoadingPage({ fontLoadedSt }) {
	return (
		<div className={fontLoadedSt ? "loading-page loaded" : "loading-page"} />
	);
}
