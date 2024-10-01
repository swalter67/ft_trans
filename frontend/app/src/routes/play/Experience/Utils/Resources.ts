import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import EventEmitter from './EventEmitter'
import Experience from '../Experience'

interface Source
{
	type: string
	path: any
	name: string
}

export default class Resources extends EventEmitter
{
	private sources: Source[]
	items: { [key: string]: any }
	private toLoad: number
	private loaded: number
	private experience: Experience
	private loaders!:
	{
		gltfLoader: GLTFLoader
		textureLoader: THREE.TextureLoader
		cubeTextureLoader: THREE.CubeTextureLoader
		soundLoader: THREE.AudioLoader
	}

	constructor(sources: Source[])
	{
		super()
		this.experience = new Experience(null)
		// Options
		this.sources = sources

		// Setup
		this.items = {}
		this.toLoad = this.sources.length
		this.loaded = 0

		this.setLoaders()
		this.startLoading()
	}

	setLoaders(): void
	{
		this.loaders = {
			gltfLoader: new GLTFLoader(),
			textureLoader: new THREE.TextureLoader(),
			cubeTextureLoader: new THREE.CubeTextureLoader(),
			soundLoader: new THREE.AudioLoader(),
		}
	}

	startLoading(): void
	{
		for (const source of this.sources)
		{
			if (source.type === 'gltfModel')
			{
				this.loaders.gltfLoader.load(source.path, (file) =>
				{
					this.sourceLoaded(source, file)
				})
			}
			else if (source.type === 'texture')
			{
				this.loaders.textureLoader.load(source.path, (file) =>
				{
					this.sourceLoaded(source, file)
				})
			}
			else if (source.type === 'cubeTexture')
			{
				this.loaders.cubeTextureLoader.load(source.path, (file) =>
				{
					this.sourceLoaded(source, file)
				})
			}
			else if (source.type === 'sound')
			{
 				this.loaders.soundLoader.load(source.path, ( file )=> {
					this.sourceLoaded(source, file)
				})
			}
	}
	}

	private async sourceLoaded(source: Source, file: any): Promise<void>
	{
		if (source.type === 'sound')
		{
			this.items[source.name] = new THREE.Audio(this.experience.audioListerner)
			await this.items[source.name].setBuffer(file)
			this.items[source.name].setVolume(1)
		}
		else
			this.items[source.name] = file

		this.loaded++
		if (this.loaded === this.toLoad)
			this.trigger('loaded')
	}
}
