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

const getOrderedDirections = () => [ Direction.Up, Direction.Left, Direction.Down, Direction.Right ]
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
