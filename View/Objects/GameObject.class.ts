module View.Objects {
    export abstract class GameObject {
        private sprite: PIXI.Sprite;
        private placedOnView: boolean = false;

        constructor(sprite: PIXI.Sprite) {
            this.sprite = sprite;
            this.sprite.position = new PIXI.Point(-100, -100);
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
        }

        get position() {
            return this.sprite.position;
        }

        get rotation() {
            return this.sprite.rotation;
        }

        set position(point: PIXI.Point) {
            this.sprite.position = point.clone();
        }

        set rotation(angle: number) {
            this.sprite.rotation = angle;
        }

        get width() {
            return Math.floor(this.sprite.width * this.sprite.scale.x);
        }

        get height() {
            return Math.floor(this.sprite.height * this.sprite.scale.y);
        }

        public insertIntoView() {
            if (this.placedOnView)
                return;

            var gameView = <GameView>ViewManager.getInstance().getView("game");
            gameView.getStage().addChild(this.sprite);

            this.placedOnView = true;
        }

        public removeFromView() {
            if (!this.placedOnView)
                return;

            var gameView = <GameView>ViewManager.getInstance().getView("game");
            gameView.getStage().removeChild(this.sprite);

            this.placedOnView = false;
        }
    }
}