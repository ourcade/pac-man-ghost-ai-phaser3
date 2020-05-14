import Phaser from 'phaser'
import SceneKeys from '~/consts/SceneKeys'

export default class Preloader extends Phaser.Scene
{
	preload()
	{
		this.load.image('tiles', 'assets/board.png')
		this.load.atlas('game-atlas', 'assets/game.png', 'assets/game.json')
	}

	create()
	{
		this.scene.start(SceneKeys.Game)
	}
}
