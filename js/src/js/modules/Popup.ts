import { overflow } from './overflow';

export default class Popup {
    openPopup(targetPopup: HTMLElement | null, popups: NodeListOf<Element>) {
        popups.forEach((el) => {
            el.classList.remove('is-open');
        });

    	targetPopup?.classList.add('is-open');
        overflow.on();
	}

	closePopup(popups: NodeListOf<Element>) {
        popups.forEach((el) => {
            el.classList.remove('is-open');

            el.querySelectorAll('video')?.forEach((video) => {
                video.pause();
                video.currentTime = 0;
            });
        });

        if (!document.body.classList.contains('is-nav-open')) {
            overflow.off();
        }
	}
}
