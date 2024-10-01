<script lang="ts">
  import { getContext } from "svelte";
  import Data from "./Store.js";

  export let friend: any;

  const { notif_remover }: any = getContext("remover")

  let data: any;
  data = $Data;

  async function accept_request() {
    friend.answer = "accept";
    await fetch(data.api + "/user/friend/answer", {
      method: "PUT",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(friend)
    });
    for (let i: number = 0; i < data.friends_notifications.length; i++) {
      if (data.friends_notifications[i].username == friend.username) {
        notif_remover(i, "friend");
      }
    }
  }

  async function decline_request() {
    friend.answer = "decline";
    await fetch(data.api + "/user/friend/answer", {
      method: "PUT",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(friend)
    });
    for (let i = 0; i < data.friends_notifications.length; i++) {
      if (data.friends_notifications[i].username == friend.username) {
        notif_remover(i, "friend");
      }
    }
  }
</script>

<div class="notif_card">
  <span>{friend.username} sent you a friend request</span>
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
