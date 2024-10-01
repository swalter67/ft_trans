import * as THREE from 'three'
import Experience from '../Experience'

export default class Floor
{
	private experience: Experience
	private scene: THREE.Scene

	// Floor
	parameters: {
		width: number
		height: number,
		depth: number
	} = {width: 18, height: 9, depth: 0.25}

	private floorGeometry!: THREE.BoxGeometry
	private floorMaterial!: THREE.MeshStandardMaterial
	floor!: THREE.Mesh

	// Middle Line
	private middleLineGeometry!: THREE.PlaneGeometry
	private middleLineMaterial!: THREE.MeshStandardMaterial
	private middleLines: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[] = [];
	private middleLine!: THREE.Mesh


	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene

		// Setup
		this.setFloor()
		this.setMidlleLine()
	}

	private setFloor()
	{
		// Reset for debug
		if (this.floor)
		{
			this.floorGeometry.dispose()
			this.floorMaterial.dispose()
			this.scene.remove(this.floor)
		}

		// Geometry
		this.floorGeometry = new THREE.BoxGeometry(this.parameters.width, this.parameters.height, this.parameters.depth)

		// Material
		this.floorMaterial = new THREE.MeshStandardMaterial({
			color: 0x1f1f2a,
			depthWrite: false,
			transparent: true,
			opacity: 0.7,
			roughness: 0.8,
			metalness: 0.1,
			side: THREE.DoubleSide
		});
		this.floorMaterial.needsUpdate = true

		// Mesh
		this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial)
		this.floor.rotation.x = Math.PI / 2
		this.floor.position.y = - this.parameters.depth / 2
		this.floor.receiveShadow = true
		this.scene.add(this.floor)
	}
	
	private setMidlleLine()
	{
		// Reset for debug
		if (this.middleLine)
		{
			this.middleLineGeometry.dispose()
			this.middleLineMaterial.dispose()
			for(let i = 0; i < this.middleLines.length; i++)
			{
				// console.log(`i: ${i}`)
				this.scene.remove(this.middleLines[i])
			}
			this.middleLines.splice(0, this.middleLines.length)
		}
		
		// Geometry
		this.middleLineGeometry = new THREE.PlaneGeometry(0.1, 0.25)

		// Material
		this.middleLineMaterial = new THREE.MeshStandardMaterial({
			side: THREE.DoubleSide
		})

		// Mesh
		for (let i = Math.ceil(- this.parameters.height / 2); i <= Math.floor(this.parameters.height / 2); i += 0.5)
		{
			this.middleLine = new THREE.Mesh(this.middleLineGeometry, this.middleLineMaterial)
			this.middleLine.position.set(0, - 0.01, i)
			this.middleLine.rotateX(Math.PI * -0.5)
			this.middleLines.push(this.middleLine)
		}

		for(let i = 0; i < this.middleLines.length; i++)
			this.scene.add(this.middleLines[i])
	}
}
