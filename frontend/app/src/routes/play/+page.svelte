<script lang="ts">
	import { onMount } from "svelte";
	import Data from "../Store.js";
	import { io } from "socket.io-client";
	import Experience from "./Experience/Experience.ts";
	import { PUBLIC_HOST_BACK } from '$env/static/public'
	import { PUBLIC_PORT_BACK } from '$env/static/public'

	let data: any;
	data = $Data;

  async function connect_socket() {
    data.games_socket = io(`ws://${PUBLIC_HOST_BACK}:${PUBLIC_PORT_BACK}/pong`, { transports: ["websocket"] });
  }

  async function private_game(id: any, mode: number) {
    const main = document.querySelector(".main");
    const canvas = main.appendChild(document.createElement("canvas")); // du test
    canvas.classList.add("webgl");
      if (mode == 1)
        data.games_socket.emit("createInvite", { sendTo: id });
      else {
        id.answer = "join";
        data.games_socket.emit("joinGame", id);
      }
      data.goto_pg = null;
      sync_data(data);
      new Experience(canvas)
  }

  async function quick_game() {
    const main = document.querySelector(".main");
    const canvas = main.appendChild(document.createElement("canvas")); // du test
    canvas.classList.add("webgl");
    data.games_socket.emit("quickGame");
    new Experience(canvas);
  }

	function sync_data(new_data: any) {
		Data.update(() => {
			return new_data;
		});
	}

	onMount(() => {
		data.current_page = "Play";
		sync_data(data);
		connect_socket();
		if (data.goto_pg != null)
			private_game(data.goto_pg, data.pg_demerde);
    else
      quick_game();
	});
</script>

<main class="main">
</main>

<style> 
	.menu {
		margin-top: 0.5em;
    display: grid;
    grid-template-rows: repeat(auto-fit, minmax(150px, 1fr));
    justify-content: center;
    align-content: space-around;
	}
	a {
		max-width: 50em;
		text-decoration: none;
	}
	.menu-elem {
		border: 0.1em solid white;
		font-size: 40px;
		text-align: center;
		padding: 3em;
		background: #212121BB;
		color: rgba(255, 255, 255, 0.5);
		border: 0.01em solid royalblue;
		box-shadow: 0em 0em 0.1em royalblue;
		text-shadow: 0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff;
		margin-top: 0.8em;
		border-radius: 0.8em;
		transition: 0.5s ease-in-out;
		font-family: 'neon';
	}
	.menu-elem:hover {
		color: white;
	}

</style>
