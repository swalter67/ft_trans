<script lang="ts">
	import { onMount } from 'svelte';
	import Data from '../Store.js';
	import ChatApp from './ChatApp.svelte'

	let data: any = $Data;
	function sync_data(new_data: any) {
		Data.update(() => {
			return new_data;
		});
	}
	onMount(() => {
		data.current_page = "Chat";
		sync_data(data);
	});
</script>

<main>
	<ChatApp class="chatapp"/>
</main>

<style>
  .chatapp {
    margin-top: 10px;
  }
</style>
