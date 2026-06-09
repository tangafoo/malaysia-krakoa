import { browser } from '$app/environment';

const STORAGE_KEY = 'xp-sounds';

export type SoundKey = 'click' | 'click2' | 'error' | 'minimize' | 'send' | 'clear' | 'repulsor';

const SOURCES: Record<SoundKey, string> = {
	click: '/sounds/xp-click.mp3',
	click2: '/sounds/xp-click02.mp3',
	error: '/sounds/xp-error.mp3',
	minimize: '/sounds/xp-minimize.mp3',
	send: '/sounds/xp-send.mp3',
	clear: '/sounds/xp-clear.mp3',
	repulsor: '/sounds/iron-man-repulsor.mp3'
};

export const SOUND_KEYS = Object.keys(SOURCES) as SoundKey[];

interface PlayOptions {
	volume?: number;
	rate?: number;
}

class SoundsState {
	enabled = $state(true);
	ctx: AudioContext | null = null;
	buffers: Partial<Record<SoundKey, AudioBuffer>> = {};

	hydrate() {
		if (!browser) return;
		this.enabled = localStorage.getItem(STORAGE_KEY) !== 'off';
	}

	toggle() {
		this.enabled = !this.enabled;
		if (browser) localStorage.setItem(STORAGE_KEY, this.enabled ? 'on' : 'off');
	}

	async init() {
		if (!browser || this.ctx) return;
		try {
			const Ctor =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (!Ctor) return;
			this.ctx = new Ctor();
			await Promise.all(
				(Object.keys(SOURCES) as SoundKey[]).map(async (key) => {
					try {
						const res = await fetch(SOURCES[key]);
						if (!res.ok) return;
						const arr = await res.arrayBuffer();
						this.buffers[key] = await this.ctx!.decodeAudioData(arr);
					} catch {
						// One missing file shouldn't break the rest.
					}
				})
			);
		} catch {
			// AudioContext unavailable.
		}
	}

	play(key: SoundKey, opts: PlayOptions = {}) {
		if (!this.enabled || !this.ctx) return;
		const buf = this.buffers[key];
		if (!buf) return;
		if (this.ctx.state === 'suspended') this.ctx.resume();
		const src = this.ctx.createBufferSource();
		const gain = this.ctx.createGain();
		gain.gain.value = opts.volume ?? 0.35;
		src.playbackRate.value = opts.rate ?? 1;
		src.buffer = buf;
		src.connect(gain).connect(this.ctx.destination);
		src.start(0);
	}

	/**
	 * Velocity-aware click. `pressure` is from PointerEvent: real values come from
	 * touch / Apple Pencil (0–1, non-flat); mouse always reports 0.5, which we
	 * treat as "no info" and humanize via randomness instead.
	 */
	click(pressure?: number) {
		const isRealPressure =
			typeof pressure === 'number' && pressure > 0 && Math.abs(pressure - 0.5) > 0.01;
		const volume = isRealPressure ? 0.12 + pressure * 0.45 : 0.18 + Math.random() * 0.25;
		const rate = 0.92 + Math.random() * 0.16;
		this.play('click', { volume, rate });
	}
}

export const sounds = new SoundsState();
