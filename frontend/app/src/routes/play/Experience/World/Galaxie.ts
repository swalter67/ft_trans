import * as THREE from 'three'
import Experience from '../Experience'
import Resources from '../Utils/Resources'
import Camera from '../Camera'
import Time from '../Utils/Time'
import GUI from 'lil-gui'
import Debug from '../Utils/Debug'

export default class Galaxie
{
	private experience: Experience
	private scene: THREE.Scene
	private resources : Resources
	private camera: Camera
	private time: Time

	// Parameters
	parameters: {
		count: number,
		sizeGalaxy: number,
		sizeParticles: number,
		positions: Float32Array | null,
		colors: Float32Array | null
	} = {count: 3333 * 3, sizeGalaxy: 100, sizeParticles: 0.8, positions: null, colors: null}
	
	// Debug
	private gui: Debug
	private debugFolder: GUI

	// Galaxy THREE.Points
	private particlesGeometry!: THREE.BufferGeometry
	private particlesMaterial!: THREE.PointsMaterial
	private particles!: THREE.Points

	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.camera = this.experience.camera
		this.time = this.experience.time
		this.gui = this.experience.debug

		// Debug
		if (this.gui.isActive)
		{
			this.debugFolder = this.gui.ui.addFolder("Galaxy")
			this.debug()
		}

		// Setup
		this.generateGalaxy()
	}

	private generateGalaxy()
	{
		// Reset For debug
		if (this.particles)
		{
			this.particlesGeometry.dispose()
			this.particlesMaterial.dispose()
			this.scene.remove(this.particles)
		}
		
		// Initialisation
		this.particlesGeometry = new THREE.BufferGeometry()
		this.parameters.positions = new Float32Array(this.parameters.count * 3)
		this.parameters.colors = new Float32Array(this.parameters.count * 3)

		// Positions and Colors
		for (let i = 0; i < this.parameters.count * 3; i++)
		{
			const random = Math.random()
			this.parameters.positions[i] = (random - 0.5) * this.parameters.sizeGalaxy 
			this.parameters.colors[i] = random - 0.3
		}
		const protect = this.camera.positionZ + 1
		for (let i3 = 0; i3 < this.parameters.count * 3; i3 += 3)
		{
			if (this.parameters.positions[i3] < protect
				&& this.parameters.positions[i3 + 1] < protect
				&& this.parameters.positions[i3 + 2] < protect
				&& this.parameters.positions[i3] > -protect
				&& this.parameters.positions[i3 + 1] > -protect
				&& this.parameters.positions[i3 + 2] > -protect
				)
			{
				this.parameters.positions[i3] = this.parameters.positions[i3] > 0 ? this.parameters.positions[i3] + protect : this.parameters.positions[i3] - protect
				this.parameters.positions[i3 + 1] = this.parameters.positions[i3 + 1] > 0 ? this.parameters.positions[i3 + 1] + protect : this.parameters.positions[i3 + 1] - protect
				this.parameters.positions[i3 + 2] = this.parameters.positions[i3 + 2] > 0 ? this.parameters.positions[i3 + 2] + protect : this.parameters.positions[i3 + 2] - protect
			}
		}
		this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.parameters.positions, 3))
		this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(this.parameters.colors, 3))
		
		// Material
		this.particlesMaterial = new THREE.PointsMaterial({
			vertexColors: true,
			map: this.resources.items.particlesTexture,
			size: this.parameters.sizeParticles,
			sizeAttenuation: true,
			transparent: true, // Cree un probleme avec la transparence du terrain
			alphaMap: this.resources.items.particlesTexture,
			blending: THREE.AdditiveBlending,
    		depthWrite: false // fixe alpha,
		})
		
		// Galaxy Points
		this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)
		this.scene.add(this.particles)
	}

	private setAnimation()
	{
		this.particles.rotation.x += this.time.deltaTime / 80
		this.particles.rotation.y += this.time.deltaTime / 50
		this.particles.rotation.z += this.time.deltaTime / 80
	}

	update()
	{
		this.setAnimation()
	}

	private debug()
	{
		this.debugFolder.add(this.parameters, 'count')
			.min(0)
			.max(30000)
			.step(30)
			.onFinishChange(() => this.generateGalaxy())
		this.debugFolder.add(this.parameters, 'sizeGalaxy')
			.min(0)
			.max(500)
			.step(10)
			.onFinishChange(() => this.generateGalaxy())
		this.debugFolder.add(this.parameters, 'sizeParticles')
			.min(0.1)
			.max(2)
			.step(0.1)
			.onFinishChange(() => this.generateGalaxy())
	}
}