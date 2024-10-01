import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience';
import type Server from '../ClientServer';
import type Resources from '../Utils/Resources';
import type Floor from './Floor';
import type Debug from '../Utils/Debug'
import type GUI from 'lil-gui'
// import Physics from './Physics';

export default class Paddles
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	private floor: Floor
	private resources: Resources
	// private physics: Physics

	// Debug
	private gui: Debug
	private debugFolder!: GUI

	// Paddles
	parameters: {
		width: number,
		height: number,
		depth: number,
		leftPaddleColor: THREE.ColorRepresentation,
		rightPaddleColor: THREE.ColorRepresentation

	} = {width: 0.25, height: 0.5, depth: 1.5, leftPaddleColor: 0x00ffff, rightPaddleColor: 0xffff00}

	uniformsLeft = {
		color: {type: 'vec3', value: new THREE.Color(this.parameters.leftPaddleColor)},
		ballPos: {type: 'vec3', value: new CANNON.Vec3(0, 0, 0)}
	}

	uniformsRight = {
		color: {type: 'vec3', value: new THREE.Color(this.parameters.rightPaddleColor)},
		ballPos: {type: 'vec3', value: new CANNON.Vec3(0, 0, 0)}
	}
	
	keys: {
		keyW: boolean,
		keyS: boolean,
	} = {keyW: false, keyS: false}

	private geometry!: THREE.BoxGeometry
	private paddleTexture!: THREE.Texture
	leftPaddle!: THREE.Mesh
	rightPaddle!: THREE.Mesh


	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		this.floor = this.experience.world.floor
		this.resources = this.experience.resources
		this.gui = this.experience.debug
		// this.physics = this.experience.world.physics

		// Debug
		if (this.gui.isActive)
		{
			this.debugFolder = this.gui.ui.addFolder('Paddle')
			this.debug()
		}

		// Setup
		this.setPaddles()
		this.eventKeydown()
		this.eventKeyup()
	}

	private getVertexShader()
	{
		return 'varying vec4 worldPos;\
			void main()\
			{\
				worldPos = modelMatrix * vec4(position, 1.0);\
				gl_Position = projectionMatrix * viewMatrix * worldPos;\
			}'
	}

	private getFragmentShader()
	{
		return 'varying vec4 worldPos;\
			uniform vec3 color;\
			uniform vec3 ballPos;\
			\
			void main()\
			{\
				float dist = distance(ballPos, worldPos.xyz);\
				float minDist = 0.1;\
				float maxDist = 0.75;\
				float normalDist = (maxDist - clamp(dist, minDist, maxDist)) / (maxDist - minDist);\
				gl_FragColor = vec4(mix(color, vec3(1,0,0), normalDist), 1.0);\
			}'
	}

	private setMaterial(uniforms: any) : THREE.ShaderMaterial
	{
		const material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: this.getVertexShader(),
			fragmentShader: this.getFragmentShader()
		})
		return material
	}

	setPaddles()
	{
		// Reset for debug
		if (this.leftPaddle && this.rightPaddle)
		{
			this.geometry.dispose()
			// this.floorMaterial.dispose()
			this.scene.remove(this.leftPaddle)
			this.scene.remove(this.rightPaddle)
			this.uniformsLeft.color.value.set(this.parameters.leftPaddleColor)
			this.uniformsRight.color.value.set(this.parameters.rightPaddleColor)
		}
		
		// Geometry
		this.geometry = new THREE.BoxGeometry(this.parameters.width, this.parameters.height, this.parameters.depth)
		
		// Texture
		this.paddleTexture = this.resources.items.paddleTexture

		// Mesh
		this.leftPaddle = new THREE.Mesh(this.geometry, this.setMaterial(this.uniformsLeft))
		if (this.floor != undefined)
			this.leftPaddle.position.set(
				- this.floor.parameters.width / 2 + this.parameters.width / 2 + 0.2, 
				this.parameters.height / 2,
				0
			)
		this.rightPaddle = new THREE.Mesh(this.geometry, this.setMaterial(this.uniformsRight))
		if (this.floor != undefined) 
			this.rightPaddle.position.set(
				this.floor.parameters.width / 2 - this.parameters.width / 2 - 0.2, 
				this.parameters.height / 2, 
				0
			)
		this.scene.add(this.leftPaddle, this.rightPaddle)
		
		// this.physics.leftPaddleBody.position.copy(this.server.gameState.elements.leftPaddlePosition)
		// this.physics.rightPaddleBody.position.copy(this.server.gameState.elements.rightPaddlePosition)
	}

	private eventKeydown()
	{
		window.addEventListener('keydown', (event) =>
		{
			if (event.code === 'KeyW')
				this.keys.keyW = true
			if (event.code === 'KeyS')
				this.keys.keyS = true
			if (event.code === 'KeyP')
				this.server.socket.emit('playerInput', 'keyP')
		})
	}

	private eventKeyup()
	{
		window.addEventListener('keyup', (event) =>
		{
			if (event.code === 'KeyW')
				this.keys.keyW = false
			if (event.code === 'KeyS')
				this.keys.keyS = false
		})
	}

	update()
	{
		this.leftPaddle.position.copy(this.server.gameState.elements.leftPaddlePosition)
		this.rightPaddle.position.copy(this.server.gameState.elements.rightPaddlePosition)
		if (this.keys.keyW)
			this.server.socket.emit('playerInput', 'keyW')
		else if (this.keys.keyS )
			this.server.socket.emit('playerInput', 'keyS')

		this.uniformsLeft.ballPos.value.copy(this.server.gameState.elements.ballPosition)
		this.uniformsRight.ballPos.value.copy(this.server.gameState.elements.ballPosition)
	}

	private debug()
	{
		this.debugFolder.addColor(this.parameters, 'leftPaddleColor').onChange(() => this.setPaddles())
		this.debugFolder.addColor(this.parameters, 'rightPaddleColor').onChange(() => this.setPaddles())
	}
}