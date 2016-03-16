module Game.Objects {
    export abstract class GameObject {
        private destroyed: boolean = false;
        protected viewObject: View.Objects.GameObject;
        private velocity = {
            x: 0, y: 0
        }

        constructor(viewObject: View.Objects.GameObject) {
            this.viewObject = viewObject;
            this.viewObject.insertIntoView();
        }

        isDestroyed() {
            return this.destroyed;
        }

        destroy() {
            this.destroyed = true;
            this.viewObject.removeFromView();
        }

        setPosition(x: number, y: number) {
            // @TODO
        }

        collidesWith(obj: GameObject) {
            // @TODO
        }

        abstract onCollision(obj: GameObject);

        update() {
            // @TODO            
        }
    }
}