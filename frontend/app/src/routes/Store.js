import { writable } from 'svelte/store';
import { PUBLIC_HOST_BACK } from '$env/static/public'
import { PUBLIC_PORT_BACK } from '$env/static/public'

const Data = writable({
	api: `http://${PUBLIC_HOST_BACK}:${PUBLIC_PORT_BACK}`,
  //api: "http://50n2g.com:3000",
  connected: true,
  current_page: "Home",
  cookie: null,
  imgbb: "fadd7edc07f9b8daf6ed7a43338aeebe",
  twofa_popup: false,
  notif_panel_open: false,
  notifications_socket: null,
  chat_socket: null,
  games_socket: null,
  friends_notifications: [],
  games_notifications: [],
  messages_notifications: [],
  goto_pm: null,
  goto_pg: null,
  pg_demerde: null,
});

export default Data;
