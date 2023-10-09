import {
	createMachine,
	assign,
	interpret,
	raise,
	spawn,
	stop,
	sendTo,
} from "xstate";

export const machine = createMachine(
	{
		/** @xstate-layout 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-FcKRzEpJakqlbhyVOZNCi4Qkg-QoUOEMKzMTCk2F9WYVyEjKg+XVQSEz-J80XrHC6VRnHEQ7vvMJrStqiiUOYWYPsCqHHjCkQu8xHKF2mii7y6KmpsFNkvHFaj8VELelGTwPZ9iWDhJMdwF9ljUoTMBelctDi6zYVPF+RtvmYpRti1RkAgVvUAmKJ5mwPCRH1SsoG6wwRTk2JYMY7iUXKpruyuuaMLYQC1cMdO3ZvCP2jIrVwy12KmoDhauElkrF4I4TPdCPljkf1VUvH+9SeVpNJmEcEOxco4lCDTJZy0HDFViNKbKCxvDRBtbPKNWBP6xsrL-KALryJ0UFXokV8DxXBBzWOGIaxsqjDROgtIQA */
		context: {
			initContext: {},
			clothFollowPos: null,
			clothGrabInitPos: null,
			clonedCanvas: null,
			worksAreaWdith: 0,
			infoAreaWdith: 0,
		},
		id: "appStateManager",
		initial: "Opening Idle",
		on: {
			"init some context": {
				actions: ["assign some context", "show ctx"],
			},
		},
		states: {
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
				on: {
					"works bar click": {
						target: "Jet To Square/ Work Areas Opening",
					},
				},
			},
			"Jet To Square/ Work Areas Opening": {
				exit: {
					type: "open works area",
				},
				invoke: {
					src: "jet to square animating",
					id: "jet to square animating",
				},
				on: {
					"jet to square finished": {
						target: "Square Idle/ Work Areas Opened",
					},
				},
			},
			"Jet To Square/ Info Areas Opening": {
				entry: {
					type: "open info area",
				},
				invoke: {
					src: "jet to square animating",
					id: "jet to square animating",
				},
				on: {
					"jet to square finished": {
						target: "Square Idle/ Info Areas Opened",
					},
				},
			},
			"Square Idle/ Work Areas Opened": {
				exit: {
					type: "works area close",
				},
				on: {
					"info bar click": {
						target: "Square Idle/ Info Areas Opened",
					},
					"works bar click": {
						target: "Square To Jet/ Work Area closing",
					},
					"canvas click": {
						target: "Square To Jet/ Work Area closing",
					},
				},
			},
			"Square Idle/ Info Areas Opened": {
				exit: {
					type: "info area close",
				},
				on: {
					"works bar click": {
						target: "Square Idle/ Work Areas Opened",
					},
					"canvas click": {
						target: "Square To Jet/ Info Area closing",
					},
					"info bar click": {
						target: "Square To Jet/ Info Area closing",
					},
				},
			},
			"Square To Jet/ Work Area closing": {
				invoke: {
					src: "square to jet animating",
					id: "square to jet animating",
				},
				on: {
					"square to jet finished": "Jet Idle/ Aeras Closed",
				},
			},
			"Square To Jet/ Info Area closing": {
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
		},
		predictableActionArguments: true,
		preserveActionOrder: true,
	},
	{
		actions: {
			"assign some context": assign({
				initContext: (ctx, event) => {
					// for (const prop in event) {

					// }
					const temEvent = { ...event };
					delete temEvent.type;
					return { ...ctx.initContext, ...temEvent };
				},
			}),
			"show ctx": (ctx) => {
				// console.log(ctx);
			},
			"assign point pos": assign({
				clothGrabInitPos: (ctx, event) => event.pointPos,
			}),

			"start cloning": assign({
				cloneOpeningRef: (ctx, event) =>
					spawn(async (callback, receive) => {
						const { openningDom, html2canvas } = event;
						const pEleOrigList = openningDom.querySelectorAll("p");

						const clonedOpeningDom = openningDom.cloneNode(true);
						const pEleClonedList = clonedOpeningDom.querySelectorAll("p");

						clonedOpeningDom.classList.remove("scroll");

						pEleOrigList.forEach((ele, i) => {
							const style = window.getComputedStyle(ele);
							const matrix = new WebKitCSSMatrix(style.transform);
							const translateX = matrix.m41;
							pEleClonedList[i].style.transform = `translateX(${translateX}px)`;
						});

						let canvas = null;
						document.body.appendChild(clonedOpeningDom);
						clonedOpeningDom.style.zIndex = "-1";

						try {
							canvas = await html2canvas(clonedOpeningDom, { logging: false });

							//remove temporary cloned Dom
							clonedOpeningDom.remove();

							callback({
								type: "clone finished",
								clonedCanvas: canvas,
								openningDom,
							});
						} catch (error) {
							console.log(error);
						}
					}),
			}),

			"assign canvas": assign({
				clonedCanvas: (ctx, event) => event.clonedCanvas,
				openningDom: (ctx, event) => event.openningDom,
			}),

			"remove opening dom": (ctx) => {
				//remove the original opening dom
				ctx.openningDom.remove();
				stop(ctx.cloneOpeningRef);
			},

			"open works area": (context, event) => {},

			"open info area": (context, event) => {},

			"works area close": (context, event) => {},

			"info area close": (context, event) => {},
		},
		services: {
			"square to jet animating": (ctx, event) => (callback) => {
				const { squareToJet } = ctx.initContext;

				//animate square to jet
				squareToJet(() => {
					callback("square to jet finished");
				});
			},
			"jet to square animating": (ctx, event) => (callback) => {
				const { jetToSquare, setGeo, squareGeo, setMat, squareMat } =
					ctx.initContext;
				//animate square to jet
				jetToSquare(() => {
					//set jet geo and mat
					setGeo(squareGeo);
					setMat(squareMat);
					callback("jet to square finished");
				});
			},
		},
		guards: {},
		delays: {},
	}
);
const appStateManager = interpret(machine).start();

export default appStateManager;
