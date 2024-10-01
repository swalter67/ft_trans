<script lang="ts">
	import { onMount } from "svelte";
	import Data from "../Store.js";

	let data: any;
	data = $Data;

	function sync_data(new_data: any) {
		Data.update(() => {
			return new_data;
		});
	}
  onMount(() => {
    data.current_page = "Logout";
    sync_data
  })
</script>
<main>
  <h1> Déconnecté </h1>
</main>
