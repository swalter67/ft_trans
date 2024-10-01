<script lang="ts">
	import Data from "./Store.js";

	let data: any;
	data = $Data;

	let user = {
		username: "Not connected",
		level: "0%",
		img_src: "https://upload.wikimedia.org/wikipedia/commons/3/39/Jean_Todt_%28Official%29.png",
	};

	async function get_userdata() {
		if (data.connected == true) {
			let req: any = await fetch(data.api + "/user/me", {
				credentials: "include"
			});
			let res: any = await req.json();
			user = res;
		}
	}
</script>

{#await get_userdata()}
	<div class="card">
		<div class="left-side">
			<span>Not Connected</span>
		</div>
	</div>
{:then}
	<div class="card">
		<div class="left-side">
			<span>{user.username}</span>
			<span>{user.level}</span>
		</div>
			<!-- svelte-ignore a11y-missing-attribute -->
			<img src="{user.avatar_url}" width="400"/>
	</div>
{/await}

<style>
	.card {
		/*border: 0.2 solid royalblue;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		max-width: 15em;
		text-align: center;
		color: royalblue;
		color: royalblue;
		border: 0.1em solid royalblue;
		box-shadow: 0em 0em 0.9em royalblue;*/
		/*text-shadow: 0 0 5px #228dff,0 0 10px #228dff,0 0 10px #228dff,0 0 10px #228dff,0 0 10px #228dff,0 0 10px #228dff;*/
		position: relative;
	  	width: 150px;
 	 	max-width: 150px;
		text-align: center;
 		background: linear-gradient(0deg, #000, #272727);
 	 	/*max-height: 150px;*/
		padding: 20px;
 	 	display: flex;
 	 	flex-direction: row;
 	 	justify-content: space-between;
	}
	.card > img {
		height: 45px;
		width: auto;
	}
	.card:before, .card:after {
		content: '';
		position: absolute;
		left: -2px;
		top: -2px;
		background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00,#ffff00, #ff0000, #fb0094, 
			#0000ff, #00ff00,#ffff00, #ff0000);
		background-size: 400%;
		width: calc(100% + 4px);
		height: calc(100% + 4px);
		z-index: -1;
		animation: steam 20s linear infinite;
	}
	@keyframes steam {
	0% {
		background-position: 0 0;
	}
	50% {
		background-position: 400% 0;
	}
	100% {
		background-position: 0 0;
	}
	}
	.card:after {
	filter: blur(50px);
	}
	.left-side {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	.right-side {
		display: flex;
		width: 100%;
	}
	img {
		width: 30%;
		height: auto;
		max-height: 10em;
	}
</style>
