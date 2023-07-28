<script lang="ts">
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';

	import { setInitialClassState } from '@skeletonlabs/skeleton';

	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { getKeys } from '../environment';

	import {
		authenticating,
		transitionKey,
		storeTheme,
		currentCourse,
		currentLo
	} from 'tutors-reader-lib/src/stores/stores';
	import { analyticsService } from 'tutors-reader-lib/src/services/analytics-service';
	import { initServices } from '$lib/tutors-startup';

	import tutors from 'tutors-ui/lib/themes/tutors.css?inline';
	import dyslexia from 'tutors-ui/lib/themes/dyslexia.css?inline';
	import halloween from 'tutors-ui/lib/themes/halloween.css?inline';
	import valentines from 'tutors-ui/lib/themes/valentines.css?inline';

	let mounted = false;
	const themes: any = { tutors, dyslexia, halloween, valentines };
	let currentRoute = '';

	onMount(async () => {
		mounted = true;
		storeTheme.subscribe(setBodyThemeAttribute);
		setColorScheme();
		setInitialClassState();
		initServices();
		const func = () => {
			if (!document.hidden && !currentRoute?.startsWith('/live')) {
				analyticsService.updatePageCount();
			}
		};
		setInterval(func, 30 * 1000);
	});

	page.subscribe((path) => {
		if (path.route.id) {
			currentRoute = path.route.id;
		}
		if (mounted && path.params.courseid && getKeys().firebase.apiKey !== 'XXX') {
			analyticsService.learningEvent(path.params);
		}
		if (path?.url.hash && !path?.url.hash.startsWith('#access_token')) {
			console.log(path?.url.hash);
			const el = document.querySelector(`[id="${path.url.hash}"]`);
			if (el) {
				el.scrollIntoView({
					behavior: 'smooth'
				});
			}
		}
	});

	afterNavigate((params: any) => {
		if (!$page.url.hash) {
			const isNewPage: boolean =
				params.from && params.to && params.from.route.id !== params.to.route.id;
			const elemPage = document.querySelector('#page');
			if (isNewPage && elemPage !== null) {
				elemPage.scrollTop = 0;
			}
		}
	});

	function setColorScheme() {
		if (
			localStorage.getItem('storeLightSwitch') === 'true' ||
			(!('storeLightSwitch' in localStorage) &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function setBodyThemeAttribute(): void {
		document.body.setAttribute('data-theme', $storeTheme);
	}
</script>

<svelte:head>
	{@html `\<style\>${themes[$storeTheme]}}\</style\>`}
	{#if currentLo}
		<title>{$currentLo?.title}</title>
	{:else}
		<title>Tutors Course Reader</title>
	{/if}
</svelte:head>

<div id="app" class="h-full overflow-hidden">
	<slot />
</div>
