enum Direction
{
	Left,
	Right,
	Up,
	Down,

	None
}

interface IGhostAI
{
	readonly speed: number
	readonly targetPosition: { x: number, y: number }

	pickDirection(): Direction
}

const getOrderedDirections = (filter?: (dir: Direction) => boolean) => {
	const dirs = [Direction.Up, Direction.Left, Direction.Down, Direction.Right]
	if (!filter)
	{
		return dirs
	}
	return dirs.filter(filter)
}

const getOppositeDirection = (direction: Direction) => {
	switch (direction)
	{
		case Direction.Left:
			return Direction.Right
		case Direction.Right:
			return Direction.Left
		case Direction.Up:
			return Direction.Down
		case Direction.Down:
			return Direction.Up
	}
}

export {
	IGhostAI,
	Direction,

	getOrderedDirections,
	getOppositeDirection
}
