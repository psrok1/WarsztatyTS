/**
 * Punkt wejścia aplikacji
 * Rejestruje widoki i uruchamia całą machinę
 */
window.onload = () => { 
    var viewManager = View.ViewManager.getInstance();
    viewManager.registerView("message", new View.MessageView());
    viewManager.switchView("message");

    var textureManager = View.TextureManager.getInstance();

    textureManager.onProgress(function (loadedTextureName: string) {
        var that: View.MessageView = this;
        that.setMessage("Ładowanie tekstur: " + loadedTextureName);
    }.bind(viewManager.getView("message")));

    textureManager.onLoaded(function () {
        var that: View.ViewManager = this;
        var gameView = <View.GameView>that.registerView("game", new View.GameView());
        that.switchView("game");
        Game.World.init();
    }.bind(viewManager));

    textureManager.loadTextures();
};