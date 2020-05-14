import Phaser from 'phaser'

enum Moves
{
	None,
	Left,
	Right,
	Up,
	Down
}

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
	private hero?: Phaser.Physics.Arcade.Sprite
	private boardLayer?: Phaser.Tilemaps.DynamicTilemapLayer

	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

	private queuedMove = Moves.None
	private lastKeyDown = Moves.None
	private queuedMoveAccumulator = 0

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
		const dotsLayer = map.createDynamicLayer('Dots', tileset)

		const dots = dotsLayer.createFromTiles(33, -1, { key: 'tiles', frame: 'white-dot-small.png', origin: 0 })
		dots.forEach(dot => {
			this.physics.add.existing(dot)
			const body = dot.body as Phaser.Physics.Arcade.Body
			body.setCircle(4, 12, 12)
		})

		this.boardLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
			tile.tint = 0x3ba3ff
		})

		this.boardLayer.setCollisionByProperty({ collides: true })

		createHeroAnims(this.anims)

		const objectsLayer = map.getObjectLayer('BoardObjects')
		for (let i = 0; i < objectsLayer.objects.length; ++i)
		{
			const obj = objectsLayer.objects[i]
			switch (obj.name)
			{
				case 'spawn':
				{
					const x = Math.round(obj.x! / 32) * 32
					const y = Math.round(obj.y! / 32) * 32
					this.hero = this.physics.add.sprite(x + 16, y + 16, 'game-atlas')
						.setTint(0xfffc3b)

					this.hero.play('hero-idle')
					const body = this.hero.body as Phaser.Physics.Arcade.Body
					body.setCircle(16)
						.setFriction(0, 0)
					break
				}
			}
		}

		this.setupHero(this.boardLayer)

		this.physics.add.overlap(this.hero!, dots, this.handlePlayerEatDot.bind(this), (obj1, obj2) => {
			const o1 = obj1 as Phaser.Physics.Arcade.Sprite
			const o2 = obj2 as Phaser.Physics.Arcade.Sprite
			const o2p = o2.body.position.clone()
			o2p.x -= 16
			o2p.y -= 16
			const d2 = Phaser.Math.Distance.BetweenPointsSquared(o1.body.position, o2p)
			return d2 <= 100
		})
	}

	private handlePlayerEatDot(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
	{
		const dot = obj2 as Phaser.Physics.Arcade.Sprite
		dot.destroy(true)
	}
	
	update(t: number, dt: number)
	{
		if (!this.hero || !this.boardLayer)
		{
			return
		}

		const threshold = 10

		const x = (Math.floor(this.hero.x / 32) * 32) + 16
		const y = (Math.floor(this.hero.y / 32) * 32) + 16
		const vel = this.hero.body.velocity

		if (vel.x !== 0 || vel.y !== 0)
		{
			this.hero.play('hero-move', true)
		}
		else
		{
			this.hero.play('hero-idle')
			this.queuedMove = Moves.None
		}

		if (this.cursors.left?.isDown && vel.x >= 0)
		{
			if (!this.boardLayer.getTileAtWorldXY(this.hero.x - 32, this.hero.y))
			{
				if (vel.y === 0 || Math.abs(y - this.hero.y) <= threshold)
				{
					this.queuedMove = Moves.Left
				}	
			}
		}
		else if (this.cursors.right?.isDown && vel.x <= 0)
		{
			if (!this.boardLayer.getTileAtWorldXY(this.hero.x + 32, this.hero.y))
			{
				if (vel.y === 0 || Math.abs(y - this.hero.y) <= threshold)
				{
					this.queuedMove = Moves.Right
				}
			}
		}
		else if (this.cursors.up?.isDown && vel.y >= 0)
		{
			if (!this.boardLayer.getTileAtWorldXY(this.hero.x, this.hero.y - 32))
			{
				if (vel.x === 0 || Math.abs(x - this.hero.x) <= threshold)
				{
					this.queuedMove = Moves.Up
				}
			}
		}
		else if (this.cursors.down?.isDown && vel.y <= 0)
		{
			if (!this.boardLayer.getTileAtWorldXY(this.hero.x, this.hero.y + 32))
			{
				if (vel.x === 0 || Math.abs(x - this.hero.x) <= threshold)
				{
					this.queuedMove = Moves.Down
				}
			}
		}

		if (this.queuedMove !== Moves.None)
		{
			this.queuedMoveAccumulator += dt
			if (this.queuedMoveAccumulator >= 200)
			{
				this.queuedMove = Moves.None
				this.queuedMoveAccumulator = 0
			}
		}

		switch (this.queuedMove)
		{
			case Moves.None:
				break

			case Moves.Left:
			{
				if (Math.abs(y - this.hero.y) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Right:
			{
				if (Math.abs(y - this.hero.y) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Up:
			{
				if (Math.abs(x - this.hero.x) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Down:
			{
				if (Math.abs(x - this.hero.x) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}
		}

		const speed = 100
		switch (this.lastKeyDown)
		{
			case Moves.Left:
			{
				const y = (Math.floor((this.hero.body.y + 16) / 32) * 32) // + 16
				this.hero.body.y = y
				this.hero.setVelocity(-speed, 0)
				this.hero.setAngle(180)
				break
			}

			case Moves.Right:
			{
				const y = (Math.floor((this.hero.body.y + 16) / 32) * 32) // + 16
				this.hero.body.y = y
				this.hero.setVelocity(speed, 0)
				this.hero.setAngle(0)
				break
			}

			case Moves.Up:
			{
				const x = Math.floor((this.hero.body.x + 16) / 32) * 32
				this.hero.body.x = x
				this.hero.setVelocity(0, -speed)
				this.hero.setAngle(-90)
				break
			}

			case Moves.Down:
			{
				const x = Math.floor((this.hero.body.x + 16) / 32) * 32
				this.hero.body.x = x
				this.hero.setVelocity(0, speed)
				this.hero.setAngle(90)
				break
			}
		
			default:
				break;
		}
	}

	private setupHero(board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		if (!this.hero)
		{
			return
		}

		const vec = board.getTopLeft()
		console.log(`${vec.x}, ${vec.y}`)

		this.physics.add.collider(this.hero, board)
		this.cameras.main.startFollow(this.hero, true)
		this.cameras.main.useBounds = true
		this.cameras.main.setBounds(0, 0, board.width, board.height)
	}
}
