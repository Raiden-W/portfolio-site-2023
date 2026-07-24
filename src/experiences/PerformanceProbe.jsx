import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Perf, setCustomData } from "r3f-perf";

const FRAME_SAMPLE_LIMIT = 180;
const REPORT_INTERVAL = 0.5;

function FrameTimeP95() {
	const frameTimesRef = useRef([]);
	const reportElapsedRef = useRef(0);

	useFrame((_, delta) => {
		const frameTimes = frameTimesRef.current;
		frameTimes.push(delta * 1000);
		if (frameTimes.length > FRAME_SAMPLE_LIMIT) {
			frameTimes.shift();
		}

		reportElapsedRef.current += delta;
		if (reportElapsedRef.current < REPORT_INTERVAL) {
			return;
		}

		reportElapsedRef.current = 0;
		const sortedFrameTimes = [...frameTimes].sort((a, b) => a - b);
		const percentileIndex = Math.ceil(sortedFrameTimes.length * 0.95) - 1;
		setCustomData(sortedFrameTimes[percentileIndex] ?? 0);
	});

	return null;
}

export default function PerformanceProbe() {
	return (
		<>
			<FrameTimeP95 />
			<Perf
				position="bottom-right"
				logsPerSecond={2}
				showGraph
				customData={{ name: "P95", info: "ms", value: 0, round: 1 }}
			/>
		</>
	);
}
