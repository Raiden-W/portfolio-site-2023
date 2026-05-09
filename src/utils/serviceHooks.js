import { useEffect, useState } from "react";
import { stringify } from "qs";

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL?.replace(/\/$/, "");

const getApiUrl = (path, query) => {
	if (!apiBaseUrl) {
		return "";
	}

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${apiBaseUrl}${normalizedPath}${query ? `?${query}` : ""}`;
};

const looksLikeExternalMediaUrl = (url) =>
	/^[^/\s]+\.[^/\s]+\/.+/.test(url);

const getMediaUrl = (url) => {
	if (!url || /^https?:\/\//i.test(url)) {
		return url;
	}

	if (url.startsWith("//")) {
		return `https:${url}`;
	}

	if (looksLikeExternalMediaUrl(url)) {
		return `https://${url}`;
	}

	if (!apiBaseUrl) {
		return url;
	}

	return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

const useFetch = (url) => {
	const [dataSt, setData] = useState(null);
	const [errorSt, setError] = useState(null);
	const [loadingSt, setLoading] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		let active = true;

		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await fetch(url, { signal: controller.signal });
				if (!res.ok) {
					throw new Error(`Request failed (${res.status}) for ${url}`);
				}

				const data = await res.json();
				if (active) {
					setData(data);
				}
			} catch (error) {
				if (active && error.name !== "AbortError") {
					setError(error);
					setData(null);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		if (url) {
			fetchData();
		} else {
			setError(new Error("Missing VITE_BASE_API_URL."));
		}

		return () => {
			active = false;
			controller.abort();
		};
	}, [url]);

	return { dataSt, errorSt, loadingSt };
};

const useGetTest = () => {
	const [testSt, setTest] = useState();

	const { dataSt, errorSt, loadingSt } = useFetch(
		getApiUrl("/api/test")
	);

	useEffect(() => {
		if (dataSt) {
			setTest(true);
		} else if (errorSt) {
			setTest(false);
		}
	}, [dataSt, errorSt]);

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
		getApiUrl("/api/works-area", getHeroImagesQuery)
	);

	useEffect(() => {
		if (dataSt) {
			const heroImagesData = dataSt.data.attributes.works.data
				.map((workData) => {
					const workId = workData.id;
					const heroImage = workData.attributes.hero_image.data?.attributes;
					if (!heroImage) {
						return null;
					}

					const mediumFormat = heroImage.formats?.medium;
					let url;
					let width;
					let height;
					if (mediumFormat) {
						url = mediumFormat.url;
						width = mediumFormat.width;
						height = mediumFormat.height;
					} else {
						url = heroImage.url;
						width = heroImage.width;
						height = heroImage.height;
					}

					return {
						workId,
						url: getMediaUrl(url),
						width,
						height,
					};
				})
				.filter(Boolean);

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
		getApiUrl("/api/works-area", getWorksQuery)
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
						const media = mediaData.attributes.media.data?.attributes;
						if (!media) {
							return null;
						}

						const alternativeText = media.alternativeText;
						let url;
						if (type === "video") {
							url = media.url;
						} else if (type === "image") {
							if (media.formats?.medium) {
								url = media.formats.medium.url;
							} else {
								url = media.url;
							}
						}
						return { id, type, title, alternativeText, url: getMediaUrl(url) };
					}
				).filter(Boolean);

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
		getApiUrl("/api/info-area", getInfoQuery)
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
