import Phaser from 'phaser'

import { Direction, IGhostAI } from './IGhostAI'
import Ghost from '../Ghost'

export default class SimpleGhostAI implements IGhostAI
{
	private readonly ghost: Ghost
	private readonly boardLayer: Phaser.Tilemaps.DynamicTilemapLayer

	get speed()
	{
		return 100
	}

	get targetPosition()
	{
		return {
			x: 0,
			y: 0
		}
	}

	constructor(ghost: Ghost, board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		this.ghost = ghost
		this.boardLayer = board
	}

	pickDirection()
	{
		const body = this.ghost.body as Phaser.Physics.Arcade.Body
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

		return Direction.None
	}

	private getPossibleDirections()
	{
		const body = this.ghost.body as Phaser.Physics.Arcade.Body
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
