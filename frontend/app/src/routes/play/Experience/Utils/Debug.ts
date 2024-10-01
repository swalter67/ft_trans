import GUI from "lil-gui"

export default class Debug
{
	isActive: boolean
	ui!: GUI

	constructor()
	{
		// this.isActive = window.location.hash === "#debug"
		this.isActive = true

		if (this.isActive)
		{
			this.ui = new GUI()
			this.ui.close()
			this.ui._closeFolders = true
			this.ui.domElement.id = 'gui'
			// console.log('test : ' + this.ui.domElement.id)
		}
	}
}
