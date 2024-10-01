<script>
  import { onMount } from "svelte";
  import Experience from "./Experience/Experience.ts"

  const canvas = document.querySelector("chibrong");

  onMount(() => {
    const exp = new Experience(canvas);
  })
</script>

<main>
  <canvas class="chibrong"></canvas>
</main>

<canvas id="gui" class="autoPlace" width="45%" height="100%"></canvas>

<style> 
  #lil-gui.autoPlace {
    position: absolute;
		top: 8px;
		left: 45%;
	}
</style>
