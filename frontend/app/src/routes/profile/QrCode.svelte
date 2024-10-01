<script lang="ts">
  import { onMount } from "svelte"
  import Data from "../Store.js";

  export let uri: string;

  let data: any;
  data = $Data;

  let api: string = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";

  async function get_uri() {
    let req: any = await fetch(data.api + "/auth/2fa/uri", {
      credentials: "include"
    });
    let res: any = await req.json();
  }

</script>

<main>
  <img src="{api + uri}">
</main>

<style>
  main {
    background: transparent;
  }
</style>
