import { overflow } from './overflow';

export default class Nav {
	body?: HTMLElement;

	toggleNav(body: HTMLElement) {
		this.body = body;

		if(!this.body.classList.contains('is-nav-open')){
			this.body.classList.add('is-nav-open');
			overflow.on();
		} else {
			this.body.classList.remove('is-nav-open');
			/*overflow.off();*/
		}
	}

	closeNav() {
		this.body && this.body.classList.remove('is-nav-open');
		/*overflow.off();*/
	}

	scrollTo = (target: any) => {
        if (document.documentElement.clientWidth < 1024) {
        	this.closeNav();
        }

        // target.scrollIntoView({block: "start", behavior: "smooth"});

        return false;
	}
}