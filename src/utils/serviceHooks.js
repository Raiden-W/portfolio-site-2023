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
		}/api/works?populate[0]=work_medias&populate[1]=work_medias.media`
	);

	useEffect(() => {
		if (dataSt) {
			const worksData = dataSt.data.map((workData) => {
				const id = workData.id;
				const title = workData.attributes.title;
				const description = workData.attributes.description;
				const techTools = workData.attributes.tech_tools;
				const viewLink = workData.attributes.view_link;
				const repoLink = workData.attributes.repo_link;
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
					viewLink,
					repoLink,
					mediaSet,
				};
			});

			setWorksData(worksData);
		}
	}, [dataSt]);

	return { worksDataSt, errorSt, loadingSt };
};

export { useGetWorks };
