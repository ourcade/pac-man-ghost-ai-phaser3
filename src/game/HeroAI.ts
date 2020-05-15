import Phaser from 'phaser'

export default class HeroAI
{
	private count = 0

	private keysDownState = {
		left: false,
		right: false,
		up: false,
		down: false
	}

	getKeysDownState()
	{
		++this.count
		if (this.count >= 30)
		{
			this.count = 1
		}

		if (this.count > 1)
		{
			return this.keysDownState
		}

		const r = Phaser.Math.Between(0, 3)
		this.keysDownState.left = false
		this.keysDownState.right = false
		this.keysDownState.up = false
		this.keysDownState.down = false

		switch (r)
		{
			case 0:
				this.keysDownState.left = true
				break

			case 1:
				this.keysDownState.right = true
				break

			case 2:
				this.keysDownState.up = true
				break

			case 3:
				this.keysDownState.down = true
				break
		}

		return this.keysDownState
	}
}
