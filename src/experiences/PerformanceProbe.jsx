import { useEffect, useRef } from "react";
import { PerfHeadless, usePerf } from "r3f-perf";
import appStateManager from "../utils/appStateManager";

export default function PerformanceProbe() {
	const sampleRef = useRef(0);
	const log = usePerf((state) => state.log);
	const getReport = usePerf((state) => state.getReport);

	useEffect(() => {
		if (!log) {
			return;
		}

		sampleRef.current += 1;
		const appState =
			appStateManager.getSnapshot?.().value ?? appStateManager.state.value;

		console.info(
			"__PERF_SAMPLE__",
			JSON.stringify({
				sample: sampleRef.current,
				appState,
				log: {
					fps: log.fps,
					cpu: log.cpu,
					gpu: log.gpu,
					mem: log.mem,
				},
				report: getReport(),
			})
		);
	}, [getReport, log]);

	return <PerfHeadless logsPerSecond={1} />;
}
