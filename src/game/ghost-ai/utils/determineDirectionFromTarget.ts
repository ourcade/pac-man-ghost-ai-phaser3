import { Direction, getOppositeDirection } from '../IGhostAI'

import positionInDirection from './positionInDirection'

const determineDirectionFromTarget = (x: number, y: number, targetX: number, targetY: number, directions: Direction[], board: Phaser.Tilemaps.DynamicTilemapLayer) => {
	let closestDirection = Direction.None
	let closestDistance = -1

	for (const dir of directions)
	{
		const position = positionInDirection(x, y, dir)

		if (board.getTileAtWorldXY(position.x, position.y))
		{
			// cannot move into walls
			continue
		}

		const d = Phaser.Math.Distance.Between(position.x, position.y, targetX, targetY)
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

export default determineDirectionFromTarget
export {
	determineDirectionFromTarget
}
