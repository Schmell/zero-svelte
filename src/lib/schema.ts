// NOTE:
// You need your db to exist that matches this schema.
// I  don't have migration code in this repo, feel free to add

import {
	ANYONE_CAN_DO_ANYTHING,
	boolean,
	createBuilder,
	createSchema,
	definePermissions,
	relationships,
	string,
	syncedQuery,
	table,
	type Row
} from '@rocicorp/zero';
import { z as zod } from 'zod';

const types = table('type')
	.columns({
		id: string(),
		name: string()
	})
	.primaryKey('id');

const todos = table('todo')
	.columns({
		id: string(),
		title: string(),
		completed: boolean(),
		type_id: string()
	})
	.primaryKey('id');

const todoRelationship = relationships(todos, ({ one }) => ({
	type: one({
		sourceField: ['type_id'],
		destField: ['id'],
		destSchema: types
	})
}));

export const schema = createSchema({
	tables: [types, todos],
	relationships: [todoRelationship]
});

export type Schema = typeof schema;
export type Todo = Row<typeof schema.tables.todo>;
export type Type = Row<typeof schema.tables.todo>;

type AuthData = {
	// The logged-in user.
	sub: string;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	return {
		todo: ANYONE_CAN_DO_ANYTHING,
		type: ANYONE_CAN_DO_ANYTHING
	};
});
