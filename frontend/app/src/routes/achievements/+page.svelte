<svelte:head>
  <link rel="stylesheet" href="fonts.css"  type = "text/css" />
</svelte:head>

<script lang="ts">
  import { onMount } from "svelte";
  import Data from "../Store.js";

  let data: any;
  data = $Data;

  let leaderboard_data: any;
  let user_data: any;
  let match_data: any;
  let achievements_data: any;
  let achievements_list: any = ["Hutchinson", "Starsky", "Testarossa", "Sonny Crockett", "Ricardo Teubs", "Thomas Magnum"];
  let achievements_img: any = [
   "https://i.ibb.co/LR2V1TW/hutchinson.png",
   "https://i.ibb.co/FY8QDr4/starsky.png",
   "https://i.ibb.co/Jq20P5P/testarossa.png",
   "https://i.ibb.co/sFSZXWp/Sonny.png",
   "https://i.ibb.co/rtTGJjH/Teubs.png",
   "https://i.ibb.co/4JqJnW6/magnum.png"
  ];
  let history_data: any;

  async function get_historydata() {
    let req: any = await fetch(data.api + "/stats/history", { credentials: "include" });
    let res: any = await req.json()
    history_data = res.reverse();

  }

  async function get_achievements() {
    let req: any = await fetch(data.api + "/stats/create2", { credentials: "include" }); // préservatif
    req = await fetch(data.api + "/stats/achiev", { credentials: "include" });
    achievements_data = await req.json();
  }

  async function get_matchdata() {
    match_data = {
      games_stats: {
        ecart_max: null,
        highest_exchange: null,
        max_rebond: null
      },
      winloose_stats: {}
    };
    let req: any = await fetch(data.api + "/stats/stat", { credentials: "include" }); // Random Stats
    let infos: any = await req.json();
    match_data.games_stats.ecart_max = infos[0];
    match_data.games_stats.highest_exchange = infos[1];
    match_data.games_stats.max_rebond = infos[2];
    req = await fetch(data.api + "/stats/stat2", { credentials: "include" }); // Win/Loose
    match_data.winloose_stats = await req.json();
  }

  async function get_leaderboard() {
    await get_userdata();
    let req: any = await fetch(data.api + "/stats/classement", { credentials: "include" });
    leaderboard_data = await req.json();
  }

  function sync_data(new_data: any) {
    Data.update(() => {
      return new_data;
    });
  }

  async function get_userdata() {
    let req: any = await fetch(data.api + "/user/me", { credentials: "include" });
    user_data = await req.json();
  }

  onMount(() => {
    data.current_page = "Leaderboard and Achievements";
    sync_data(data);
  })
</script>

<main>
  <div class="grid">
    <div class="stats">
      <span class="title">Match Stats</span>
      {#await get_matchdata()}
        <h2>Loading Match Stats</h2>
      {:then}
        {#await user_data}
        	<span>Loading Playtime</span>
        {:then} 
        	<span class="leadstats">Playtime : { Math.floor(user_data.play_time / 60000) } minutes</span>
        {/await}
        <span class="leadstats">Wins : {match_data.winloose_stats.matchesWon}</span>
        <span class="leadstats">Looses : {match_data.winloose_stats.matchesLost}</span>
        <span class="leadstats">Max Diff Score : {match_data.games_stats.ecart_max}</span>
        <span class="leadstats">Highest Exchange in one game : {match_data.games_stats.highest_exchange}</span>
        <span class="leadstats">Max Wallhits in one game : {match_data.games_stats.max_rebond}</span>
      {/await}
    </div>
    <div class="stats">
      <span class="title">Match History</span>
      {#await get_historydata()}
        	<span>Loading Match History</span>
      {:then}
        <div class="overflow">
          {#each history_data as history}
          <div class="history-span">{history.winnerIdF.username} {history.scoreWin} - {history.scoreLose} {history.looserOdF.username}</div>
          {/each}
        </div>
      {/await}
    </div>
    <div class="achievements">
      <span class="title">Achievements</span>
      {#await get_achievements()}
        <h2>Loading Achievements</h2>
      {:then}
        <div class="grid-achievements">
          {#each achievements_data as achievement, id}
            <div class="block">
              <span class="achievement-span">{achievement.pourcent}</span><img src={achievements_img[id]} style="filter: grayscale({100 - achievement.pourcent}%)">
            </div>
          {/each}
        </div>
      {/await}
    </div>
    <div class="leaderboard">
      <span class="title">Leaderboard</span>
      {#await get_leaderboard()}
        <h2>Loading leaderboard</h2>
      {:then}
      <div class="ol">
        <ol>
          {#each leaderboard_data as player}
            {#if user_data.username ==  player.username}
              <li class="me {player.medal}"><b>{player.username} (Level : {player.level})</b></li>
            {:else}
              <li class="other {player.medal}">{player.username} (Level : {player.level})</li>
            {/if}
          {/each}
        </ol>
        </div>
      {/await}
    </div>
  </div>
</main>

<style>
  main {
    margin: 30px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(250px, 250px));
    align-content: space-between;
    justify-content: space-around;
    gap: 100px;
    width: 100%;
    height: 50em;
  }
  .grid > div {
    border: 1px solid yellow;
  }
  .me, .other{
    margin-top: 0.55em;
  }
  .leaderboard, .achievements, .stats{
    border-bottom: 0.09em solid yellow;
    /* box-shadow: 0em 0em 0.5em yellow; */
    box-shadow:
        0 0 0.1vw 0.1vw #fff7f7,
        /* 0 0 0.5vw  0.2vw #e97272, */
        0 0 4vw  0.4vw yellow,
    

    inset 0 0 1.5vw  0.4vw yellow,
    /* inset 0 0 0.2vw  0.1vw #e97272, */
    inset 0.1vw 0.1vw 0.1vw 0.2vw #fff7f7;
    margin-top: 1.5em;
    border-radius: 0.1em;
    background: #212121BB;
    font-size: 1.25em;
    font-family: monospace;
    height: 22em;
    text-align: center;
    overflow: hidden;
  }
  .ol{
    font-size: 1em;
    font-family: monospace;
    height: 18em;
    text-align: center;
    overflow-y: scroll;
    scrollbar-width: none;
    margin-left: 2em;
  }
  .leaderboard > ::-webkit-scrollbar{
    height: 0;
    width: 0;
  }
  .overflow{
    overflow-y: scroll;
    scrollbar-width: none;
  }
  .overflow > ::-webkit-scrollbar{
    height: 0;
    width: 0;
  }
  .title{
    display: flex;
    text-align: center;
    flex-direction: column;
    gap: 0.9em;
    /* box-shadow: 0em 0em 0.5em yellow; */
    border-bottom: 0.1em solid yellow;
    font-family: "retro";
    font-size: 1em;
    margin-top: 1em;
  }
  .leadstats{
    text-align: center;
    word-wrap: anywhere;
    font-size: 1.2em;
    margin-top: 1.15em;
  }
  .PLATINIUM {
    color: royalblue;
  }
  .GOLD {
    color: gold;
  }
  .ARGENT {
    color: silver;
  }
  .stats {
    display: flex;
    flex-direction: column;
  }
  .history {
    display: flex;
    flex-direction: column;
  }
  .grid-achievements {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 35px;
  }
  .block {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .block > img{
    max-width: 80px;
    height: auto;
  }
  .block > span {
    font-size: 30px;
    font-family: neon;
  }

  .history {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .overflow {
    overflow: scroll;
    margin-top: 5px;
    margin-bottom: 10px;
  }
  .overflow::-webkit-scrollbar {
    height: 0;
    width: 0;
    color: transparent;
  }

  /* .history_span{

  } */
</style>
