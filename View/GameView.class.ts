module View {
    export class GameView extends View {
        private stars: Stars;

        constructor() {
            super();
            this.stars = new Stars(this);
        }

        update() {
            this.stars.move(1, 1);
        }
    }

    class Stars {
        private stars: PIXI.TilingSprite;

        constructor(parent: View) {
            var texture = TextureManager.getInstance().getTexture("stars");
            this.stars = new PIXI.TilingSprite(texture, 800, 600);
            parent.getStage().addChild(this.stars);
        }

        set opacity(alpha: number) {
            this.stars.alpha = alpha;
        }
        get opacity(): number {
            return this.stars.alpha;
        }

        move(x: number, y: number) {
            this.stars.tilePosition.x += x;
            this.stars.tilePosition.y += y;
        }
    }
} 