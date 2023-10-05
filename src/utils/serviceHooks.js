import { useEffect, useState } from "react";

const useFetch = (url) => {
	const [dataSt, setData] = useState(null);
	const [errorSt, setError] = useState(null);
	const [loadingSt, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			try {
				const res = await fetch(url);
				const data = await res.json();
				console.log("fetch!");
				setData(data);
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		};

		fetchData();
	}, [url]);

	return { dataSt, errorSt, loadingSt };
};

const useGetWorks = () => {
	const [worksDataSt, setWorksData] = useState([]);

	const { dataSt, errorSt, loadingSt } = useFetch(
		`${
			import.meta.env.VITE_BASE_API_URL
		}/api/works-area?populate[works][populate][work_medias][populate][0]=media&populate[works][populate][links][populate]=*`
	);

	useEffect(() => {
		if (dataSt) {
			const worksData = dataSt.data.attributes.works.data.map((workData) => {
				const id = workData.id;
				const title = workData.attributes.title;
				const description = workData.attributes.description;
				const techTools = workData.attributes.tech_tools;
				const externalLinks = workData.attributes.links.map((linkData) => {
					const displayedText = linkData.displayed_text;
					const url = linkData.url;
					const id = linkData.id;

					return { displayedText, url, id };
				});
				const mediaSet = workData.attributes.work_medias.data.map(
					(mediaData) => {
						const id = mediaData.id;
						const type = mediaData.attributes.type;
						const title = mediaData.attributes.title;
						const alternativeText =
							mediaData.attributes.media.data.attributes.alternativeText;
						const url =
							type === "video"
								? mediaData.attributes.media.data.attributes.url
								: mediaData.attributes.media.data.attributes.formats.medium.url;

						return { id, type, title, alternativeText, url };
					}
				);

				return {
					id,
					title,
					description,
					techTools,
					externalLinks,
					mediaSet,
				};
			});

			setWorksData(worksData);
		}
	}, [dataSt]);

	return { worksDataSt, errorSt, loadingSt };
};

export { useGetWorks };
