import { Direction } from "../IGhostAI";

import { TileSize } from '../consts/TileConfig'

const positionInDirection = (x: number, y: number, direction: Direction) => {
	switch (direction)
	{
		case Direction.Up:
			return { x, y: y - TileSize }

		case Direction.Left:
			return { x: x - TileSize, y }

		case Direction.Down:
			return { x, y: y + TileSize }

		case Direction.Right:
			return { x: x + TileSize, y }

		default:
			return { x, y }
	}
}

export default positionInDirection

export {
	positionInDirection
}
