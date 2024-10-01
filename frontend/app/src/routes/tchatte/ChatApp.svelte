<script lang="ts">
  import Data from "../Store.js";
  import UserCard from "./UserCard.svelte";
  import { onMount, setContext } from "svelte";
  import { goto } from "$app/navigation";
  import { io } from "socket.io-client";
  import { PUBLIC_HOST_BACK } from '$env/static/public'
  import { PUBLIC_PORT_BACK } from '$env/static/public'

  setContext("private", { enter_the_matrix, send_quick_play_request });

  let data: any;
  data = $Data;

  let chann_var: string = "channel-list";
  let tchat_var: string = "tchat-text main-screen";
  let users_var: string = "channel-user";
  let media_kiri: string = "grille_normalwife";

  let in_room: boolean = false;
  let show_profile: boolean = false;
  let is_mute: boolean = false;
  let is_friend: boolean = false;
  let is_blocked: boolean = false;
  let mute_min: number;

  let room_messages: any = [];
  let room_users: any;
  let current_room: any;
  let current_room_name: any;
  let connected_users: any;
  let user_data: any;
  let profile_data: any;
  let selected_status: any;
  let profile_status: any;

  let rooms_member: any;
  let rooms_owner: any;
  let new_rooms = [];
  let room_password = [];
  
  let room_name_input: string;
  let room_password_input: string;
  let room_description_input: string;
  let editing: boolean = false;
  let editing_room_id: any = null;
  let user_room_message: any;

  let popup_create_room: boolean = false;
  let show_new_rooms: boolean = false;

  async function unblock_user(id: any) {
    let req: any = await fetch(data.api + "/user/unblock/" + id, {
      credentials: "include",
      method: "PUT",
    });
    get_connected_user();
    show_profile = false;
  }

  async function modify_room(room) {
    room_name_input = room.name;
    room_description_input = room.description;
    editing = true;
    popup_create_room = true;
    editing_room_id = room.id
  }

  async function send_modify_room() {
    if (editing_room_id == null)
      return ;
    let room_image_url: string = await le_back_du_front();
    let form: FormData = new FormData();
    let jsonified_form: object = {};
    form.append("name", room_name_input);
    if (room_password_input == null || room_password_input == "" || room_password_input == undefined || room_password_input == "null")
      form.append("noPassword", true)
    else {
      form.append("noPassword", false)
      form.append("password", room_password_input);
    }
    form.append("description", room_description_input);
    if (room_image_url != null && room_image_url != undefined)
      form.append("avatar", room_image_url);
    form.forEach(function(value, key) {
      if (key == "password") {
        if (value == undefined || value == "undefined")
          jsonified_form[key] =  "";
        else
          jsonified_form[key] = value
      }
      else {
        jsonified_form[key] = value;
      }
    });

    let req: any = await fetch(data.api + "/chat/room/" + editing_room_id + "/status", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonified_form)
    });
    let res: any = await req.json();
    popup_create_room = false;
    current_room_name = room_name_input;
    room_name_input = null;
    room_password_input = null;
    room_description_input = null;
    editing = false;
    editing_room_id = null;
    get_room_list();
  }

  async function get_chatid_from_global_user_id(user_id, room_id) {
    let req: any = await fetch(data.api + "/chat/room/" + room_id + "/members", {
      credentials: "include"
    });
    let res: any = await req.json();
    for (let i = 0; i < res.length; i++) {
      if (res[i].userId == user_id)
        return res[i].id;
    }
    return null;
  }

  async function kick_tchatte(user_id, room_id) {
    let real_room_id_because_back_cant_do_it_by_himself_even_if_its_easier_and_more_efficient: any = await get_chatid_from_global_user_id(user_id, room_id);
    if (real_room_id_because_back_cant_do_it_by_himself_even_if_its_easier_and_more_efficient == null) {
      return;
    }
    let req: any = await fetch(data.api + "/chat/room/" + room_id + "/member/" + real_room_id_because_back_cant_do_it_by_himself_even_if_its_easier_and_more_efficient + "?reason=\"chibre\"", {
      method: "DELETE",
      credentials: "include"
    });
    show_profile = false;
    req = await fetch(data.api + "/chat/room/" + current_room + "/members", { credentials: "include" });
    room_users = await req.json();
  }

  async function remove_friend(id) {
    let req: any = await fetch(data.api + "/user/friend/chibrimise/" + id, {
      method: "DELETE",
      credentials: "include"
    });
    awaiting();
    show_profile = false;
  }


  async function check_friends(id: any) {
    let req: any = await fetch(data.api + "/user/friend/all", { credentials: "include" });
    let res: any = await req.json();
    for (let i = 0; i < res.length; i++) {
      if (res[i].id == id)
        return true;
    }
    return false;
  }

  async function check_blocked(id: any) {
    let req: any = await fetch(data.api + "/user/blocked/all", { credentials: "include" });
    let res: any = await req.json();
    for (let i: number = 0; i < res.length; i++) {
      if (res[i].id == id)
        return true;
    }
    return false;
  }

  async function get_profile_role(user: any, room: any) {
    let req: any = await fetch(data.api + "/chat/status/room/" + room + "/user/" + user + "?mode=2", { credentials: "include" });
    let res: any = await req.json();
    return res.role;
  }

  async function get_selected_status(user: any, room: any) {
    let req: any = await fetch(data.api + "/chat/status/room/" + room + "/user/" + user + "?mode=1", { credentials: "include" });
    let res: any = await req.json();
    // console.log(res);
    return res;
  }

  async function get_profile_data(id: any) {
    let req: any = await fetch(data.api + "/user/search/" + id, { credentials: "include" })
    return await req.json();
  }

  async function get_user_data() {
    let req: any = await fetch(data.api + "/user/me", { credentials: "include" });
    user_data = await req.json();
  }

  function send_quick_play_request(id: any, mode: any) {
    data.goto_pg = id;
    data.pg_demerde = mode;
    sync_data(data);
    goto("/play");
  }

  async function get_connected_user() {
    let new_connected_users: Array<any> = new Array();
    let req: any = await fetch(data.api + "/user/connected", { credentials: "include" });
    let res: any = await req.json();
    req = await fetch(data.api + "/user/me", { credentials: "include" });
    let my_account: any = await req.json();
    req = await fetch(data.api + "/games/online", { credentials: "include" });
    let connected_list: any = await req.json();
    res.forEach((elem) => {
      if (elem.id != my_account.id)
        new_connected_users.push(elem);
    });
    for (let i: number = 0; i < new_connected_users.length; i++) {
      if (connected_list.length == 0)
          new_connected_users[i].email = false;
      else {
        for (let x: number = 0; x < connected_list.length; x++) {
          if (new_connected_users[i].id == connected_list[x])
            new_connected_users[i].email = true;
        }
      }
    }
    for (let i: number = 0; i < new_connected_users.length; i++) {
      if (new_connected_users[i].blokedBy.length > 0) {
        for (let x: number = 0; x < new_connected_users[i].blokedBy.length; x++) {
          if (new_connected_users[i].blokedBy[x].id == user_data.id) {
            new_connected_users.splice(i, 1);
            i--;
            break;
          }
        }
      }
    }
    connected_users = [...new_connected_users];
  }

  async function socket_new_message(room_id: any) {
    let req: any = await fetch(data.api + "/chat/room/" + room_id + "/message", { credentials: "include" }).catch((err) => { return null; });
    if (req.status === 403) {
      room_message = [];
      return ;
    }
    if (req === null)
      return ;
    room_messages = await req.json();
    if (room_messages.length > 0)
      room_messages = room_messages.reverse();
  }

  async function enter_the_matrix(room_id, room_name) {
    let chatbox: any;
    if (in_room && room_id == current_room)
      return ;
    let req: any = await fetch(data.api + "/user/me", { credentials: "include" });
    let user: any = await req.json();
    req = await fetch(data.api + "/chat/room/" + room_id + "/message", { credentials: "include" }).catch((err) => { return null; });
    if (req.status === 403) {
      room_message = [];
      return ;
    }
    if (req === null)
      return ;
    room_messages = await req.json();
    req = await fetch(data.api + "/chat/room/me", { credentials: "include" });
    let boucle: any = await req.json()
    let result: any;
    for (let i = 0; i < boucle.length; i++) {
      if (boucle[i].name == room_name)
        result = i;
    }
    if (boucle[result].member[0].status === "MUTE")
      is_mute = true;
    if (room_messages.length > 0)
      room_messages = room_messages.reverse();
    current_room = room_id;
    current_room_name = room_name;
    data.chat_socket.emit("joinRoom", {
      id: 0,
      username: user.username,
      sendFrom: user.id,
      sendTo: null,
      for: room_id,
      avatar: null,
      type: "OK",
      content: null,
      answer: "join",
      date: Date(),
      cookie: null
    });
    req = await fetch(data.api + "/chat/room/" + current_room + "/members", { credentials: "include" });
    room_users = await req.json();
    if (!in_room) {
      popup_create_room = false;
      show_new_rooms = false;
      in_room = true;
      data.chat_socket.on("newRoomMessage", (message, serverOff) => {
        socket_new_message(current_room);
        chatbox = document.querySelector(".tchat_elem");
        setTimeout(() => {chatbox.scrollTo(0, chatbox.scrollHeight)}, 50);
      });
    }
    popup_create_room = false;
    show_new_rooms = false;
    in_room = true;
    chatbox = document.querySelector(".tchat_elem");
    if (chatbox != null)
      setTimeout(() => {chatbox.scrollTo(0, chatbox.scrollHeight)}, 50);
  }

  async function send_message() {
    let req: any = await fetch(data.api + "/chat/room/" + current_room + "/message/add", {
      method: "POST",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message: user_room_message})
    });
    user_room_message = "";
  }

  async function join_room(id) {
    let room_id: any = new_rooms[id].id
    let req: any;
    if (new_rooms[id].password) {
        req = await fetch(data.api + "/chat/room/member/" + room_id + "/add", {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({password: room_password[id]})
      });
    }
    else {
      req = await fetch(data.api + "/chat/room/member/" + room_id + "/add", {
        method: "POST",
        credentials: "include",
      });
    }
    room_password = [];
    let res: any = await req.json();
    if (res.statusCode != 401) {
      show_new_rooms = false;
      get_room_list();
    }
  }

  async function tri_de_ses_morts() {
    let req: any = await fetch(data.api + "/chat/room/me", {
      credentials: "include"
    });
    let my_rooms: any = await req.json();
    req = await fetch(data.api + "/chat/room/all", {
      credentials: "include"
    });
    let all_rooms: any = await req.json();
    let id_all: Array<any> = [];
    let id_my: Array<any> = [];
    all_rooms.forEach((elem) => id_all.push(elem.id));
    my_rooms.forEach((elem) => id_my.push(elem.id));
    let inside: boolean = false;
    new_rooms = [];
    for (let i = 0; i < id_all.length; i++) {
      for (let y = 0; y < id_my.length; y++) {
        if (id_all[i] == id_my[y]) {
          inside = true;
          break;
        }
      }
      if (inside == false)
        new_rooms.push(all_rooms[i]);
      else
        inside = false;
    }
    show_new_rooms = true;
  }

  async function le_back_du_front() {
    let image_input: any = document.querySelector(".img_in");
    if (image_input.files.length == 0)
      return "https://i.ibb.co/dcLH5MH/trous.png";
    let form: FormData = new FormData();
    form.append("image", image_input.files[0]);

    let req: any = await fetch("https://api.imgbb.com/1/upload?expiration=15552000&key=" + data.imgbb, {
      method: "POST",
      body: form
    });
    let res: any = await req.json();
    return res.data.url;
  }

  async function get_room_list() {
    let req: any = await fetch(data.api + "/chat/room/me?has=member&privacy=public", {
      credentials: "include"
    });
    let res: any = await req.json();
    rooms_member = [...res];
    req = await fetch(data.api + "/chat/room/me?has=owner&privacy=public", {
      credentials: "include"
    });
    res = await req.json();
    rooms_owner = [...res];
    req = await fetch(data.api + "/chat/room/me?has=admin&privacy=public", {
      credentials: "include"
    });
    res = await req.json();
    rooms_member = [...rooms_member, ...res];
  }

  async function create_room() {
    let room_image_url: any = await le_back_du_front();
    let form: FormData = new FormData();
    let jsonified_form: any = {};
    form.append("name", room_name_input);
    form.append("description", room_description_input);
    form.append("avatar", room_image_url);
    form.forEach(function(value, key) {
      if (key == "password") {
        if (value == undefined || value == "undefined")
          jsonified_form[key] =  "";
        else
          jsonified_form[key] = value
      }
      else {
        jsonified_form[key] = value;
      }
    });

    let req: any = await fetch(data.api + "/chat/room/create", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonified_form)
    });
    let res: any = await req.json();
    popup_create_room = false;
    room_name_input = null;
    room_password_input = null;
    room_description_input = null;
    get_room_list();
  }

  async function popup_profile(user_id: any, room_id: any) {
    selected_status = await get_selected_status(user_id, room_id);
    profile_status = await get_profile_role(user_data.id, room_id)
    profile_data = await get_profile_data(user_id);
    is_friend = await check_friends(user_id);
    is_blocked = await check_blocked(user_id);
    show_profile = true;
  }

  async function connect_socket() {
    data.chat_socket = io(`ws://${PUBLIC_HOST_BACK}:${PUBLIC_PORT_BACK}/chat`, { transports: ["websocket"] });
    data.notifications_socket = io(`ws://${PUBLIC_HOST_BACK}:${PUBLIC_PORT_BACK}/notifications`, { transports: ["websocket"] });
  }

  async function powerfull_redirect(id: any) {
    if (id == null)
      return;
    let req: any = await fetch(data.api + "/chat/room/search/" + data.goto_pm, { credentials: "include" });
    let res: any = await req.json();
    enter_the_matrix(data.goto_pm, res.name);
    data.goto_pm = null;
  }

  async function magic_button_2(room_id: any, user_id: any, kiri: any) {
      let req: any = await fetch(data.api + "/chat/room/" + room_id + "/user/" + user_id + "?role=" + kiri, {
        credentials: "include",
        method: "PATCH",
      })
      show_profile = false;
  }

  async function magic_button(room_id: any, user_id: any, kiri: any) {
    if (kiri == "MUTE") {
      let isnum: boolean = /^\d+$/.test(mute_min);
      if (mute_min == null || mute_min == undefined || isnum == false || mute_min < 0)
        mute_min = 10;
      let req: any = await fetch(data.api + "/chat/room/" + room_id + "/user/" + user_id + "?status=" + kiri + "&time=" + mute_min, {
        credentials: "include",
        method: "PATCH",
      })
    }
    else {
      let req: any = await fetch(data.api + "/chat/room/" + room_id + "/user/" + user_id + "?status=" + kiri, {
        credentials: "include",
        method: "PATCH",
      })
    }
    mute_min = 0;
    show_profile = false;
  }

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }

  async function block_user(id: any) {
    let req: any = await fetch(data.api + "/user/block/" + id, {
      credentials: "include",
      method: "POST",
    });
    show_profile = false;
  }

  async function add_friend(id: any) {
    let req: any = await fetch(data.api + "/user/friend/add/" + id, {
      credentials: "include",
      method: "POST",
    });
    show_profile = false;
  }

  async function delete_friend(id: any) {
    let req: any = await fetch(data.api + "/user/friend/chibrimise/" + id, {
      credentials: "include",
      method: "DELETE",
    });
    show_profile = false;
  }

  function on_sen_ballec_on_fait_ca_en_trente_secondes_et_on_recharge_la_page() {
    data.notifications_socket.on("chatRoomStatus", (e) => {
      // console.log(e);
      // checker si on est dans la room
      if (e.username == "BAN" || e.username == "KICK") {
        get_room_list();
        if (current_room_name == e.for) {
          in_room = false;
          popup_create_room = false;
          show_new_rooms = false;
        }
      }
      else if (e.username == "MUTE")
        is_mute = true;
      else {
        if (is_mute == true)
          is_mute = false;
        get_room_list();
      }
    });
  }

  onMount(() => {
    connect_socket();
    get_connected_user();
    get_user_data();
    if (data.goto_pm != null)
      powerfull_redirect(data.goto_pm);
    on_sen_ballec_on_fait_ca_en_trente_secondes_et_on_recharge_la_page();
    setInterval(() => {
      get_connected_user();
    }, 5000);
  });
</script>

<main>
  {#if show_profile}
  <div class="overlay">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="popup_profile" >
      <div class="popup_profile_infos">
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="cover">
          <img src="{profile_data.avatar_url}" width="200" height="200">
        </div>
        <span class="profile_username">Username : {profile_data.username}</span>
        <span class="profile_level">Level : {profile_data.level}</span>
      </div>
      <div class="popup_buttons">
        {#if profile_status == "OWNER"}
            {#if selected_status.status != "BAN"}
              <button on:click={() => magic_button(current_room, profile_data.id, "BAN")}>Ban</button>
            {:else}
              <button on:click={() => magic_button(current_room, profile_data.id, "ALLOW")}>Unban</button>
            {/if}
            {#if selected_status.status != "MUTE"}
              <input bind:value={mute_min} class="input_mute"placeholder="Minutes for mute">
              <button on:click={() => magic_button(current_room, profile_data.id, "MUTE")}>Mute</button>
            {:else}
              <button on:click={() => magic_button(current_room, profile_data.id, "ALLOW")}>Unmute</button>
            {/if}
              <button on:click={() => kick_tchatte(profile_data.id, current_room)}>Kick</button>
            {#if selected_status.role != "ADMIN"}
              <button on:click={() => magic_button_2(current_room, profile_data.id, "ADMIN")}>Admin</button>
            {:else}
              <button on:click={() => magic_button_2(current_room, profile_data.id, "MEMBER")}>Unadmin</button>
            {/if}
        {/if}
        {#if profile_status == "ADMIN"}
          {#if selected_status.role != "OWNER"}
            {#if selected_status.status != "BAN"}
              <button on:click={() => magic_button(current_room, profile_data.id, "BAN")}>Ban</button>
            {:else}
              <button on:click={() => magic_button(current_room, profile_data.id, "ALLOW")}>Unban</button>
            {/if}
            {#if selected_status.status != "MUTE"}
              <input bind:value={mute_min} class="input_mute"placeholder="Minutes for mute">
              <button on:click={() => magic_button(current_room, profile_data.id, "MUTE")}>Mute</button>
            {:else}
              <button on:click={() => magic_button(current_room, profile_data.id, "ALLOW")}>Unmute</button>
            {/if}
          {/if}
        {/if}
        {#if is_blocked}
          <button on:click={() => unblock_user(profile_data.id)}>Unblock</button>
        {:else}
          <button on:click={() => block_user(profile_data.id)}>Block</button>
        {/if}
        {#if is_friend}
          <button on:click={() => remove_friend(profile_data.id)}>Remove Friends</button>
        {:else}
          <button on:click={() => add_friend(profile_data.id)}>Add Friends</button>
        {/if}
        <button on:click={() => show_profile = false}>Cancel</button>
      </div>
    </div>
  </div>
  {/if}
  <div class="{media_kiri}">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="{chann_var}" >
      <span class="box-title">Channels list</span>
        {#await get_room_list()}
        	<span>Loading room list</span>
        {:then}
          <div class="rooms_member">
            <span class="list_title">Rooms as member</span>
          	{#each rooms_member as room}
              {#if room.member[0].status != "BAN"}
                <span class="room" on:click={() => enter_the_matrix(room.id, room.name)}>{room.name}</span>
              {/if}
            {/each}
          </div>
          <div class="rooms_owner">
            <span class="list_title">My Rooms</span>
          	{#each rooms_owner as room, id}
              <div><span class="room" on:click={() => enter_the_matrix(room.id, room.name)}>{room.name}</span><button on:click={modify_room(rooms_owner[id])} class="bouton_2">Edit</button></div>
            {/each}
          </div>
        {/await}
      <div class="room-options">
        <button class="bouton" on:click={() => {popup_create_room = !popup_create_room; show_new_rooms = false}}>Create Room</button>
        <button class="bouton" on:click={() => {show_new_rooms = !show_new_rooms; popup_create_room = false}}>Search New Room</button>
      </div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="{tchat_var}">
      {#if show_new_rooms}
        {#await tri_de_ses_morts()}
          <h1>Loading rooms...</h1>
        {:then} 
          <div class="grille_rooms">
            {#each new_rooms as room, id}
              <div class="room_card">
                  <span class="title">{room.name}</span>
                  <img src={room.avatar}>
                  {#if room.password}
                    <input class="bouton" type="password" bind:value={room_password[id]}>
                  {/if}
                  <button class="join_room"on:click={() => join_room(id)}>Join</button>
              </div>
            {/each}
          </div>
        {/await}
      {:else if popup_create_room}
        <div class="popup_room">
          <form>
            <input class="img_in" type="file" id="image" name="image" accept="image/png, image/jpeg" />
            <input class="bouton_bar" type="text" placeholder="Room name" bind:value={room_name_input} />
            <textarea class="bouton_desc" name="desc" id="1" cols="40" rows="15" placeholder="Room description" bind:value={room_description_input}></textarea>
            <input class="bouton_bar" type="password" placeholder="Room password" bind:value={room_password_input} />
          </form>
        {#if editing}
          <button class="bouton_room" on:click={() => send_modify_room()}>Edit</button>
        {:else}
          <button class="bouton_room" on:click={() => create_room()}>Create</button>
        {/if}
          <button class="bouton_room" on:click={() => popup_create_room = false}>Cancel</button>
        </div>
      {:else}
        {#if in_room}
          <span class="box-title">
            {current_room_name}
            <div class="userlist">
              {#each room_users as user}
                {#if user_data.username == user.userIdF.username}
                  <span class="user_userlist">{user.userIdF.username}</span>
                {:else}
                  <span class="user_userlist clickable" on:click={() => popup_profile(user.userId, current_room)}>{user.userIdF.username}</span>
                {/if}
              {/each}
            </div>
          </span>
            <div class="tchat_elem">
              {#if room_messages.length != 0}
                {#each room_messages as message}
                  {#if user_data.username == message.membreF.userIdF.username}
                    <span class="room_message">{message.date.replace("T", " ").split(".")[0]} &lt;{message.membreF.userIdF.username}&gt;: {message.message}</span><br />
                  {:else}
                    <span class="room_message">{message.date.replace("T", " ").split(".")[0]} &lt;<span class="clickable" on:click={() => popup_profile(message.membreF.userId, current_room)}>{message.membreF.userIdF.username}</span>&gt;: {message.message}</span><br />
                  {/if}
                {/each}
              {:else}
                <span class="room_messages">No Messages</span>
              {/if}
            </div>
            <div class="input_box">
              {#if !is_mute}
                <form on:submit|preventDefault={() => send_message()} class="input_box">
                    <input type="text" bind:value="{user_room_message}" class="input_chat">
                </form>
                <button class="bouton" on:click={() => send_message()}>Send Message</button>
              {/if}
            </div>
        {:else}
          <span class="box-title">Tchatte</span>
          <h1>You are not in a room</h1>
        {/if}
      {/if}
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="{users_var}">
      <span class="box-title">Connected Users</span>
      {#await get_connected_user()}
        <span>No one is connected</span>
      {:then}
        {#each connected_users as user}
          <UserCard info={user} />
        {/each}
      {/await}
</main>

<style>
  .tchat-box {
    display: flex;
    flex-direction: row;
  }
  .tchat-box > div {
    margin: 0.1em;
  }
  .tchat-text {
    display: flex;
    flex-direction: column;
    flex: 25%;
  }
  .channel-list, .channel-user, .tchat-text, .tchat_room {
    display: flex;
    flex-direction: column;
    border: 0.09em solid green;
    /* box-shadow: 0em 0em 0.5em green; */
    box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw green,
    

    inset 0 0 1.5vw  0.4vw green,
    /* inset 0 0 0.2vw  0.1vw #e97272, */
    inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
    margin-top: 0.8em;
    border-radius: 1em;
    background: #212121BB;
    font-size: 1.25em;
    font-family: monospace;
    flex: 25%;
  }

  .channel-list > span, .channel-user > span, .tchat-text > span {
    padding: 0.3em;
    text-overflow: hidden;
    white-space: nowrap;
  }
  .channel-list, .channel-user {
    text-align: center;
  }
  .main-screen {
    flex: 50%;
  }
  .box-title {
    display: flex;
    text-align: center;
    flex-direction: column;
    /* box-shadow: 0em 0em 0.5em green; */
    border-bottom: 0.1em solid green;
    font-family: "retro";
    font-size: 0.815em;
    margin-top: 1em;
  }
  .rooms_list {
    display: flex;
    flex-direction: row;
  }
  .rooms_member, .rooms_owner {
    display: flex;
    flex-direction: column;
    margin-bottom: 4em;
  }
  .room{
    cursor: pointer;
    transition: 0.5s ease-in-out;
  }
  .room:hover{
    color: green;
    transition: 0.5s ease-in-out;
  }
  .list_title{
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.5em green;
    margin-top: 1em;
    margin-left: 1em;
    margin-right: 1em;
    border-radius: 0.2em;
  }
  .grille_rooms {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  .bouton, .join_room, .bouton_room, .bouton_bar, .bouton_desc, .bouton_2{
    background: #212121BB;
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.1em green;
    color: white;
    border-radius: 0.2em;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
    max-width: 50%;
  }
  .bouton:hover, .join_room:hover, .bouton_room:hover, .bouton_bar:hover, .bouton_desc:hover, .bouton_2:hover{
    color: green;
    transition: 0.5s ease-in-out;
  }
  .bouton_2{
    display: flex;
    margin-left: 47%;
  }
  .bouton_room{
    margin-top: 20px;
    margin-left: 8px;
  }
  .bouton_bar, .bouton_desc{
    font-size: 1.3em;
  }
  .bouton_desc{
    margin-top: 50px;
  }
  .tchat_elem {
    overflow-y: scroll;
    height: 100%;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding: 20px;
  }
  .tchat_elem::-webkit-scrollbar {
    display: none;
  }
  .tchat_elem > span {
    text-overflow: hidden;
    word-wrap: anywhere;
  }
  .private_avatar {
    max-width: 20%;
    height: auto;
  }
  .channel-user {
    display: flex;
    flex-direction: columns;
  }
  .input_box {
    display: grid;
    grid-template-columns: 4fr 1fr;
    position: relative;
    bottom: 0;
    left: 0;
    gap: 1em;
  }
  .room_card{
    display: grid;
    align-items: center;
    align-content: space-between;
    justify-items: center;
  }
  .room_card > img {
    max-width: 20%;
    height: auto;
  }
  .input_box > button {
    background: #212121BB;
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.1em green;
    color: white;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
  }
  .input_chat {
    background: #212121BB;
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.1em green;
    color: white;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
    border-bottom-left-radius: 12px;
  }
  .input_mute{
    background: #212121BB;
    border: 0.1em solid green;
    box-shadow: 0em 0em 0.1em green;
    color: white;
    font-size: 1.0em;
    transition: 0.5s ease-in-out;
  }
  /* Ultra Wife */
  .grille_ultrawife {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    gap: 10px;
  }

  /* Normal Wife */
  .grille_normalwife {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 400px 400px;
    grid-template-areas:
      "latina milf milf"
      "brunette milf milf"
      ". . .";
    gap: 25px;
    margin: 25px;
  }
  .grille_normalwife > .channel-list{
    grid-area: latina;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* height: 0;
    width: 0; */
    /* overflow-x: hidden; */
    /* overflow-y: hidden; */
    /* overflow: hidden; */
  }
  .grille_normalwife > ::-webkit-scrollbar{
    height: 0;
    width: 0;
  }
  .grille_normalwife > .tchat-text, .grille_normalwife::-webkit-scrollbar {
    grid-area: milf;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* overflow: hidden; */
  }
  .grille_normalwife > .channel-user, .grille_normalwife::-webkit-scrollbar {
    grid-area: brunette;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* overflow: hidden; */
  }

/*.box {
  width: 40%;
  margin: 0 auto;
  background: rgba(255,255,255,0.2);
  padding: 35px;
  border: 2px solid #fff;
  border-radius: 20px/50px;
  background-clip: padding-box;
  text-align: center;
}*/

.popup_button {
  font-size: 1em;
  padding: 10px;
  color: #fff;
  border: 2px solid #06D85F;
  border-radius: 20px/50px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease-out;
}
.popup_button:hover {
  background: #06D85F;
}

.popup {
  margin: 70px auto;
  padding: 20px;
  background: #fff;
  border-radius: 5px;
  width: 30%;
  position: relative;
  transition: all 5s ease-in-out;
}

.popup h2 {
  margin-top: 0;
  font-family: Tahoma, Arial, sans-serif;
}
h2{
  color: #ff0000;
}
.popup .close {
  position: absolute;
  top: 20px;
  right: 30px;
  transition: all 200ms;
  font-size: 30px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}
.popup .close:hover {
  color: #06D85F;
}
.popup .content {
  max-height: 30%;
  overflow: auto;
}

  .popup_profile {
    background: #212121ec;
    border: 0.01em solid #06D85F;
    box-shadow: 0em 0em 0.5em #06D85F;
    color: white;
    padding: 100px;
    border-radius: 5px;
  }

  .popup_profile_infos {
    display: grid;
    grid-template-columns: repeat(2, 250px);
    grid-template-areas: 
      "photo username"
      "photo level";
    align-items: center;
    gap: 50px;
  }

  .popup_profile_infos > img {
    grid-area: photo;
  }

  .profile_username {
    grid-area: username;
  }

  .profile_level {
    grid-area: level;
    margin-bottom: 20px;
  }

  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 500ms;
    opacity: 1;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cover > img{
    height: auto;
    width: 250px;
    object-fit: cover;
  }
  .popup_button {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .popup_buttons > button{
    background: #212121BB;
    border: 0.1em solid #06D85F;
    box-shadow: 0em 0em 0.5em #06D85F;
    color: white;
    border-radius: 0.2em;
    font-size: 1em;
    transition: 0.5s ease-in-out;
  }
  .popup_buttons > button:hover{
    color: #06D85F;
    transition: 0.5s ease-in-out;
  }
  .clickable:hover {
    color: green;
    cursor: pointer;
    transition: 0.5s ease-in-out;
  }

  .userlist {
    display: flex;
    flex-direction: column;
    font-family: monospace;
    max-height: 50px;
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
