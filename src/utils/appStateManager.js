import { createMachine, assign, interpret } from "xstate";
import gsap from "gsap";

export const machine = createMachine(
	{
		/** @xstate-layout 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-FcKRzEpJakqlbhyVOZNCi4Qkg-QoUOEMKzMTCk2F9WYVyEjKg+XVQSEz-J80XrHC6VRnHEQ7vvMJrStqiiUOYWYPsCqHHjCkQu8xHKF2mii7y6KmpsFNkvHFaj8VELelGTwPZ9iWDhJMdwF9ljUoTMBelctDi6zYVPF+RtvmYpRti1RkAgVvUAmKJ5mwPCRH1SsoG6wwRTk2JYMY7iUXKpruyuuaMLYQC1cMdO3ZvCP2jIrVwy12KmoDhauElkrF4I4TPdCPljkf1VUvH+9SeVpNJmEcEOxco4lCDTJZy0HDFViNKbKCxvDRBtbPKNWBP6xsrL-KALryJ0UFXokV8DxXBBzWOGIaxsqjDROgtIQA */
		context: {
			initContext: {},
			clothGrabInitPos: null,
			clonedCanvas: null,
			worksAreaWidth: 0,
			canvasWidth: 100,
			infoAreaWidth: 0,
			workAreaActive: false,
			infoAreaActive: false,
			animTasks: { canvasDone: false, areaDone: false },
			imageTransition: { done: true, latestWorkId: 1 },
		},
		id: "appStateManager",
		initial: "Opening Idle",
		// initial: "Tem Start",
		on: {
			"init some context": {
				actions: "assign some context",
			},
		},
		states: {
			"Tem Start": {
				after: {
					1000: [
						{
							target: "#appStateManager.Square To Jet",
						},
					],
				},
			},
			"Opening Idle": {
				on: {
					"mouse down opening": {
						target: "Cloning Opening",
						actions: "assign point pos",
					},
				},
			},
			"Cloning Opening": {
				entry: "start cloning",

				on: {
					"clone finished": {
						actions: "assign canvas",
					},
					"set cloth texture": {
						target: "Cloth Grabing",
						actions: "remove opening dom",
					},
					"mouse up opening": {
						target: "Waiting For Cloth Ready",
					},
				},
			},
			"Cloth Grabing": {
				on: {
					"mouse up canvas": {
						target: "Cloth Falling",
					},
				},
			},
			"Waiting For Cloth Ready": {
				on: {
					"clone finished": {
						actions: "assign canvas",
					},
					"set cloth texture": {
						target: "Cloth Falling",
						actions: "remove opening dom",
					},
				},
			},
			"Cloth Falling": {
				on: {
					"cloth nearly out": {
						target: "Cloth To Square",
					},
				},
			},
			"Cloth To Square": {
				exit: "turn on post effect",
				on: {
					"cloth to square finished": {
						target: "Square To Jet",
					},
				},
			},
			"Square To Jet": {
				invoke: {
					src: "square to jet animating",
					id: "square to jet animating",
				},
				on: {
					"square to jet finished": {
						target: "Jet Idle/ Aeras Closed",
					},
				},
			},
			"Jet Idle/ Aeras Closed": {
				entry: [
					"add point track",
					"assign work area inactive",
					"assign info area inactive",
				],
				on: {
					"works bar click": {
						target: "Jet To Square/ Work Areas Opening",
					},
					"info bar click": {
						target: "Jet To Square/ Info Areas Opening",
					},
				},
			},
			"Jet To Square/ Work Areas Opening": {
				entry: "remove point track",
				invoke: [
					{
						src: "jet to square animating",
						id: "jet to square animating",
					},
					{
						src: "open works area",
						id: "open works area",
					},
				],
				on: {
					"open area finished": {
						target: "Square Idle/ Work Areas Opened",
						cond: "anim all finished",
					},
					"jet to square finished": {
						target: "Square Idle/ Work Areas Opened",
						cond: "anim all finished",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
			"Jet To Square/ Info Areas Opening": {
				entry: "remove point track",
				invoke: [
					{
						src: "jet to square animating",
						id: "jet to square animating",
					},
					{
						src: "open info area",
						id: "open info area",
					},
				],
				on: {
					"open area finished": {
						target: "Square Idle/ Info Areas Opened",
						cond: "anim all finished",
					},
					"jet to square finished": {
						target: "Square Idle/ Info Areas Opened",
						cond: "anim all finished",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
			"Square Idle/ Work Areas Opened": {
				entry: [
					"set work square",
					"assign work area active",
					"assign info area inactive",
				],
				on: {
					"info bar click": {
						target: "Info Areas Opening",
					},
					"works bar click": {
						target: "Square To Jet/ Work Area closing",
					},
					"canvas click": {
						target: "Square To Jet/ Work Area closing",
					},
					"enter one work": {
						actions: "set next image to square mat",
					},
				},
			},
			"Square Idle/ Info Areas Opened": {
				entry: [
					"set info sqaure",
					"assign info area active",
					"assign work area inactive",
				],
				exit: "freeze profile",
				on: {
					"canvas click": {
						target: "Square To Jet/ Info Area closing",
					},
					"info bar click": {
						target: "Square To Jet/ Info Area closing",
					},
					"works bar click": {
						target: "Work Areas Opening",
					},
					"joystick moves": {
						actions: "move profile",
					},
				},
			},
			"Info Areas Opening": {
				invoke: {
					src: "open info area",
					id: "open info area",
				},
				on: {
					"open area finished": {
						target: "Square Idle/ Info Areas Opened",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
			"Square To Jet/ Work Area closing": {
				invoke: [
					{
						src: "square to jet animating",
						id: "square to jet animating",
					},
					{
						src: "close works area",
						id: "close works area",
					},
				],
				on: {
					"close area finished": {
						target: "Jet Idle/ Aeras Closed",
						cond: "anim all finished",
					},
					"square to jet finished": {
						target: "Jet Idle/ Aeras Closed",
						cond: "anim all finished",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
			"Square To Jet/ Info Area closing": {
				invoke: [
					{
						src: "square to jet animating",
						id: "square to jet animating",
					},
					{
						src: "close info area",
						id: "close info area",
					},
				],
				on: {
					"close area finished": {
						target: "Jet Idle/ Aeras Closed",
						cond: "anim all finished",
					},
					"square to jet finished": {
						target: "Jet Idle/ Aeras Closed",
						cond: "anim all finished",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
			"Work Areas Opening": {
				invoke: {
					src: "open works area",
					id: "open works area",
				},
				on: {
					"open area finished": {
						target: "Square Idle/ Work Areas Opened",
					},
					"width changes": {
						actions: "assign width",
					},
				},
			},
		},
		predictableActionArguments: true,
		preserveActionOrder: true,
	},
	{
		actions: {
			"assign some context": assign({
				initContext: (ctx, event) => {
					const temEvent = { ...event };
					delete temEvent.type;
					return { ...ctx.initContext, ...temEvent };
				},
			}),
			"assign point pos": assign({
				clothGrabInitPos: (_, event) => event.pointPos,
			}),

			"start cloning": async (_, event) => {
				await event.cloneOpeningDom();
			},

			"assign canvas": assign({
				clonedCanvas: (_, event) => event.clonedCanvas,
			}),

			"remove opening dom": (ctx) => {
				//remove the original opening dom
				ctx.initContext.openningDom.remove();
			},

			"assign width": assign({
				worksAreaWidth: (_, event) => event.worksAreaWidth,
				canvasWidth: (_, event) => event.canvasWidth,
				infoAreaWidth: (_, event) => event.infoAreaWidth,
			}),

			"assign work area active": assign({
				workAreaActive: () => true,
			}),
			"assign work area inactive": assign({
				workAreaActive: () => false,
			}),
			"assign info area active": assign({
				workInfoActive: () => true,
			}),
			"assign info area inactive": assign({
				workInfoActive: () => false,
			}),

			"add point track": (ctx) => {
				ctx.initContext.addMoveCamera();
				ctx.initContext.resumeSmoothCamera();
			},

			"remove point track": (ctx) => {
				ctx.initContext.removeMoveCamera();
				ctx.initContext.pauseSmoothCamera();
			},

			"turn on post effect": (ctx) => {
				const { setEffectOn } = ctx.initContext;
				setEffectOn(true);
			},

			"set work square": (ctx) => {
				const { setGeo, squareGeo, setMat, squareWorkMat } = ctx.initContext;
				//set square geo and mat
				setGeo(squareGeo);
				setMat(squareWorkMat);
				squareWorkMat.uEmissive = 1;
				gsap.to(squareWorkMat, { uEmissive: 0, duration: 0.3 });
			},

			"set info sqaure": (ctx) => {
				const { setGeo, infoGeo, setMat, squareInfoMat } = ctx.initContext;
				//set square geo and mat
				setGeo(infoGeo);
				setMat(squareInfoMat);

				squareInfoMat.emissive.set(0xffffff);
				gsap.to(squareInfoMat.emissive, { r: 0, g: 0, b: 0, duration: 0.3 });
			},

			"move profile": (ctx, event) => {
				const { smoothProfileX, smoothProfileY } = ctx.initContext;
				const { x, y } = event;

				smoothProfileX(y * 0.012);
				smoothProfileY(x * 0.012);
			},

			"freeze profile": (ctx) => {
				ctx.initContext.pauseSmoothProfile();
				ctx.initContext.resumeSmoothProfile();
			},

			"set next image to square mat": (ctx, event) => {
				const { squareWorkMat, heroImages } = ctx.initContext;
				ctx.imageTransition.latestWorkId = event.workId;

				const imageTransit = () => {
					let nextWorkId = 1;
					for (let i = 0; i < heroImages.length; i++) {
						if (heroImages[i].workId === ctx.imageTransition.latestWorkId) {
							squareWorkMat.uTextureNext = heroImages[i].texture;
							squareWorkMat.uTextureNextRatioHW = heroImages[i].ratioHW;
							nextWorkId = ctx.imageTransition.latestWorkId;
							break;
						}
					}
					gsap.to(squareWorkMat, {
						uTransition: 1,
						duration: 1.2,
						ease: "power1.out",
						onStart: () => {
							ctx.imageTransition.done = false;
						},
						onComplete: () => {
							squareWorkMat.uTextureCurr = squareWorkMat.uTextureNext;
							squareWorkMat.uTextureCurrRatioHW =
								squareWorkMat.uTextureNextRatioHW;
							squareWorkMat.uTransition = 0;
							squareWorkMat.currWorkId = nextWorkId;
							ctx.imageTransition.done = true;
							if (nextWorkId !== ctx.imageTransition.latestWorkId) {
								imageTransit();
							}
						},
					});
				};

				if (
					ctx.imageTransition.done &&
					squareWorkMat.currWorkId !== event.workId
				) {
					ctx.imageTransition.done = false;
					imageTransit();
				}
			},
		},
		services: {
			"square to jet animating": (ctx, _) => (callback) => {
				ctx.animTasks.canvasDone = false;
				const { squareToJet, tunnelMat, bgColor } = ctx.initContext;
				//set canvas bg color to white
				gsap.to(bgColor, { r: 1, g: 1, b: 1, duration: 1 });
				//activate tunnel
				gsap.to(tunnelMat, { uDynamic: 1, duration: 1 });
				//animate square to jet
				squareToJet(() => {
					ctx.animTasks.canvasDone = true;
					callback("square to jet finished");
				});
			},
			"jet to square animating": (ctx, _) => (callback) => {
				ctx.animTasks.canvasDone = false;
				const { jetToSquare, tunnelMat, bgColor } = ctx.initContext;
				//set canvas bg color to grey
				gsap.to(bgColor, { r: 0.12, g: 0.12, b: 0.12, duration: 1 });
				//activate tunnel
				gsap.to(tunnelMat, { uDynamic: 0, duration: 1 });
				//animate square to jet
				jetToSquare(() => {
					ctx.animTasks.canvasDone = true;
					callback("jet to square finished");
				});
			},
			"open works area": (ctx, _) => (callback) => {
				openArea("works area", ctx, callback);
			},

			"open info area": (ctx, _) => (callback) => {
				openArea("info area", ctx, callback);
			},

			"close works area": (ctx, _) => (callback) => {
				closeArea("works area", ctx, callback);
			},

			"close info area": (ctx, _) => (callback) => {
				closeArea("info area", ctx, callback);
			},
		},
		guards: {
			"anim all finished": (ctx) => {
				return ctx.animTasks.areaDone && ctx.animTasks.canvasDone;
			},
		},
	}
);

const appStateManager = interpret(machine).start();

export default appStateManager;

const openArea = (areaToOpen, ctx, callback) => {
	ctx.animTasks.areaDone = false;

	const { worksDom, infoDom } = ctx.initContext;

	const params = {};

	if (areaToOpen === "works area") {
		params.domToOpen = worksDom;
		params.domToClose = infoDom;
		params.finalWorksAreaW = 60;
		params.finalInfoAreaW = 0;
		params.duration = 0.8;
		params.delay = -0.2;
	}
	if (areaToOpen === "info area") {
		params.domToOpen = infoDom;
		params.domToClose = worksDom;
		params.finalWorksAreaW = 0;
		params.finalInfoAreaW = 40;
		params.duration = 0.6;
		params.delay = -0.1;
	}

	const psudoValues = {
		worksAreaW: ctx.worksAreaWidth,
		infoAreaW: ctx.infoAreaWidth,
	};

	const tl = gsap.timeline();

	const domToCloseVisible =
		window.getComputedStyle(params.domToClose).visibility === "visible";

	if (domToCloseVisible) {
		tl.to(params.domToClose, {
			opacity: 0,
			duration: 0.2,
			ease: "none",
		}).set(params.domToClose, {
			visibility: "hidden",
		});
	}

	tl.to(psudoValues, {
		worksAreaW: params.finalWorksAreaW,
		infoAreaW: params.finalInfoAreaW,
		duration: params.duration,
		ease: "power3",
		onUpdate: () => {
			const worksAreaWidth = psudoValues.worksAreaW;
			const canvasWidth =
				100 - (psudoValues.worksAreaW + psudoValues.infoAreaW);
			const infoAreaWidth = psudoValues.infoAreaW;
			callback({
				type: "width changes",
				worksAreaWidth,
				canvasWidth,
				infoAreaWidth,
			});
		},
	}).to(params.domToOpen, {
		opacity: 1,
		visibility: "visible",
		delay: params.delay,
		duration: 0.2,
		ease: "none",
		onComplete: () => {
			ctx.animTasks.areaDone = true;
			callback({ type: "open area finished" });
		},
	});
};

const closeArea = (areaToClose, ctx, callback) => {
	ctx.animTasks.areaDone = false;

	const { worksDom, infoDom } = ctx.initContext;

	const params = {};

	if (areaToClose === "works area") {
		params.domToClose = worksDom;
		params.duration = 0.8;
	}
	if (areaToClose === "info area") {
		params.domToClose = infoDom;
		params.duration = 0.6;
	}

	const psudoValues = {
		worksAreaW: ctx.worksAreaWidth,
		infoAreaW: ctx.infoAreaWidth,
	};

	const tl = gsap.timeline();

	tl.to(params.domToClose, {
		opacity: 0,
		duration: 0.2,
		ease: "none",
	})
		.set(params.domToClose, {
			visibility: "hidden",
		})
		.to(psudoValues, {
			worksAreaW: 0,
			infoAreaW: 0,
			duration: params.duration,
			ease: "power2",
			onUpdate: () => {
				const worksAreaWidth = psudoValues.worksAreaW;
				const canvasWidth =
					100 - (psudoValues.worksAreaW + psudoValues.infoAreaW);
				const infoAreaWidth = psudoValues.infoAreaW;
				callback({
					type: "width changes",
					worksAreaWidth,
					canvasWidth,
					infoAreaWidth,
				});
			},
			onComplete: () => {
				ctx.animTasks.areaDone = true;
				callback({ type: "close area finished" });
			},
		});
};
