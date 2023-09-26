import { create } from "zustand";
import { gsap } from "gsap";

const useWidthStore = create((set, get) => ({
	worksAreaWSt: 0,
	canvasWSt: 100,
	infoAreaWSt: 0,
	worksAreaActiveSt: false,
	infoAreaActiveSt: false,
	worksAreaContainerDom: null,
	infoAreaContainerDom: null,

	openWorksArea: (elementDom) => {
		if (!get().worksAreaContainerDom) {
			set({ worksAreaContainerDom: elementDom });
		}

		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};

		set({ worksAreaActiveSt: true });

		const tl = gsap.timeline();

		if (get().infoAreaActiveSt) {
			set({ infoAreaActiveSt: false });

			const infoDom = get().infoAreaContainerDom;
			if (infoDom) {
				tl.to(infoDom, {
					opacity: 0,
					duration: 0.2,
					ease: "none",
				}).set(infoDom, {
					visibility: "hidden",
				});
			}
		}

		tl.to(psudoValues, {
			worksAreaW: 60,
			infoAreaW: 0,
			duration: 0.8,
			ease: "power3",
			onUpdate: () => {
				set({ worksAreaWSt: psudoValues.worksAreaW });
				set({
					canvasWSt: 100 - (psudoValues.worksAreaW + psudoValues.infoAreaW),
				});
				set({ infoAreaWSt: psudoValues.infoAreaW });
			},
		}).to(elementDom, {
			opacity: 1,
			visibility: "visible",
			delay: -0.2,
			duration: 0.2,
			ease: "none",
		});
	},

	closeWorksArea: (elementDom) => {
		set({ worksAreaActiveSt: false });
		set({ infoAreaActiveSt: false });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};

		const tl = gsap.timeline();
		tl.to(elementDom, {
			opacity: 0,
			duration: 0.2,
			ease: "none",
		})
			.set(elementDom, {
				visibility: "hidden",
			})
			.to(psudoValues, {
				worksAreaW: 0,
				infoAreaW: 0,
				duration: 0.8,
				ease: "power2",
				onUpdate: () => {
					set({ worksAreaWSt: psudoValues.worksAreaW });
					set({
						canvasWSt: 100 - (psudoValues.worksAreaW + psudoValues.infoAreaW),
					});
					set({ infoAreaWSt: psudoValues.infoAreaW });
				},
			});
	},

	openInfoArea: (elementDom) => {
		if (!get().infoAreaContainerDom) {
			set({ infoAreaContainerDom: elementDom });
		}

		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};

		set({ infoAreaActiveSt: true });

		const tl = gsap.timeline();

		if (get().worksAreaActiveSt) {
			set({ worksAreaActiveSt: false });

			const worksDom = get().worksAreaContainerDom;
			if (worksDom) {
				tl.to(worksDom, {
					opacity: 0,
					duration: 0.2,
					ease: "none",
				}).set(worksDom, {
					visibility: "hidden",
				});
			}
		}

		tl.to(psudoValues, {
			worksAreaW: 0,
			infoAreaW: 40,
			duration: 0.6,
			ease: "power3",
			onUpdate: () => {
				set({ worksAreaWSt: psudoValues.worksAreaW });
				set({
					canvasWSt: 100 - (psudoValues.worksAreaW + psudoValues.infoAreaW),
				});
				set({ infoAreaWSt: psudoValues.infoAreaW });
			},
		}).to(elementDom, {
			opacity: 1,
			visibility: "visible",
			delay: -0.2,
			duration: 0.2,
			ease: "none",
		});
	},

	closeInfoArea: (elementDom) => {
		set({ worksAreaActiveSt: false });
		set({ infoAreaActiveSt: false });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};

		const tl = gsap.timeline();
		tl.to(elementDom, {
			opacity: 0,
			duration: 0.2,
			ease: "none",
		})
			.set(elementDom, {
				visibility: "hidden",
			})
			.to(psudoValues, {
				worksAreaW: 0,
				infoAreaW: 0,
				duration: 0.6,
				ease: "power2",
				onUpdate: () => {
					set({ worksAreaWSt: psudoValues.worksAreaW });
					set({
						canvasWSt: 100 - (psudoValues.worksAreaW + psudoValues.infoAreaW),
					});
					set({ infoAreaWSt: psudoValues.infoAreaW });
				},
			});
	},
}));

export { useWidthStore };
