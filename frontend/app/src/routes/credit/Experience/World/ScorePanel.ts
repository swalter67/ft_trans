import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Experience from '../Experience'
import Floor from './Floor'


export default class ScorePanel
{
	private experience: Experience
	private scene: THREE.Scene
	private floor: Floor
	private camera: THREE.PerspectiveCamera

	// Parameters
	private parameters : {
		height: number,
		width: number
	} = {height: 1.5, width: 12}

	// ScorePanel Elements
	private groupPanel!: THREE.Group
	private scorePanel!: THREE.Mesh
	private geometry!: THREE.PlaneGeometry
	private material!: THREE.MeshStandardMaterial
	private fontLoader!: FontLoader
	private infoPanel!: THREE.Mesh

	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.floor = this.experience.world.floor
		this.camera = this.experience.camera.instance

		// Setup
		this.setGroupPanel()
		this.setGeometry()
		this.setMaterial()
		this.setMesh()
		this.setInfoPanel()
	}

	private setGroupPanel()
	{
		this.groupPanel = new THREE.Group()
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
				`CREDITS`,
				{
					font: font,
					size: 0.5,
					height: 0.01,
					curveSegments: 12, // Peut etre diminue pour augmenter les performance, joue sur l'arrondie des lettre comme le O
					bevelEnabled: true,
					bevelThickness: 0.03,
					bevelSize: 0.02,
					bevelOffset: 0,
					bevelSegments: 5 // Peut etre diminue pour augmenter les performances, joue sur les surface obliques qui donne de la profondeurs aux lettres.
				})
			   	const material = new THREE.MeshMatcapMaterial( { color: 'white' });
			   	this.infoPanel = new THREE.Mesh(textGeometry, material);
				textGeometry.computeBoundingBox();
				if (textGeometry.boundingBox)
				this.infoPanel.position.set(-(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2,
																		(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y),
																		- this.floor.parameters.height / 2 + 0.04)	
				this.infoPanel.receiveShadow = true
				this.infoPanel.castShadow = true
			   	this.groupPanel.add(this.infoPanel);
			})
	}

	update()
	{
		this.groupPanel.lookAt(this.camera.position)
	}
}