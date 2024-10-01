import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience'
import type Server from '../ClientServer'
// import Physics from './Physics'
import type Ball from './Ball'
import type Floor from './Floor'

export default class Wall
{
	private experience: Experience
	private server: Server
	private scene: THREE.Scene
	// private physics: Physics
	private ball: Ball
	private floor!: Floor

	private parametersWalls: {
		width: number,
		height: number,
		depth: number
	} = {	width: 18, 
			height: 5, 
			depth: 0.01
		}

	private parametersTopWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: 0, 
			positionY: 0.5, 
			positionZ: - (9 / 2)
		}
	
	private parametersBottomWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: 0, 
			positionY: 0.5, 
			positionZ: (9 / 2)
		}

	private uniforms = {
		color: {type: 'vec3', value: new THREE.Color(0x3A68C1)},
		ballPos: {type: 'vec3', value: new CANNON.Vec3(0, 0, 0)}
	}

	private geometry: THREE.BoxGeometry
	// private material: THREE.ShaderMaterial
	private topWallMesh: THREE.Mesh
	private bottomWallMesh: THREE.Mesh

	constructor()
	{
		this.experience = new Experience(null)
		this.server = this.experience.server
		this.scene = this.experience.scene
		// this.physics = this.experience.world.physics
		this.ball = this.experience.world.ball
		this.floor = this.experience.world.floor

		// Parameters

		// Setup
		this.setWall()
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
				float impactRange = 1.5; \
				float alpha = smoothstep(0.0, impactRange, dist); \
				gl_FragColor = vec4(mix(vec3(1,1,1), color, alpha), 1.0 - alpha);\
			}'
	}

	private setMaterial(uniforms) : THREE.ShaderMaterial
	{
		const material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: this.getVertexShader(),
			fragmentShader: this.getFragmentShader(),
			transparent: true,
			depthWrite: false,
			blending: THREE.NormalBlending
		})
		return material
	}

	setWall()
	{
		// Geometry
		this.geometry = new THREE.BoxGeometry(
				this.parametersWalls.width, 
				this.parametersWalls.height, 
				this.parametersWalls.depth
		)

		// Mesh
		this.topWallMesh = new THREE.Mesh(this.geometry, this.setMaterial(this.uniforms))
		this.topWallMesh.position.set(
			this.parametersTopWall.positionX,
			this.parametersTopWall.positionY,
			this.parametersTopWall.positionZ
		)

		this.bottomWallMesh = new THREE.Mesh(this.geometry, this.setMaterial(this.uniforms))
		this.bottomWallMesh.position.set(
			this.parametersBottomWall.positionX,
			this.parametersBottomWall.positionY,
			this.parametersBottomWall.positionZ
		)

		this.scene.add(this.topWallMesh, this.bottomWallMesh)
	}

	update()
	{
		this.uniforms.ballPos.value.copy(this.server.gameState.elements.ballPosition)
	}
}