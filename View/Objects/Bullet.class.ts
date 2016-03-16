module View.Objects {
    export enum BulletType {
        SingleBullet,
        DoubleBullet
    }

    export class Bullet extends GameObject {
        constructor(type: BulletType = BulletType.SingleBullet) {
            var texture = TextureManager.getInstance().getTexture("bullet");
            super(new PIXI.Sprite(texture));
        }
    }
}