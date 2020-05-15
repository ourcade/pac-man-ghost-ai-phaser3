import Phaser from 'phaser'

import Hero from '../Hero'
import Ghost from '../Ghost'

import { IGhostAI, getOppositeDirection, getOrderedDirections } from './IGhostAI'

import { TileSize } from './consts/TileConfig'
import determineDirectionFromTarget from './utils/determineDirectionFromTarget'

export default class FlankHeroAI implements IGhostAI
{
	private readonly hero: Hero
	private readonly ghost: Ghost
	private readonly chasingGhost: Ghost
	private readonly board: Phaser.Tilemaps.DynamicTilemapLayer

	private mimicOriginal = false

	get speed()
	{
		return 100
	}

	get targetPosition()
	{
		const heroDir = this.hero.facingVector

		if (this.mimicOriginal && heroDir.y === -1)
		{
			heroDir.x = -1
		}

		const tx = this.hero.x + TileSize * (heroDir.x * 2)
		const ty = this.hero.y + TileSize * (heroDir.y * 2)

		const pt = new Phaser.Geom.Point(tx - this.chasingGhost.x, ty - this.chasingGhost.y)
		
		return { x: tx + pt.x, y: ty + pt.y }
	}

	constructor(hero: Hero, ghost: Ghost, chasingGhost: Ghost, board: Phaser.Tilemaps.DynamicTilemapLayer, mimicOriginal = false)
	{
		this.hero = hero
		this.ghost = ghost
		this.chasingGhost = chasingGhost
		this.board = board

		this.mimicOriginal = mimicOriginal
	}

	pickDirection()
	{
		const backwardsDirection = getOppositeDirection(this.ghost.currentDirection)
		const directions = getOrderedDirections(dir => dir !== backwardsDirection)

		const { x: tx, y: ty } = this.targetPosition
		const { x, y } = this.ghost

		return determineDirectionFromTarget(x, y, tx, ty, directions, this.board)
	}
}
