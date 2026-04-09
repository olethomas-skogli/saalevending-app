import { env } from '$env/dynamic/public';

export function isDemoMode(): boolean {
	return env.PUBLIC_DEMO_MODE === 'true';
}

export { demoState } from './state';
