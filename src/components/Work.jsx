function Work({
	workTitle = "Unknown Title",
	workMedia = "Blank",
	workTechTools = "Unity Three.js Node.js React",
	workDescription = "Bah Lah Bah Lah Bah Lah Bah Lah",
	workViewLink = "/",
	workRepoLink = "https://www.github.com",
}) {
	return (
		<div className="work">
			<h3 className="work__title">{workTitle}</h3>
			<div className="work__media-container">{workMedia}</div>
			<p className="work__tech-tools">{workTechTools}</p>
			<p className="work__description">{workDescription}</p>
			<div className="work__links-container">
				<a target="_blank" href={workViewLink}>
					Visit Site
				</a>
				<a target="_blank" href={workRepoLink}>
					Repo Link
				</a>
			</div>
		</div>
	);
}

export default Work;
