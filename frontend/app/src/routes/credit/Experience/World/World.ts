import type * as THREE from 'three'
import Experience from '../Experience'
import Environment from './Environment'
import type Resources from '../Utils/Resources'
import Floor from './Floor'
import FloorLine from './FloorLine'
import ScorePanel from './ScorePanel'
import Galaxie from './Galaxie'
import Physics from './Physics'
import Ball from './Ball'
import Wall from './Wall'
import Credits from './Credits'

export default class World
{
	private experience: Experience
	private scene: THREE.Scene
	private resources: Resources
	private ready: Boolean

	physics!: Physics
	galaxie!: Galaxie
	floor!: Floor
	scorePanel!: ScorePanel
	floorLine!: FloorLine
	ball!: Ball
	wall!: Wall
	credits!: Credits

	private environment!: Environment

	constructor()
	{
		this.ready = false
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.physics = new Physics()

		this.resources.on('loaded', () =>
		{
			// Setup
			this.floor = new Floor()
			this.galaxie = new Galaxie()
			this.floorLine = new FloorLine()
			this.wall = new Wall()
			this.scorePanel = new ScorePanel()
			this.ball = new Ball()
			this.credits = new Credits()
			this.environment = new Environment()
			this.ready = true
		})
		this.resources.on('music', () =>
		{
		    this.resources.items.music.setLoop(true).play()
		})
	}

	update()
	{
		if(this.ready && this.credits)
		{
			this.galaxie.update()
			this.scorePanel.update()
			this.ball.update()
			this.wall.update()
			this.credits.update()
		}
	}
}