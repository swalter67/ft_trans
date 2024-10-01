import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Experience from '../Experience'
import Server from '../ClientServer'
import Floor from './Floor'
import Debug from '../Utils/Debug'
import GUI from 'lil-gui'


export default class ScorePanel
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	private floor: Floor
	private camera: THREE.PerspectiveCamera

	// Parameters
	private parameters : {
		height: number,
		width: number
	} = {height: 1.5, width: 12}

	// Debug
	private gui: Debug
	private debugFolder: GUI

	// ScorePanel Elements
	private groupPanel!: THREE.Group
	private scorePanel!: THREE.Mesh
	private geometry!: THREE.PlaneGeometry
	private material!: THREE.MeshStandardMaterial
	private fontLoader!: FontLoader
	private infoPanel!: THREE.Mesh

	// Score Player
	scorePlayer1: number
	scorePlayer2: number

	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		this.floor = this.experience.world.floor
		this.camera = this.experience.camera.instance
		this.gui = this.experience.debug

		// Debug
		// if (this.gui.isActive)
		// {
		// 	this.debugFolder = this.gui.ui.addFolder("ScorePanel")
		// 	this.debug()
		// }

		// Parameter
		this.scorePlayer1 = this.server.gameState.playerLeft.score
		this.scorePlayer2 = this.server.gameState.playerRight.score
	
		// Setup
		this.setGroupPanel()
		this.setGeometry()
		this.setMaterial()
		this.setMesh()
			this.setInfoPanel()
		this.server.on('score', () =>
		{
			this.setInfoPanel()
		})
	}

	private setGroupPanel()
	{
		this.groupPanel = new THREE.Group()
		if (this.floor != undefined)
			this.groupPanel.position.set(0, this.parameters.height / 2 + 0.1, - this.floor.parameters.height / 2)
		this.scene.add(this.groupPanel)
		this.groupPanel.lookAt(this.camera.position)

	}

	private setGeometry()
	{
		this.geometry = new THREE.PlaneGeometry(this.parameters.width, this.parameters.height)
	}

	private setMaterial()
	{
		this.material = new THREE.MeshStandardMaterial({
			color: 0x1f1f2a,
			// transparent: true,
			// opacity: 0.98,
			depthWrite: false,
		})
	}

	private setMesh()
	{
		this.scorePanel = new THREE.Mesh(this.geometry, this.material)
		if (this.floor != undefined)
		this.scorePanel.position.set(0, this.parameters.height / 2 + 0.1, - this.floor.parameters.height / 2)
		this.groupPanel.add(this.scorePanel)
	}

	setInfoPanel()
	{
		if (this.infoPanel)
		{
			this.groupPanel.remove(this.infoPanel)
			this.infoPanel.geometry.dispose()
		}
		this.fontLoader = new FontLoader()
		this.fontLoader.load(
			'fonts/helvetiker_regular.typeface.json',
			(font) =>
			{
			   const textGeometry = new TextGeometry(
				`${this.server.gameState.playerLeft.name} : ${this.server.gameState.playerLeft.score}   -   ${this.server.gameState.playerRight.name} : ${this.server.gameState.playerRight.score}`,
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
				this.infoPanel = new THREE.Mesh(textGeometry, material);
				if (this.floor != undefined)
					this.infoPanel.position.set(0, this.parameters.height / 2 + 0.1, - this.floor.parameters.height / 2 + 0.04)	
				this.infoPanel.receiveShadow = true
				this.infoPanel.castShadow = true
			   	this.groupPanel.add(this.infoPanel);
			})
	}

	update()
	{
		this.groupPanel.lookAt(this.camera.position)
	}

	private debug()
	{
		this.debugFolder.add(this.parameters, 'height')
			.min(1)
			.max(16)
			.step(1)
			.onChange(() =>
			{
				this.scorePanel.scale.y = this.parameters.height
			})
		this.debugFolder.add(this.parameters, 'width')
			.min(1)
			.max(16)
			.step(1)
			.onChange(() =>
			{
				this.scorePanel.scale.x = this.parameters.width
			})
	}
}