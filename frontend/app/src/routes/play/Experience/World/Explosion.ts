import * as THREE from 'three'
import Experience from '../Experience'
import type Server from '../ClientServer'
import type Resources from '../Utils/Resources'
import type World from './World'
import type Ball from './Ball'
import type Time from '../Utils/Time'
// import Physics from './Physics'

export default class Explosion
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	private resources : Resources
	private world: World
	private ball: Ball
	private time: Time
	// private physics: Physics

	// Parameters
	parameters: {
		count: number,
		radius: number,
		sizeParticles: number,
		explosionStartTime: number | null,
		directions: Float32Array | null,
		positions: Float32Array | null,
		color: Float32Array | null,
	} = {	count: 500,
			radius: 0.25,
			sizeParticles: 0.5,
			explosionStartTime: null,
			directions: null,
			positions: null,
			color: null
		}

	// explosion THREE.Points
	private particlesGeometry!: THREE.BufferGeometry
	private particlesMaterial!: THREE.PointsMaterial
	private particles!: THREE.Points

	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.world = this.experience.world
		this.ball = this.world.ball
		this.time = this.experience.time
		// this.physics = this.experience.world.physics
	}

	setExplosion()
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
		this.parameters.directions = new Float32Array(this.parameters.count * 3);
		this.parameters.positions = new Float32Array(this.parameters.count * 3)
		this.parameters.color = new Float32Array(this.parameters.count * 3)

		// Positions and Colors
		for (let i3 = 0; i3 < this.parameters.count * 3; i3 += 3)
		{
			let theta = Math.random() * 2 * Math.PI
			let phi = Math.acos(2 * Math.random() - 1)
			
			this.parameters.positions[i3] = this.parameters.radius * Math.sin(phi) * Math.cos(theta) + this.server.gameState.elements.ballPosition.x
			this.parameters.positions[i3 + 1] = this.parameters.radius * Math.sin(phi) * Math.sin(theta) + this.server.gameState.elements.ballPosition.y
			this.parameters.positions[i3 + 2] = this.parameters.radius * Math.cos(phi) + this.server.gameState.elements.ballPosition.z
			this.parameters.directions[i3] = this.parameters.positions[i3] - this.server.gameState.elements.ballPosition.x
    		this.parameters.directions[i3 + 1] = this.parameters.positions[i3 + 1] - this.server.gameState.elements.ballPosition.y
    		this.parameters.directions[i3 + 2] = this.parameters.positions[i3 + 2] - this.server.gameState.elements.ballPosition.z
			this.parameters.color[i3] = 0xffffff
			this.parameters.color[i3 + 1] = 0xffffff
			this.parameters.color[i3 + 2] = 0xffffff
		}

		this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.parameters.positions, 3))
		this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(this.parameters.color, 3))
		
		// Material
		this.particlesMaterial = new THREE.PointsMaterial({
			vertexColors: true,
			map: this.resources.items.explosionTexture,
			size: this.parameters.sizeParticles,
			sizeAttenuation: true,
			transparent: true, // Cree un probleme avec la transparence du terrain
			alphaMap: this.resources.items.explosionTexture,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		})
		
		// Galaxy Points
		this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial)
		this.scene.add(this.particles)

	}

	explosion()
	{
		let elapsed = (this.time.elapsedTime - this.parameters.explosionStartTime!)
		if (elapsed < 1)
		{
			let speed = 12
			for (let i3 = 0; i3 < this.parameters.count * 3; i3 += 3)
			{
				this.parameters.positions![i3] += this.parameters.directions![i3] * speed * elapsed
				this.parameters.positions![i3 + 1] += this.parameters.directions![i3 + 1] * speed * elapsed
				this.parameters.positions![i3 + 2] += this.parameters.directions![i3 + 2] * speed * elapsed
			}
			this.particlesGeometry.attributes.position.needsUpdate = true
		} 
		else
		{
			this.parameters.explosionStartTime = null
			this.scene.remove(this.particles)
		}
	}

	update()
	{
		if(this.ball.ballMesh && this.ball.ballMesh.position.y < - 1.9)
		{
			if(this.parameters.explosionStartTime === null)
			{
				this.setExplosion();
				this.parameters.explosionStartTime = this.time.elapsedTime
			}
		}
		if (this.parameters.explosionStartTime !== null)
		this.explosion()
	}
}