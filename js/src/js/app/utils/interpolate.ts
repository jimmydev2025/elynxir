export function interpolate(value: number, min: number, max: number, targetRangeMin: number, targetRangeMax: number): number {
	const 
		result = targetRangeMin + (targetRangeMax - targetRangeMin) * (value - min) / (max - min);
		
	return result;
};

export function interpolateClamp(value: number, min: number, max: number, targetRangeMin: number, targetRangeMax: number): number {
	const 
		result = targetRangeMin + (targetRangeMax - targetRangeMin) * (value - min) / (max - min);
		
	return Math.max(targetRangeMin, Math.min(result, targetRangeMax));
};

export function norm(value: number, min: number, max: number): number {
	return (value - min) / (max - min);
}

export function normClamp(val: number, min: number, max: number): number {
    const result = Math.max(0, Math.min((val - min) / (max - min), 1));
    return result;
}

export function lerp(norm: number, min: number, max: number): number {
	return (max - min) * norm + min;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}
