import * as CANNON from 'cannon-es'

export default class Physics
{
	world: CANNON.World

	defaultMaterial!: CANNON.Material
	wallMaterial!: CANNON.Material
	ballMaterial!: CANNON.Material
	private defaultBallContactMaterial!: CANNON.ContactMaterial
	private ballWallContactMaterial!: CANNON.ContactMaterial
	private floorShape!: CANNON.Box
	private wallTopBottomShape!: CANNON.Box
	private wallLeftRightShape!: CANNON.Box
	private ballShape!: CANNON.Sphere
	floorBody!: CANNON.Body
	topWallBody!: CANNON.Body
	bottomWallBody!: CANNON.Body
	leftWallBody!: CANNON.Body
	rightWallBody!: CANNON.Body
	ballBody!: CANNON.Body

	constructor()
	{
		// Set World
		this.world = new CANNON.World()
		// this.world.broadphase = new CANNON.SAPBroadphase(this.world)
		// this.world.broadphase.dirty = true
		this.world.gravity.set(0, - 1.82, 0)

		// Setup
		this.setMaterial()
		this.setDefaultBallContactMaterial()
		this.setBallWallContactMaterial()
		this.setFloorShape()
		this.setTopBottomWallShape()
		this.setLeftRightWallShape()
		this.setBallShape()
		this.setFloorBody()
		this.setWallBody()
	}

	private setMaterial()
	{
		this.defaultMaterial = new CANNON.Material('default')
		this.wallMaterial = new CANNON.Material('wallMaterial')
		this.ballMaterial = new CANNON.Material('ballMaterial')
	}

	private setDefaultBallContactMaterial()
	{
		this.defaultBallContactMaterial = new CANNON.ContactMaterial(
			this.ballMaterial,
			this.defaultMaterial,
			{
				friction: 0,
				restitution: 0
			}
		)
		this.world.defaultContactMaterial = this.defaultBallContactMaterial
	}

	private setBallWallContactMaterial()
	{
		this.ballWallContactMaterial = new CANNON.ContactMaterial(
			this.ballMaterial,
			this.wallMaterial,
			{
				friction: 0,
				restitution: 1
			}
		)
		this.world.addContactMaterial(this.ballWallContactMaterial)
	}
	
	private setFloorShape()
	{
		this.floorShape = new CANNON.Box(new CANNON.Vec3(
			18 * 0.5,
			0.5 * 0.5,
			9 * 0.5
		))
	}
		
	private setTopBottomWallShape()
	{
		this.wallTopBottomShape = new CANNON.Box(new CANNON.Vec3(
			18.2 * 0.5,
			5 * 0.5,
			0.5 * 0.5
		))
	}

	private setLeftRightWallShape()
	{
		this.wallLeftRightShape = new CANNON.Box(new CANNON.Vec3(
			1 * 0.5,
			5 * 0.5,
			9.2 * 0.5
		))
	}

	private setBallShape()
	{
		this.ballShape = new CANNON.Sphere(0.25)
	}
	
	private setFloorBody()
	{
		this.floorBody = new CANNON.Body(
		{
			mass: 0,
			shape: this.floorShape,
			material: this.defaultMaterial,
			position: new CANNON.Vec3(0, -0.25, 0)
		})
		this.world.addBody(this.floorBody)
	}

	private setWallBody()
	{
		this.topWallBody = new CANNON.Body({
			mass: 0,
			shape: this.wallTopBottomShape,
			material: this.wallMaterial
		})
		this.bottomWallBody = new CANNON.Body({
			mass: 0,
			shape: this.wallTopBottomShape,
			material: this.wallMaterial
		})
		this.leftWallBody = new CANNON.Body({
			mass: 0,
			shape: this.wallLeftRightShape,
			material: this.wallMaterial
		})
		this.rightWallBody = new CANNON.Body({
			mass: 0,
			shape: this.wallLeftRightShape,
			material: this.wallMaterial
		})
		this.world.addBody(this.topWallBody)
		this.world.addBody(this.bottomWallBody)
		this.world.addBody(this.leftWallBody)
		this.world.addBody(this.rightWallBody)
		this.topWallBody.type = CANNON.Body.STATIC;
		this.bottomWallBody.type = CANNON.Body.STATIC;
		this.leftWallBody.type = CANNON.Body.STATIC;
		this.rightWallBody.type = CANNON.Body.STATIC;
	}

	setBallBody()
	{
		this.ballBody = new CANNON.Body({
			mass: 1,
	  		position: new CANNON.Vec3(-9, 9, 0),
			material: this.ballMaterial,
			shape: this.ballShape,
			velocity: new CANNON.Vec3(4, 0, 1)
   		})
		this.world.addBody(this.ballBody)
	}
}