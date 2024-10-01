import * as THREE from 'three'
import Experience from '../Experience'
import type Physics from './Physics'
import type Resources from '../Utils/Resources'

export default class Ball
{
	private experience: Experience
	private scene: THREE.Scene
	private physics : Physics
	private resources: Resources

	parameters: {
		radius: number,
		widthSegments: number,
		heightSegments: number,
		speed: number,
	} = { radius: 0.25, widthSegments: 22, heightSegments: 16, speed: 5}

	private ballGeometry!: THREE.SphereGeometry
	private ballMaterial!: THREE.MeshMatcapMaterial
	private ballTexture!: THREE.Texture
	ballMesh: any
	private isWaiting: boolean = true

	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.physics = this.experience.world.physics
		this.resources = this.experience.resources

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
		if (!this.ballMesh && this.isWaiting)
		{
			setTimeout(() => {
				this.isWaiting = false;
			}, 3500)
		}
		if (!this.ballMesh && !this.isWaiting)
		{
			this.setBallMesh()
			this.physics.setBallBody()
		}
		else if(this,this.ballMesh)
		{
			if(this.physics.ballBody.position.y < 0.5)
			{
				this.physics.ballBody.velocity.normalize()
				this.physics.ballBody.velocity.scale(this.parameters.speed, this.physics.ballBody.velocity)
			}
			this.ballMesh.position.copy(this.physics.ballBody.position)
		}
	}
}