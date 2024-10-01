import type * as THREE from 'three'
import Experience from '../Experience'
import Environment from './Environment'
import type Resources from '../Utils/Resources'
import Floor from './Floor'
import FloorLine from './FloorLine'
import ScorePanel from './ScorePanel'
import Paddles from './Paddles'
import Galaxie from './Galaxie'
import Ball from './Ball'
import Explosion from './Explosion'
import Wall from './Wall'
import ScreenEvent from './ScreenEvent'
import Sound from './Sound'

export default class World
{
	private experience: Experience
	private scene: THREE.Scene
	private resources: Resources
	private ready: Boolean

	galaxie!: Galaxie
	floor!: Floor
	scorePanel!: ScorePanel
	screenEvent!: ScreenEvent
	floorLine!: FloorLine
	paddles!: Paddles
	ball!: Ball
	explosion!: Explosion
	wall!: Wall
	sound!: Sound

	private environment!: Environment

	constructor()
	{
		this.ready = false
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.sound = new Sound()

		this.resources.on('loaded', async () =>
		{
			// Setup
			this.galaxie = new Galaxie()
			this.floor = new Floor()
			this.floorLine = new FloorLine()
			this.wall = new Wall()
			this.screenEvent = new ScreenEvent()
			this.scorePanel = new ScorePanel()
			if (this.resources.items.waiting)
				this.resources.items.waiting.setLoop(true).play()
			this.experience.server.socket.emit('ready')
		})

		this.experience.server.on('launchGame', () =>
		{
			if (!this.ready)
			{
				if (this.resources.items.waiting)
					this.resources.items.waiting.pause()
				this.paddles = new Paddles()
				this.ball = new Ball()
				this.explosion = new Explosion()
				this.environment = new Environment()
				this.ready = true
			}
		})
	}

	update()
	{
		if (this.galaxie)
			this.galaxie.update()
		if (this.screenEvent)
			this.screenEvent.update()
		if (this.scorePanel)
			this.scorePanel.update()
		if (this.ready)// && !this.experience.server.gameState.playerLeft.pause && !this.experience.server.gameState.playerRight.pause)
		{
			this.ball.update()
			this.paddles.update()
			if (this.wall)
				this.wall.update()
			this.explosion.update()
		}
	}
}