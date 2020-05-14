import Phaser from 'phaser'

enum Moves
{
	None,
	Left,
	Right,
	Up,
	Down
}

export default class Hero extends Phaser.Physics.Arcade.Sprite
{
	private queuedMove = Moves.None
	private lastKeyDown = Moves.None
	private queuedMoveAccumulator = 0

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string)
	{
		super(scene, x, y, texture)

		this.setTint(0xfffc3b)
		this.play('hero-idle')
	}

	handleMovement(dt: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys, boardLayer: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		const threshold = 10

		const x = (Math.floor(this.x / 32) * 32) + 16
		const y = (Math.floor(this.y / 32) * 32) + 16
		const vel = this.body.velocity

		if (vel.lengthSq() > 0.2)
		{
			this.play('hero-move', true)
		}
		else
		{
			this.play('hero-idle')
			this.lastKeyDown = Moves.None
		}

		if (cursors.left?.isDown && vel.x >= 0)
		{
			if (!boardLayer.getTileAtWorldXY(this.x - 32, this.y))
			{
				if (vel.y === 0 || Math.abs(y - this.y) <= threshold)
				{
					this.queuedMove = Moves.Left
				}	
			}
		}
		else if (cursors.right?.isDown && vel.x <= 0)
		{
			if (!boardLayer.getTileAtWorldXY(this.x + 32, this.y))
			{
				if (vel.y === 0 || Math.abs(y - this.y) <= threshold)
				{
					this.queuedMove = Moves.Right
				}
			}
		}
		else if (cursors.up?.isDown && vel.y >= 0)
		{
			if (!boardLayer.getTileAtWorldXY(this.x, this.y - 32))
			{
				if (vel.x === 0 || Math.abs(x - this.x) <= threshold)
				{
					this.queuedMove = Moves.Up
				}
			}
		}
		else if (cursors.down?.isDown && vel.y <= 0)
		{
			if (!boardLayer.getTileAtWorldXY(this.x, this.y + 32))
			{
				if (vel.x === 0 || Math.abs(x - this.x) <= threshold)
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
				if (Math.abs(y - this.y) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Right:
			{
				if (Math.abs(y - this.y) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Up:
			{
				if (Math.abs(x - this.x) <= 2)
				{
					this.lastKeyDown = this.queuedMove
					this.queuedMove = Moves.None
				}
				break
			}

			case Moves.Down:
			{
				if (Math.abs(x - this.x) <= 2)
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
				const y = (Math.floor((this.body.y + 16) / 32) * 32) // + 16
				this.body.y = y
				this.setVelocity(-speed, 0)
				this.setAngle(180)
				break
			}

			case Moves.Right:
			{
				const y = (Math.floor((this.body.y + 16) / 32) * 32) // + 16
				this.body.y = y
				this.setVelocity(speed, 0)
				this.setAngle(0)
				break
			}

			case Moves.Up:
			{
				const x = Math.floor((this.body.x + 16) / 32) * 32
				this.body.x = x
				this.setVelocity(0, -speed)
				this.setAngle(-90)
				break
			}

			case Moves.Down:
			{
				const x = Math.floor((this.body.x + 16) / 32) * 32
				this.body.x = x
				this.setVelocity(0, speed)
				this.setAngle(90)
				break
			}
		
			default:
				break;
		}
	}
}

Phaser.GameObjects.GameObjectFactory.register('hero', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string) {
	const hero = new Hero(this.scene, x, y, texture)

	this.displayList.add(hero)
	this.updateList.add(hero)

	this.scene.physics.world.enableBody(hero, Phaser.Physics.Arcade.DYNAMIC_BODY)

	const body = hero.body as Phaser.Physics.Arcade.Body
	body.setCircle(16)
		.setFriction(0, 0)

	return hero
})

declare global
{
	namespace Phaser.GameObjects
	{
		interface GameObjectFactory
		{
			hero(x: number, y: number, texture: string): Hero
		}
	}
}
