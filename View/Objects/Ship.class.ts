module View.Objects {
    export class Ship extends GameObject {
        constructor() {
            var texture = TextureManager.getInstance().getTexture("ship");
            var sprite = new PIXI.Sprite(texture);
            sprite.rotation = Math.PI;
            super(sprite);
        }
    }
}