<script>
  import Data from "./Store.js";

  let twofa_input = [];
  let data = $Data;

  async function send_twofa() {
    let ilmarchebientondeuxfamaintenanttocard = "";
    for (let i = 0; i < 6; i++) {
      ilmarchebientondeuxfamaintenanttocard = ilmarchebientondeuxfamaintenanttocard + twofa_input[i]
    }
    let req = await fetch(data.api + "/auth/2fa/enable", {
      method: "PUT",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({code: ilmarchebientondeuxfamaintenanttocard})
    });
    let res = await req.json();
    // console.log(res);
    req = await fetch(data.api + "/auth/2fa/status", {
      credentials: "include"
    });
    res = await req.json();
    if (res.verify) {
      data.twofa_popup = false;
      window.location.replace("/");
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
  }

  function input_manager(id, key) {
    if (id === 6 && key.key !== "Backspace") {
      send_twofa();
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
</script>

<div class="popup">
  <input id="0" type="text" bind:value={twofa_input[0]} on:keyup={(key) => { input_manager(1, key) } } maxlength="1" autofocus>
  <input id="1" type="text" bind:value={twofa_input[1]} on:keyup={(key) => { input_manager(2, key) } } maxlength="1">
  <input id="2" type="text" bind:value={twofa_input[2]} on:keyup={(key) => { input_manager(3, key) } } maxlength="1">
  <input id="3" type="text" bind:value={twofa_input[3]} on:keyup={(key) => { input_manager(4, key) } } maxlength="1">
  <input id="4" type="text" bind:value={twofa_input[4]} on:keyup={(key) => { input_manager(5, key) } } maxlength="1">
  <input id="5" type="text" bind:value={twofa_input[5]} on:keyup={(key) => { input_manager(6, key) } } maxlength="1">
  <!-- <button on:click={() => send_twofa()}>Activate 2FA</button> -->
</div>

<style>
  .popup{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 20px;
  }
  button, input {
    background: #212121BB;
    border: 0.1em solid red;
    box-shadow: 0em 0em 0.5em red;
    color: white;
    border-radius: 0.2em;
    font-size: 0.75em;
    transition: 0.5s ease-in-out;
  }
  input {
    max-width: 50px;
    min-height: 80px;
    font-size: 2em;
    text-align: center;
  }
  input:focus {
    color: red;
    outline: none;
  }
  button:hover {
    color: red;
    transition: 0.5s ease-in-out;
  }
</style>
