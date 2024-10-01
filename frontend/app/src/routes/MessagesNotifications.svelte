<script lang="ts">
  import { getContext } from "svelte";
  import { goto } from "$app/navigation";
  import Data from "./Store.js";

  export let message: any;

  let data: any;
  data = $Data

  const { notif_remover }: any = getContext("remover");

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }

  async function remove_request() {
    for (let i: number = 0; i < data.messages_notifications.length; i++) {
      if (data.messages_notifications[i].username == message.username) {
        notif_remover(i, "message");
      }
    }
  }

  async function read_request() {
    remove_request();
    data.goto_pm = message.for;
    sync_data(data);
    goto("/tchatte/douille");
  }

</script>

<div class="notif_card">
  <span>{message.username} sent you a message</span><br>
  <div class="buttons_container">
    <button on:click={() => read_request()} class="button accept">Read</button>
    <button on:click={() => remove_request()} class="button decline">Hide</button>
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
