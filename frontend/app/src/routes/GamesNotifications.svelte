<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import Data from "./Store.js";

  export let game: any;

  let data: any;
  data = $Data;

	function sync_data(new_data: any) {
		Data.update(() => {
			return new_data;
		});
	}

  const { notif_remover }: any = getContext("remover");

  function remove_request() {
    for (let i: number = 0; i < data.games_notifications.length; i++) {
      if (data.games_notifications[i].username == game.username) {
        notif_remover(i, "game");
      }
    }
  }

  async function accept_request() {
    remove_request();
    data.goto_pg = game;
    data.pg_demerde = 2;
    sync_data(data);
    goto("/play");
  }

  async function decline_request() {
    remove_request();
		console.log(game);
    await fetch(data.api + "/games/refuseGame", {
      method: "DELETE",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(game)
    });
		console.log('la');
  }

</script>

<div class="notif_card">
  <span>{game.username}</span>
  <div class="buttons_container">
    <button on:click={() => accept_request()} class="button accept">Accept</button>
    <button on:click={() => decline_request()} class="button decline">Decline</button>
  </div>
</div>

<style>
  .notif_card {
    display: flex;
    flex-direction: column;
    padding: 0.5em;
  }
  .buttons_container {
    display: flex;
    flex-direction: row;
    gap: 1em;
  }

  span{
    margin-bottom: 2em;
    margin-top: 0.1em;
  }

  .button {
    background: #31313170;
    font-size: 2em;
    
    width: 50%;
    border-radius: 0.1em;
  }

  .accept {
    color: green;
    border: 0.01em solid green;
  }

  .decline {
    color: red;
    border: 0.01em solid red;
  }
</style>
