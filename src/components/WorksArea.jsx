import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import "./WorksArea.scss";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Work from "./Work";
import arrowIcon from "../assets/arrow.svg";
import appStateManager from "../utils/appStateManager";
import { useSelector } from "@xstate/react";
import gsap from "gsap";
import languageStateManager from "../utils/languageStateManager";

const getCategoryAnimationDurations = () =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
		? { fadeOut: 1, fadeIn: 1 }
		: { fadeOut: 180, fadeIn: 240 };

const getWorksForCategory = (category, works, workCategories) => {
	if (category === "all") {
		return works;
	}

	const categoryData = workCategories.find((item) => item.key === category);
	const worksById = new Map(works.map((work) => [work.id, work]));
	return (categoryData?.workIds ?? [])
		.map((workId) => worksById.get(workId))
		.filter(Boolean);
};

const getWorkCategory = (workId, workCategories) =>
	workCategories.find((category) => category.workIds.includes(workId))?.key;

function WorksArea(props) {
	const containerRef = useRef();
	const listRef = useRef();
	const areaRef = useRef();
	const simpleBarRef = useRef(null);
	const categoriesRef = useRef();
	const categoryTrackRef = useRef();
	const categoryDragRef = useRef({
		pointerId: null,
		startX: 0,
		startScrollLeft: 0,
		moved: false,
	});
	const queuedWorkAreaOpenRef = useRef(false);
	const fadeOutTimerRef = useRef();
	const fadeInTimerRef = useRef();
	const categoryScrollInitializedRef = useRef(false);

	const [windowWidthSt, setWindowWidth] = useState(window.innerWidth);
	const [ifAnyUnfoldSt, setIfAnyUnfold] = useState(false);
	const [expandedWorkIdSt, setExpandedWorkId] = useState(null);
	const [activeCategorySt, setActiveCategory] = useState("all");
	const [pendingCategorySt, setPendingCategory] = useState(null);
	const [categoryPhaseSt, setCategoryPhase] = useState("idle");
	const [categoryIndicatorSt, setCategoryIndicator] = useState(null);

	const worksDataSt = useSelector(
		languageStateManager,
		(state) => state.context.worksData
	);
	const workCategoriesSt = useSelector(
		languageStateManager,
		(state) => state.context.workCategories
	);
	const languagePhaseSt = useSelector(languageStateManager, (state) => {
		if (state.matches("fadingOut")) return "fading-out";
		if (state.matches("fadingIn")) return "fading-in";
		return "idle";
	});
	const contentLocaleSt = useSelector(
		languageStateManager,
		(state) =>
			state.context.currentLocale ??
			state.context.requestedLocale ??
			state.context.defaultLocale
	);
	const isChineseSt = contentLocaleSt === "zh-CN";

	const workAreaActiveSt = useSelector(
		appStateManager,
		(s) => s.context.workAreaActive
	);
	const workAreaCanOpenSt = useSelector(
		appStateManager,
		(s) =>
			s.matches("Jet Idle/ Aeras Closed") ||
			s.matches("Square Idle/ Info Areas Opened")
	);
	const visibleWorksDataSt = useMemo(
		() => getWorksForCategory(activeCategorySt, worksDataSt, workCategoriesSt),
		[activeCategorySt, worksDataSt, workCategoriesSt]
	);
	const selectedCategorySt = pendingCategorySt ?? activeCategorySt;
	const categoryTransitioningSt = categoryPhaseSt !== "idle";

	useLayoutEffect(() => {
		let animationFrame;
		let settledLayoutFrame;
		let hasUnmounted = false;
		const categoriesElement = categoriesRef.current;
		const categoryTrackElement = categoryTrackRef.current;

		const updateCategoryIndicator = () => {
			const selectedButton = categoriesElement?.querySelector(
				".works-area__bar-category.is-active"
			);

			if (!categoriesElement || !selectedButton) {
				return;
			}

			const indicatorContainer =
				windowWidthSt < 400 ? categoryTrackElement : categoriesElement;

			if (!indicatorContainer) {
				return;
			}

			const indicatorContainerRect = indicatorContainer.getBoundingClientRect();
			const selectedRect = selectedButton.getBoundingClientRect();
			const indicatorContainerStyle =
				window.getComputedStyle(indicatorContainer);
			const borderLeft =
				Number.parseFloat(indicatorContainerStyle.borderLeftWidth) || 0;
			const borderTop =
				Number.parseFloat(indicatorContainerStyle.borderTopWidth) || 0;
			const nextIndicator = {
				x: selectedRect.left - indicatorContainerRect.left - borderLeft,
				y: selectedRect.top - indicatorContainerRect.top - borderTop,
				width: selectedRect.width,
				height: selectedRect.height,
			};

			setCategoryIndicator((currentIndicator) => {
				if (
					currentIndicator &&
					Object.keys(nextIndicator).every(
						(key) => currentIndicator[key] === nextIndicator[key]
					)
				) {
					return currentIndicator;
				}

				return nextIndicator;
			});
		};

		const scheduleCategoryIndicatorUpdate = () => {
			cancelAnimationFrame(animationFrame);
			animationFrame = requestAnimationFrame(updateCategoryIndicator);
		};
		const updateCategoryScrollEdges = () => {
			if (!categoriesElement) {
				return;
			}

			const maximumScrollLeft = Math.max(
				categoriesElement.scrollWidth - categoriesElement.clientWidth,
				0
			);
			const edgeTolerance = 1;

			categoriesElement.dataset.scrollStart = String(
				categoriesElement.scrollLeft <= edgeTolerance
			);
			categoriesElement.dataset.scrollEnd = String(
				categoriesElement.scrollLeft >= maximumScrollLeft - edgeTolerance
			);
		};
		const scrollSelectedCategoryIntoView = () => {
			const selectedButton = categoriesElement?.querySelector(
				".works-area__bar-category.is-active"
			);

			if (!categoriesElement || !selectedButton || windowWidthSt >= 400) {
				return;
			}

			const maximumScrollLeft = Math.max(
				categoriesElement.scrollWidth - categoriesElement.clientWidth,
				0
			);
			const categoriesRect = categoriesElement.getBoundingClientRect();
			const selectedRect = selectedButton.getBoundingClientRect();
			const centeredScrollLeft =
				categoriesElement.scrollLeft +
				selectedRect.left -
				categoriesRect.left -
				(categoriesElement.clientWidth - selectedRect.width) / 2;
			const targetScrollLeft =
				selectedCategorySt === "all"
					? 0
					: Math.min(Math.max(centeredScrollLeft, 0), maximumScrollLeft);
			const reduceMotion = window.matchMedia?.(
				"(prefers-reduced-motion: reduce)"
			).matches;

			if (!categoryScrollInitializedRef.current) {
				categoriesElement.scrollLeft = targetScrollLeft;
				categoryScrollInitializedRef.current = true;
				updateCategoryScrollEdges();
				return;
			}

			categoriesElement.scrollTo({
				left: targetScrollLeft,
				behavior: reduceMotion ? "auto" : "smooth",
			});
		};
		const refreshCategoryLayout = () => {
			scheduleCategoryIndicatorUpdate();
			updateCategoryScrollEdges();
			scrollSelectedCategoryIntoView();
			cancelAnimationFrame(settledLayoutFrame);
			settledLayoutFrame = requestAnimationFrame(() => {
				scheduleCategoryIndicatorUpdate();
				updateCategoryScrollEdges();
				scrollSelectedCategoryIntoView();
			});
		};
		const handleCategoryTransitionEnd = (event) => {
			const isCategoryButton = event.target.matches(
				".works-area__bar-category"
			);
			const isCategoryControl = event.target === categoriesElement;
			const affectsIndicatorGeometry =
				(event.propertyName === "font-weight" && isCategoryButton) ||
				(event.propertyName === "transform" &&
					(isCategoryButton || isCategoryControl));

			if (!affectsIndicatorGeometry) {
				return;
			}

			refreshCategoryLayout();
		};

		updateCategoryIndicator();
		refreshCategoryLayout();
		window.addEventListener("resize", scheduleCategoryIndicatorUpdate);
		window.addEventListener("load", refreshCategoryLayout);
		document.fonts?.ready
			.then(() => {
				if (!hasUnmounted) {
					refreshCategoryLayout();
				}
			})
			.catch(() => {});
		categoriesElement?.addEventListener("scroll", updateCategoryScrollEdges, {
			passive: true,
		});
		categoriesElement?.addEventListener(
			"transitionend",
			handleCategoryTransitionEnd
		);

		const resizeObserver = new ResizeObserver(scheduleCategoryIndicatorUpdate);
		if (categoriesElement) {
			resizeObserver.observe(categoriesElement);
			if (categoryTrackElement) {
				resizeObserver.observe(categoryTrackElement);
			}
			categoriesElement
				.querySelectorAll(
					".works-area__bar-category, .works-area__bar-category span"
				)
				.forEach((button) => resizeObserver.observe(button));
		}

		return () => {
			hasUnmounted = true;
			cancelAnimationFrame(animationFrame);
			cancelAnimationFrame(settledLayoutFrame);
			window.removeEventListener("resize", scheduleCategoryIndicatorUpdate);
			window.removeEventListener("load", refreshCategoryLayout);
			categoriesElement?.removeEventListener(
				"scroll",
				updateCategoryScrollEdges
			);
			categoriesElement?.removeEventListener(
				"transitionend",
				handleCategoryTransitionEnd
			);
			resizeObserver.disconnect();
		};
	}, [selectedCategorySt, windowWidthSt]);

	useEffect(() => {
		const updateWindowWidth = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", updateWindowWidth);

		appStateManager.send("init some context", {
			worksDom: containerRef.current,
		});

		return () => {
			window.removeEventListener("resize", updateWindowWidth);
			clearTimeout(fadeOutTimerRef.current);
			clearTimeout(fadeInTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if (!workAreaActiveSt) {
			foldOtherWorks();
			stopAllVideos();
			setIfAnyUnfold(false);
			setExpandedWorkId(null);
		}
	}, [workAreaActiveSt]);

	useEffect(() => {
		if (!workAreaActiveSt) {
			return undefined;
		}

		let frame = requestAnimationFrame(() => {
			simpleBarRef.current?.recalculate();
			frame = requestAnimationFrame(() => {
				simpleBarRef.current?.recalculate();
			});
		});

		return () => cancelAnimationFrame(frame);
	}, [categoryPhaseSt, expandedWorkIdSt, visibleWorksDataSt, workAreaActiveSt]);

	useEffect(() => {
		if (workAreaActiveSt) {
			queuedWorkAreaOpenRef.current = false;
			return;
		}

		if (!queuedWorkAreaOpenRef.current || !workAreaCanOpenSt) {
			return;
		}

		queuedWorkAreaOpenRef.current = false;
		appStateManager.send("works bar click");
	}, [workAreaActiveSt, workAreaCanOpenSt]);

	const foldOtherWorks = () => {
		Array.from(listRef.current?.children ?? []).forEach((e) => {
			if (e.classList.contains("unfold")) {
				e.classList.replace("unfold", "fold");
			}
		});
		setExpandedWorkId(null);
	};

	const stopAllVideos = () => {
		listRef.current?.querySelectorAll("video").forEach((video) => {
			video.pause();
		});
	};

	const handleCategoryPointerDown = (event) => {
		if (
			windowWidthSt >= 400 ||
			event.pointerType !== "mouse" ||
			event.button !== 0
		) {
			return;
		}

		categoryDragRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startScrollLeft: event.currentTarget.scrollLeft,
			moved: false,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handleCategoryPointerMove = (event) => {
		const dragState = categoryDragRef.current;

		if (dragState.pointerId !== event.pointerId) {
			return;
		}

		const distance = event.clientX - dragState.startX;
		if (Math.abs(distance) > 3) {
			dragState.moved = true;
			event.preventDefault();
		}

		event.currentTarget.scrollLeft = dragState.startScrollLeft - distance;
	};

	const handleCategoryPointerUp = (event) => {
		if (categoryDragRef.current.pointerId !== event.pointerId) {
			return;
		}

		event.currentTarget.releasePointerCapture(event.pointerId);
		categoryDragRef.current.pointerId = null;
	};

	const handleCategoryPointerCancel = () => {
		categoryDragRef.current = {
			pointerId: null,
			startX: 0,
			startScrollLeft: 0,
			moved: false,
		};
	};

	const handleCategoryClickCapture = (event) => {
		if (!categoryDragRef.current.moved) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		categoryDragRef.current.moved = false;
	};

	const requestWorkAreaOpen = () => {
		if (workAreaActiveSt) {
			return;
		}

		if (workAreaCanOpenSt) {
			appStateManager.send("works bar click");
			return;
		}

		queuedWorkAreaOpenRef.current = true;
	};

	const handleCategorySelect = (category) => {
		requestWorkAreaOpen();

		if (category === activeCategorySt || categoryTransitioningSt) {
			return;
		}

		setPendingCategory(category);
		setCategoryPhase("fading-out");
		const { fadeOut, fadeIn } = getCategoryAnimationDurations();

		fadeOutTimerRef.current = setTimeout(() => {
			const nextWorks = getWorksForCategory(
				category,
				worksDataSt,
				workCategoriesSt
			);
			const expandedWorkRemains = nextWorks.some(
				(work) => work.id === expandedWorkIdSt
			);

			if (expandedWorkIdSt && !expandedWorkRemains) {
				stopAllVideos();
				setExpandedWorkId(null);
				setIfAnyUnfold(false);
			}

			setActiveCategory(category);
			setCategoryPhase("fading-in");
			fadeInTimerRef.current = setTimeout(() => {
				setPendingCategory(null);
				setCategoryPhase("idle");
			}, fadeIn);
		}, fadeOut);
	};

	return (
		<div
			className={isChineseSt ? "works-area is-chinese" : "works-area"}
			data-language-phase={languagePhaseSt}
			ref={areaRef}
		>
			<Resize areaRef={areaRef} ifAnyUnfold={ifAnyUnfoldSt} {...props} />
			<div
				className="works-area__bar"
				onClick={() => {
					appStateManager.send("works bar click");
				}}
			>
				<span className="works-area__bar-title locale-copy">
					{isChineseSt ? "作品集" : "works"}
				</span>
				<nav
					className={`works-area__bar-categories${
						categoryTransitioningSt ? " is-loading" : ""
					}${categoryIndicatorSt ? " is-ready" : ""}`}
					aria-label="Filter works by category"
					aria-busy={categoryTransitioningSt}
					onClickCapture={handleCategoryClickCapture}
					onClick={(event) => event.stopPropagation()}
					onPointerDown={handleCategoryPointerDown}
					onPointerMove={handleCategoryPointerMove}
					onPointerUp={handleCategoryPointerUp}
					onPointerCancel={handleCategoryPointerCancel}
					ref={categoriesRef}
					style={
						categoryIndicatorSt
							? {
									"--category-indicator-x": `${categoryIndicatorSt.x}px`,
									"--category-indicator-y": `${categoryIndicatorSt.y}px`,
									"--category-indicator-width": `${categoryIndicatorSt.width}px`,
									"--category-indicator-height": `${categoryIndicatorSt.height}px`,
							  }
							: undefined
					}
				>
					<div
						className="works-area__bar-categories-track"
						ref={categoryTrackRef}
					>
						<span
							className="works-area__bar-category-indicator"
							aria-hidden="true"
						/>
						<button
							type="button"
							className={
								selectedCategorySt === "all"
									? "works-area__bar-category is-active"
									: "works-area__bar-category"
							}
							aria-pressed={selectedCategorySt === "all"}
							disabled={categoryTransitioningSt}
							onClick={() => handleCategorySelect("all")}
						>
							<span className="locale-copy">
								{isChineseSt ? "所有项目" : "All"}
							</span>
						</button>
						<button
							type="button"
							className={
								selectedCategorySt === "commercial"
									? "works-area__bar-category is-active"
									: "works-area__bar-category"
							}
							aria-pressed={selectedCategorySt === "commercial"}
							disabled={categoryTransitioningSt}
							onClick={() => handleCategorySelect("commercial")}
						>
							<span className="locale-copy">
								{isChineseSt ? "商业项目" : "Commercial"}
							</span>
						</button>
						<button
							type="button"
							className={
								selectedCategorySt === "exploration"
									? "works-area__bar-category is-active"
									: "works-area__bar-category"
							}
							aria-pressed={selectedCategorySt === "exploration"}
							disabled={categoryTransitioningSt}
							onClick={() => handleCategorySelect("exploration")}
						>
							<span className="locale-copy">
								{isChineseSt ? "个人探索" : "Exploration"}
							</span>
						</button>
						<button
							type="button"
							className={
								selectedCategorySt === "sandbox"
									? "works-area__bar-category is-active"
									: "works-area__bar-category"
							}
							aria-pressed={selectedCategorySt === "sandbox"}
							disabled={categoryTransitioningSt}
							onClick={() => handleCategorySelect("sandbox")}
						>
							<span className="locale-copy">
								{isChineseSt ? "沙盒实验" : "Sandbox"}
							</span>
						</button>
					</div>
				</nav>
				<div
					className={
						workAreaActiveSt
							? "works-area__bar-arrow unfold"
							: "works-area__bar-arrow"
					}
				>
					<img src={arrowIcon} alt="arrow icon" />
					<img src={arrowIcon} alt="arrow icon" />
				</div>
			</div>

			<SimpleBar ref={simpleBarRef} style={{ height: "100%" }}>
				<div className="works-area__container" ref={containerRef}>
					<div className={`works-area__list ${categoryPhaseSt}`} ref={listRef}>
						{visibleWorksDataSt.map((workData) => (
							<Work
								windowWidth={windowWidthSt}
								workAreaActive={workAreaActiveSt}
								key={workData.id}
								workId={workData.id}
								title={workData.title}
								sub={workData.sub}
								category={getWorkCategory(workData.id, workCategoriesSt)}
								showCategory={selectedCategorySt === "all"}
								isChinese={isChineseSt}
								techTools={workData.techTools}
								description={workData.description}
								year={workData.year}
								externalLinks={workData.externalLinks}
								mediaSet={workData.mediaSet}
								isExpanded={expandedWorkIdSt === workData.id}
								foldOtherWorks={foldOtherWorks}
								setIfAnyUnfold={setIfAnyUnfold}
								setExpandedWorkId={setExpandedWorkId}
								stopAllVideos={stopAllVideos}
								{...props}
							/>
						))}
					</div>
				</div>
			</SimpleBar>
		</div>
	);
}

export default WorksArea;

const Resize = ({ areaRef, ifVertical, ifAnyUnfold }) => {
	const updateWorksAreaLayout = useCallback(
		(worksAreaWidth) => {
			if (!ifVertical) {
				areaRef.current.style.width = `${worksAreaWidth}%`;
				areaRef.current.style.height = "100%";
				return;
			}

			if (ifAnyUnfold) {
				gsap.to(areaRef.current.style, {
					height: `${worksAreaWidth / 0.6}%`,
					duration: 0.3,
					delay: 1.2,
					ease: "power4.in",
				});
			} else {
				gsap.to(areaRef.current.style, {
					height: `${worksAreaWidth}%`,
					duration: 0.3,
				});
			}
			areaRef.current.style.width = "100%";
		},
		[areaRef, ifAnyUnfold, ifVertical]
	);

	useEffect(() => {
		appStateManager.send("init some context", { updateWorksAreaLayout });
		const state = appStateManager.getSnapshot?.() ?? appStateManager.state;
		updateWorksAreaLayout(state.context.worksAreaWidth);
	}, [updateWorksAreaLayout]);

	return null;
};
