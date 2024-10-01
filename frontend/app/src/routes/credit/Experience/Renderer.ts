import * as THREE from 'three'
import Experience from "./Experience";
import Sizes from './Utils/Sizes';
import Camera from './Camera';

export default class Renderer
{
	private experience: Experience
	private canvas: HTMLCanvasElement | undefined
	private sizes: Sizes
	private scene: THREE.Scene
	private camera: Camera
	private instance!: THREE.WebGLRenderer

	constructor()
	{
		// Setup
		this.experience = new Experience(null)
		this.canvas = this.experience.canvas
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.camera = this.experience.camera

		// Set
		this.setInstance()
	}

	private setInstance()
	{
		this.instance = new THREE.WebGLRenderer
		({
			canvas: this.canvas,
			antialias: true
		})
		this.instance.toneMapping = THREE.CineonToneMapping
		this.instance.toneMappingExposure = 1.75
		this.instance.shadowMap.enabled = true
		this.instance.shadowMap.type = THREE.PCFSoftShadowMap
		this.instance.setClearColor('#191620')
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}
	
	resize()
	{
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
	}

	update()
	{
		this.instance.render(this.scene, this.camera.instance)
	}
}