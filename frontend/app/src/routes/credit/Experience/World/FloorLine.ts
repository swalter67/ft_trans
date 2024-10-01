import * as THREE from 'three'
import Experience from '../Experience'
import Floor from './Floor'

export default class FloorLine
{
	private experience: Experience
	private scene: THREE.Scene
	private floor: Floor
	
	// Parameter
	parameters: {
		colorBorderLine: THREE.ColorRepresentation,
		colorMiddleLine: THREE.ColorRepresentation,
		colorBlinkingLine: THREE.ColorRepresentation,
		lineIntensity: number

	} = {
		colorBorderLine: 0x3A68C1,
		colorMiddleLine: 0x3A68C1,
		colorBlinkingLine: 0xff6a00,
		lineIntensity: 100
	}

	private ambiantLight!: THREE.AmbientLight
	topAreaLight!: THREE.RectAreaLight
	bottomAreaLight!: THREE.RectAreaLight
	private leftAreaLight!: THREE.RectAreaLight
	private rightAreaLight!: THREE.RectAreaLight
	private middleAreaLight!: THREE.RectAreaLight

	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.floor = this.experience.world.floor
		
		// Setup
		this.setAmbiantLight()
		this.setTopAreaLight()
		this.setBottomAreaLight()
		this.setLeftAreaLight()
		this.setRightAreaLight()
		this.setMiddleAreaLight()
	}

	private setAmbiantLight()
	{
		this.ambiantLight = new THREE.AmbientLight(0xffffff, 4.5)
		this.ambiantLight.castShadow = false
		this.scene.add(this.ambiantLight)
	}

	private setTopAreaLight()
	{
		// Reset for debug
		if(this.topAreaLight)
		{
			this.scene.remove(this.topAreaLight)
		}

		this.topAreaLight = new THREE.RectAreaLight(this.parameters.colorBorderLine, this.parameters.lineIntensity, this.floor.parameters.width, 0.1)
		this.topAreaLight.position.set(0, 0.08, - this.floor.parameters.height / 2 + 0.05)
		this.topAreaLight.rotateX(Math.PI * -0.5)
		this.scene.add(this.topAreaLight)
	}

	private setBottomAreaLight()
	{
		// Reset for debug
		if(this.bottomAreaLight)
		{
			this.scene.remove(this.bottomAreaLight)
		}
				
		this.bottomAreaLight = new THREE.RectAreaLight(this.parameters.colorBorderLine, this.parameters.lineIntensity, this.floor.parameters.width, 0.1)
		this.bottomAreaLight.position.set(0, 0.08, this.floor.parameters.height / 2 - 0.05)
		this.bottomAreaLight.rotateX(Math.PI * - 0.5)
		this.scene.add(this.bottomAreaLight)
	}

	private setLeftAreaLight()
	{
		// Reset for debug
		if(this.leftAreaLight)
		{
			this.scene.remove(this.leftAreaLight)
		}

		this.leftAreaLight = new THREE.RectAreaLight(this.parameters.colorBorderLine, this.parameters.lineIntensity, 0.1, this.floor.parameters.width)
		this.leftAreaLight.position.set(- this.floor.parameters.width / 2 + 0.05, 0.08, 0)
		this.leftAreaLight.rotateX(Math.PI * - 0.5)
		this.scene.add(this.leftAreaLight)
	}

	private setRightAreaLight()
	{
		// Reset for debug
		if(this.rightAreaLight)
		{
			this.scene.remove(this.rightAreaLight)
		}

		this.rightAreaLight = new THREE.RectAreaLight(this.parameters.colorBorderLine, this.parameters.lineIntensity, 0.1, this.floor.parameters.width)
		this.rightAreaLight.position.set(this.floor.parameters.width / 2 - 0.05, 0.08, 0)
		this.rightAreaLight.rotateX(Math.PI * - 0.5)
		this.scene.add(this.rightAreaLight)
	}

	private setMiddleAreaLight()
	{
		// Reset for debug
		if(this.middleAreaLight)
		{
			this.scene.remove(this.middleAreaLight)
		}

		this.middleAreaLight = new THREE.RectAreaLight(this.parameters.colorMiddleLine, this.parameters.lineIntensity, this.floor.parameters.width - 1, 0.05)
		this.middleAreaLight.position.set(0, 0.04, 0)
		this.middleAreaLight.rotateX(Math.PI * - 0.5)
		this.scene.add(this.middleAreaLight)
	}

	setAllLine()
	{
		this.setTopAreaLight()
		this.setBottomAreaLight()
		this.setLeftAreaLight()
		this.setRightAreaLight()
		this.setMiddleAreaLight()
	}
}