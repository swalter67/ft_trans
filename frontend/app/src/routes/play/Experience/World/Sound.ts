import type ClientServer from '../ClientServer'
import Experience from '../Experience'
import type Resources from '../Utils/Resources'

export default class Sound
{
    experience: Experience
    resources: Resources
    clientServer: ClientServer

    constructor()
    {
        this.experience = new Experience(null)
        this.resources = this.experience.resources
        this.clientServer = this.experience.server

        this.clientServer.on('sound', () =>
        {
            Object.keys(this.resources.items).forEach(sound  =>
            {
                if(this.resources.items[sound] && this.resources.items[sound].isPlaying && !this.resources.items[this.clientServer.gameState.sound!].isPlaying)
                    this.resources.items[sound].pause()
            })
            if (this.resources.items[this.clientServer.gameState.sound!] && !this.resources.items[this.clientServer.gameState.sound!].isPlaying)
                this.resources.items[this.clientServer.gameState.sound!].setLoop(true).play()
        })
    }
}