import * as THREE from 'three'
import Experience from '../Experience';


export default class Environment
{
	private experience: Experience
	private scene: THREE.Scene

	private leftPointLight!: THREE.SpotLight
	private rightPointLight!: THREE.SpotLight


	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene

		this.setPointLight(0x00ffff, -11, 'left')
		this.setPointLight(0xffff00, 11, 'right')
	}

	private setPointLight(color: THREE.ColorRepresentation, x: number, pointLight: string)
	{
		const tmpPointLight = new THREE.SpotLight(color, 100, 25)
		tmpPointLight.penumbra = 0.3
		tmpPointLight.position.set(x, 5, 0)
		tmpPointLight.castShadow = true
		tmpPointLight.shadow.mapSize.width = 1024
		tmpPointLight.shadow.mapSize.height = 1024
		if (pointLight === 'left')
			this.leftPointLight = tmpPointLight
		else if (pointLight === 'right')
			this.rightPointLight = tmpPointLight
		else
		{
			// console.log('Bad Name Light')
			return
		}
		this.scene.add(tmpPointLight)
	}
}
