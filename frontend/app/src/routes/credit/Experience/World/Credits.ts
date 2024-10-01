import * as THREE from 'three'
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Experience from '../Experience'
import type World from './World'
import * as CANNON from 'cannon-es'
import type Physics from './Physics'


// Objects
interface LetterGroup
{
    letterMeshGroup: THREE.Object3D
    size?: THREE.Vector3
    letterOffset: number
    letterPhysicsShape?: CANNON.Shape
    letterPhysicsBody?: CANNON.Body[]
}

export default class Credits
{
    private experience: Experience
    private world: World
    private physics: Physics
    private worldPhysics: CANNON.World
    private scene: THREE.Scene

    // Parameters
    private parameters :
    [string, string, string, string, string] = ["MANU", "STEPH", "SEB", "THOMAS", "HUGO"]

    // Credits elements
    private mainGroup!: THREE.Object3D
    private fontLoader!: FontLoader
    private letterGroup: Record<string, LetterGroup> = {}
    private letterPhysicsMaterial!: CANNON.Material
    private defaultLetterContactMaterial!: CANNON.ContactMaterial
    private ballLetterContactMaterial!: CANNON.ContactMaterial
    private wallLetterContactMaterial!: CANNON.ContactMaterial
    private dprFactor = 1

    private ready: number = 0

    constructor()
    {
        this.experience = new Experience(null)
        this.world = this.experience.world
        this.physics = this.world.physics
        this.worldPhysics = this.physics.world
        this.scene = this.experience.scene

        // Setup
        this.createMainGroup()
        this.initPhysics()
        this.setFont()
    }

    createMainGroup()
    {
        this.mainGroup = new THREE.Object3D()
        this.scene.add(this.mainGroup)
    }

    setFont()
    {
        this.fontLoader = new FontLoader()
        this.fontLoader.load('fonts/helvetiker_regular.typeface.json',
            (font) => {
            this.parameters.forEach(user => {
                this.create3DText(font, user)
            })
        })
    }

    initPhysics()
    {
        this.letterPhysicsMaterial = new CANNON.Material()

        this.defaultLetterContactMaterial = new CANNON.ContactMaterial(
            this.letterPhysicsMaterial,
            this.physics.defaultMaterial,
            {
                friction: 0.5,
                restitution: 0
            })
        this.ballLetterContactMaterial = new CANNON.ContactMaterial(
            this.physics.ballMaterial,
            this.letterPhysicsMaterial,
            {
                friction: 0.5,
                restitution: 0.5
            })
        this.wallLetterContactMaterial = new CANNON.ContactMaterial(
            this.letterPhysicsMaterial,
            this.physics.wallMaterial,
            {
                friction: 0,
                restitution: 0.5
            })
        
            this.worldPhysics.addContactMaterial(this.defaultLetterContactMaterial)
            this.worldPhysics.addContactMaterial(this.wallLetterContactMaterial)
            this.worldPhysics.addContactMaterial(this.ballLetterContactMaterial)
    }

    create3DText(font: any, user: string)
    {
        const line = user;
        let i = 0;

        let xrandom: number
        let zrandom: number
        let collisionDetected: boolean
        const nameLength = user.length
        
        this.letterGroup[user] = {
            letterMeshGroup: new THREE.Object3D(),
            letterOffset: 0,
            letterPhysicsBody: []
        };    
        
        
        do {
            xrandom = (Math.random() - 0.5) * (16.5 - nameLength)
            zrandom = (Math.random() - 0.5) * 8
        this.letterGroup[user].letterOffset = xrandom
            collisionDetected = false

            if (this.ready >= 1)
            {

                for (const placedUser in this.letterGroup)
                {
                    if (placedUser !== user)
                    {
                        for (let j = 0; j < this.letterGroup[placedUser].letterMeshGroup.children.length; j++)
                        {
                            const letterMesh = this.letterGroup[placedUser].letterMeshGroup.children[j]
                            if (this.checkCollision(letterMesh, this.letterGroup, user))
                            {
                                collisionDetected = true
                                break
                            }
                            let tmp = Math.abs(zrandom - this.letterGroup[placedUser].letterPhysicsBody![0].position.z)
                            if (tmp < 1.2)
                            {
                                collisionDetected = true
                                break
                            }
                        }
                        if (collisionDetected)
                            break
                    }
                }
            }
        } while (collisionDetected); 

        line!.split("").forEach( (letter) =>
        {
            const letterGeometry = new TextGeometry(
                letter,
                {
                    font: font,
                    size: 0.5 * this.dprFactor,
                    height: 0.1 * this.dprFactor,
                    curveSegments: 3, // Peut etre diminue pour augmenter les performance, joue sur l'arrondie des lettre comme le O
                    bevelEnabled: true,
                    bevelThickness: 0.01 * this.dprFactor,
                    bevelSize: 0.02 * this.dprFactor,
                    bevelOffset: 0,
                    bevelSegments: 5 
                })

            letterGeometry.computeBoundingBox()
            letterGeometry.computeBoundingSphere()

            const letterMaterial = new THREE.MeshStandardMaterial({
                color: 'white',
                roughness: 0.5,
                metalness: 0.5
            })

            const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial)
            this.letterGroup[user].size = letterMesh.geometry.boundingBox!.getSize(new THREE.Vector3())
            this.letterGroup[user].letterMeshGroup!.add(letterMesh)

            
            this.letterGroup[user].letterOffset += this.letterGroup[user].size!.x + (0.1 * this.dprFactor)

            this.letterGroup[user].letterPhysicsShape = new CANNON.Box(new CANNON.Vec3().copy(this.letterGroup[user].size!).scale(0.5))
            this.letterGroup[user].letterPhysicsBody!.push(new CANNON.Body({
                mass: 0.25,
                position: new CANNON.Vec3(
                    this.letterGroup[user].letterOffset,
                    0.25,
                    zrandom
                ),
                material: this.letterPhysicsMaterial
            }))

            const center = letterMesh.geometry.boundingSphere!.center
            this.letterGroup[user].letterPhysicsBody![i].addShape(
                this.letterGroup[user].letterPhysicsShape!,
                new CANNON.Vec3(center.x, center.y, center.z));
            this.worldPhysics.addBody(this.letterGroup[user].letterPhysicsBody![i])
            i++
        })

        this.letterGroup[user].letterMeshGroup.children.forEach((letter) =>
        {
            letter.position.x -= this.letterGroup[user].size!.x + this.letterGroup[user].letterOffset
        })

        this.mainGroup.add(this.letterGroup[user].letterMeshGroup)
        this.ready++
    }

    checkCollision(letterMesh: THREE.Object3D, letterGroup: Record<string, LetterGroup>, user:string)
    {
        for (let i = 0; i < letterGroup[user].letterPhysicsBody!.length; i++)
        {
            const body = letterGroup[user].letterPhysicsBody![i]
            const bodySize = letterGroup[user].size!.clone().multiplyScalar(0.5)
            const bodyPosition = body.position
            
            if (Math.abs(bodyPosition.x - letterMesh.position.x) < bodySize.x &&
                Math.abs(bodyPosition.y - letterMesh.position.y) < bodySize.y &&
                Math.abs(bodyPosition.z - letterMesh.position.z) < bodySize.z)
            {
                return true
            }
        }

        return false
    }
    

    update()
    {
        if(this.ready === this.parameters.length)
        {
            this.parameters.forEach(user =>
            {
                for( let i = 0; i < this.letterGroup[user].letterMeshGroup.children.length; i++)
                {
                    const letter = this.letterGroup[user].letterMeshGroup.children[i]
                    letter.position.copy(new THREE.Vector3(
                        this.letterGroup[user].letterPhysicsBody![i].position.x,
                        this.letterGroup[user].letterPhysicsBody![i].position.y,
                        this.letterGroup[user].letterPhysicsBody![i].position.z))
                    letter.quaternion.copy(this.letterGroup[user].letterPhysicsBody![i].quaternion)
                }
            })
        }
    }
}