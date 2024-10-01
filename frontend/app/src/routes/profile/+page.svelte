<script lang="ts">
  import Data from '../Store.js';
  import QrCode from './QrCode.svelte';
  import { onMount } from "svelte";
  import { goto } from "$app/navigation"

  let data: any;
  let twofa_state: any;
  let twofa_key: any;
  let twofa_input: any = [];
  let friend_input: string;
  let friend_search: any;
  let phase: number = 1;
  let qrcode_uri: string = "chibre";
  let popup: boolean = false;
  let did_search: boolean = false;
  let show_input_username: boolean = false;
  let show_image_form: boolean = false;
  let change_username: string;
  data = $Data;

  let user: any;
  let friends: any;
  let blocked: any;
  let rooms: any;
  let memberrooms: any;

  function input_manager(id, key) {
    if (id === 6 && key.key !== "Backspace") {
      activate_twofa(2);
      return ;
}
    if (key.key === "Backspace") {
      twofa_input[id - 1] = "";
      document.getElementById(id - 2).focus();
      return ;
    }
    else if (key.keyCode >= 48 && key.keyCode <= 57 || key.keyCode >= 96 && key.keyCode <= 105)
      document.getElementById(id).focus();
  }

  function sync_data(new_data) {
    Data.update(() => {
      return new_data;
    });
  }

  async function regenerate_key() {
    let req: any = await fetch(data.api + "/auth/2fa/keygen", {
      method: "PUT",
      credentials: "include"
    });
    let res: any = await req.json();
    twofa_input = [];
    qrcode_uri = res.fa_uri;
    popup = true;
    phase = 1;
  }

  async function search_bar() {
    if (friend_input.length < 3) {
      did_search = false;
      return;
    }
    let req: any = await fetch(data.api + "/user/search?username=" + friend_input, {
      credentials: "include",
    }); 
    let res: any = await req.json();
    friend_search = res;
    // console.log(friend_search);
    if (friend_search.length == 0)
      did_search = false;
    else
      did_search = true;
  }

  async function add_friend() {
    let req: any = await fetch(data.api + "/user/search?username=" + friend_input, {
      credentials: "include"
    });
    let res: any = await req.json();
    // console.log(res);
    let friendid: any = res[0].id
    req = await fetch(data.api + "/user/friend/add/" + friendid, {
       method: "POST",
       credentials: "include",
    });
    res = req.json();
    get_friendlist();
    friend_input = "";
    friend_input = friend_input;
  }

  async function block_and_delete_friend(id: any) {
    let req: any = await fetch(data.api + "/user/friend/chibrimise/" + id, {
      method: "DELETE",
      credentials: "include"
    });
    let res: any = await req.text();
    reload_list();
  }

  async function unblock(id: any) {
    let req: any = await fetch(data.api + "/user/unblock/" + id, {
      credentials: "include",
      method: "PUT",
    });
    let res: any = await req.text();
    reload_list();
  }

  async function leave_room(id: any) {
    let room_id: any = memberrooms[id].id;
    let req: any = await fetch(data.api + "/chat/room/" + room_id + "/member/" + memberrooms[id].member[0].id, {
  	  method: "DELETE",
      credentials: "include"
    });
    let res: any = await req.text();
    reload_list();
  }

  async function delete_room(id: any) {
    let req: any = await fetch(data.api + "/chat/room/" + id, {
      method: "DELETE",
      credentials: "include"
    });
    let res: any = await req.text();
    reload_list();
  }

	async function get_userdata() {
		if (data.connected == true) {
			let req: any = await fetch(data.api + "/user/me", {
				credentials: "include"
			});
			let res: any = await req.json();
			user = res;
      user.created = user.created.split("T")[0];
      twofa_key = user.fa_key;
		}
	}

  async function get_friendlist() {
    if (data.connected == true) {
      let req: any = await fetch(data.api + "/user/friend/all", {
        credentials: "include"
      });
      let res: any = await req.json();
      friends = [...res];
    }
  }

  async function get_blocklist() {
    if (data.connected == true) {
      let req: any = await fetch(data.api + "/user/blocked/all", {
        credentials: "include"
      });
      let res: any = await req.json();
      blocked = [...res];
    }
  }

  async function get_roomlist() {
    if (data.connected == true) {
      let req: any = await fetch(data.api + "/chat/room/me?has=owner", {
        credentials: "include"
      });
      let res: any = await req.json();
      // console.log(res);
      rooms = [...res];
    }
  }

  async function get_roommemberlist() {
    if (data.connected == true) {
      let req: any = await fetch(data.api + "/chat/room/me?has=member", {
        credentials: "include"
      });
      let res: any = await req.json();
      // console.log(res);
      memberrooms = [...res];
    }
  }

  function reload_list() {
    get_friendlist();
    get_blocklist();
    get_roomlist();
    get_roommemberlist();
  }

  function connect() {
  }

  async function get_twofa_state() {
    let req: any = await fetch(data.api + "/auth/2fa/status", {
      credentials: "include"
    });
    let res: any = await req.json();
    twofa_state = res.status;
    if (twofa_state)
      twofa_key = user.fa_key;
  }

  async function activate_twofa(phase) {
    if (phase == 1) {
      let req: any = await fetch(data.api + "/auth/2fa/keygen", {
        method: "PUT",
        credentials: "include"
      });
      let res: any = await req.json();
      qrcode_uri = res.fa_uri;
      twofa_input = [];
      popup = true;
      phase = 1;
    }
    else {
      let req: any = await fetch(data.api + "/auth/2fa/enable", {
        method: "PUT",
        credentials: "include"
      });
      let res: any = await req.json();
      let ilmarchebientondeuxfamaintenanttocard: any = "";
      for (let i: number = 0; i < 6; i++) {
        ilmarchebientondeuxfamaintenanttocard = ilmarchebientondeuxfamaintenanttocard + twofa_input[i]
      }
      req = await fetch(data.api + "/auth/2fa/enable", {
        method: "PUT",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
        body: JSON.stringify({code: ilmarchebientondeuxfamaintenanttocard })
      });
      req = await fetch(data.api + "/auth/2fa/status", {
        credentials: "include"
      });
      res = await req.json();
      if (res.verify) {
        twofa_key = res.fa_key;
        twofa_state = true;
        popup = false;
      }
      else {
        twofa_input[0] = "W";
        twofa_input[1] = "r";
        twofa_input[2] = "o";
        twofa_input[3] = "n";
        twofa_input[4] = "g";
        twofa_input[5] = "!";
        setTimeout(() => {twofa_input = []; document.getElementById(0).focus(); }, 2000);
      }
      twofa_input = [];
    }
  }

  async function deactivate_twofa() {
    let req: any = await fetch(data.api + "/auth/2fa/disable", {
      method: "PUT",
      credentials: "include"
    });
    let res: any = await req.json();
    twofa_state = false;
  }

  async function send_new_username() {
    let form: FormData = new FormData();
    let jsonified_form: any = {};
    form.append("username", change_username);
    form.append("avatar_url", user.avatar_url);
    form.forEach(function(value, key) {
      if (value == undefined || value == "")
        jsonified_form[key] = user.username;
      else
        jsonified_form[key] = value
    });
    let req: any = await fetch(data.api + "/user/update", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonified_form)
    });
    get_userdata();
    show_input_username = false;
  }

  async function le_back_du_front() {
    let image_input: any = document.querySelector(".img_in");
    if (image_input.files.length == 0)
      return null;
    let form: FormData = new FormData();
    form.append("image", image_input.files[0]);

    let req: any = await fetch("https://api.imgbb.com/1/upload?expiration=15552000&key=" + data.imgbb, {
      method: "POST",
      body: form
    });
    let res: any = await req.json();
    // console.log(res);
    return res.data.url;
  }

  async function send_new_avatar() {
    let avatar_url: string = await le_back_du_front();
    let form: any = new FormData();
    let jsonified_form: any = {};
    form.append("username", user.username);
    form.append("avatar_url", avatar_url);
    form.forEach(function(value, key) {
      if (value == undefined || value == "")
        jsonified_form[key] = user.username;
      else
        jsonified_form[key] = value;
    });
    let req: any = await fetch(data.api + "/user/update", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonified_form)
    });
    get_userdata();
    show_image_form = false;
  }

  onMount(() => {
    data.current_page = "Profile";
    if (data.connected == false)
      goto(data.api + "/auth/login");
    sync_data(data);
    get_twofa_state();
  });

</script>

{#if popup == true}
  {#if phase == 1}
    <div class="popup_qr">
      <QrCode uri="{qrcode_uri}" />
      <div>
        <button class="activate_2fa"on:click={() => phase = 2}>Ok</button>
        <button class="desactivate_2fa"on:click={() => popup = false}>Cancel</button>
      </div>
    </div>
  {:else}
    <div class="popup"> 
      <input id="0" class="twofa_inputs" type="text" bind:value={twofa_input[0]} on:keyup={(key) => { input_manager(1, key) } } maxlength="1" autofocus>
      <input id="1" class="twofa_inputs" type="text" bind:value={twofa_input[1]} on:keyup={(key) => { input_manager(2, key) } } maxlength="1">
      <input id="2" class="twofa_inputs" type="text" bind:value={twofa_input[2]} on:keyup={(key) => { input_manager(3, key) } } maxlength="1">
      <input id="3" class="twofa_inputs" type="text" bind:value={twofa_input[3]} on:keyup={(key) => { input_manager(4, key) } } maxlength="1">
      <input id="4" class="twofa_inputs" type="text" bind:value={twofa_input[4]} on:keyup={(key) => { input_manager(5, key) } } maxlength="1">
      <input id="5" class="twofa_inputs" type="text" bind:value={twofa_input[5]} on:keyup={(key) => { input_manager(6, key) } } maxlength="1">
      <button class="desactivate_2fa"on:click={() => popup = false}>Cancel</button>
    </div>
  {/if}
{:else}
  <main>
    <div class="lists">
      <div class="userdata">
        {#await get_userdata()}
          <h1> Loading user data... </h1>
        {:then}
          {#if data.connected}
            <div class="user_info">
              {#if show_input_username}
                <input class="search_bar"bind:value={change_username} placeholder="New username" maxlength="32">
                <button class="valid_name"on:click={() => send_new_username()}>Validate</button>
                <button class="cancel_name"on:click={() => show_input_username = false}>Cancel</button>
              {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span on:click={() => show_input_username = true}>{user.username}</span>
              {/if}
              {#if show_image_form}
                <form>
                  <input class="img_in" type="file" id="image" name="image" accept="image/png, image/jpeg" />
                  <button class="valid_avatar"on:click={() => send_new_avatar()}>Validate</button>
                  <button class="cancel_avatar"on:click={() => show_image_form = false}>Cancel</button>
                </form>
              {:else}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-missing-attribute -->
                <img src="{user.avatar_url}" width="20" on:click={() => show_image_form = true}>
              {/if}
              <div class="twofablock">
                <div class="leftblock">
                  {#if twofa_state == false}
                    <span>2FA Authentification Status : Not Activated</span> <button class="activate_2fa"on:click={() => activate_twofa(1)}>Activate 2FA</button>
                  {:else}
                  <span>2FA Authentification Status : Activated</span> <button class="desactivate_2fa"on:click={() => deactivate_twofa()}>Desactivate 2FA</button> <button class="regenerate_key"on:click={() => regenerate_key()}>Regenerate key</button>
                    <span>2FA Key: {twofa_key}</span>
                  {/if}
                    <span>Account created : {user.created}</span>
                </div>
              </div>
            </div>
          {/if}
        {/await}
      </div>
      <div class="friendlist">
        <span class="headerlist">Friend List</span>
        <div class="friend_list">
          {#await get_friendlist()}
            <h1> Loading Friend list... </h1>
          {:then} 
            {#each friends as friend}
              <div class="friend_elem">
                <img src="{friend.avatar_url}" width="200" />
                <span>{friend.username}</span>
                <button class="chibre" on:click={() => block_and_delete_friend(friend.id)}>Chibre</button>
              </div>
            {/each}
          {/await}
        </div>
        <div class="friend_input">
          <input bind:value="{friend_input}" type="text" class="search_bar"on:input={() => search_bar()}>
          <button class="add_friend"on:click={() => add_friend()}>Add Friend</button>
          {#if did_search == true}
            <div class="potential_friends">
              {#each friend_search as friend}
                <span>{friend.username}</span><button class="add_friend_search"on:click={() => {friend_input = friend.username; add_friend()}}>Add Friend</button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div class="blocklist">
        <span class="headerlist">Block List</span>
        {#await get_blocklist()}
          <h1> Loading Blocked Users List </h1>
        {:then}
          {#each blocked as block}
            <div class="friend_elem">
              <img src="{block.avatar_url}" width="200" />
              <span>{block.username}</span>
              <button class="unchibre"on:click={() => unblock(block.id)}>Unchibre</button>
            </div>
          {/each}
        {/await}
      </div>
      <div class="roomlist">
        <span class="headerlist">Owner Room List</span>
        {#await get_roomlist()}
          <h1> Loading Room List </h1>
        {:then}
          {#each rooms as room}
            <div class="block_card">
              <span>{room.name}</span>
              <button class="delete_room" on:click={() => delete_room(room.id)}>Delete Room</button>
            </div>
          {/each}
        {/await}
      </div>
      <div class="roommemberlist">
        <span class="headerlist">Member Room List</span>
        {#await get_roommemberlist()}
          <h1> Loading Room Member List </h1>
        {:then}
          {#each memberrooms as memberroom, id}
            <div class="block_card">
              <span>{memberroom.name}</span>

                <button class="quit_room" on:click={() => leave_room(id)}>Quit Room</button>
            </div>
          {/each}
        {/await}
      </div>
    </div>
  </main>
{/if}

<style>
  main {
    margin: 50px;
  }
  .twofablock {
    margin-top: 2em;
  }
  .leftblock {
    background: #212121BB;
    margin-left: 1em;
    padding: 1.2em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    align-items: center;
    border: 0.1em solid red;
    border-radius: 0.5em;
    /* box-shadow: 0em 0em 0.3em red; */
    box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #e50b0b,
    

    inset 0 0 1.5vw  0.4vw #e50b0b,
    /* inset 0 0 0.2vw  0.1vw #e97272, */
    inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
  }
  .popup{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 20px;
  }
  .lists {
    margin-top: 2em;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(500px, 1fr));
  }
  .friendlist, .blocklist, .roomlist, .roommemberlist {
    /* border-bottom: 0.09em solid red; */
    /* box-shadow: 0em 0em 0.5em red; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #e50b0b,
    

    inset 0 0 1.5vw  0.4vw #e50b0b,
    /* inset 0 0 0.2vw  0.1vw #e97272, */
    inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
    margin-top: 3em;
    border-radius: 1em;
    background: #212121BB;
    font-size: 1.25em;
    font-family: monospace;
  }
  .friendlist > span, .blocklist > span, .roomlist > span, .roommemberlist > span{
    padding: 0.3em;
    text-overflow: hidden;
    white-space: nowrap;
  }
  .friendlist{
    display: flex;
    flex-direction: column;
    gap: 0.9em;
    width: 30em;
    min-height: 20em;
  }
  .roommemberlist{
    display: flex;
    flex-direction: column;
    gap: 0.9em;
    width: 30em;
    min-height: 20em;
  }
  .roomlist{
    display: flex;
    flex-direction: column;
    gap: 0.9em;
    width: 30em;
    min-height: 20em;
  }
  .blocklist{
    display: flex;
    flex-direction: column;
    gap: 0.9em;
    width: 30em;
    min-height: 20em;
  }
  .userdata{
    margin-left: 1em;
    margin-top: -1em;
    border-radius: 0.5em;
    display: flex;
    flex-direction: column;
    gap: 0.9em;
    width: 20em;
  }
  .user_info > img {
    /* margin-top: 1em; */
    width: 80%;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.5em red;
  }
  .headerlist{
    display: flex;
    text-align: center;
    flex-direction: column;
    gap: 0.9em;
    width: 29.25em; 
    /* box-shadow: 0em 0em 0.5em red; */
    border-bottom: 0.1em solid red;
    font-family: "retro";
    font-size: 0.815em;
    margin-top: 1em;
  }
  .search_bar{
    background: #212121BB;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.5em red;
    color: white;
    border-bottom-left-radius: 1em;
    font-size: 0.75em;
    transition: 0.5s ease-in-out;
  }
  .friend_elem {
    flex-direction: row;
    /* margin-top: 1em; */
  }
  .user_info {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2.5em;
    
  }
  .friend_elem > img, .block_card > img{
    margin-left: 1em;
  }
  img {
		width: 30%;
		height: auto;
  }
  .block_card{
    text-align: left;
    word-wrap: anywhere;
    margin-left: 1em;
  }
  .friend_input{
    display: flex;
    /*margin-top: 55em;*/
    width: 0.7em;
  }
  .quit_room{
    margin-left: 75%;
    margin-bottom: 4px;
  }
  .delete_room{
    margin-left: 75%;
    margin-bottom: 4px;
  }
  .quit_room, .delete_room, .chibre, .unchibre, .activate_2fa, .desactivate_2fa, .add_friend, .valid_name, .valid_avatar, .cancel_name, .cancel_avatar, .regenerate_key {
    background: #212121BB;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.5em red;
    color: white;
    border-radius: 0.2em;
    font-size: 0.75em;
    transition: 0.5s ease-in-out;
    
  }
  .quit_room:hover, .delete_room:hover, .chibre:hover, .unchibre:hover, .activate_2fa:hover, .desactivate_2fa:hover, .regenerate_key:hover, .add_friend:hover, .add_friend_search:hover, .cancel_avatar:hover, .cancel_name:hover, .valid_avatar:hover, .valid_name:hover{
    color: red;
    transition: 0.5s ease-in-out;
  }
  .valid_avatar, .cancel_avatar, .valid_name, .cancel_name{
    display: block;
    margin-left: auto;
    margin-right: auto;
    font-size: 1em;
  }
  .add_friend_search{
    background: #212121BB;    
    border: 0.01em solid red;    
    box-shadow: 0em 0em 0.5em rgb(255, 0, 0);
    color: white;
    border-radius: 0em;
    font-size: 0.75em;
    margin-left: 4em;
  }
  .potential_friends > span{
    background: #212121BB;   
    border: 0.1em solid red;    
    box-shadow: 0em 0em 0.5em rgb(255, 0, 0);    
    color: white;
    font-size: 0.75em;
    margin-left: 5em;
  }
  .friend_list {
    height: 100%;
  }
  .twofa_inputs {
    background: #212121BB;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.5em red;
    color: white;
    border-radius: 0.2em;
    font-size: 0.75em;
    transition: 0.5s ease-in-out;
    max-width: 50px;
    min-height: 80px;
    font-size: 2em;
    text-align: center;
  }

  .twofa_inputs:focus {
    color: red;
    outline: none;
  }

  .popup_qr {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 20px;
  }

  .popup{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 20px;
  }
</style>
