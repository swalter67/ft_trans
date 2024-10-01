import * as CANNON from 'cannon-es'
import Experience from '../Experience'

export default class Physics
{
	world: CANNON.World
	private experience: Experience

	private defaultMaterial: CANNON.Material
	private wallMaterial: CANNON.Material
	private paddleMaterial: CANNON.Material
	private ballMaterial: CANNON.Material
	private defaultBallContactMaterial: CANNON.ContactMaterial
	private ballWallContactMaterial: CANNON.ContactMaterial
	private ballPaddleContactMaterial: CANNON.ContactMaterial
	private floorPaddleContactMaterial: CANNON.ContactMaterial
	private wallPaddleContactMaterial: CANNON.ContactMaterial
	private floorShape: CANNON.Box
	private wallShape: CANNON.Box
	private ballShape: CANNON.Sphere
	private paddleShape: CANNON.Box
	floorBody: CANNON.Body
	topWallBody: CANNON.Body
	bottomWallBody: CANNON.Body
	ballBody: CANNON.Body
	leftPaddleBody: CANNON.Body
	rightPaddleBody: CANNON.Body

	constructor()
	{
		// Set World
		this.world = new CANNON.World()
		this.world.broadphase = new CANNON.SAPBroadphase(this.world)
		this.world.broadphase.dirty = true
		this.world.gravity.set(0, - 9.82, 0)

		this.experience = new Experience(null)
		
		// Setup
		this.setMaterial()
		this.setDefaultBallContactMaterial()
		this.setBallWallContactMaterial()
		this.setBallPaddleContactMaterial()
		this.setPaddleFloorContactMaterial()
		this.setWallPaddleContactMaterial()
		this.setFloorShape()
		this.setWallShape()
		this.setBallShape()
		this.setPaddleShape()
		this.setFloorBody()
		this.setWallBody()
		this.setPaddleBody('left')
		this.setPaddleBody('right')
	}

	private setMaterial()
	{
		this.defaultMaterial = new CANNON.Material('default')
		this.wallMaterial = new CANNON.Material('wallMaterial')
		this.ballMaterial = new CANNON.Material('ballMaterial')
		this.paddleMaterial = new CANNON.Material('paddleMaterial')
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
				restitution: 1.07
			}
		)
		this.world.addContactMaterial(this.ballWallContactMaterial)
	}
	
	private setBallPaddleContactMaterial()
	{
		this.ballPaddleContactMaterial = new CANNON.ContactMaterial(
			this.ballMaterial,
			this.paddleMaterial,
			{
				friction: 0,
				restitution: 1.05
			}
		)
		this.world.addContactMaterial(this.ballPaddleContactMaterial)
	}

	private setPaddleFloorContactMaterial()
	{
		this.floorPaddleContactMaterial = new CANNON.ContactMaterial(
			this.paddleMaterial,
			this.defaultMaterial,
			{
				friction: 0.01,
				restitution: 0
			}
		)
		this.world.addContactMaterial(this.floorPaddleContactMaterial)
	}

	private setWallPaddleContactMaterial()
	{
		this.wallPaddleContactMaterial = new CANNON.ContactMaterial(
			this.wallMaterial,
			this.paddleMaterial,
			{
				friction: 0,
				restitution: 0
			}
		)
		this.world.addContactMaterial(this.wallPaddleContactMaterial)
	}
		
	private setFloorShape()
	{
		this.floorShape = new CANNON.Box(new CANNON.Vec3(
			18 * 0.5,
			0.5 * 0.5,
			9 * 0.5
		))
	}
		
	private setWallShape()
	{
		this.wallShape = new CANNON.Box(new CANNON.Vec3(
			18.2 * 0.5,
			5 * 0.5,
			0.5 * 0.5
		))
	}

	private setBallShape()
	{
		this.ballShape = new CANNON.Sphere(0.25)
	}
	
	private setPaddleShape()
	{
		this.paddleShape = new CANNON.Box(new CANNON.Vec3(
			0.25 * 0.5,
			0.5 * 0.5,
			1.5 * 0.5
		))
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
			shape: this.wallShape,
			material: this.wallMaterial
		})
		this.bottomWallBody = new CANNON.Body({
			mass: 0,
			shape: this.wallShape,
			material: this.wallMaterial
		})
		this.world.addBody(this.topWallBody)
		this.world.addBody(this.bottomWallBody)
		this.topWallBody.type = CANNON.Body.STATIC;
		this.bottomWallBody.type = CANNON.Body.STATIC;
	}

	setBallBody()
	{
		this.ballBody = new CANNON.Body({
			mass: 1,
	  		position: new CANNON.Vec3(0, 9, 0),
			material: this.ballMaterial,
			shape: this.ballShape
   		})
		this.world.addBody(this.ballBody)
	}

	private setPaddleBody(paddleName: string)
	{
		const paddle = new CANNON.Body({
			mass: 100,
			shape: this.paddleShape,
			material: this.paddleMaterial
		})
		paddle.linearFactor.set(0, 0, 1)
		paddle.angularDamping = 1
		if (paddleName === 'left')
			this.leftPaddleBody = paddle
		else if (paddleName === 'right')
			this.rightPaddleBody = paddle
		else
		{
			// console.log('bad paddleName')
			return
		}
		this.world.addBody(paddle)
	}
}
