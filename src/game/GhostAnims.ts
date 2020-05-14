import Phaser from 'phaser'

const createGhostAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'ghost-body-idle',
		frames: anims.generateFrameNames('game-atlas', { start: 1, end: 2, prefix: 'ghost-body-', suffix: '.png' }),
		frameRate: 5,
		repeat: -1
	})
}

export default createGhostAnims

export {
	createGhostAnims
}
