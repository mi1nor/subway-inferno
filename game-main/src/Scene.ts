import { Tag } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Wall } from "./GameObjects/Wall.js";
import { Canvas } from "./Context.js";
import {
	GameObject,
	Vector2,
	RaycastHit,
	Line,
	GetIntersectPoint,
	Lerp,
	Color,
} from "./Utilites.js";

export class Scene {
	public static Current: Scene;

	private readonly _gameObjects: GameObject[];
	public readonly Player: Player;
	public readonly Length: number;
	private _levelPosition = 0;

	constructor(player: Player, Length: number) {
		this.Length = Length;
		this.Player = player;

		Scene.Current = this;

		this._gameObjects = [
			player,
			new Wall(0, 750, Length, 100),
			new Wall(Length, 0, 100, 1000),
			new Wall(0, -100, Length, 100),
			new Wall(-100, 0, 100, 1000),
		];
	}

	public GetLevelPosition() {
		return this._levelPosition;
	}

	public GetCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collide = GameObject.GetCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public IsCollide(who: GameObject, tag?: Tag) {
		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collide = GameObject.IsCollide(who, object);

			if (collide !== false) return collide;
		}

		return false;
	}

	public Raycast(
		from: Vector2,
		direction: Vector2,
		distance: number,
		tag?: Tag
	): RaycastHit[] | undefined {
		const result: RaycastHit[] = [];

		const normalized = direction.Normalize();
		const line = new Line(
			from.X,
			from.Y,
			from.X + normalized.X * distance,
			from.Y + normalized.Y * distance
		);

		for (const object of this._gameObjects) {
			if (tag !== undefined && (object.Tag & tag) === 0) continue;

			const collider = object.GetCollider();
			if (collider === undefined) continue;

			const pos = object.GetPosition();

			const top = GetIntersectPoint(
				line,
				new Line(
					pos.X,
					pos.Y + collider.Height,
					pos.X + collider.Width,
					pos.Y + collider.Height
				)
			);
			const right = GetIntersectPoint(
				line,
				new Line(
					pos.X + collider.Width,
					pos.Y,
					pos.X + collider.Width,
					pos.Y + collider.Height
				)
			);
			const bottom = GetIntersectPoint(
				line,
				new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y)
			);
			const left = GetIntersectPoint(
				line,
				new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height)
			);

			if (top !== undefined)
				result.push({ position: top, instance: object });
			if (right !== undefined)
				result.push({ position: right, instance: object });
			if (bottom !== undefined)
				result.push({ position: bottom, instance: object });
			if (left !== undefined)
				result.push({ position: left, instance: object });
		}

		return result.length === 0
			? undefined
			: result.sort(
					(a, b) =>
						(a.position.X - from.X) ** 2 +
						(a.position.Y - from.Y) ** 2 -
						((b.position.X - from.X) ** 2 +
							(b.position.Y - from.Y) ** 2)
			  );
	}

	public Update(dt: number) {
		const plrPos = this.Player.GetPosition();
		const plrSize = this.Player.GetCollider();

		this._levelPosition = Lerp(
			this._levelPosition,
			Math.clamp(
				plrPos.X - 1500 / 2 - plrSize.Width / 2,
				0,
				this.Length - 1500
			),
			dt / 500
		);

		for (const object of this._gameObjects) object.Update(dt);
	}

	public Render() {
		Canvas.SetFillColor(new Color(50, 50, 50));
		Canvas.DrawRectangleFixed(0, 0, this.Length, 750);
		
		for (const object of this._gameObjects) object.Render();
	}

	public RenderOverlay() {
		this.Player.RenderOverlay();
	}

	public Instantiate(object: GameObject) {
		const index = this._gameObjects.push(object) - 1;

		object.OnDestroy = () => this._gameObjects.splice(index);
	}
}