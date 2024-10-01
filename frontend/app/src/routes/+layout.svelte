<svelte:head>
  <link rel="stylesheet" href="fonts.css"  type = "text/css" />
</svelte:head>

<script lang="ts">
  import Data from "./Store.js";
  import ProfileCard from "./ProfileCard.svelte";
	import { onMount } from "svelte"
  import TwoFaModule from "./TwoFaModule.svelte";
  import NotificationsPanel from "./NotificationsPanel.svelte";
	import { io } from "socket.io-client";
  import { PUBLIC_HOST_BACK } from '$env/static/public'
  import { PUBLIC_PORT_BACK } from '$env/static/public'

  let data: any;
	data = $Data;

  let user_data: any;

  async function subscribe_notifications() {
    data.notifications_socket.emit("notification", data.cookie);
    data.notifications_socket.on("newFriend", (notif: any) => {
      // console.log("New Friends");
      data.friends_notifications.push(notif);
      data.notif_panel_open = true;
    });
    data.notifications_socket.on("chatNewMessage", (notif: any) => {
      // console.log("New Message");
      data.messages_notifications.push(notif);
      data.notif_panel_open = true;
    });
    data.notifications_socket.on("inviteGame", (notif: any) => {
      // console.log("New Games invite");
      data.games_notifications.push(notif);
      data.notif_panel_open = true;
    });
  }


  async function connect_notifications() {
    data.notifications_socket = io(`ws://${PUBLIC_HOST_BACK}:${PUBLIC_PORT_BACK}/notifications`, { transports: ["websocket"] });
    subscribe_notifications();
  }

  async function connect_socket() {
    let res: any = await get_cookie();
    if (res == false)
      return ;
    connect_notifications();
  }

  function back() { data.current_page = "Home"; sync_data(data); window.location.replace("/") }

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }

  async function check_twofa_status() {
    let req: any = await fetch(data.api + "/auth/2fa/status", {
      credentials: "include"
    });
    let res: any = await req.json();
    if (res.statusCode == 401) {
        return true;
    }
    else
      return false;
  }

  async function get_cookie()	{
    let cookie: any = document.cookie;
    if (cookie === "") {
      data.connected = false;
      data.cookie = null;
      sync_data(data);
      if (data.current_page != "Logout")
        window.location.replace(data.api + "/auth/login");
      return false;
    }
    else {
      data.connected = true;
      data.twofa_popup = await check_twofa_status();
      cookie = document.cookie;
      if (cookie === "")
        get_cookie();
      cookie = cookie.split("; ");
        for (let elem in cookie) {
        if (cookie[elem].startsWith("jwt"))
          cookie = cookie[elem];
      }
      cookie = cookie.split('=')[1];
      data.cookie = cookie;
      sync_data(data);
      return true;
    }
  }

  async function get_notifications() {
    let req: any = await fetch(data.api + "/notification/all", { credentials: "include" })
    let res: any = await req.json();
    for (let i: number = 0; i != res[0].length; i++)
      data.friends_notifications.push(res[0][i])
    let room_id_parse: any = [];
    let room_name_parse: any = [];
    let room_userid_parse: any = [];
    for (let i: number = 0; i != res[1].length; i++)
      room_id_parse.push(res[1][i].roomId);
    for (let i: number = 0; i != res[1].length; i++)
      room_name_parse.push(res[1][i].roomIdF.name);
    for (let i: number = 0; i != res[1].length; i++)
      room_userid_parse.push(res[1][i].membreF.userId );
    let unique_room_id: any = [...new Set(room_id_parse)];
    let unique_room_name: any = [...new Set(room_name_parse)];
    let unique_room_userid: any = [...new Set(room_userid_parse)];
    let array_message_notif: any = [];
    for (let i = 0; i != unique_room_id.length; i++) {
      let new_message_notif : any = {
        username: null,
        for: null
      };
      let splitting: any = unique_room_name[i].split("-");
      if (splitting[0] != user_data.username && unique_room_userid[i] == user_data.id)
        new_message_notif.username = splitting[0];
      else
        new_message_notif.username = splitting[1];
      new_message_notif.for = unique_room_id[i];
      data.messages_notifications.push(new_message_notif);
    }
  }

 async function get_userdata() {
    let req: any = await fetch(data.api + "/user/me", { credentials: "include" })
    let res: any = await req.json();
    user_data = res;
 }

  onMount(async () => {
    await connect_socket();
    await get_userdata();
    await get_notifications();
  })

</script>

{#if data.twofa_popup}
	<TwoFaModule />
{:else}
	<nav>
		<div class="title">
      {#if data.current_page != "Home"}
        <div on:click={() => back()}><img src="./arrow-small-left-svgrepo-com.svg" width="64" height="64" style="filter: invert(12%) sepia(83%) saturate(6692%) hue-rotate(256deg) brightness(88%) contrast(101%);"></div>
      {/if}
      {data.current_page}
    </div>
		<div class="left-block">
			<div class="icons-block">
        {#if data.current_page != "Profile"}
            <a href="/profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4720e1" d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"></path></svg></a>
        {/if}
        <a href="{data.api + '/auth/logout'}"><img src="./cross-svgrepo-com.svg" width="24" height="24" style="filter: invert(12%) sepia(83%) saturate(6692%) hue-rotate(256deg) brightness(88%) contrast(101%);"></a>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<svg on:click={() => data.notif_panel_open = !data.notif_panel_open} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4720e1" d="M12 1c3.681 0 7 2.565 7 6v4.539c0 .642.189 1.269.545 1.803l2.2 3.298A1.517 1.517 0 0 1 20.482 19H15.5a3.5 3.5 0 1 1-7 0H3.519a1.518 1.518 0 0 1-1.265-2.359l2.2-3.299A3.25 3.25 0 0 0 5 11.539V7c0-3.435 3.318-6 7-6ZM6.5 7v4.539a4.75 4.75 0 0 1-.797 2.635l-2.2 3.298-.003.01.001.007.004.006.006.004.007.001h16.964l.007-.001.006-.004.004-.006.001-.006a.017.017 0 0 0-.003-.01l-2.199-3.299a4.753 4.753 0 0 1-.798-2.635V7c0-2.364-2.383-4.5-5.5-4.5S6.5 4.636 6.5 7ZM14 19h-4a2 2 0 1 0 4 0Z"></path></svg>
			</div>
			{#if data.connected}
				<ProfileCard />
			{/if}
		</div>
	</nav>

  {#if data.notif_panel_open}
      <NotificationsPanel />
  {/if}

	<slot />

	{#if data.connected}
	<footer>
	</footer>
	{/if}
{/if}

<style>
	:global(body) {
		margin: 0em;
		padding: 0em;
		box-sizing: border-box;
		background: url("/background.svg") no-repeat center center fixed;
    background-size: cover;
		/* overflow: hidden; */
		overflow-x: hidden;
		color: white;
	}
  :global(*:focus) {
    outline: none;
  }
  :global(body):-webkit-scrollbar{
    width: 20px;
  }
  :global(body):-webkit-scrollbar-track{
    box-shadow: inset 0 0 10px green;
    border-radius: 10px;
  }
  :global(body):-webkit-scrollbar-thumb{
    background: green;
    border-radius: 10px;
    border: solid 3px #00ff00;
  }
  :global(body):-webkit-scrollbar-thumb:hover{
    background: #00ff00;
  }
	nav {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		background: #212121BB;
		color: white;
		padding: 1em;
		border-bottom: 0.1em solid white;
		height: 4em;
		text-wrap: nowrap;
		font-weight: bold;
	}
	.title{
    cursor: pointer;
		font-family: 'retro';
	}
	.left-block {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.icons-block {
    cursor: pointer;
		margin: 0 1em 0 1em;
		
	}
	.back-button {
		max-width: 7em;
		font-size: 1.3em;
		text-align: right;
		padding: 0.5em;
		background: #31313170;
		color: white;
		border: 0.1em solid royalblue;
		box-shadow: 0em 0em 0.1em royalblue;
		text-shadow: 0 0 0.5em #fff,0 0 0.5em #fff,0 0 0.5em #fff,0 0 0.5em #228dff,0 0 0.5em #228dff,0 0 0.5em #228dff;
		margin-left: -3em;
		margin-top: 1em;
		border-radius: 0.3em;
		transition: 0.5s ease-in-out;
		font-family: 'neon';
	}
	.back-button:hover {
		margin-left: -1em;
		color: royalblue;
	}
	:global(a:active) {
		text-decoration: none;
	}
	.logout-button{
		max-width: 20em;
		font-size: 1.5em;
		text-align: left;
		padding: 0.3em;
		background: #31313170;
		color: white;
		border: 0.1em solid royalblue;
		box-shadow: 0em 0em 0.1em royalblue;
		text-shadow: 0 0 0.5em #fff,0 0 0.5em #fff,0 0 0.5em #fff,0 0 0.5em #228dff,0 0 0.5em #228dff,0 0 0.5em #228dff;
		/*margin-right: 10px;
		margin-bottom: 20px;*/
		border-radius: 0.3em;
		/*transition: 0.5s ease-in-out;*/
		font-family: 'neon';
		text-decoration: none;
	}
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .title > div >img{
    margin-top: 6px;
  }
</style>
