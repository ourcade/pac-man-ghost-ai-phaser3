import Phaser from 'phaser'

import { IGhostAI, getOrderedDirections, getOppositeDirection } from './IGhostAI'
import Hero from '../Hero'
import Ghost from '../Ghost'

import { determineDirectionFromTarget } from './utils/determineDirectionFromTarget'

export default class ChaseHeroAI implements IGhostAI
{
	private readonly hero: Hero
	private readonly ghost: Ghost
	private readonly board: Phaser.Tilemaps.DynamicTilemapLayer

	get speed()
	{
		return 100
	}

	get targetPosition()
	{
		return {
			x: this.hero.x,
			y: this.hero.y
		}
	}

	constructor(hero: Hero, ghost: Ghost, board: Phaser.Tilemaps.DynamicTilemapLayer)
	{
		this.hero = hero
		this.ghost = ghost
		this.board = board
	}

	pickDirection()
	{
		const tx = this.hero.body.position.x
		const ty = this.hero.body.position.y

		const backwardsPosition = getOppositeDirection(this.ghost.currentDirection)
		const directions = getOrderedDirections(dir => dir !== backwardsPosition)

		return determineDirectionFromTarget(
			this.ghost.x, this.ghost.y,
			tx, ty,
			directions,
			this.board
		)
	}
}
