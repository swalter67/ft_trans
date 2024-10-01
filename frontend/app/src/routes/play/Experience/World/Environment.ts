import * as THREE from 'three'
import Experience from '../Experience'
import type Debug from '../Utils/Debug'
import type GUI from 'lil-gui'


export default class Environment
{
	private experience: Experience
	private scene: THREE.Scene

	private leftPointLight!: THREE.SpotLight
	private rightPointLight!: THREE.SpotLight
	private ambiantLight!: THREE.AmbientLight

	// Debug
	private gui: Debug
	private debugFolder!: GUI

	// Parameter
	parameters: {
		ambiantLight: THREE.ColorRepresentation,
		leftLight: THREE.ColorRepresentation,
		rightLight: THREE.ColorRepresentation,
	} = {
		ambiantLight: 0xffffff,
		leftLight: 0x00ffff,
		rightLight: 0xffff00
	}


	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.gui = this.experience.debug

		// Debug
		if (this.gui.isActive)
		{
			this.debugFolder = this.gui.ui.addFolder('Light')
			this.debug()
		}

		this.setAmbiantLight()
		this.setPointLight(this.parameters.leftLight, -11, 'left')
		this.setPointLight(this.parameters.rightLight, 11, 'right')
	}
	
	private setAmbiantLight()
	{
		this.ambiantLight = new THREE.AmbientLight(this.parameters.ambiantLight, 4.5)
		this.scene.add(this.ambiantLight)
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

	private setAmbiantLightDebug()
	{
		// Reset for debug
		if(this.ambiantLight)
		{
			this.scene.remove(this.ambiantLight)
		}

		this.ambiantLight = new THREE.AmbientLight(this.parameters.ambiantLight, 4.5)
		this.scene.add(this.ambiantLight)
	}

	private setLeftLightDebug()
	{
		// Reset for debug
		if(this.leftPointLight)
		{
			this.scene.remove(this.leftPointLight)
		}

		this.leftPointLight = new THREE.SpotLight(this.parameters.leftLight, 100, 25)
		this.leftPointLight.penumbra = 0.3
		this.leftPointLight.position.set(-11, 5, 0)
		this.leftPointLight.castShadow = true
		this.leftPointLight.shadow.mapSize.width = 1024
		this.leftPointLight.shadow.mapSize.height = 1024
		this.scene.add(this.leftPointLight)
	}

	private setRightLightDebug()
	{
		// Reset for debug
		if(this.rightPointLight)
		{
			this.scene.remove(this.rightPointLight)
		}

		this.rightPointLight = new THREE.SpotLight(this.parameters.rightLight, 100, 25)
		this.rightPointLight.penumbra = 0.3
		this.rightPointLight.position.set(11, 5, 0)
		this.rightPointLight.castShadow = true
		this.rightPointLight.shadow.mapSize.width = 1024
		this.rightPointLight.shadow.mapSize.height = 1024
		this.scene.add(this.rightPointLight)
	}


	private debug()
	{
		this.debugFolder.addColor(this.parameters, 'ambiantLight').onChange(() => this.setAmbiantLightDebug())
		this.debugFolder.addColor(this.parameters, 'leftLight').onChange(() => this.setLeftLightDebug())
		this.debugFolder.addColor(this.parameters, 'rightLight').onChange(() => this.setRightLightDebug())
	}
}
