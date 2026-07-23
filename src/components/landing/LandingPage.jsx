import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./LandingPage.scss";

const BLOCK_SIZES = {
	"2x1": { w: 2, h: 1 },
	"1x2": { w: 1, h: 2 },
	"2x2": { w: 2, h: 2 },
	"3x2": { w: 3, h: 2 },
	"2x3": { w: 2, h: 3 },
	"3x3": { w: 3, h: 3 },
};

const POEM = `Take this kiss upon the brow!
And, in parting from you now,
Thus much let me avow-
You are not wrong, who deem
That my days have been a dream;
Yet if hope has flown away
In a night, or in a day,
In a vision, or in none,
Is it therefore the less gone?
All that we see or seem
Is but a dream within a dream.

I stand amid the roar
Of a surf-tormented shore,
And I hold within my hand
Grains of the golden sand-
How few! yet how they creep
Through my fingers to the deep,
While I weep-while I weep!
O God! can I not grasp
Them with a tighter clasp?
O God! can I not save
One from the pitiless wave?
Is all that we see or seem
But a dream within a dream?`;

const CLEAN_POEM = POEM.toLowerCase()
	.replace(/[^a-z0-9\s]/g, "")
	.replace(/\s+/g, " ")
	.trim();

const SMALL_VARIANTS = ["sineWave", "triangleMarch", "needle", "semicircles"];
const COUNTDOWN_START = 25;

function readSmallViewportHeight() {
	if (!window.CSS?.supports?.("height", "100svh")) {
		return window.innerHeight;
	}

	const probe = document.createElement("div");
	probe.style.cssText =
		"position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none;";
	document.documentElement.appendChild(probe);
	const height = probe.getBoundingClientRect().height;
	probe.remove();

	return height || window.innerHeight;
}

function useResponsiveGrid() {
	const readViewport = () => ({
		width: window.innerWidth,
		height: readSmallViewportHeight(),
	});

	const [viewport, setViewport] = useState(readViewport);

	useEffect(() => {
		const onResize = () => setViewport(readViewport());
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const targetCellSize =
		viewport.width < 500
			? 55
			: viewport.width < 1000
			? 70
			: viewport.width < 1450
			? 85
			: 100;
	const columns = Math.max(4, Math.round(viewport.width / targetCellSize));
	const rows = Math.max(4, Math.round(viewport.height / targetCellSize));

	return {
		columns,
		rows,
		cellWidth: viewport.width / columns,
		cellHeight: viewport.height / rows,
		targetCellSize,
	};
}

function mulberry32(seed) {
	return () => {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function pick(random, items) {
	return items[Math.floor(random() * items.length)];
}

function shuffle(random, items) {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function collidesWithGap(candidate, placed) {
	return placed.some((item) => {
		const horizontalGap =
			candidate.x + candidate.w < item.x || item.x + item.w < candidate.x;
		const verticalGap =
			candidate.y + candidate.h < item.y || item.y + item.h < candidate.y;
		return !horizontalGap && !verticalGap;
	});
}

function placeBlock(random, placed, columns, rows, block) {
	const maxX = columns - block.w - 1;
	const maxY = rows - block.h - 1;

	if (maxX < 1 || maxY < 1) {
		return null;
	}

	const candidates = [];
	for (let y = 1; y <= maxY; y += 1) {
		for (let x = 1; x <= maxX; x += 1) {
			candidates.push({ ...block, x, y });
		}
	}

	for (const candidate of shuffle(random, candidates)) {
		if (!collidesWithGap(candidate, placed)) {
			return candidate;
		}
	}

	return null;
}

function generateLandingLayout({ columns, rows, seed }) {
	let bestAttempt = null;

	for (let attempt = 0; attempt < 80; attempt += 1) {
		const random = mulberry32(seed + attempt * 9973);
		const placed = [];
		let missingRequired = 0;
		const add = (size, variant, required = true) => {
			const dimensions = BLOCK_SIZES[size];
			const placement = placeBlock(random, placed, columns, rows, {
				id: `${variant}-${placed.length}`,
				size,
				variant,
				...dimensions,
			});

			if (placement) {
				placed.push(placement);
				return true;
			}

			if (required) {
				missingRequired += 1;
			}

			return false;
		};

		add("3x3", "handRipple");
		add("2x2", "countdown");
		add("2x2", "cursorArrow");

		const hasRoomForBothFeatureBlocks =
			columns * rows >= 120 && columns >= 10 && rows >= 8;
		if (hasRoomForBothFeatureBlocks) {
			add("3x2", "worldTime", false);
			add("2x3", "typewriter", false);
		} else {
			const feature =
				random() > 0.5 ? ["3x2", "worldTime"] : ["2x3", "typewriter"];
			add(feature[0], feature[1]);
		}

		const smallCount =
			columns * rows > 140
				? 4 + Math.floor(random() * 3)
				: 2 + Math.floor(random() * 3) + (hasRoomForBothFeatureBlocks ? 1 : 0);
		const usedSmallVariants = {
			"2x1": new Set(),
			"1x2": new Set(),
		};
		const pickSmallVariant = (size) => {
			const unused = SMALL_VARIANTS.filter(
				(variant) => !usedSmallVariants[size].has(variant)
			);
			return pick(random, unused.length ? unused : SMALL_VARIANTS);
		};

		for (let i = 0; i < smallCount; i += 1) {
			const size = random() > 0.5 ? "2x1" : "1x2";
			const variant = pickSmallVariant(size);
			if (add(size, variant, false)) {
				usedSmallVariants[size].add(variant);
			}
		}

		const score = placed.length - missingRequired * 10;
		if (!bestAttempt || score > bestAttempt.score) {
			bestAttempt = { placed, missingRequired, score };
		}

		if (missingRequired === 0) {
			return placed;
		}
	}

	return bestAttempt?.placed || [];
}

function MotionBlock({
	size,
	variant,
	onEnter3D,
	onRegenerateLayout,
}) {
	const dimensions = BLOCK_SIZES[size];

	return (
		<section
			className={`motion-block motion-block--${variant} motion-block--${size}`}
			style={{ "--block-w": dimensions.w, "--block-h": dimensions.h }}
			aria-label={`${size} ${variant}`}
		>
			<BlockContent
				size={size}
				variant={variant}
				onEnter3D={onEnter3D}
				onRegenerateLayout={onRegenerateLayout}
			/>
		</section>
	);
}

function BlockContent({
	size,
	variant,
	onEnter3D,
	onRegenerateLayout,
}) {
	switch (variant) {
		case "sineWave":
			return <SineWave size={size} />;
		case "triangleMarch":
			return <TriangleMarch size={size} />;
		case "needle":
			return <NeedleGauge size={size} />;
		case "semicircles":
			return <SemiCircleSpin size={size} />;
		case "countdown":
			return (
				<Countdown
					onEnter3D={onEnter3D}
					onRegenerateLayout={onRegenerateLayout}
				/>
			);
		case "cursorArrow":
			return <CursorArrow />;
		case "worldTime":
			return <WorldTime />;
		case "typewriter":
			return <TypewriterPoem />;
		case "handRipple":
			return <HandRipple onEnter3D={onEnter3D} />;
		default:
			return null;
	}
}

function SineWave({ size }) {
	const vertical = size === "1x2";

	return (
		<div className={`sine-wave ${vertical ? "sine-wave--vertical" : ""}`}>
			<div className="sine-track" aria-hidden="true">
				{Array.from({ length: 2 }, (_, index) => (
					<svg key={index} viewBox="0 0 240 100" preserveAspectRatio="none">
						<path
							className="sine"
							d="M 0 50 C 20 10, 40 10, 60 50 S 100 90, 120 50 S 160 10, 180 50 S 220 90, 240 50"
						/>
					</svg>
				))}
			</div>
		</div>
	);
}

function TriangleMarch({ size }) {
	const vertical = size === "1x2";
	const triangles = Array.from({ length: 5 });

	return (
		<div
			className={`triangle-march ${vertical ? "triangle-march--vertical" : ""}`}
			aria-hidden="true"
		>
			<div className="triangle-track">
				{Array.from({ length: 2 }, (_, groupIndex) => (
					<div className="triangle-group" key={groupIndex}>
						{triangles.map((_, index) => (
							<span key={index} />
						))}
					</div>
				))}
			</div>
		</div>
	);
}

function NeedleGauge({ size }) {
	const vertical = size === "1x2";

	return (
		<div className={`needle-gauge ${vertical ? "needle-gauge--vertical" : ""}`}>
			{Array.from({ length: 2 }, (_, faceIndex) => (
				<div className="gauge-face" key={faceIndex}>
					{Array.from({ length: 23 }, (_, index) => (
						<i key={index} style={{ "--tick": index }} />
					))}
					<div
						className="needle"
						style={{ "--needle-offset": `${faceIndex * 0.18}s` }}
					/>
					<div className="gauge-hub" />
				</div>
			))}
		</div>
	);
}

function SemiCircleSpin({ size }) {
	const vertical = size === "1x2";

	return (
		<div
			className={`semi-spin ${vertical ? "semi-spin--vertical" : ""}`}
			aria-hidden="true"
		>
			<div className="semi-disc semi-disc-a" />
			<div className="semi-disc semi-disc-b" />
		</div>
	);
}

function Countdown({ onEnter3D, onRegenerateLayout }) {
	const [count, setCount] = useState(COUNTDOWN_START);
	const hasTriggeredRef = useRef(false);
	const triggerRef = useRef(null);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setCount((value) => {
				if (value <= 1) {
					if (!hasTriggeredRef.current) {
						hasTriggeredRef.current = true;
						onEnter3D?.({
							triggerElement: triggerRef.current,
							reason: "countdown",
						});
					}
					return 0;
				}

				return value - 1;
			});
		}, 900);
		return () => window.clearInterval(timer);
	}, [onEnter3D]);

	const resetCountdown = () => {
		hasTriggeredRef.current = false;
		setCount(COUNTDOWN_START);
		onRegenerateLayout?.();
	};

	return (
		<div
			ref={triggerRef}
			className="countdown"
			role="button"
			tabIndex={0}
			onClick={(event) => {
				resetCountdown();
				event.currentTarget.blur();
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					resetCountdown();
				}
			}}
		>
			<div className="count-ring">
				<span>{count}</span>
			</div>
			<div className="film-sweep" />
			<div className="film-cross film-cross-x" />
			<div className="film-cross film-cross-y" />
		</div>
	);
}

function CursorArrow() {
	const ref = useRef(null);

	useEffect(() => {
		let frameId = null;
		let pointerX = 0;
		let pointerY = 0;

		const updateArrow = () => {
			frameId = null;
			const arrow = ref.current;

			if (!arrow) {
				return;
			}

			const rect = arrow.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const radians = Math.atan2(pointerY - centerY, pointerX - centerX);
			const angle = (radians * 180) / Math.PI;

			arrow.style.setProperty("--arrow-angle", `${angle}deg`);
			arrow.classList.remove("no-cursor");
			arrow.classList.add("has-cursor");
		};

		const onPointerMove = (event) => {
			pointerX = event.clientX;
			pointerY = event.clientY;

			if (frameId === null) {
				frameId = window.requestAnimationFrame(updateArrow);
			}
		};

		window.addEventListener("pointermove", onPointerMove);
		return () => {
			window.removeEventListener("pointermove", onPointerMove);
			if (frameId !== null) {
				window.cancelAnimationFrame(frameId);
			}
		};
	}, []);

	return (
		<div
			ref={ref}
			className="cursor-arrow no-cursor"
			aria-hidden="true"
		>
			<svg viewBox="0 0 120 120">
				<path d="M15 48 H74 L53 27 L68 12 L114 59 L68 106 L53 91 L74 72 H15 Z" />
			</svg>
		</div>
	);
}

function WorldTime() {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const format = (timeZone) =>
		new Intl.DateTimeFormat("en-GB", {
			timeZone,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		}).format(now);

	return (
		<div className="world-time">
			<div className="terminal-line">
				<span>Terminal</span>
				<strong>07</strong>
			</div>
			<TimeRow time={format("Europe/London")} city="London" />
			<TimeRow time={format("Asia/Shanghai")} city="Shanghai" />
			<TimeRow time={format("Europe/Rome")} city="Milan" />
		</div>
	);
}

function TimeRow({ time, city }) {
	return (
		<div className="time-row">
			<span>{time}</span>
			<strong>{city}</strong>
		</div>
	);
}

function TypewriterPoem() {
	const [length, setLength] = useState(0);
	const ref = useRef(null);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setLength((value) => (value >= CLEAN_POEM.length ? 0 : value + 1));
		}, 42);
		return () => window.clearInterval(timer);
	}, []);

	useLayoutEffect(() => {
		if (!ref.current) {
			return;
		}

		const overflow = ref.current.scrollHeight - ref.current.clientHeight;
		ref.current.scrollTop = Math.max(0, overflow);
	}, [length]);

	return (
		<div className="typewriter" ref={ref}>
			<p>
				{CLEAN_POEM.slice(0, length)}
				<span className="text-cursor" />
			</p>
		</div>
	);
}

function HandRipple({ onEnter3D }) {
	const triggerRef = useRef(null);

	const enter = (event) => {
		onEnter3D?.({
			event,
			triggerElement: triggerRef.current,
			reason: "handRipple",
		});
		event.currentTarget.blur();
	};

	return (
		<div
			ref={triggerRef}
			className="hand-ripple"
			role="button"
			tabIndex={0}
			onClick={enter}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					enter(event);
				}
			}}
		>
			<div className="ripple-field" aria-hidden="true">
				{Array.from({ length: 7 }, (_, index) => (
					<span key={index} style={{ "--ripple-index": index }} />
				))}
			</div>
			<svg
				className="hand-icon"
				viewBox="0 0 240 240"
				role="img"
				aria-label="click here"
			>
				<path
					className="hand-shape"
					d="M80 121 V63 C80 53 87 47 96 47 C105 47 112 54 112 64 V110 V83 C112 74 119 68 128 68 C137 68 144 75 144 84 V114 V94 C144 86 151 80 160 80 C169 80 176 87 176 96 V126 V110 C176 101 183 95 192 95 C201 95 208 102 208 112 V151 C208 191 181 218 139 218 H121 C99 218 84 208 69 188 L35 144 C29 136 31 126 39 121 C47 116 56 118 63 126 L80 147 Z"
					fill="currentColor"
				/>
				<text x="80" y="157">
					click
				</text>
				<text x="84" y="181">
					here
				</text>
			</svg>
		</div>
	);
}

function SiteBanner({ height }) {
	const label = "Rydeen Wang Club Landing";
	const repeats = Array.from({ length: 8 });

	return (
		<header
			className="site-banner"
			style={height ? { "--banner-h": height } : undefined}
		>
			<div className="site-banner-track">
				{Array.from({ length: 2 }, (_, groupIndex) => (
					<div className="site-banner-group" key={groupIndex}>
						{repeats.map((_, index) => (
							<span key={index}>{label}</span>
						))}
					</div>
				))}
			</div>
		</header>
	);
}

function GridBackdrop({ grid }) {
	return (
		<div
			className="grid-backdrop"
			style={{
				"--cell-w": `${grid.cellWidth}px`,
				"--cell-h": `${grid.cellHeight}px`,
			}}
			aria-hidden="true"
		/>
	);
}

export default function LandingPage({ onEnter3D }) {
	const grid = useResponsiveGrid();
	const createLayoutState = useCallback((sourceGrid) => {
		const seed = Math.floor(Math.random() * 1000000000);
		return {
			seed,
			columns: sourceGrid.columns,
			rows: sourceGrid.rows,
			targetCellSize: sourceGrid.targetCellSize,
			cellWidth: sourceGrid.cellWidth,
			cellHeight: sourceGrid.cellHeight,
			blocks: generateLandingLayout({
				columns: sourceGrid.columns,
				rows: sourceGrid.rows,
				seed,
			}),
		};
	}, []);
	const [layoutState, setLayoutState] = useState(() => createLayoutState(grid));

	const regenerateLayout = useCallback(() => {
		setLayoutState(createLayoutState(grid));
	}, [createLayoutState, grid]);

	return (
		<main className="landing-page">
			<GridBackdrop
				grid={{
					cellWidth: layoutState.cellWidth,
					cellHeight: layoutState.cellHeight,
				}}
			/>
			<SiteBanner height={`${layoutState.cellHeight}px`} />
			<div className="grid-readout" aria-hidden="true">
				<span>{layoutState.columns}</span>
				<span>{layoutState.rows}</span>
			</div>
			<section
				className="landing-grid"
				style={{
					"--columns": layoutState.columns,
					"--rows": layoutState.rows,
					"--cell-w": `${layoutState.cellWidth}px`,
					"--cell-h": `${layoutState.cellHeight}px`,
					"--grid-w": `${layoutState.columns * layoutState.cellWidth}px`,
					"--grid-h": `${layoutState.rows * layoutState.cellHeight}px`,
				}}
			>
				{layoutState.blocks.map((block) => (
					<div
						key={block.id}
						className="placed-block"
						style={{
							gridColumn: `${block.x + 1} / span ${block.w}`,
							gridRow: `${block.y + 1} / span ${block.h}`,
						}}
					>
						<MotionBlock
							size={block.size}
							variant={block.variant}
							onEnter3D={onEnter3D}
							onRegenerateLayout={regenerateLayout}
						/>
					</div>
				))}
			</section>
		</main>
	);
}
