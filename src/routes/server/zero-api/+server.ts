import { ZERO_UPSTREAM_DB } from '$env/static/private';
import { PostgresJSConnection, PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg';
import { json, type RequestHandler } from '@sveltejs/kit';
import { decodeJwt } from 'jose';
import postgres from 'postgres';
import { schema } from '../../../schema.js';
import { createMutators } from '../../api/mutators/index.js';

export const POST: RequestHandler = async ({ request, url, params }) => {
	//

	const processor = new PushProcessor(
		new ZQLDatabase(new PostgresJSConnection(postgres(ZERO_UPSTREAM_DB)), schema)
	);

	// const encodedJWT = request.headers.get('authorization')?.substring('Bearer '.length)
	// const decodedJWT = encodedJWT ? decodeJwt(encodedJWT) : undefined

	const result = await processor.process(createMutators(), request);

	return json(result);
};
