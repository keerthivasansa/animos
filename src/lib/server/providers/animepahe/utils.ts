export function getDurationFromString(duration: string) {
	const parts = duration.split(':').map((val) => Number(val));
	const hours = parts[0];
	const minutes = parts[1];
	const seconds = parts[2];
	return hours * 3600 + minutes * 60 + seconds;
}
