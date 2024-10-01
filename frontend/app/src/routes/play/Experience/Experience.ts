import * as THREE from 'three'
import Sizes from './Utils/Sizes'
import Time from './Utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World/World'
import Resources from './Utils/Resources'
import sources from './sources'
import Debug from './Utils/Debug'
import Server from './ClientServer'

let instance: Experience | null = null

export default class Experience
{
	canvas!: HTMLCanvasElement
	debug!: Debug
	sizes!: Sizes
	time!: Time
	scene!: THREE.Scene
	resources!: Resources
	server!: Server
	camera!: Camera
	renderer!: Renderer
	world!: World
	audioListerner!: THREE.AudioListener

	constructor(canvas:HTMLCanvasElement | null)
	{
		// Singleton
		if (instance)
			return instance
		instance = this

	//	console.log(canvas);
		// Options
		if (!canvas) { return }
		this.canvas = canvas
		
		// Setup
		this.debug = new Debug()
		this.sizes = new Sizes()
		this.scene = new THREE.Scene()
		this.audioListerner = new THREE.AudioListener();
		this.resources = new Resources(sources)
		this.server = new Server()
		this.camera = new Camera()
		this.renderer = new Renderer()
		this.world = new World()
		this.time = new Time()

		// Sizes resize event
		this.sizes.on('resize', () =>
		{
			this.resize()
		})

		// Time tick event
		this.time.on('tick', () =>
		{
			this.update()
		})
	}

	resize() 
	{
		this.camera.resize()
		this.renderer.resize()
	}

	update()
	{
		this.world.update()
		this.renderer.update()
		//this.camera.update()	
	}
}
