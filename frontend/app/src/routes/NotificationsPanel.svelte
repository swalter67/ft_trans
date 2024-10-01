<script lang="ts">
  import Data from "./Store.js";
  import FriendsNotifications from "./FriendsNotifications.svelte";
  import GamesNotifications from "./GamesNotifications.svelte";
  import MessagesNotifications from "./MessagesNotifications.svelte";
  import { onMount, setContext } from "svelte";

  let data: any;
  data = $Data;

  let has_friends: any;
  let has_games: any;
  let has_messages: any;

  setContext("remover", { notif_remover });

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }

  function notif_remover(id: any, list: any) {
    switch(list) {
      case "friend":
        data.friends_notifications.splice(id, 1);
        data.friends_notifications = data.friends_notifications;
        break;
      case "game":
        data.games_notifications.splice(id, 1);
        data.games_notifications = data.games_notifications;
        break;
      case "message":
        data.messages_notifications.splice(id, 1);
        data.messages_notifications = data.messages_notifications;
        break;
    }
    sync_data(data);
  }

  function check_friendslist() {
    if (data.friends_notifications.length > 0)
      return true;
    return false;
  }

  function check_gameslist() {
    if (data.games_notifications.length > 0)
      return true;
    return false;
  }

  function check_messageslist() {
    if (data.messages_notifications.length > 0)
      return true;
    return false;
  }

  onMount(() => {
    has_friends = check_friendslist();
    has_games = check_gameslist();
    has_messages = check_messageslist();
    // console.log(data.friends_notifications);
  })
</script>

<main class="notif_popup">
  {#if has_friends}
    {#each data.friends_notifications as friend}
      <FriendsNotifications {friend}/>
    {/each}
  {/if}
  {#if has_games}
    {#each data.games_notifications as game}
      <GamesNotifications {game}/>
    {/each}
  {/if}
  {#if has_messages}
    {#each data.messages_notifications as message}
      <MessagesNotifications {message}/>
    {/each}
  {/if}
</main>

<style>
  .notif_popup{
    background: #212121BB;
    text-align: left;
    position: absolute;
    font-size: 1em;
    top: 10vh; left: 87.5vw;
    box-shadow: 0em 0em 0.4em royalblue;
    border: 0.01em solid royalblue;
    border-radius: 0.5em;
    transition: 0.5s ease-in-out;
}

</style>
