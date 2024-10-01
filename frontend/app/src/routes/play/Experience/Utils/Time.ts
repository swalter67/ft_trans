import * as THREE from 'three'
import EventEmitter from "./EventEmitter"
import Experience from '../Experience'
// import Physics from '../World/Physics'

export default class Time extends EventEmitter
{
	private clock: THREE.Clock
	private oldElapsedTime: number
	elapsedTime: number
	deltaTime: number

	private experience: Experience
	// private physics: Physics

	constructor()
	{
		super()
		this.experience = new Experience()
		// this.physics = this.experience.world.physics

		// Setup
		this.clock = new THREE.Clock()
		this.oldElapsedTime = 0

		// Tick event
		window.requestAnimationFrame(() =>
		{
			this.tick()
		})
	}

	tick()
	{
		// Update value
		this.elapsedTime = this.clock.getElapsedTime()
		this.deltaTime = this.elapsedTime - this.oldElapsedTime
		this.oldElapsedTime = this.elapsedTime

		// Physics
		// this.physics.world.step(1 / 60, this.deltaTime, 3)
		// this.physics.world.step(1 / 60, 100000, 1)

		// EventEmitter
		this.trigger('tick')

		// Tick event
		window.requestAnimationFrame(() =>
		{
			this.tick()
		})
	}
}