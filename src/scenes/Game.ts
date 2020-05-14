import Phaser from 'phaser'
import Hero from '../game/Hero'

import '../game/Hero'

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

export default class Game extends Phaser.Scene
{
	private hero?: Hero
	private boardLayer?: Phaser.Tilemaps.DynamicTilemapLayer

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

	init()
	{
		this.cursors = this.input.keyboard.createCursorKeys()
	}

	preload()
    {
		this.load.tilemapTiledJSON('tilemap', 'levels/level-1.json')
    }

    create()
    {
		const map = this.make.tilemap({ key: 'tilemap' })
		const tileset = map.addTilesetImage('basic_tiles', 'tiles')
		
		this.boardLayer = map.createDynamicLayer('Board', tileset)
			.forEachTile((tile: Phaser.Tilemaps.Tile) => {
				tile.tint = 0x3ba3ff
			})
			.setCollisionByProperty({ collides: true })

		const dotsLayer = map.createDynamicLayer('Dots', tileset)
		const dots = dotsLayer.createFromTiles(33, -1, { key: 'tiles', frame: 'white-dot-small.png', origin: 0 })
		dots.forEach(dot => {
			this.physics.add.existing(dot)
			const body = dot.body as Phaser.Physics.Arcade.Body
			body.setCircle(4, 12, 12)
		})

		const powerDots = dotsLayer.createFromTiles(34, -1, { key: 'tiles', frame: 'white-dot.png', origin: 0 })
		powerDots.forEach(dot => {
			this.physics.add.existing(dot)
			const body = dot.body as Phaser.Physics.Arcade.Body
			body.setCircle(8, 8, 8)

			this.tweens.add({
				targets: dot,
				alpha: 0,
				duration: 1000,
				yoyo: true,
				repeat: -1
			})
		})

		createHeroAnims(this.anims)

		this.createFromObjectsLayer(map.getObjectLayer('BoardObjects'))
		this.setupHero(this.boardLayer)

		if (this.hero)
		{
			this.physics.add.overlap(this.hero, dots, this.handlePlayerEatDot, this.processPlayerEatDot, this)
			this.physics.add.overlap(this.hero, powerDots, this.handlePlayerEatPowerDot, this.processPlayerEatDot, this)
		}
	}

	private handlePlayerEatPowerDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		obj2.destroy(true)
	}

	private processPlayerEatDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		const o1 = obj1 as Phaser.Physics.Arcade.Sprite
		const o2 = obj2 as Phaser.Physics.Arcade.Sprite

		const o1p = o1.body.position
		const o2p = o2.body.position.clone()
		o2p.x -= o2.body.offset.x
		o2p.y -= o2.body.offset.y

		return Phaser.Math.Distance.BetweenPointsSquared(o1p, o2p) <= 100
	}

	private handlePlayerEatDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		obj2.destroy(true)
	}
	
	update(t: number, dt: number)
	{
		if (this.hero && this.boardLayer)
		{
			this.hero.handleMovement(dt, this.cursors, this.boardLayer)
		}
	}

	private createFromObjectsLayer(layer: Phaser.Tilemaps.ObjectLayer)
	{
		for (let i = 0; i < layer.objects.length; ++i)
		{
			const obj = layer.objects[i]
			switch (obj.name)
			{
				case 'spawn':
				{
					const x = Math.round(obj.x! / 32) * 32
					const y = Math.round(obj.y! / 32) * 32
					this.hero = this.add.hero(x + 16, y + 16, 'game-atlas')
					break
				}
			}
		}
	}

	private setupHero(board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		if (!this.hero)
		{
			return
		}

		this.physics.add.collider(this.hero, board)
		this.cameras.main.startFollow(this.hero, true)
		this.cameras.main.useBounds = true
		this.cameras.main.setBounds(0, 0, board.width, board.height)
	}
}
