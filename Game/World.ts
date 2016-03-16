module Game.World {
    const UPDATE_RATE = 30; /* fps */

    export const WORLD_WIDTH = 800;
    export const WORLD_HEIGHT = 600;

    // Wywoływane po załadowaniu tekstur i skonstruowaniu widoku
    export function init() {
        // @TODO
        // ---- JUST SOME "HELLO WORLD" ----
        var ship = new View.Objects.Ship();
        ship.position = new PIXI.Point(400, 550);
        ship.insertIntoView();
    }

    // Główna pętla gry
    export function update() {
        // @TODO
    }

    export function gameOver() {
        // @TODO
    }
}