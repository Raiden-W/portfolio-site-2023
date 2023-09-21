import { create } from "zustand";
import { gsap } from "gsap";

const useWidthStore = create((set, get) => ({
	worksAreaWSt: 0,
	canvasWSt: 100,
	infoAreaWSt: 0,
	worksAreaActiveSt: false,
	infoAreaActiveSt: false,
	openWorksArea: () => {
		set({ worksAreaActiveSt: true });
		set({ infoAreaActiveSt: false });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};
		gsap.to(psudoValues, {
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
		});
	},
	closeWorksArea: () => {
		set({ worksAreaActiveSt: false });
		set({ infoAreaActiveSt: false });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};
		gsap.to(psudoValues, {
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

	openInfoArea: () => {
		set({ worksAreaActiveSt: false });
		set({ infoAreaActiveSt: true });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};
		gsap.to(psudoValues, {
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
		});
	},
	closeInfoArea: () => {
		set({ worksAreaActiveSt: false });
		set({ infoAreaActiveSt: false });
		const psudoValues = {
			worksAreaW: get().worksAreaWSt,
			infoAreaW: get().infoAreaWSt,
		};
		gsap.to(psudoValues, {
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
