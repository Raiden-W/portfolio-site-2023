import { useEffect, useState } from "react";
import { stringify } from "qs";

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

const useGetTest = () => {
	const [testSt, setTest] = useState();

	const { dataSt, errorSt, loadingSt } = useFetch(
		`${import.meta.env.VITE_BASE_API_URL}/api/test`
	);

	useEffect(() => {
		if (dataSt) {
			setTest(true);
		}
	}, [dataSt]);

	return { testSt, errorSt, loadingSt };
};

const getHeroImagesQuery = stringify({
	populate: {
		works: {
			fields: ["hero_image"],
			populate: {
				hero_image: {
					populate: ["media"],
				},
			},
		},
	},
});

const useGetHeroImages = () => {
	const [heroImagesDataSt, setHeroImagesData] = useState([]);

	const { dataSt, errorSt, loadingSt } = useFetch(
		`${import.meta.env.VITE_BASE_API_URL}/api/works-area?${getHeroImagesQuery}`
	);

	useEffect(() => {
		if (dataSt) {
			const heroImagesData = dataSt.data.attributes.works.data.map(
				(workData) => {
					const workId = workData.id;
					let url;
					let width;
					let height;
					if (workData.attributes.hero_image.data.attributes.formats.medium) {
						url =
							workData.attributes.hero_image.data.attributes.formats.medium.url;
						width =
							workData.attributes.hero_image.data.attributes.formats.medium
								.width;
						height =
							workData.attributes.hero_image.data.attributes.formats.medium
								.height;
					} else {
						url = workData.attributes.hero_image.data.attributes.url;
						width = workData.attributes.hero_image.data.attributes.width;
						height = workData.attributes.hero_image.data.attributes.height;
					}

					return {
						workId,
						url,
						width,
						height,
					};
				}
			);

			setHeroImagesData(heroImagesData);
		}
	}, [dataSt]);

	return { heroImagesDataSt, errorSt, loadingSt };
};

const getWorksQuery = stringify({
	populate: {
		works: {
			populate: {
				work_medias: {
					populate: ["media"],
				},
				links: {
					populate: "*",
				},
			},
		},
	},
});

const useGetWorks = () => {
	const [worksDataSt, setWorksData] = useState([]);

	const { dataSt, errorSt, loadingSt } = useFetch(
		`${import.meta.env.VITE_BASE_API_URL}/api/works-area?${getWorksQuery}`
	);

	useEffect(() => {
		if (dataSt) {
			const worksData = dataSt.data.attributes.works.data.map((workData) => {
				const id = workData.id;
				const title = workData.attributes.title;
				const sub = workData.attributes.sub;
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
						let url;
						if (type === "video") {
							url = mediaData.attributes.media.data.attributes.url;
						} else if (type === "image") {
							if (mediaData.attributes.media.data.attributes.formats.medium) {
								url =
									mediaData.attributes.media.data.attributes.formats.medium.url;
							} else {
								url = mediaData.attributes.media.data.attributes.url;
							}
						}
						return { id, type, title, alternativeText, url };
					}
				);

				return {
					id,
					title,
					sub,
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

const getInfoQuery = stringify({
	populate: {
		contact_links: {
			populate: "*",
		},
	},
});

const useGetInfo = () => {
	const [infoDataSt, setInfoData] = useState(null);

	const { dataSt, errorSt, loadingSt } = useFetch(
		`${import.meta.env.VITE_BASE_API_URL}/api/info-area?${getInfoQuery}`
	);

	useEffect(() => {
		if (dataSt) {
			const infoData = {};
			infoData.title = dataSt.data.attributes.title;
			infoData.description = dataSt.data.attributes.description;
			infoData.foot = dataSt.data.attributes.foot;
			infoData.contactLinks = dataSt.data.attributes.contact_links.map(
				(comp) => {
					if (comp.__component === "dy-component.list-item") {
						return {
							type: "text",
							displayedText: comp.displayed_text,
							id: comp.id,
						};
					} else if (comp.__component === "dy-component.link") {
						return {
							type: "link",
							url: comp.url,
							displayedText: comp.displayed_text,
							id: comp.id,
						};
					}
				}
			);

			setInfoData(infoData);
		}
	}, [dataSt]);

	return { infoDataSt, errorSt, loadingSt };
};

export { useGetWorks, useGetHeroImages, useGetInfo, useGetTest };
