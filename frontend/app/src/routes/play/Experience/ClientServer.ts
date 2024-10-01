import EventEmitter from "./Utils/EventEmitter"
import type { Socket } from "socket.io-client"
import * as CANNON from 'cannon-es'
import { get } from "svelte/store"
import Data from "../../Store.js"

interface MyEvents {
	messageDuServeur: (data: string) => void
	info: (data: ElementPhysics, sound: string) => void
    infoPlayer: (dataLeft: player, dataRight: player) => void
    infoPlayerRight: (data: player) => void
    infoBallPosition: (data: CANNON.Vec3) => void
    infoBallVelocity: (data: CANNON.Vec3) => void
	playerInput: (data: string) => void
	launchGame: () => void
	screenEvent: (data: string, sound?: string) => void 
	endScreenEvent: (sound?: string) => void
	ready: () => void
}

interface player
{
    name: string
    score: number
    pause: boolean
    disconnect: boolean
	disconnectTimer?: NodeJS.Timeout
	win: boolean
}

interface ElementPhysics
{
	newBall: boolean
	ballPosition: any
	ballVelocity: any
	leftPaddlePosition: any
	rightPaddlePosition: any
}

export default class Server extends EventEmitter
{
	socket: Socket<MyEvents, MyEvents>

	gameState:
	{
		isStart: boolean
		playerLeft: player
		playerRight: player
		elements: ElementPhysics
		sceenEvents: string | undefined
		sound: string | undefined
	} = {
		isStart: false,
		playerLeft: {
			name: 'wait Player',
			score: 0,
			pause: false,
			disconnect: false,
			win: false
		},
		playerRight: {
			name: 'wait Player',
			score: 0,
			pause: false,
			disconnect: false,
			win: false
		},
		elements: {
			newBall: false,
			ballPosition: new CANNON.Vec3(),
			ballVelocity: new CANNON.Vec3(),
			leftPaddlePosition: new CANNON.Vec3(),
			rightPaddlePosition: new CANNON.Vec3(),
		},
		sceenEvents: undefined,
		sound: 'none'
	}
	
	constructor()
	{
		super()
  	  	const data: any = get(Data);
   		 this.socket = data.games_socket;
		this.eventConnection()
		this.messageServer()
		this.infoServer()
		this.eventServer()
	}

	eventConnection()
	{
		this.socket.on("connect", () =>
		{
			// console.log('Connecté au serveur')
		})
	}

	messageServer()
	{
		this.socket.on("messageDuServeur", (message) =>
		{
			// console.log("Message du serveur: ", message)
		})
	}

	infoServer()
	{
		this.socket.on("info", (data, sound) =>
		{
			this.gameState.elements = data;
			if (sound !== null && sound !== undefined && sound !== 'none')
				this.gameState.sound = sound;
		})

		this.socket.on("infoPlayer", (dataLeft, dataRight) => {
			this.gameState.playerLeft = dataLeft
			this.gameState.playerRight = dataRight
			// console.log('> INFO Player COUCOU')
			// if (this.gameState.playerLeft.pause || this.gameState.playerRight.pause)
			// {
			// 	if(this.gameState.playerLeft.pause)
			// 		// console.log('Jeu en Pause : left')
			// 	if(this.gameState.playerRight.pause)
			// 		// console.log('Jeu en Pause : right') 
			// }
			this.trigger('score')
		})

		this.socket.on("infoBallPosition", (data) => {
			this.gameState.elements.ballPosition = data
		})

		this.socket.on("infoBallVelocity", (data) => {
			this.gameState.elements.ballVelocity = data
		})
	}

	eventServer()
	{
		this.socket.on('launchGame', () =>
		{
			this.trigger('launchGame')
		})

		this.socket.on('screenEvent', (message, sound) =>
		{
			this.gameState.sceenEvents = message
			this.gameState.sound = sound
			// console.log(this.gameState.sceenEvents)
			this.trigger('screenEvent')
			if (sound)
				this.trigger('sound')
		})

		this.socket.on('endScreenEvent', (sound) =>
		{
			// console.log('endScreenEvent')
			this.gameState.sceenEvents = undefined
			
			this.gameState.sound = sound
			if(sound)
				this.trigger('sound')
		})
	}
}
