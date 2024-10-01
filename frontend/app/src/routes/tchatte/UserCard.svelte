<script lang="ts">
  import Data from "../Store.js";
  import { getContext } from "svelte"; 
  export let info: any;

  const { enter_the_matrix }: any = getContext("private");
  const { send_quick_play_request }: any = getContext("private");
  
  let data: any;
  data = $Data;
  
  let is_friend: boolean = false;
  let clicked: boolean = false;

  async function knockknock_neo(id: any, name: any) {
    let req: any = await fetch(data.api + "/user/me", { credentials: "include" });
    let user: any = await req.json();
    req = await fetch(data.api + "/chat/room/private", { credentials: "include" });
    let private_room_list: any = await req.json();
    for (let i = 0; i < private_room_list.length; i++) {
      if (private_room_list[i].member[0].userIdF.username === name) {
        enter_the_matrix(private_room_list[i].id, private_room_list[i].name);
        return ;
      }
    }
    let room_name: any = user.username + "-" + name;
    req = await fetch(data.api + "/chat/room/private/new/" + id + "?name=" + room_name, {
      method: "PUT",
      credentials: "include"
    });
    let res: any = await req.json();
    enter_the_matrix(res.id, res.name);
  }

  async function add_friend(id: any) {
    await fetch(data.api + "/user/friend/add/" + id, {
      method: "POST",
      credentials: "include"
    });
    clicked = true;
  }

  async function remove_friend(id: any) {
    await fetch(data.api + "/user/friend/chibrimise/" + id, {
      method: "DELETE",
      credentials: "include"
    });
    awaiting(id);
  }

  async function check_friends(id: any) {
    let req = await fetch(data.api + "/user/friend/all", { credentials: "include" });
    let res = await req.json();
    for (let i = 0; i < res.length; i++) {
      if (res[i].id == id)
        return true;
    }
    return false;
  }

  async function awaiting(id: any) {
    is_friend = await check_friends(id);
  }

</script>

<div class="global">
  <div class="photo">
    <img src="{info.avatar_url}" alt="">
  </div>
  <div class="info-buttons">
    <div class="info">
      <span class="username">{info.username}</span>
    </div>
    <div class="buttons">
      {#await awaiting(info.id)}
        {#if is_friend}
            <button class="notingame">Remove friend</button>
        {:else if clicked}
            <button disabled class="ingame">Request Sent</button>
        {:else}
            <button class="notingame">Add friend</button>
        {/if}
      {:then}
        {#if is_friend}
            <button class="notingame" on:click={() => remove_friend(info.id)}>Remove friend</button>
        {:else}
          {#if clicked}
            <button disabled class="ingame">Request Sent</button>
          {:else}
            <button class="notingame" on:click={() => add_friend(info.id)}>Add friend</button>
          {/if}
        {/if}
      {/await}
      {#if info.email == true}
        <button disabled class="ingame">Currently In Game</button>
      {:else}
        <button class="notingame" on:click={() => send_quick_play_request(info.id, 1)}>Quick Play</button>
      {/if}
      <button class="notingame" on:click={() => knockknock_neo(info.id, info.username)}>Private Message</button>
    </div>
  </div>
</div>

<style>
  .global {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    margin-top: 10px;
  }
  .photo {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .photo > img{
    max-width: 60px;
    height: auto;
    margin-right: 40px;
    margin-left: 10px;
  }
  .info-buttons {
    display: flex;
    flex-direction: column;
  }
  .notingame{
    background: #212121BB;
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.1em green;
    color: white;
    border-radius: 0.2em;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
    margin: 10px;
  }
  .notingame:hover{
    color: green;
    transition: 0.5s ease-in-out;
  }
  .username{
    margin-right: 80%;
  }
  .ingame {
    background: #212121BB;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.1em red;
    color: white;
    border-radius: 0.2em;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
    margin: 10px;
  }
</style>
