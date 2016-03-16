var View;
(function (View) {
    /**
     * Singleton reprezentujący menedżer widoków aplikacji
     */
    var ViewManager = (function () {
        /**
         * Konstruktor
         */
        function ViewManager() {
            /** Kontener widoków */
            this.views = {};
            /** Aktualnie wyświetlany widok */
            this.currentView = null;
            if (ViewManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            this.renderer = new Renderer();
            requestAnimationFrame(this.update);
            ViewManager.instance = this;
        }
        /**
         * Pobranie odnośnika do obiektu menedżera
         */
        ViewManager.getInstance = function () {
            if (!ViewManager.instance)
                ViewManager.instance = new ViewManager();
            return ViewManager.instance;
        };
        /**
         * Callback aktualizujący widok i rysujący kolejną klatkę
         */
        ViewManager.prototype.update = function () {
            requestAnimationFrame(function () { this.update(); }.bind(ViewManager.getInstance()));
            if (!this.currentView || this.currentView.isPaused())
                return;
            this.currentView.update();
            this.renderer.render(this.currentView.getStage());
        };
        /**
         * Rejestracja widoku
         * @param name Nazwa widoku
         * @param view Obiekt rejestrowanego widoku
         */
        ViewManager.prototype.registerView = function (name, view) {
            if (this.views[name])
                return this.views[name];
            this.views[name] = view;
            return view;
        };
        /**
         * Zmiana aktualnie wyświetlanego widoku
         * @param name Nazwa widoku, na który chcemy się przełączyć
         */
        ViewManager.prototype.switchView = function (name) {
            if (this.views[name]) {
                if (this.currentView)
                    this.currentView.pause();
                this.currentView = this.views[name];
                this.currentView.resume();
                return this.currentView;
            }
            else
                return undefined;
        };
        /**
         * Pobranie obiektu widoku o danej nazwie
         * @param Nazwa poszukiwanego widoku
         * @return Obiekt widoku o zadanej nazwie
         */
        ViewManager.prototype.getView = function (name) {
            if (this.views[name])
                return this.views[name];
            else
                return undefined;
        };
        /** Instancja menedżera */
        ViewManager.instance = null;
        return ViewManager;
    })();
    View.ViewManager = ViewManager;
    /**
     * Klasa opakowująca silnik renderujący
     * Inicjalizuje silnik i obsługuje zdarzenie resize okna, aby
     * skalować kanwę w zależności od rozmiaru okna przeglądarki.
     */
    var Renderer = (function () {
        /**
         * Konstruktor renderera
         */
        function Renderer() {
            /** Aktualna skala kanwy */
            this.ratio = 1;
            /** Pierwotna szerokość */
            this.defaultWidth = 800;
            /** Pierwotna wysokość */
            this.defaultHeight = 600;
            this.renderer = PIXI.autoDetectRenderer(this.defaultWidth, this.defaultHeight);
            this.width = this.defaultWidth;
            this.height = this.defaultHeight;
            document.body.appendChild(this.renderer.view);
            this.renderer.view.style.position = "absolute";
            this.rescale();
            window.addEventListener("resize", this.rescale.bind(this), false);
        }
        /**
         * Handler zdarzenia resize
         */
        Renderer.prototype.rescale = function () {
            this.ratio = Math.min(window.innerWidth / this.defaultWidth, window.innerHeight / this.defaultHeight);
            this.width = this.defaultWidth * this.ratio;
            this.height = this.defaultHeight * this.ratio;
            this.renderer.resize(this.width, this.height);
            this.renderer.view.style.left = window.innerWidth / 2 - this.width / 2 + "px";
            this.renderer.view.style.top = window.innerHeight / 2 - this.height / 2 + "px";
        };
        /**
         * Skalowanie obiektów widoku
         * @param displayObject Obiekt podlegający przeskalowaniu
         * @param ratio Skala
         */
        Renderer.prototype.applyRatio = function (displayObject, ratio) {
            if (ratio == 1)
                return;
            displayObject.position.x *= ratio;
            displayObject.position.y *= ratio;
            displayObject.scale.x *= ratio;
            displayObject.scale.y *= ratio;
            // PIXI don't need recursive scaling
            if (!displayObject.parent)
                for (var i = 0; i < displayObject.children.length; ++i)
                    this.applyRatio(displayObject.children[i], ratio);
        };
        /**
         * Rysowanie sceny uwzględniając zastosowaną skalę
         * @param stage Rysowana scena
         */
        Renderer.prototype.render = function (stage) {
            this.applyRatio(stage, this.ratio);
            this.renderer.render(stage);
            this.applyRatio(stage, 1 / this.ratio);
        };
        return Renderer;
    })();
})(View || (View = {}));
var View;
(function (View) {
    /**
     * Zestaw tekstur do załadowania przez menedżer
     */
    var TEXTURES_TO_LOAD = [
        {
            name: "stars",
            file: "Textures/stars.png"
        },
        {
            name: "ship",
            file: "Textures/Ships/ship3_0.png"
        },
        {
            name: "bullet",
            file: "Textures/Bullets/bullet1_0.png"
        },
        {
            name: "asteroid",
            file: "Textures/Asteroids/asteroid1_0.png"
        }
    ];
    /**
     * Singleton reprezentujący menedżer tekstur widoku
     */
    var TextureManager = (function () {
        /**
         * Konstruktor menedżera
         */
        function TextureManager() {
            /** Kontener tekstur */
            this.textures = {};
            /** Handler zdarzenia zakończenia ładowania tekstur */
            this.onLoadedHandler = null;
            /** Handler zdarzenia zakończenia ładowania pojedyńczej tekstury */
            this.onProgressHandler = null;
            if (TextureManager.instance)
                throw new Error("ViewManager is a singleton. Instantiation failed.");
            // ...
            TextureManager.instance = this;
        }
        /**
         * Pobranie odnośnika do obiektu menedżera
         */
        TextureManager.getInstance = function () {
            if (!TextureManager.instance)
                TextureManager.instance = new TextureManager();
            return TextureManager.instance;
        };
        /**
         * Pobranie załadowanej tekstury na podstawie nazwy
         * @param name Nazwa tekstury
         * @return Tekstura o zadanej nazwie
         */
        TextureManager.prototype.getTexture = function (name) {
            return this.textures[name];
        };
        /**
         * Prywatna metoda wywoływana po załadowaniu tekstury przez menedżer
         */
        TextureManager.prototype.postloadAction = function () {
            var that = this.that;
            var textureName = this.textureName;
            that.progress++;
            that.onProgressHandler(textureName);
            if (that.progress === that.progressMax)
                that.onLoadedHandler();
        };
        /**
         * Wyzwalacz ładowania zadanej tekstury
         * @param data Informacje o teksturze do załadowania
         */
        TextureManager.prototype.loadResource = function (data) {
            var texture = PIXI.Texture.fromImage(data.file);
            this.textures[data.name] = texture;
            if (!texture.baseTexture.hasLoaded)
                texture.baseTexture.addEventListener("loaded", this.postloadAction.bind({ that: this, textureName: data.name }));
            else
                this.postloadAction.call({ that: this, textureName: data.name });
        };
        /**
         * Rozpoczęcie ładowania tekstur przez menedżer
         */
        TextureManager.prototype.loadTextures = function () {
            this.progress = 0;
            this.progressMax = TEXTURES_TO_LOAD.length;
            this.textures = {};
            for (var e in TEXTURES_TO_LOAD)
                this.loadResource(TEXTURES_TO_LOAD[e]);
        };
        /**
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu wszystkich tekstur
         * przez menedżer
         * @param handler Funkcja obsługi zdarzenia
         */
        TextureManager.prototype.onLoaded = function (handler) {
            this.onLoadedHandler = handler;
        };
        /*
         * Rejestracja handlera zdarzenia wywoływanego po załadowaniu tekstury przez
         * menedżer
         * @param handler Funkcja obsługi zdarzenia
         */
        TextureManager.prototype.onProgress = function (handler) {
            this.onProgressHandler = handler;
        };
        /** Instancja obiektu menedżera tekstur */
        TextureManager.instance = null;
        return TextureManager;
    })();
    View.TextureManager = TextureManager;
})(View || (View = {}));
/**
 * Moduł dla klas widoku
 * @preferred
 */
var View;
(function (View_1) {
    /**
     * Abstrakcyjna klasa stanowiąca bazę dla klas widoków
     */
    var View = (function () {
        /**
         * Konstruktor widoku
         */
        function View() {
            /** Czy widok jest wstrzymany? */
            this.paused = true;
            this.stage = new PIXI.Stage(0);
        }
        /**
         * Metoda wyzwalana przez menedżer widoków przy rysowaniu kolejnej klatki
         */
        View.prototype.update = function () { };
        /**
         * Metoda wyzwalana przez menedżer przy wstrzymaniu widoku (po przełączeniu na inny widok)
         */
        View.prototype.pause = function () {
            if (!this.paused) {
                this.paused = true;
                // PIXI: Update interactionManager fix
                this.stage.interactionManager.dirty = true;
                return true;
            }
            else
                return false;
        };
        /**
         * Metoda wyzwalana przez menedżer przy aktywacji widoku (po przełączeniu na ten widok)
         */
        View.prototype.resume = function () {
            if (this.paused) {
                this.paused = false;
                // PIXI: Lost interactivity fix
                this.stage._interactiveEventsAdded = false;
                return true;
            }
            else
                return false;
        };
        /**
         * Metoda zwracająca, czy widok jest wstrzymany
         * @param Zwraca true, jeśli jest wstrzymany
         */
        View.prototype.isPaused = function () {
            return this.paused;
        };
        /**
         * Metoda zwracająca powiązaną z widokiem scenę renderera
         * @param Obiekt sceny
         */
        View.prototype.getStage = function () {
            return this.stage;
        };
        return View;
    })();
    View_1.View = View;
})(View || (View = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var View;
(function (View) {
    /**
     * Klasa reprezentująca widok wiadomości
     */
    var MessageView = (function (_super) {
        __extends(MessageView, _super);
        /**
         * Konstruktor widoku wiadomości
         */
        function MessageView() {
            _super.call(this);
            this.messageText = new PIXI.Text("Hello world!", { font: "12px monospace", fill: "gray" });
            this.messageText.position.x = 400;
            this.messageText.position.y = 300;
            this.messageText.anchor.x = this.messageText.anchor.y = 0.5;
            this.getStage().addChild(this.messageText);
        }
        /**
         * Metoda zmieniająca treść wiadomości
         * @param message Treść wyświetlanej wiadomości
         */
        MessageView.prototype.setMessage = function (message) {
            this.messageText.setText(message);
        };
        /**
         * Statyczna metoda przełączająca na ten widok i wyświetlająca zadaną wiadomość
         * @param message Treść wiadomości
         */
        MessageView.showMessage = function (message) {
            View.ViewManager.getInstance().getView("message").setMessage(message);
            View.ViewManager.getInstance().switchView("message");
        };
        return MessageView;
    })(View.View);
    View.MessageView = MessageView;
})(View || (View = {}));
var View;
(function (View) {
    var GameView = (function (_super) {
        __extends(GameView, _super);
        function GameView() {
            _super.call(this);
            this.stars = new Stars(this);
        }
        GameView.prototype.update = function () {
            this.stars.move(1, 1);
        };
        return GameView;
    })(View.View);
    View.GameView = GameView;
    var Stars = (function () {
        function Stars(parent) {
            var texture = View.TextureManager.getInstance().getTexture("stars");
            this.stars = new PIXI.TilingSprite(texture, 800, 600);
            parent.getStage().addChild(this.stars);
        }
        Object.defineProperty(Stars.prototype, "opacity", {
            get: function () {
                return this.stars.alpha;
            },
            set: function (alpha) {
                this.stars.alpha = alpha;
            },
            enumerable: true,
            configurable: true
        });
        Stars.prototype.move = function (x, y) {
            this.stars.tilePosition.x += x;
            this.stars.tilePosition.y += y;
        };
        return Stars;
    })();
})(View || (View = {}));
var View;
(function (View) {
    var Objects;
    (function (Objects) {
        var GameObject = (function () {
            function GameObject(sprite) {
                this.placedOnView = false;
                this.sprite = sprite;
                this.sprite.position = new PIXI.Point(-100, -100);
                this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            }
            Object.defineProperty(GameObject.prototype, "position", {
                get: function () {
                    return this.sprite.position;
                },
                set: function (point) {
                    this.sprite.position = point.clone();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GameObject.prototype, "rotation", {
                get: function () {
                    return this.sprite.rotation;
                },
                set: function (angle) {
                    this.sprite.rotation = angle;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GameObject.prototype, "width", {
                get: function () {
                    return Math.floor(this.sprite.width * this.sprite.scale.x);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(GameObject.prototype, "height", {
                get: function () {
                    return Math.floor(this.sprite.height * this.sprite.scale.y);
                },
                enumerable: true,
                configurable: true
            });
            GameObject.prototype.insertIntoView = function () {
                if (this.placedOnView)
                    return;
                var gameView = View.ViewManager.getInstance().getView("game");
                gameView.getStage().addChild(this.sprite);
                this.placedOnView = true;
            };
            GameObject.prototype.removeFromView = function () {
                if (!this.placedOnView)
                    return;
                var gameView = View.ViewManager.getInstance().getView("game");
                gameView.getStage().removeChild(this.sprite);
                this.placedOnView = false;
            };
            return GameObject;
        })();
        Objects.GameObject = GameObject;
    })(Objects = View.Objects || (View.Objects = {}));
})(View || (View = {}));
var View;
(function (View) {
    var Objects;
    (function (Objects) {
        (function (AsteroidType) {
            AsteroidType[AsteroidType["StandardAsteroid"] = 0] = "StandardAsteroid";
        })(Objects.AsteroidType || (Objects.AsteroidType = {}));
        var AsteroidType = Objects.AsteroidType;
        var Asteroid = (function (_super) {
            __extends(Asteroid, _super);
            function Asteroid(type) {
                if (type === void 0) { type = AsteroidType.StandardAsteroid; }
                var texture = View.TextureManager.getInstance().getTexture("asteroid");
                _super.call(this, new PIXI.Sprite(texture));
            }
            return Asteroid;
        })(Objects.GameObject);
        Objects.Asteroid = Asteroid;
    })(Objects = View.Objects || (View.Objects = {}));
})(View || (View = {}));
var View;
(function (View) {
    var Objects;
    (function (Objects) {
        var Ship = (function (_super) {
            __extends(Ship, _super);
            function Ship() {
                var texture = View.TextureManager.getInstance().getTexture("ship");
                var sprite = new PIXI.Sprite(texture);
                sprite.rotation = Math.PI;
                _super.call(this, sprite);
            }
            return Ship;
        })(Objects.GameObject);
        Objects.Ship = Ship;
    })(Objects = View.Objects || (View.Objects = {}));
})(View || (View = {}));
var View;
(function (View) {
    var Objects;
    (function (Objects) {
        (function (BulletType) {
            BulletType[BulletType["SingleBullet"] = 0] = "SingleBullet";
            BulletType[BulletType["DoubleBullet"] = 1] = "DoubleBullet";
        })(Objects.BulletType || (Objects.BulletType = {}));
        var BulletType = Objects.BulletType;
        var Bullet = (function (_super) {
            __extends(Bullet, _super);
            function Bullet(type) {
                if (type === void 0) { type = BulletType.SingleBullet; }
                var texture = View.TextureManager.getInstance().getTexture("bullet");
                _super.call(this, new PIXI.Sprite(texture));
            }
            return Bullet;
        })(Objects.GameObject);
        Objects.Bullet = Bullet;
    })(Objects = View.Objects || (View.Objects = {}));
})(View || (View = {}));
var Game;
(function (Game) {
    var World;
    (function (World) {
        var UPDATE_RATE = 30; /* fps */
        World.WORLD_WIDTH = 800;
        World.WORLD_HEIGHT = 600;
        // Wywoływane po załadowaniu tekstur i skonstruowaniu widoku
        function init() {
            // @TODO
            // ---- JUST SOME "HELLO WORLD" ----
            var ship = new View.Objects.Ship();
            ship.position = new PIXI.Point(400, 550);
            ship.insertIntoView();
        }
        World.init = init;
        // Główna pętla gry
        function update() {
            // @TODO
        }
        World.update = update;
        function gameOver() {
            // @TODO
        }
        World.gameOver = gameOver;
    })(World = Game.World || (Game.World = {}));
})(Game || (Game = {}));
/**
 * Punkt wejścia aplikacji
 * Rejestruje widoki i uruchamia całą machinę
 */
window.onload = function () {
    var viewManager = View.ViewManager.getInstance();
    viewManager.registerView("message", new View.MessageView());
    viewManager.switchView("message");
    var textureManager = View.TextureManager.getInstance();
    textureManager.onProgress(function (loadedTextureName) {
        var that = this;
        that.setMessage("Ładowanie tekstur: " + loadedTextureName);
    }.bind(viewManager.getView("message")));
    textureManager.onLoaded(function () {
        var that = this;
        var gameView = that.registerView("game", new View.GameView());
        that.switchView("game");
        Game.World.init();
    }.bind(viewManager));
    textureManager.loadTextures();
};
/**
 * Plik informujący kompilator o zalecanej kolejności budowania plików źródłowych
 * przy kompilacji do pliku JavaScript (app.js)
 */
/// <reference path="Pixi/pixi.d.ts" /> 
/// <reference path="View/ViewManager.class.ts" /> 
/// <reference path="View/TextureManager.class.ts" /> 
/// <reference path="View/View.class.ts" /> 
/// <reference path="View/MessageView.class.ts" /> 
/// <reference path="View/GameView.class.ts" />
/// <reference path="View/Objects/GameObject.class.ts" /> 
/// <reference path="View/Objects/Asteroid.class.ts" /> 
/// <reference path="View/Objects/Ship.class.ts" /> 
/// <reference path="View/Objects/Bullet.class.ts" /> 
/// <reference path="Game/World.ts" /> 
/// <reference path="app.ts" /> 
var Game;
(function (Game) {
    var Objects;
    (function (Objects) {
        var BULLET_SPACE = 20;
    })(Objects = Game.Objects || (Game.Objects = {}));
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Objects;
    (function (Objects) {
        var GameObject = (function () {
            function GameObject(viewObject) {
                this.destroyed = false;
                this.velocity = {
                    x: 0, y: 0
                };
                this.viewObject = viewObject;
                this.viewObject.insertIntoView();
            }
            GameObject.prototype.isDestroyed = function () {
                return this.destroyed;
            };
            GameObject.prototype.destroy = function () {
                this.destroyed = true;
                this.viewObject.removeFromView();
            };
            GameObject.prototype.setPosition = function (x, y) {
                // @TODO
            };
            GameObject.prototype.collidesWith = function (obj) {
                // @TODO
            };
            GameObject.prototype.update = function () {
                // @TODO            
            };
            return GameObject;
        })();
        Objects.GameObject = GameObject;
    })(Objects = Game.Objects || (Game.Objects = {}));
})(Game || (Game = {}));
var Game;
(function (Game) {
    var Objects;
    (function (Objects) {
        var SHIP_LOW_Y = 550;
        var SHIP_HIGH_Y = 300;
        var SHIP_LOW_X = 32;
        var SHIP_HIGH_X = 768;
    })(Objects = Game.Objects || (Game.Objects = {}));
})(Game || (Game = {}));
//# sourceMappingURL=app.js.map