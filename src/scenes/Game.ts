import Phaser from 'phaser'
import Hero from '../game/Hero'

import { createHeroAnims } from '../game/HeroAnims'
import { createGhostAnims } from '../game/GhostAnims'

import '../game/Hero'
import '../game/Ghost'
import SimpleGhostAI from '~/game/ghost-ai/SimpleGhostAI'
import ScatterAI from '~/game/ghost-ai/ScatterAI'
import ChaseHeroAI from '~/game/ghost-ai/ChaseHeroAI'
import InterceptHeroAI from '~/game/ghost-ai/InterceptHeroAI'
import FlankHeroAI from '../game/ghost-ai/FlankHeroAI'
import PlayfullyChaseHeroAI from '~/game/ghost-ai/PlayfullyChaseHeroAI'
import HeroAI from '~/game/HeroAI'

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
		createGhostAnims(this.anims)

		this.createFromObjectsLayer(map.getObjectLayer('BoardObjects'))
		this.setupHero(this.boardLayer)

		if (this.hero)
		{
			this.physics.add.overlap(this.hero, dots, this.handlePlayerEatDot, this.processPlayerEatDot, this)
			this.physics.add.overlap(this.hero, powerDots, this.handlePlayerEatPowerDot, this.processPlayerEatDot, this)
		}

		const blinky = this.add.ghost(256, 256)
			.makeRed()
			.enableTargetMarker(true)
		blinky.setAI(new ChaseHeroAI(this.hero!, blinky, this.boardLayer))

		const pinky = this.add.ghost(224, 256)
			.makePink()
			.enableTargetMarker(true)
		pinky.setAI(new InterceptHeroAI(this.hero!, pinky, this.boardLayer, true))

		const inky = this.add.ghost(288, 256)
			.makeTeal()
			.enableTargetMarker(true)
		inky.setAI(new FlankHeroAI(this.hero!, inky, blinky, this.boardLayer, true))

		const clyde = this.add.ghost(320, 256)
			.makeOrange()
			.enableTargetMarker(true)

		clyde.setAI(new PlayfullyChaseHeroAI(
			this.hero!,
			clyde,
			this.boardLayer,
			new ScatterAI(16, this.boardLayer!.height - 16, clyde, this.boardLayer)
		))

		// ghost.setAI(new SimpleGhostAI(ghost, this.boardLayer))
		// ghost.setAI(new ScatterAI(this.boardLayer!.width, this.boardLayer!.height, ghost, this.boardLayer))
		// ghost.setAI(new ChaseHeroAI(this.hero!, ghost, this.boardLayer))
		// ghost.setAI(new InterceptHeroAI(this.hero!, ghost, this.boardLayer, true))
	}

	private handlePlayerEatPowerDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		if (!this.hero)
		{
			return
		}
		this.hero.eatPowerDot(obj2 as Phaser.Physics.Arcade.Sprite)
	}

	private processPlayerEatDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		if (!this.hero)
		{
			return false
		}
		return this.hero.canEatDot(obj2 as Phaser.Physics.Arcade.Sprite)
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
					this.hero.setAI(new HeroAI())
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

		this.physics.world.setBounds(0, 0, board.width, board.height)
	}
}
