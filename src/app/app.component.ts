import {Component} from '@angular/core';
import {Md5} from 'ts-md5/dist/md5';

@Component({
	selector   : 'app-root',
	templateUrl: './app.component.html',
	styleUrls  : ['./app.component.css']
})
export class AppComponent {
	title = 'FIO Domain Marketplace';

	getGravatarURL(email: any) {
		const md5 = new Md5();
		const hash = md5.appendStr(String(email).trim().toLowerCase()).end();
		return `https://www.gravatar.com/avatar/${hash}?d=retro`;
	}
}
