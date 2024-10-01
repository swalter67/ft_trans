import * as THREE from 'three'
import Experience from '../Experience'
import type Server from '../ClientServer'
import type Resources from '../Utils/Resources'
import type ScorePanel from './ScorePanel'

export default class Ball
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	private resources: Resources
	private scorePanel: ScorePanel

	parameters: {
		radius: number,
		widthSegments: number,
		heightSegments: number,
		speed: number,
	} = { radius: 0.25, widthSegments: 22, heightSegments: 16, speed: 6}

	private ballGeometry!: THREE.SphereGeometry
	private ballMaterial!: THREE.MeshMatcapMaterial
	private ballTexture!: THREE.Texture
	ballMesh: any

	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.scorePanel = this.experience.world.scorePanel

		// Setup
		this.setBallGeometry()
		this.setTexture()
		this.setBallMaterial()
	}

	private setBallGeometry()
	{
		this.ballGeometry = new THREE.SphereGeometry(
			this.parameters.radius,
			this.parameters.widthSegments,
			this.parameters.heightSegments
		)
	}
	
	private setTexture()
	{
		this.ballTexture = this.resources.items.ballTexture
	}

	private setBallMaterial()
	{
		this.ballMaterial = new THREE.MeshMatcapMaterial({
			matcap: this.ballTexture
		})
		this.ballMaterial.needsUpdate = true
	}

	private setBallMesh()
	{
		this.ballMesh = new THREE.Mesh(this.ballGeometry, this.ballMaterial)
		this.ballMesh.position.set(0, 9, 0)
		this.ballMesh.castShadow = true
		this.scene.add(this.ballMesh)
	}

	update()
	{
		if (!this.ballMesh && this.server.gameState.elements.newBall)
		{
			this.setBallMesh()
			this.server.gameState.elements.newBall = false
		}
		else if(this.ballMesh)
		{
			this.ballMesh.position.copy(this.server.gameState.elements.ballPosition)
			if (this.server.gameState.elements.ballPosition.y < - 2)
			{
				this.scene.remove(this.ballMesh)
				this.ballMesh.geometry.dispose()
				this.ballMesh = undefined
			}
			if (this.server.gameState.sound &&
					this.resources.items[this.server.gameState.sound] &&
					!this.resources.items[this.server.gameState.sound].isPlaying &&
					this.server.gameState.sound !== 'none') {
			 			this.resources.items[this.server.gameState.sound].play()
			 			this.server.gameState.sound = 'none';
			}
		}
	}
}