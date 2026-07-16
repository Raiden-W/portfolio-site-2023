import { assign, createMachine, interpret } from "xstate";
import {
	fetchInfoData,
	fetchInitialLanguageContent,
	fetchLocales,
	mapWorksData,
} from "./serviceHooks";

const supportedLocaleCodes = ["en", "zh-CN"];
const localeStorageKey = "portfolio-locale";

const availableLocales = (response) => {
	const locales = Array.isArray(response) ? response : response?.value ?? [];
	return locales.filter((locale) => supportedLocaleCodes.includes(locale.code));
};

const getStoredLocale = () => {
	try {
		return window.localStorage.getItem(localeStorageKey);
	} catch {
		return null;
	}
};

const getBrowserLocale = (locales) => {
	const browserLanguages = navigator.languages?.length
		? navigator.languages
		: [navigator.language];

	for (const browserLanguage of browserLanguages) {
		const normalizedLanguage = browserLanguage?.toLowerCase();
		const match = locales.find((locale) => {
			const normalizedLocale = locale.code.toLowerCase();
			return (
				normalizedLocale === normalizedLanguage ||
				normalizedLocale.split("-")[0] === normalizedLanguage?.split("-")[0]
			);
		});

		if (match) {
			return match.code;
		}
	}

	return null;
};

const getInitialLocale = (locales, defaultLocale) => {
	const storedLocale = getStoredLocale();
	if (locales.some((locale) => locale.code === storedLocale)) {
		return storedLocale;
	}

	return getBrowserLocale(locales) ?? defaultLocale;
};

const prefersReducedMotion = () =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const languageMachine = createMachine(
	{
		id: "languageStateManager",
		predictableActionArguments: true,
		initial: "initializingLocales",
		context: {
			locales: [],
			defaultLocale: "en",
			currentLocale: null,
			requestedLocale: null,
			worksSource: null,
			worksData: [],
			infoData: null,
			pendingWorksData: null,
			pendingInfoData: null,
			error: null,
		},
		states: {
			initializingLocales: {
				invoke: {
					src: "loadLocales",
					onDone: {
						target: "loadingInitialContent",
						actions: "setLocales",
					},
					onError: {
						target: "loadingInitialContent",
						actions: "useDefaultLocale",
					},
				},
			},
			loadingInitialContent: {
				invoke: {
					src: "loadInitialContent",
					onDone: {
						target: "idle",
						actions: "setInitialContent",
					},
					onError: {
						target: "idle",
						actions: "setError",
					},
				},
			},
			idle: {
				on: {
					SELECT_LOCALE: {
						target: "loadingLocale",
						cond: "canSelectLocale",
						actions: "requestLocale",
					},
				},
			},
			loadingLocale: {
				invoke: {
					src: "loadRequestedContent",
					onDone: {
						target: "fadingOut",
						actions: "stageContent",
					},
					onError: {
						target: "idle",
						actions: ["setError", "resetRequestedLocale"],
					},
				},
			},
			fadingOut: {
				after: {
					fadeOutDuration: {
						target: "fadingIn",
						actions: ["commitContent", "storeLocale"],
					},
				},
			},
			fadingIn: {
				after: {
					fadeInDuration: "idle",
				},
			},
		},
	},
	{
		actions: {
			setLocales: assign((_, event) => {
				const locales = availableLocales(event.data);
				const defaultLocale =
					locales.find((locale) => locale.isDefault)?.code ??
					locales[0]?.code ??
					"en";

				return {
					locales,
					defaultLocale,
					requestedLocale: getInitialLocale(locales, defaultLocale),
					error: null,
				};
			}),
			useDefaultLocale: assign({
				locales: () => [
					{ code: "en", name: "English", isDefault: true },
					{ code: "zh-CN", name: "Chinese", isDefault: false },
				],
				defaultLocale: () => "en",
				requestedLocale: () => "en",
				error: (_, event) => event.data,
			}),
			setInitialContent: assign({
				worksSource: (_, event) => event.data.worksSource,
				worksData: (_, event) => event.data.worksData,
				infoData: (_, event) => event.data.infoData,
				currentLocale: (context) => context.requestedLocale,
				error: () => null,
			}),
			requestLocale: assign({
				requestedLocale: (_, event) => event.locale,
				error: () => null,
			}),
			stageContent: assign({
				pendingWorksData: (_, event) => event.data.worksData,
				pendingInfoData: (_, event) => event.data.infoData,
			}),
			commitContent: assign({
				worksData: (context) => context.pendingWorksData,
				infoData: (context) => context.pendingInfoData,
				currentLocale: (context) => context.requestedLocale,
				pendingWorksData: () => null,
				pendingInfoData: () => null,
				error: () => null,
			}),
			storeLocale: (context) => {
				try {
					window.localStorage.setItem(localeStorageKey, context.requestedLocale);
				} catch {
					// Language selection still works when storage is unavailable.
				}
			},
			setError: assign({
				error: (_, event) => event.data,
			}),
			resetRequestedLocale: assign({
				requestedLocale: (context) => context.currentLocale,
				pendingWorksData: () => null,
				pendingInfoData: () => null,
			}),
		},
		guards: {
			canSelectLocale: (context, event) =>
				event.locale !== context.currentLocale &&
				context.locales.some((locale) => locale.code === event.locale),
		},
		services: {
			loadLocales: () => fetchLocales(),
			loadInitialContent: (context) =>
				fetchInitialLanguageContent(context.requestedLocale),
			loadRequestedContent: async (context) => ({
				infoData: await fetchInfoData(context.requestedLocale),
				worksData: mapWorksData(context.worksSource, context.requestedLocale),
			}),
		},
		delays: {
			fadeOutDuration: () => (prefersReducedMotion() ? 1 : 180),
			fadeInDuration: () => (prefersReducedMotion() ? 1 : 260),
		},
	}
);

const languageStateManager = interpret(languageMachine).start();

export default languageStateManager;
