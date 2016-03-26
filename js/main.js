window.onload = function() {

    //Constant for visualization analytics.
    const VIS_MODE = false;

    var gameWidth = 760;
    var gameHeight = 570;

    var game = new Phaser.Game(gameWidth, gameHeight, Phaser.CANVAS, 'canvas');
    var sprites;


    var gameloop = function(game){};

    gameloop.prototype = {
        preload: function() {
            loadImages(game);
        },

        create: function() {
            game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
            setKeyboardInputs(game);
            sprites = game.add.group();
        },

        update: function() {
        }
    }
    game.state.add("start", gameloop);
    game.state.start("start");


    function loadImages(game) {
        var s1_dir = '../assets/environment/style-1/';
        game.load.image('background', s1_dir + "S1_background.png");
        game.load.image('T_small-block_01', s1_dir + "S1_small-block_01.png");
        game.load.image('T_small-block_02', s1_dir + "S1_small-block_02.png");
        game.load.image('T_small-block_03', s1_dir + "S1_small-block_03.png");
        game.load.image('T_medium-block_01', s1_dir + "S1_medium-block_01.png");
        game.load.image('T_medium-block_02', s1_dir + "S1_medium-block_02.png");
        game.load.image('T_medium-block_03', s1_dir + "S1_medium-block_03.png");
        game.load.image('T_large-block_01', s1_dir + "S1_large-block_01.png");

        game.load.image('T_small-rock_01', s1_dir + "S1_medium-block_01.png");
        game.load.image('T_large-rock_01', s1_dir + "S1_large-block_01.png");

        game.load.image('door', "../assets/doors/door128-128copy.png");
        game.load.image('open', "../assets/button.png");
        game.load.image('powerUp', "../assets/powerup.png");

	   game.load.image("magnetRock", "../assets/rocks/magnetRock.png");
       game.load.image("coin", "../assets/coin.png");
    }

    function setKeyboardInputs(game) {
        game.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(function() {
            addImg(game.canvas.width/2, game.canvas.height/2, 'T_small-block_01', game);
        }, this);

        game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() {
            saveToFile();
        }, this);
    }

    function addImg(x, y, filename, game) {
        var sprite = game.add.sprite(x, y, filename);
        var name;
        sprite.anchor.setTo(0.5);
        sprite.inputEnabled = true;
        sprite.input.enableDrag(true);
        sprites.add(sprite);

        sprite.events.onInputDown.add(function(sprite, pointer) {
            if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)){
                sprite.destroy();
            }

            if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
                sprite.angle += 5;
            }

            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
                sprite.angle -= 5;
            }
        });

        return sprite;
    }

    function outputJSON() {
        var entities = [];
        sprites.forEach(function(sprite) {
            entities.push({"type": sprite.key, "x": sprite.x * 1.05, "y":sprite.y * 1.05, "angle": sprite.angle, "name": sprite.name});
        });

        var input = prompt("Input? ex. 14, 13");
        var output = prompt("Output? ex. 14, 13");
        var weight = prompt("Weight? ex. int from 1-3");

        var num = prompt("What's the version number for the given prefix? " + input + "to" + output + "_" + weight);
        if (num < 10 && num.indexOf(0) < 0) {
            num = "0" + num;
        }
        var filename = input + "to" + output + "_" + weight + "_" + num;

        var obj = {
            "name": filename,
            "entities": entities,
            "input": {"first": parseInt(input.charAt(0)), "second": parseInt(input.charAt(1))},
            "output": {"first": parseInt(output.charAt(0)), "second": parseInt(output.charAt(1))},
            "weight": parseInt(weight)
        }
        return JSON.stringify(obj, null, 2);
    }

    function saveToFile() {
        var json = outputJSON();
        var blob = new Blob([json], {type: "text/plain;charset=utf-8"});
        var filename = JSON.parse(json)["name"];
        saveAs(blob, filename + ".json");
        return filename;
    }

    document.getElementById('file').addEventListener('change', onFileChange);

    function onFileChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
        if (VIS_MODE){
            createAnalyticsHeat(event.target.files[0].name.replace(".json",""));
        }
    }

    function onReaderLoad(event){
        sprites.destroy(true, true);
        var obj = JSON.parse(event.target.result);
        obj.entities.forEach(function(entity) {
            addImg(entity.x, entity.y, entity.type, game);
        })
    }


    /**************************************************************************
    //  * Data Visualization
    //  *************************************************************************/

    //   function loadBuildingBlocks(game) {
    //     // JS has no way of listing files in a directory, so use a file to list all other files.
    //     BBL_Loader = game.load.json("buildingBlocksList",'json/buildingBlocks/buildingBlocksList.json')
    //     game.load.onFileComplete.add(loadHelper, game)
    //   }

    //   function loadHelper(progress, key) {
    //       if (key != "buildingBlocksList") {
    //           return
    //       }
    //       // The context is set as 'game', so 'this' = 'game'
    //       BBL = this.cache.getJSON("buildingBlocksList");

    //       NUM_BB = BBL.list.length;
          
    //       for(i = 0, len = NUM_BB; i < len; i++) {
    //          this.load.json("BB" + i, BBL.list[i]);
    //       }
    //   }

    //   function createBuildingBlocks(game){
    //       for(i = 0; i < NUM_BB; i++){
    //          buildingBlocks.push(game.cache.getJSON("BB" + i))
    //       }
    //   }

    //   function createvis() {
    //     createBuildingBlocks();
    //     for(var i = 0; i < buildingBlocks.length; i++) {
    //     //   document.write('<div id="subtitle" class="row-fluid">' + buildingBlocks[i].name + '</div><div class="row-fluid row-centered"><div class="col-md-8 col-centered"><div id="overlay"><div id="canvas"></div></div></div></div>');
    //     }
    //   }

    //   createvis();
}

