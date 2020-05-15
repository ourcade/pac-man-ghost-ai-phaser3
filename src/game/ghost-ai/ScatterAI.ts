import Phaser from 'phaser'

import { Direction, IGhostAI, getOrderedDirections, getOppositeDirection } from './IGhostAI'
import Ghost from '../Ghost'

import positionInDirection from './utils/positionInDirection'

export default class ScatterAI implements IGhostAI
{
	private readonly targetX: number
	private readonly targetY: number
	private readonly ghost: Ghost
	private readonly boardLayer: Phaser.Tilemaps.DynamicTilemapLayer

	get speed()
	{
		return 100
	}

	get targetPosition()
	{
		return {
			x: this.targetY,
			y: this.targetY
		}
	}

	constructor(targetX: number, targetY: number, ghost: Ghost, board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		this.targetX = targetX
		this.targetY = targetY
		this.ghost = ghost
		this.boardLayer = board
	}

	pickDirection()
	{
		const directions = getOrderedDirections()
		let closestDirection = Direction.None
		let closestDistance = -1

		const backwardsDirection = getOppositeDirection(this.ghost.currentDirection)

		for (const dir of directions)
		{
			if (dir === backwardsDirection)
			{
				// cannot go backwards
				continue
			}

			const x = this.ghost.x
			const y = this.ghost.y
			const position = positionInDirection(x, y, dir)

			if (this.boardLayer.getTileAtWorldXY(position.x, position.y))
			{
				// cannot move into walls
				continue
			}

			const d = Phaser.Math.Distance.Between(position.x, position.y, this.targetX, this.targetY)
			if (closestDirection === Direction.None)
			{
				// first possible direction
				closestDirection = dir
				closestDistance = d
				continue
			}

			if (d < closestDistance)
			{
				closestDirection = dir
				closestDistance = d
			}
		}

		return closestDirection
	}
}
