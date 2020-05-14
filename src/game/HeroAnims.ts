import Phaser from 'phaser'

const createHeroAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'hero-move',
		frameRate: 10,
		frames: anims.generateFrameNames('game-atlas', { prefix: 'hero-', suffix: '.png', start: 1, end: 2 }),
		repeat: -1
	})

	anims.create({
		key: 'hero-idle',
		frames: [{ key: 'game-atlas', frame: 'hero-2.png' }]
	})
}

export default createHeroAnims

export {
	createHeroAnims
}
