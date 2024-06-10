import { Rectangle, Color, GameObject } from "../Utilites.js";
import { Tag } from "../Enums.js";
import { Canvas } from "../Context.js";
import { Scene } from "../Scene.js";

export class Wall extends GameObject {
	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this.Tag = Tag.Wall;
		this._x = x;
		this._y = y;

		this._collider = new Rectangle(0, 0, width, height);
	}

	override Render(): void {
		Canvas.SetFillColor(Color.Black);
		Canvas.DrawRectangle(
			this._x - Scene.Current.GetLevelPosition(),
			this._y,
			this._width,
			this._height
		);
	}
}
