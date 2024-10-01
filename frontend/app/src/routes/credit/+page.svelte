<script lang="ts">
	import { onMount } from "svelte";
	import Data from "../Store.js";
	import Experience from "./Experience/Experience.ts";
  
	let data: any;
	let canvas: any;
	data = $Data;
	
  
	function sync_data(new_data: any) {
	  Data.update(() => {
		return new_data;
	  });
	}
  
	onMount(() => {
	  data.current_page = "Credit";
	  sync_data(data);
 		new Experience(canvas);
	  });
  </script>
  
  <main>
		<canvas bind:this={canvas} class="webgl" autoplay="allow"></canvas>
  </main>
  
  <style>
	
  </style>
  