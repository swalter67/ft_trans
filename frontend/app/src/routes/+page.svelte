<script lang="ts">
  import { onMount } from "svelte"
  import Data from "./Store.js"
    
  let data: any;
  data = $Data;

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }
  onMount(() => {
    data.current_page = "Home";
    sync_data(data);
  });
</script>

<main>
  <div class="menu">
    <a href="/play"><div class="menu-elem couleur-bleu">PLAY</div></a>
    <a href="/achievements"><div class="menu-elem couleur-jaune">LEADERBOARD & ACHIEVEMENT</div></a>
    <a href="/tchatte"><div class="menu-elem couleur-vert">CHAT</div></a>
    <a href="/profile"><div class="menu-elem couleur-rouge">MY ACCOUNT</div></a>
    <a href="/credit"><div class="menu-elem couleur-violet">CREDIT</div></a>
  </div>
</main>

<style>
    .menu {
        margin-top: 0.5em;
    display: grid;
    grid-template-rows: repeat(auto-fill, minmax(150px, 1fr));
    justify-content: space-around;
    align-items: space-between;
    }
    a {
        max-width: 42.5em;
        text-decoration: none;
    }
    .menu-elem {
        border: 0.1em solid white;
        font-size: 2.5em;
        text-align: center;
        padding: 10%;
        background: #212121BB;
        color: white;
        margin-top: 0.4em;
        border-radius: 0.3em;
        transition: 0.5s ease-in-out;
        font-family: 'neon';
    }
    .menu-elem:hover {
        color: white;
        transition: 0.5s ease-in-out;
    }
    .couleur-bleu{
        color: rgba(255, 255, 255, 0.5);
        border: 0.01em solid royalblue;
        /* box-shadow: 0em 0em 0.4em royalblue; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #228dff,
    
        inset 0 0 1.5vw  0.4vw #228dff,
        /* inset 0 0 0.2vw  0.1vw #e97272, */
        inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
        text-shadow: 0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff,0 0 0.2em #228dff;
    }
    .couleur-jaune{
        color: rgba(255, 255, 255, 0.5);
        border: 0.01em solid #fff700b0;
        /* box-shadow: 0em 0em 0.4em #fff700b0; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #fff700b0,
    
        inset 0 0 1.5vw  0.4vw #fff700b0,
        /* inset 0 0 0.2vw  0.1vw #e97272, */
        inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
        text-shadow: 0 0 0.2em #fff700b0,0 0 0.2em #fff700b0,0 0 0.2em #fff700b0,0 0 0.2em #fff700b0,0 0 0.01em #fff700b0,0 0 0.01em #fff700b0;

    }
    .couleur-vert{
        color: rgba(255, 255, 255, 0.5);
        border: 0.01em solid green;
        /* box-shadow: 0em 0em 0.4em green; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #00ff00,
    
        inset 0 0 1.5vw  0.4vw #00ff00,
        /* inset 0 0 0.2vw  0.1vw #e97272, */
        inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
        text-shadow: 0 0 0.2em #00ff00,0 0 0.2em #00ff00,0 0 0.2em #00ff00,0 0 0.2em #00ff00,0 0 0.01em #00ff00,0 0 0.01em #00ff00;
    }
    .couleur-rouge{
        color: rgba(255, 255, 255, 0.5);
        border: 0.01em solid red;
        /* box-shadow: 0em 0em 0.4em red; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #e50b0b,
    
        inset 0 0 1.5vw  0.4vw #e50b0b,
        /* inset 0 0 0.2vw  0.1vw #e97272, */
        inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
        text-shadow: 0 0 0.2em #ff0000,0 0 0.2em #ff0000,0 0 0.2em #ff0000,0 0 0.2em #ff0000,0 0 0.2em #ff0000,0 0 0.2em #ff0000;
    }
    .couleur-violet{
        color: rgba(255, 255, 255, 0.5);
        border: 0.01em solid violet;
        /* box-shadow: 0em 0em 0.4em violet; */
        box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw #ea00ff,
    
        inset 0 0 1.5vw  0.4vw #ea00ff,
        /* inset 0 0 0.2vw  0.1vw #e97272, */
        inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
        text-shadow: 0 0 0.2em #ea00ff,0 0 0.2em #ea00ff,0 0 0.2em #ea00ff,0 0 0.2em #ea00ff,0 0 0.2em #ea00ff,0 0 0.2em #ea00ff;
    }
    .couleur-bleu:hover{
        box-shadow: 0em 0em 1em royalblue;
    }
    .couleur-jaune:hover{
        box-shadow: 0em 0em 1em #fff700b0;
    }
    .couleur-vert:hover{
        box-shadow: 0em 0em 1em green;
    }
    .couleur-rouge:hover{
        box-shadow: 0em 0em 1em red;
    }
    .couleur-violet:hover{
        box-shadow: 0em 0em 1em violet;
    }
</style>
