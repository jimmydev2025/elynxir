/*
Example use: 
1. Init Smart Progress
const smartProgress = new SmartProgress();
	
2. Add tweens with name, min and max values
smartProgress.add('scroll', 0, 1);

3. Update added progress values whenever you want
smartProgress.updateProgress('scroll', 0.3);

4. Update delta for every frame, when animation started
delta = ~16ms per frame on 60 fps mode
smartProgress.updateDelta(delta);

5. Get progress values on each frame 
smartProgress.getProgress('scroll');
*/

/*
Loop example

init = () => {
	this.lastTime = 0;
	this.loop(0); // run loop
}

update = (delta) => {
	smartProgress.updateDelta(delta);
	const value = smartProgress.getProgress('scroll'); // set value here
	console.log(value);
}

loop = (time) => {
	requestAnimationFrame(this.loop);
	
	const delta = time - this.lastTime;
	
	this.update(delta);

	this.lastTime = time;
}
*/

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export default class SmartProgress {
	options: any;
	tweens: {
		[key: string]: {
			instant: number,
			smooth: number,
			speed: number,
			bump: number,
			min: number,
			max: number
		}
	}

	constructor(options = {}) {
		this.options = options;
		this.tweens = {};
	}

	add = (name: string, min: number, max: number, speed?: number, bump?: number) => {
		if (this.tweens[name]) {
			console.error('Tween', name, 'already exists');
		}

		this.tweens[name] = {
			instant: 0,
			smooth: 0,
			speed: speed || 0.05,
			bump: bump || max / 1000,
			min,
			max
		}
	}

	updateProgress = (name: string, value: number, instant: boolean = false) => {
		const tween = this.tweens[name];
		const v = clamp(value, tween.min, tween.max);
		this.tweens[name].instant = v;

		if (instant) {
			this.tweens[name].smooth = v;
		}
	}

	updateDelta = (delta: number) => {
		Object.keys(this.tweens).map((name: string) => {
			const
				tween = this.tweens[name];

			let increaseValue = 0;
			let progressDiff = tween.instant - tween.smooth;

			if (tween.smooth != tween.instant) {
				increaseValue = (progressDiff * tween.speed) * (delta * 100);
				tween.smooth += increaseValue;
			}
			
			if (Math.abs(progressDiff) < tween.bump) {
				tween.smooth = tween.instant;
			}
		});
	}

	getProgress = (name: string) => {
		if (!this.tweens[name]) {
			return 0;
		}

		return this.tweens[name].smooth;
	}
}
	