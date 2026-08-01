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

const fetchJson = async (url, options = {}) => {
	if (!url) {
		throw new Error("Missing VITE_BASE_API_URL.");
	}

	const res = await fetch(url, options);
	if (!res.ok) {
		throw new Error(`Request failed (${res.status}) for ${url}`);
	}

	return res.json();
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
				const data = await fetchJson(url, { signal: controller.signal });
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
				work_gellary: {
					populate: {
						work_media: {
							populate: ["media"],
						},
					},
				},
				links: {
					populate: "*",
				},
				localizations: {
					populate: {
						links: {
							populate: "*",
						},
					},
				},
			},
		},
		worksCategory: {
			populate: {
				works: {
					fields: ["id"],
				},
			},
		},
	},
});

const mapExternalLinks = (links = []) =>
	links
		.map((linkData) => ({
			displayedText: linkData.displayed_text,
			url: linkData.url,
			id: linkData.id,
		}))
		.filter((link) => link.displayedText || link.url);

const mapWorksData = (response, locale) =>
	response.data.attributes.works.data.map((baseWork) => {
		const baseAttributes = baseWork.attributes;
		const localizedWorks = [
			baseWork,
			...(baseAttributes.localizations?.data ?? []),
		];
		const localizedWork =
			localizedWorks.find((work) => work.attributes.locale === locale) ??
			localizedWorks.find((work) => work.attributes.locale === "en") ??
			baseWork;

		const localizedAttributes = localizedWork.attributes;
		const mediaSet = (baseAttributes.work_gellary?.work_media ?? [])
			.map((mediaData) => {
				const media = mediaData.media?.data?.attributes;
				if (!media) {
					return null;
				}

				let url;
				if (mediaData.type === "video") {
					url = media.url;
				} else if (mediaData.type === "image") {
					url = media.formats?.medium?.url ?? media.url;
				}

				return {
					id: mediaData.id,
					type: mediaData.type,
					title: mediaData.title,
					alternativeText: media.alternativeText,
					url: getMediaUrl(url),
				};
			})
			.filter(Boolean);

		return {
			id: baseWork.id,
			title: localizedAttributes.title,
			sub: localizedAttributes.sub,
			description: localizedAttributes.description,
			techTools: baseAttributes.tech_tools,
			externalLinks: mapExternalLinks(localizedAttributes.links),
			mediaSet,
		};
	});

const categoryKeyByApiValue = {
	Comercial: "commercial",
	Exploration: "exploration",
	Sandbox: "sandbox",
};

const mapWorkCategories = (response) =>
	(response.data.attributes.worksCategory ?? [])
		.map((categoryData) => {
			const key = categoryKeyByApiValue[categoryData.category];
			if (!key) {
				return null;
			}

			return {
				id: categoryData.id,
				key,
				workIds: (categoryData.works?.data ?? []).map((work) => work.id),
			};
		})
		.filter(Boolean);

const mapInfoData = (response) => {
	const attributes = response.data.attributes;
	return {
		title: attributes.title,
		description: attributes.description,
		foot: attributes.foot,
		contactLinks: attributes.contact_links
			.map((comp) => {
				if (comp.__component === "dy-component.list-item") {
					return {
						type: "text",
						displayedText: comp.displayed_text,
						id: comp.id,
					};
				}

				if (comp.__component === "dy-component.link") {
					return {
						type: "link",
						url: comp.url,
						displayedText: comp.displayed_text,
						id: comp.id,
					};
				}

				return null;
			})
			.filter(Boolean),
	};
};

const fetchLocales = async () =>
	fetchJson(getApiUrl("/api/i18n/locales"));

const fetchWorksSource = async () =>
	fetchJson(getApiUrl("/api/works-area", getWorksQuery));

const fetchInfoData = async (locale) => {
	const query = stringify({
		locale,
		populate: {
			contact_links: {
				populate: "*",
			},
		},
	});
	return mapInfoData(await fetchJson(getApiUrl("/api/info-area", query)));
};

const fetchInitialLanguageContent = async (locale) => {
	const [worksSource, infoData] = await Promise.all([
		fetchWorksSource(),
		fetchInfoData(locale),
	]);

	return {
		worksSource,
		worksData: mapWorksData(worksSource, locale),
		workCategories: mapWorkCategories(worksSource),
		infoData,
	};
};

export {
	fetchInfoData,
	fetchInitialLanguageContent,
	fetchLocales,
	mapWorksData,
	useGetHeroImages,
	useGetTest,
};
