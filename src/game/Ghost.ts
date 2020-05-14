import Phaser from 'phaser'

enum Direction
{
	Left,
	Right,
	Up,
	Down
}

export default class Ghost extends Phaser.GameObjects.Container
{
	private ghostBody: Phaser.GameObjects.Sprite
	private leftPupil: Phaser.GameObjects.Image
	private rightPupil: Phaser.GameObjects.Image

	private readonly boardLayer: Phaser.Tilemaps.DynamicTilemapLayer

	constructor(scene: Phaser.Scene, x: number, y: number, board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		super(scene, x, y)

		this.boardLayer = board

		this.ghostBody = scene.add.sprite(16, 16, 'game-atlas')
		this.ghostBody.play('ghost-body-idle')

		const eyes = scene.add.image(16, 11, 'game-atlas', 'ghost-eyes.png')

		this.leftPupil = scene.add.image(0, 0, 'game-atlas', 'ghost-pupil.png')
			.setTint(0x2F16AF)
		this.rightPupil = scene.add.image(0, 0, 'game-atlas', 'ghost-pupil.png')
			.setTint(0x2F16AF)

		this.add(this.ghostBody)
		this.add(eyes)
		this.add(this.leftPupil)
		this.add(this.rightPupil)

		this.look('center')
	}

	makeRed()
	{
		this.ghostBody.setTint(0xFF0400)
	}

	makeTeal()
	{
		this.ghostBody.setTint(0x0CF9E3)
	}

	makePink()
	{
		this.ghostBody.setTint(0xFCB4E3)
	}

	makeOrange()
	{
		this.ghostBody.setTint(0xFCB72C)
	}

	look(direction: 'left' | 'right' | 'up' | 'down' | 'center')
	{
		switch (direction)
		{
			default:
				this.leftPupil.x = 10
				this.leftPupil.y = 11
				this.rightPupil.x = 22
				this.rightPupil.y = 11
				break

			case 'left':
				this.leftPupil.x = 7
				this.leftPupil.y = 11
				this.rightPupil.x = 20
				this.rightPupil.y = 11
				break
			
			case 'right':
				this.leftPupil.x = 12
				this.leftPupil.y = 11
				this.rightPupil.x = 25
				this.rightPupil.y = 11
				break

			case 'up':
				this.leftPupil.x = 10
				this.leftPupil.y = 8
				this.rightPupil.x = 22
				this.rightPupil.y = 8
				break

			case 'down':
				this.leftPupil.x = 10
				this.leftPupil.y = 15
				this.rightPupil.x = 22
				this.rightPupil.y = 15
				break
		}
	}

	preUpdate(t: number, dt: number)
	{
		this.scene.physics.world.wrapObject(this, 32)

		const body = this.body as Phaser.Physics.Arcade.Body
		const x = body.position.x
		const y = body.position.y

		const gx = (Math.floor(x / 32) * 32)
		const gy = (Math.floor(y / 32) * 32)

		if (Math.abs(x - gx) > 2 || Math.abs(y - gy) > 2)
		{
			return
		}

		body.position.x = gx
		body.position.y = gy

		const speed = 100
		const dir = this.pickDirection()
		
		switch (dir)
		{
			case 0:
				this.look('left')
				body.setVelocity(-speed, 0)
				break

			case 1:
				this.look('right')
				body.setVelocity(speed, 0)
				break

			case 2:
				this.look('up')
				body.setVelocity(0, -speed)
				break

			case 3:
				this.look('down')
				body.setVelocity(0, speed)
				break
		}
	}

	private pickDirection()
	{
		const body = this.body as Phaser.Physics.Arcade.Body
		const x = body.position.x
		const y = body.position.y

		const directions = this.getPossibleDirections()
		
		for (let i = 0; i < directions.length; ++i)
		{
			const dir = directions[i]
			switch (dir)
			{
				case Direction.Left:
				{
					// check left
					if (!this.boardLayer.getTileAtWorldXY(x - 32, y))
					{
						return dir
					}
					break
				}

				case Direction.Right:
				{
					// check right
					if (!this.boardLayer.getTileAtWorldXY(x + 32, y))
					{
						return dir
					}
					break
				}

				case Direction.Up:
				{
					// check up
					if (!this.boardLayer.getTileAtWorldXY(x, y - 32))
					{
						return dir
					}
					break
				}

				case Direction.Down:
				{
					// check up
					if (!this.boardLayer.getTileAtWorldXY(x, y + 32))
					{
						return dir
					}
					break
				}
			}
		}

		return -1
	}

	private getPossibleDirections()
	{
		const body = this.body as Phaser.Physics.Arcade.Body
		const vel = body.velocity

		let oppositeDir = -1

		if (vel.x < 0)
		{
			oppositeDir = Direction.Right
		}
		else if (vel.x > 0)
		{
			oppositeDir = Direction.Left
		}
		else if (vel.y < 0)
		{
			oppositeDir = Direction.Down
		}
		else if (vel.y > 0)
		{
			oppositeDir = Direction.Up
		}

		return [Direction.Left, Direction.Right, Direction.Up, Direction.Down]
			.filter(dir => dir !== oppositeDir)
	}
}

Phaser.GameObjects.GameObjectFactory.register('ghost', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, board: Phaser.Tilemaps.DynamicTilemapLayer) {
	const ghost = new Ghost(this.scene, x, y, board)

	this.displayList.add(ghost)
	this.updateList.add(ghost)

	this.scene.physics.world.enableBody(ghost, Phaser.Physics.Arcade.DYNAMIC_BODY)

	const body = ghost.body as Phaser.Physics.Arcade.Body
	body.setCircle(16)
		.setFriction(0, 0)

	return ghost
})

type Layer = Phaser.Tilemaps.DynamicTilemapLayer

declare global
{
	namespace Phaser.GameObjects
	{
		interface GameObjectFactory
		{
			ghost(x: number, y: number, board: Layer): Ghost
		}
	}
}
