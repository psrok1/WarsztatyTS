module View.Objects {
    export enum AsteroidType {
        StandardAsteroid
    }

    export class Asteroid extends GameObject {
        constructor(type: AsteroidType = AsteroidType.StandardAsteroid) {
            var texture = TextureManager.getInstance().getTexture("asteroid");
            super(new PIXI.Sprite(texture));
        }
    }
}