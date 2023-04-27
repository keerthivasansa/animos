import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';
import prisma from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';
import db from '@server/database';

export const environment = dev ? 'DEV' : 'PROD';

export const auth = lucia({
	adapter: prisma(db),
	env: environment,
	middleware: sveltekit()
});

export type Auth = typeof auth;
