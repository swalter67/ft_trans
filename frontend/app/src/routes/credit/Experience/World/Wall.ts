import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Experience from '../Experience'
import type Physics from './Physics'
import type Floor from './Floor'

export default class Wall
{
	private experience: Experience
	private scene: THREE.Scene
	private physics: Physics
	private floor: Floor

	private parametersTopBottomWalls: {
		width: number,
		height: number,
		depth: number
	} = {	width: 18, 
			height: 5, 
			depth: 0.2
		}
	
	private parametersLeftRightWalls: {
		width: number,
		height: number,
		depth: number
	} = {	width: 0.2, 
			height: 5, 
			depth: 9
		}

	private parametersTopWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: 0, 
			positionY: 0.5, 
			positionZ: - (9 / 2) + 0.2
		}
	
	private parametersBottomWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: 0, 
			positionY: 0.5, 
			positionZ: (9 / 2)
		}
	
	private parametersLeftWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: - (18 / 2) + 0.2, 
			positionY: 0.5, 
			positionZ: 0
		}

	private parametersRightWall : {
		positionX: number,
		positionY: number,
		positionZ: number
	} = {	positionX: 18 / 2, 
			positionY: 0.5, 
			positionZ: 0
		}

	private uniforms = {
		color: {type: 'vec3', value: new THREE.Color(0x3A68C1)},
		ballPos: {type: 'vec3', value: new CANNON.Vec3(0, 0, 0)}
	}

	private geometryTopBottom!: THREE.BoxGeometry
	private geometryLeftRight!: THREE.BoxGeometry
	private topWallMesh!: THREE.Mesh
	private bottomWallMesh!: THREE.Mesh
	private leftWallMesh!: THREE.Mesh
	private rightWallMesh!: THREE.Mesh

	constructor()
	{
		this.experience = new Experience(null)
		this.scene = this.experience.scene
		this.physics = this.experience.world.physics
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

	private setMaterial(uniforms: any) : THREE.ShaderMaterial
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
		this.geometryTopBottom = new THREE.BoxGeometry(
				this.parametersTopBottomWalls.width, 
				this.parametersTopBottomWalls.height, 
				this.parametersTopBottomWalls.depth
		)

		this.geometryLeftRight = new THREE.BoxGeometry(
			this.parametersLeftRightWalls.width, 
			this.parametersLeftRightWalls.height, 
			this.parametersLeftRightWalls.depth
	)

		// Mesh
		this.topWallMesh = new THREE.Mesh(this.geometryTopBottom, this.setMaterial(this.uniforms))
		this.topWallMesh.position.set(
			this.parametersTopWall.positionX,
			this.parametersTopWall.positionY,
			this.parametersTopWall.positionZ
		)

		this.bottomWallMesh = new THREE.Mesh(this.geometryTopBottom, this.setMaterial(this.uniforms))
		this.bottomWallMesh.position.set(
			this.parametersBottomWall.positionX,
			this.parametersBottomWall.positionY,
			this.parametersBottomWall.positionZ
		)

		this.leftWallMesh = new THREE.Mesh(this.geometryLeftRight, this.setMaterial(this.uniforms))
		this.leftWallMesh.position.set(
			this.parametersLeftWall.positionX,
			this.parametersLeftWall.positionY,
			this.parametersLeftWall.positionZ
		)

		this.rightWallMesh = new THREE.Mesh(this.geometryLeftRight, this.setMaterial(this.uniforms))
		this.rightWallMesh.position.set(
			this.parametersRightWall.positionX,
			this.parametersRightWall.positionY,
			this.parametersRightWall.positionZ
		)
		
		this.scene.add(this.topWallMesh, this.bottomWallMesh, this.leftWallMesh, this.rightWallMesh)
		this.physics.topWallBody.position.copy(new CANNON.Vec3(this.topWallMesh.position.x,
															this.topWallMesh.position.y,
															this.topWallMesh.position.z))
		this.physics.bottomWallBody.position.copy(new CANNON.Vec3(this.bottomWallMesh.position.x,
															this.bottomWallMesh.position.y,
															this.bottomWallMesh.position.z))
		this.physics.leftWallBody.position.copy(new CANNON.Vec3(this.leftWallMesh.position.x,
															this.leftWallMesh.position.y,
															this.leftWallMesh.position.z))
		this.physics.rightWallBody.position.copy(new CANNON.Vec3(this.rightWallMesh.position.x,
															this.rightWallMesh.position.y,
															this.rightWallMesh.position.z))
	}

	update()
	{
		if (this.experience.world.ball.ballMesh)
			this.uniforms.ballPos.value.copy(this.physics.ballBody.position)
	}
}