import Phaser from 'phaser'

import { IGhostAI, getOppositeDirection, getOrderedDirections } from './IGhostAI'
import Hero from '../Hero'
import Ghost from '../Ghost'
import ScatterAI from './ScatterAI'

import { determineDirectionFromTarget } from './utils/determineDirectionFromTarget'

import { TileSize } from './consts/TileConfig'

export default class PlayfullyChaseHeroAI implements IGhostAI
{
	private readonly hero: Hero
	private readonly ghost: Ghost
	private readonly board: Phaser.Tilemaps.DynamicTilemapLayer
	private readonly scatterAI: ScatterAI

	private targetPos = { x: -1, y: -1 }

	get speed()
	{
		return 100
	}

	get targetPosition()
	{
		return {
			x: this.targetPos.x,
			y: this.targetPos.y
		}
	}

	constructor(hero: Hero, ghost: Ghost, board: Phaser.Tilemaps.DynamicTilemapLayer, scatterAI: ScatterAI)
	{
		this.hero = hero
		this.ghost = ghost
		this.board = board
		this.scatterAI = scatterAI
	}

	pickDirection()
	{
		const backwardsPosition = getOppositeDirection(this.ghost.currentDirection)
		const directions = getOrderedDirections(dir => dir !== backwardsPosition)

		const { x, y } = this.ghost
		const { x: tx, y: ty } = this.hero

		const d = Phaser.Math.Distance.Between(x, y, tx, ty)

		if (d >= 8 * TileSize)
		{
			this.targetPos.x = tx
			this.targetPos.y = ty
			return determineDirectionFromTarget(x, y, tx, ty, directions, this.board)
		}
		
		this.targetPos = this.scatterAI.targetPosition
		return this.scatterAI.pickDirection()
	}
}
