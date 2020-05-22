import Phaser from 'phaser'

import { Direction, IGhostAI } from './ghost-ai/IGhostAI'
import IGhost from './IGhost'

export default class Ghost extends Phaser.GameObjects.Container implements IGhost
{
	private readonly ghostBody: Phaser.GameObjects.Sprite
	private readonly leftPupil: Phaser.GameObjects.Image
	private readonly rightPupil: Phaser.GameObjects.Image

	private aiBehavior?: IGhostAI
	private lastDirection = Direction.None

	private lastTilePosition = { x: -1, y: -1 }

	private targetIndicator: Phaser.GameObjects.Text

	get currentDirection()
	{
		return this.lastDirection
	}

	constructor(scene: Phaser.Scene, x: number, y: number)
	{
		super(scene, x, y)

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

		this.look(Direction.None)

		this.targetIndicator = scene.add.text(0, 0, 'x')
			.setOrigin(0.5)
			.setDepth(1000)

		this.enableTargetMarker(false)
	}

	setAI(ai: IGhostAI)
	{
		this.aiBehavior = ai
		return this
	}

	enableTargetMarker(enable: boolean)
	{
		this.targetIndicator.setVisible(enable)
		return this
	}

	makeRed()
	{
		this.ghostBody.setTint(0xFF0400)
		this.targetIndicator.setColor('#FF0400')
		return this
	}

	makeTeal()
	{
		this.ghostBody.setTint(0x0CF9E3)
		this.targetIndicator.setColor('#0CF9E3')
		return this
	}

	makePink()
	{
		this.ghostBody.setTint(0xFCB4E3)
		this.targetIndicator.setColor('#FCB4E3')
		return this
	}

	makeOrange()
	{
		this.ghostBody.setTint(0xFCB72C)
		this.targetIndicator.setColor('#FCB72C')
		return this
	}

	look(direction: Direction)
	{
		switch (direction)
		{
			default:
				this.leftPupil.x = 10
				this.leftPupil.y = 11
				this.rightPupil.x = 22
				this.rightPupil.y = 11
				break

			case Direction.Left:
				this.leftPupil.x = 7
				this.leftPupil.y = 11
				this.rightPupil.x = 20
				this.rightPupil.y = 11
				break
			
			case Direction.Right:
				this.leftPupil.x = 12
				this.leftPupil.y = 11
				this.rightPupil.x = 25
				this.rightPupil.y = 11
				break

			case Direction.Up:
				this.leftPupil.x = 10
				this.leftPupil.y = 8
				this.rightPupil.x = 22
				this.rightPupil.y = 8
				break

			case Direction.Down:
				this.leftPupil.x = 10
				this.leftPupil.y = 15
				this.rightPupil.x = 22
				this.rightPupil.y = 15
				break
		}
	}

	preUpdate(t: number, dt: number)
	{
		if (!this.aiBehavior)
		{
			return
		}

		this.scene.physics.world.wrapObject(this, 32)

		const body = this.body as Phaser.Physics.Arcade.Body
		const x = body.position.x
		const y = body.position.y

		if (!Phaser.Geom.Rectangle.Contains(this.scene.physics.world.bounds, x, y))
		{
			// don't switch direction when outside of world; being wrapped
			return
		}

		const gx = (Math.floor(x / 32) * 32)
		const gy = (Math.floor(y / 32) * 32)

		if (this.lastTilePosition.x === gx && this.lastTilePosition.y === gy)
		{
			// skip if we just handled this position
			return
		}

		if (Math.abs(x - gx) > 4 || Math.abs(y - gy) > 4)
		{
			return
		}

		body.position.x = gx
		body.position.y = gy

		this.lastTilePosition.x = gx
		this.lastTilePosition.y = gy

		const speed = this.aiBehavior.speed

		const dir = this.aiBehavior.pickDirection()

		const tPos = this.aiBehavior.targetPosition
		this.targetIndicator.setPosition(tPos.x, tPos.y)
		
		switch (dir)
		{
			case 0:
				this.look(Direction.Left)
				body.setVelocity(-speed, 0)
				break

			case 1:
				this.look(Direction.Right)
				body.setVelocity(speed, 0)
				break

			case 2:
				this.look(Direction.Up)
				body.setVelocity(0, -speed)
				break

			case 3:
				this.look(Direction.Down)
				body.setVelocity(0, speed)
				break
		}

		this.lastDirection = dir
	}
}

Phaser.GameObjects.GameObjectFactory.register('ghost', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
	const ghost = new Ghost(this.scene, x, y)

	this.displayList.add(ghost)
	this.updateList.add(ghost)

	this.scene.physics.world.enableBody(ghost, Phaser.Physics.Arcade.DYNAMIC_BODY)

	const body = ghost.body as Phaser.Physics.Arcade.Body
	body.setCircle(16)
		.setFriction(0, 0)

	return ghost
})

declare global
{
	namespace Phaser.GameObjects
	{
		interface GameObjectFactory
		{
			ghost(x: number, y: number): Ghost
		}
	}
}
