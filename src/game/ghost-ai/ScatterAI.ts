import Phaser from 'phaser'

import { IGhostAI, getOrderedDirections, getOppositeDirection } from './IGhostAI'
import Ghost from '../Ghost'

import determineDirectionFromTarget from './utils/determineDirectionFromTarget'

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
			x: this.targetX,
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
		const backwardsDirection = getOppositeDirection(this.ghost.currentDirection)
		const directions = getOrderedDirections(dir => dir !== backwardsDirection)

		return determineDirectionFromTarget(
			this.ghost.x, this.ghost.y,
			this.targetX, this.targetY,
			directions,
			this.boardLayer
		)
	}
}
