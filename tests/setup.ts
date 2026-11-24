/**
 * Browser globals that jsdom has but jsdom-global doesn't expose
 */
for (const name of ["Option"]) {
	(globalThis as any)[name] ??= (window as any)[name];
}
