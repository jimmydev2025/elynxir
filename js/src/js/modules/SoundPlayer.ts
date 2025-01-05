import Module from './Module';
import { Events } from '../app/Constants';
import { Howl, Howler } from 'howler';
import getQuery from '../app/utils/getQuery';

export default class SoundPlayer extends Module {
	sounds: any;
	preloaderMusic?: any;
	preloaderAssets?: any;
	muted: boolean = false;
	mutedByUser: boolean = false;

	constructor() {
		super();
		this.sounds = {};
		this.preloaderMusic = null;
		this.preloaderAssets = null;
		this.subscribe([Events.soundsLoaded, /*Events.preloaderAssetsLoaded,*/ Events.playPreloaderMusic, Events.playMainMusic, Events.toggleMute, Events.playSound, Events.toggleHeartbeat])

		if (getQuery('mute') == '1') {
			this.toggleMute(true);
		}
	}

	onEvent = (event: string, payload: any) => {
		switch (event) {
			/*case Events.preloaderAssetsLoaded:
				this.preloaderAssets = payload.preloaderAssets;
				break;*/

			case Events.soundsLoaded:
				this.sounds = payload.sounds;
				// this.sounds.main.play();
				break;

			case Events.playPreloaderMusic:
				this.preloaderMusic = payload.data.preloaderAssets.preloaderMusic;
				this.preloaderMusic.play();
				break;

			case Events.playMainMusic:
				// this.sounds.main.fade(0, 0.5, 1000).play();
				break;

			case Events.toggleMute:
				this.toggleMute(payload);
				break;

			case Events.playSound:
				this.playSound(payload);
				break;

			case Events.toggleHeartbeat:
				this.toggleHeartbeat(payload);
				break;
		}
	}

	playSound = (payload: any) => {
		const soundName: string = payload.data;
		
		this.sounds[soundName].play();
	}

	toggleHeartbeat = (payload: any) => {
		const state = payload.data;
		const sound = this.sounds['HeartBeat_Loop_120bpm'];
		sound.loop(state);
		sound[state ? 'play' : 'pause']();
	}

	toggleMute = (payload: any) => {
		if (payload.force != undefined) {
			if (!this.mutedByUser) {
				this.muted = payload.force;
			}
		}

		if (payload.user) {
			this.muted = !this.muted;
			this.mutedByUser = this.muted;
		}
		Howler.mute(this.muted);
	}
}