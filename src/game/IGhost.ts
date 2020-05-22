import { Direction, IGhostAI } from './ghost-ai/IGhostAI'

interface IGhost
{
	readonly currentDirection: Direction
	readonly physicsBody: Phaser.Physics.Arcade.Body

	setAI(ai: IGhostAI): IGhost
	enableTargetMarker(enable: boolean): IGhost

	makeRed(): IGhost
	makeTeal(): IGhost
	makePink(): IGhost
	makeOrange(): IGhost

	look(direction: Direction): void

	preUpdate(t: number, dt: number): void
}

export default IGhost
