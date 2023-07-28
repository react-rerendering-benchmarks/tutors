import { page } from '$app/stores';
import { authService } from 'tutors-reader-lib/src/services/auth-service';
import { presenceService } from 'tutors-reader-lib/src/services/presence-service';
import { initFirebase } from 'tutors-reader-lib/src/utils/firebase-utils';
import { getKeys } from '../environment';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';

import { transitionKey, currentCourse, authenticating } from 'tutors-reader-lib/src/stores/stores';

export async function initServices() {
	const { apiKey } = getKeys().firebase;
	if (apiKey !== 'XXX') {
		initFirebase(getKeys().firebase);
		authService.setCredentials(getKeys().auth0);
		presenceService.startPresenceEngine();

		const { url } = get(page);
		const hash = url.hash;

		if (hash.startsWith('#/course')) {
			const courseId = hash.slice(9);
			goto(courseId);
		} else if (hash.startsWith('#access_token')) {
			authenticating.set(true);
			const token = hash.substring(hash.indexOf('#') + 1);
			authService.handleAuthentication(token, (courseId) => {
				goto(`/course/${courseId}`);
			});
		} else if (!hash) {
			const currentCourseValue = get(currentCourse);
			if (currentCourseValue) {
				await authService.checkAuth(currentCourseValue);
			}
		}
	}

	const unsubscribePage = page.subscribe((path) => {
		const { url } = path;
		const { hash, pathname } = url;

		if (hash.startsWith('#/course')) {
			const relPath = hash.slice(1);
			goto(relPath);
		} else {
			transitionKey.set(pathname);
			if (/book|pdf|video|note/.test(pathname)) {
				transitionKey.set('none');
			}
		}
	});

	return () => {
		unsubscribePage();
	};
}
