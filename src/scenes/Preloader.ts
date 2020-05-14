import Phaser from 'phaser'
import SceneKeys from '~/consts/SceneKeys'

export default class Preloader extends Phaser.Scene
{
	preload()
	{
		this.load.atlas('tiles', 'assets/board.png', 'assets/board.json')
		this.load.atlas('game-atlas', 'assets/game.png', 'assets/game.json')
	}

	create()
	{
		this.scene.start(SceneKeys.Game)
	}
}
