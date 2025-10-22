<script lang="ts">
	import './styles.css';
	import { PUBLIC_SERVER } from '$env/static/public';
	import { Query } from '$lib/query.svelte.js';
	import { Z } from '$lib/Z.svelte.js';
	import { schema, type Schema, type Todo } from '$lib/schema.js';
	import { queries } from './api/queries/index.js';
	import { createMutators, type CreateMutators } from './api/mutators/index.js';

	const z = new Z<Schema, CreateMutators>({
		server: PUBLIC_SERVER,
		schema,
		userID: 'anon',
		kvStore: 'mem',
		mutators: createMutators()
	});

	// Stable Query instance; update when filter changes via event
	const todos = new Query(queries.allTodos());

	let todo_dialog = $state<HTMLDialogElement>();
	let type_dialog = $state<HTMLDialogElement>();
	let current_todo = $state(new Query(queries.getTodo('0')));

	function applyFilter(value: string) {
		const ft = value || undefined;
		const q = ft
			? z.query.todo.where('type_id', '=', ft).related('type')
			: z.query.todo.related('type');
		todos.updateQuery(q);
	}

	// Basic query, reactive by default
	const types = new Query(queries.allTypes());

	const randID = () => Math.random().toString(36).slice(2);

	function onsubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const todo_name = formData.get('todo_name') as string;
		const todo_type = formData.get('todo_type') as string;
		const id = randID();
		if (todo_name) {
			z.mutate.todo.create({ id, title: todo_name, completed: false, type_id: todo_type });
			(event.target as HTMLFormElement).reset();
		}
	}

	function toggle_todo({ currentTarget }: { currentTarget: HTMLInputElement }) {
		z.mutate.todo.toggle_complete(currentTarget.value);
	}

	function add_type(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const todo_type = formData.get('type') as string;
		const id = randID();
		if (todo_type) {
			z.mutate.type.create({ id, name: todo_type });
			(event.target as HTMLFormElement).reset();
		}
	}

	function editTodo(event: Event) {
		const formData = new FormData(event.target as HTMLFormElement);
		const id = formData.get('id') as string;
		const title = formData.get('title') as string;
		const completed = formData.get('completed') as string;
		const type_id = formData.get('type_id') as string;
		z.mutate.todo.update({ id, title, type_id, completed: completed ? true : false });
	}
</script>

{#if z.online}
	<div>Connected</div>
{:else}
	<div>Offline</div>
{/if}

<div>
	<form onsubmit={add_type}>
		<input type="text" id="type" name="type" />
		<button type="submit">Add Type</button>
		<button type="button" onclick={() => type_dialog?.showModal()}> Edit Types </button>
	</form>
	<form {onsubmit}>
		<input type="text" id="todo_name" name="todo_name" />
		<select name="todo_type" id="todo_type">
			{#each types.current as type (type.id)}
				<option value={type.id}>{type.name}</option>
			{/each}
		</select>
		<button type="submit">Add</button>
	</form>
	<h1>Todos</h1>
	<select
		name="todo_type"
		id="todo_type"
		onchange={(e) => applyFilter((e.target as HTMLSelectElement).value)}
	>
		<option value="">All</option>
		{#each types.current as type (type.id + 'option-list')}
			<option value={type.id}>{type.name}</option>
		{/each}
	</select>
	<ul>
		{#each todos.current as todo (todo.id)}
			<li>
				<input type="checkbox" value={todo.id} checked={todo.completed} oninput={toggle_todo} />
				{todo.title} - {todo.type?.name}
				<button
					class="ghost"
					onclick={() => {
						current_todo.updateQuery(queries.getTodo(todo.id));
						todo_dialog?.showModal();
					}}
				>
					✏️
				</button>
				<button class="ghost" onclick={() => z.mutate.todo.delete(todo.id)}> 🗑️ </button>
			</li>
		{/each}
	</ul>
</div>

<dialog bind:this={type_dialog}>
	<h2>Edit the types</h2>
	{#each types.current as type (type.id + 'option-list')}
		<div>
			<input
				type="text"
				value={type.name}
				name="name"
				oninput={({ currentTarget }) => {
					z.mutate.type.update({ id: type.id, name: currentTarget.value });
				}}
			/>
			<button
				class="ghost"
				onclick={async () => {
					z.mutate.type.delete(type.id);
				}}
			>
				🗑️
			</button>
		</div>
	{/each}
	<form method="dialog">
		<button>Close</button>
	</form>
</dialog>

<dialog bind:this={todo_dialog}>
	<h2>Edit the todo</h2>
	<form method="dialog" onsubmit={editTodo}>
		<input name="completed" type="checkbox" checked={current_todo.current?.completed} />
		<input name="id" type="hidden" value={current_todo.current?.id} />
		<input name="title" type="text" value={current_todo.current?.title} />
		<select name="type_id" value={current_todo.current?.type?.id}>
			{#each types.current as type (type.id + 'option-list')}
				<option value={type.id}>{type.name}</option>
			{/each}
		</select>
		<button>OK</button>
	</form>
</dialog>
