// mutators.ts
import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero';
import type { Schema } from '../../../schema.js';

export function createMutators() {
	return {
		type: {
			insert: async (tx: Transaction<Schema>, { id, name }: { id: string; name: string }) => {
				if (name.length > 100) throw new Error(`Name is too long`);
				console.log(id, name);
				await tx.mutate.type.upsert({ id, name });
			}
		},
		todo: {
			insert: async (
				tx: Transaction<Schema>,
				{
					id,
					title,
					completed,
					type_id
				}: { id: string; type_id: string; completed: boolean; title: string }
			) => {
				// Validate title length. Legacy issues are exempt.
				if (title.length > 100) throw new Error(`Title is too long`);

				await tx.mutate.todo.insert({ id, title, completed, type_id });
			},

			update: async (
				tx: Transaction<Schema>,
				{
					id,
					title,
					completed,
					type_id
				}: { id: string; type_id: string; completed: boolean; title: string }
			) => {
				// Validate title length. Legacy issues are exempt.
				if (title.length > 100) {
					throw new Error(`Title is too long`);
				}
				await tx.mutate.todo.update({ id, title, completed, type_id });
			},

			toggleComplete: async (tx: Transaction<Schema>, id: string) => {
				const currentTodo = await tx.query.todo.where('id', id).one();
				const completed = !currentTodo?.completed;
				await tx.mutate.todo.update({ id, completed });
			}
		}
	} as const satisfies CustomMutatorDefs;
}

export type CreateMutators = ReturnType<typeof createMutators>;
