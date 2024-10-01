import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Experience from '../Experience'
import type Server from '../ClientServer'


export default class ScreenEvent
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	private camera: THREE.PerspectiveCamera

	// Parameters
	private parameters : {} = {}


	// ScorePanel Elements
	private fontLoader!: FontLoader
	private screenEvent!: THREE.Mesh

	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		this.camera = this.experience.camera.instance

		// Setup
		this.server.on('screenEvent', () =>
		{
			if(this.server.gameState.sceenEvents != undefined)
				this.setScreenEvent()
		})
	}

	setScreenEvent()
	{
		if (this.screenEvent)
		{
			this.scene.remove(this.screenEvent)
			this.screenEvent.geometry.dispose()
		}

		this.fontLoader = new FontLoader()
		this.fontLoader.load(
			'fonts/helvetiker_regular.typeface.json',
			(font) =>
			{
			   const textGeometry = new TextGeometry(
				`${this.server.gameState.sceenEvents}`,
				{
					font: font,
					size: 0.5,
					height: 0.01,
					curveSegments: 3, // Peut etre diminue pour augmenter les performance, joue sur l'arrondie des lettre comme le O
					bevelEnabled: true,
					bevelThickness: 0.03,
					bevelSize: 0.02,
					bevelOffset: 0,
					bevelSegments: 5 // Peut etre diminue pour augmenter les performances, joue sur les surface obliques qui donne de la profondeurs aux lettres.
				})
				textGeometry.center();
			   	const material = new THREE.MeshMatcapMaterial( { color: 'white' });
			   	this.screenEvent = new THREE.Mesh(textGeometry, material);
				this.screenEvent.position.set(0, 2, 0)	
				this.screenEvent.receiveShadow = true
				this.screenEvent.castShadow = true
				this.scene.add(this.screenEvent)
			})
	}

	update()
	{
		if (this.screenEvent && this.server.gameState.sceenEvents === undefined)
		{
			this.scene.remove(this.screenEvent)
			this.screenEvent.geometry.dispose()
		}
		else if (this.screenEvent && this.server.gameState.sceenEvents != undefined)
			this.screenEvent.lookAt(this.camera.position)
	}

}