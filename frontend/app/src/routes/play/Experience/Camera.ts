import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Experience from './Experience'
import type Sizes from './Utils/Sizes'

export default class Camera
{
	private experience: Experience
	private scene: THREE.Scene
	private sizes: Sizes
	private canvas: HTMLCanvasElement | undefined
	instance!: THREE.PerspectiveCamera
	private controls!: OrbitControls

	// Parameters
	private fov: number = 25
	private near: number = 0.1
	private far: number = 120
	private positionX: number = 0
	private positionY: number = 26
	positionZ: number = 16

	constructor()
	{
		// Setup
		this.experience = new Experience(null)
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.canvas = this.experience.canvas

		// Set
		this.setInstance()
		this.setOrbitControl()
	}

	private setInstance()
	{
		// Set Camera
		this.instance = new THREE.PerspectiveCamera(
			this.fov,
			this.sizes.width / this.sizes.height,
			this.near,
			this.far
		)
		this.instance.position.set(
			this.positionX,
			this.positionY,
			this.positionZ
		)
		this.instance.lookAt(0, 0, 0)
		this.scene.add(this.instance)

	}

	private setOrbitControl()
	{
		this.controls = new OrbitControls(this.instance, this.canvas)
		this.controls.enableDamping = true
	}

	resize()
	{
		this.instance.aspect = this.sizes.width / this.sizes.height
		this.instance.updateProjectionMatrix()
	}

	update()
	{
		this.controls.update()
	}
}