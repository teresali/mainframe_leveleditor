window.onload = function() {
    var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'canvas', { create: create });

    const WALL = 0;
    const TRAP = 1;
    const entities = ['W', 'T'];
    var traps = [];

    //  Dimensions
    var spriteWidth = 5;
    var spriteHeight = 7;
    var speed = 50;

    //  UI
    var ui;
    var paletteArrow;
    var coords;
    var widthText;
    var widthUp;
    var widthDown;
    var heightText;
    var heightUp;
    var heightDown;
    var speedText;
    var speedUp;
    var speedDown;
    var saveIcon;
    var saveText;
    var rightCol = 532;

    //  Drawing Area
    var canvas;
    var canvasBG;
    var canvasGrid;
    var canvasSprite;
    var canvasZoom = 50;

    //  Sprite Preview
    var preview;
    var previewBG;

    //  Keys + Mouse
    var keys;
    var isDown = false;
    var isErase = false;

    //  Palette
    var ci = 0;
    var color = 0;
    var palette = 0;
    var pmap = [WALL,TRAP, 2, 3, 4, 5, 6, 7, 8 , 9];

    //  Data
    var frame = 1;
    var frames = [[]];

    var data;

    function resetData() {
        data = [];
        traps = [];

        for (var y = 0; y < spriteHeight; y++)
        {
            var a = [];

            for (var x = 0; x < spriteWidth; x++)
            {
                a.push('.');
            }

            data.push(a);
        }

    }

    function cloneData() {

        var clone = [];

        for (var y = 0; y < data.length; y++)
        {
            var a = [];

            for (var x = 0; x < data[y].length; x++)
            {
                var v = data[y][x];
                a.push(v);
            }

            clone.push(a);
        }

        return clone;

    }

    function createUI() {

        game.create.grid('uiGrid', 32 * 16, 32, 32, 32, 'rgba(255,255,255,0.5)');

        //  Create some icons
        var arrow = [
            '  22  ',
            ' 2222 ',
            '222222',
            '  22  ',
            '  22  '
        ];

        var plus = [
            '2222222',
            '2.....2',
            '2..2..2',
            '2.222.2',
            '2..2..2',
            '2.....2',
            '2222222'
        ];

        var minus = [
            '2222222',
            '2.....2',
            '2.....2',
            '2.222.2',
            '2.....2',
            '2.....2',
            '2222222'
        ];

        var disk = [
            'DDDDDDDDDD',
            'DED1111DED',
            'DED1111DDD',
            'DEDDDDDDED',
            'DEEEEEEEED',
            'DEFFFFFFED',
            'DEFF222FED',
            'DEFF222FED',
            'DEFF222FED',
            'DDDDDDDDDD'
        ];

        game.create.texture('arrow', arrow, 2);
        game.create.texture('plus', plus, 3);
        game.create.texture('minus', minus, 3);
        game.create.texture('save', disk, 4);

        ui = game.make.bitmapData(800, 32);

        drawPalette();

        ui.addToWorld();

        var style = { font: "18px Helvetica", fill: "#fff", tabs: 80 };

        game.add.text(12, 9, entities.join("\t"), { font: "14px Helvetica", fill: "#607780", tabs: 32 });

        paletteArrow = game.add.sprite(8, 36, 'arrow');

        //  Change width
        widthText = game.add.text(rightCol, 60, "Width: " + spriteWidth, style);

        widthUp = game.add.sprite(rightCol + 180, 60, 'plus');
        widthUp.name = 'width';
        widthUp.inputEnabled = true;
        widthUp.input.useHandCursor = true;
        widthUp.events.onInputDown.add(increaseSize, this);

        widthDown = game.add.sprite(rightCol + 220, 60, 'minus');
        widthDown.name = 'width';
        widthDown.inputEnabled = true;
        widthDown.input.useHandCursor = true;
        widthDown.events.onInputDown.add(decreaseSize, this);

        //  Change height
        heightText = game.add.text(rightCol, 100, "Height: " + spriteHeight, style);

        heightUp = game.add.sprite(rightCol + 180, 100, 'plus');
        heightUp.name = 'height';
        heightUp.inputEnabled = true;
        heightUp.input.useHandCursor = true;
        heightUp.events.onInputDown.add(increaseSize, this);

        heightDown = game.add.sprite(rightCol + 220, 100, 'minus');
        heightDown.name = 'height';
        heightDown.inputEnabled = true;
        heightDown.input.useHandCursor = true;
        heightDown.events.onInputDown.add(decreaseSize, this);

        // Change speed
        speedText = game.add.text(rightCol, 140, "Speed: " + speed, style);

        speedUp = game.add.sprite(rightCol + 180, 140, 'plus');
        speedUp.name = 'speed';
        speedUp.inputEnabled = true;
        speedUp.input.useHandCursor = true;
        speedUp.events.onInputDown.add(increaseSpeed, this);

        speedDown = game.add.sprite(rightCol + 220, 140, 'minus');
        speedDown.name = 'speed';
        speedDown.inputEnabled = true;
        speedDown.input.useHandCursor = true;
        speedDown.events.onInputDown.add(decreaseSpeed, this);
        
        //  Save Icon

        saveText = game.add.text(rightCol, 520, "Saved", style);
        saveText.alpha = 0;

        saveIcon = game.add.sprite(750, 550, 'save');
        saveIcon.inputEnabled = true;
        saveIcon.input.useHandCursor = true;
        saveIcon.events.onInputDown.add(save, this);

    }

    function createDrawingArea() {
        game.create.grid('drawingGrid', 16 * canvasZoom, 16 * canvasZoom, canvasZoom, canvasZoom, 'rgba(0,191,243,0.8)');

        canvas = game.make.bitmapData(spriteWidth * canvasZoom, spriteHeight * canvasZoom);
        canvasBG = game.make.bitmapData(canvas.width + 2, canvas.height + 2);

        canvasBG.rect(0, 0, canvasBG.width, canvasBG.height, '#fff');
        canvasBG.rect(1, 1, canvasBG.width - 2, canvasBG.height - 2, '#3f5c67');

        var x = 10;
        var y = 64;

        canvasBG.addToWorld(x, y);
        canvasSprite = canvas.addToWorld(x + 1, y + 1);
        canvasGrid = game.add.sprite(x + 1, y + 1, 'drawingGrid');
        canvasGrid.crop(new Phaser.Rectangle(0, 0, spriteWidth * canvasZoom, spriteHeight * canvasZoom));

    }

    function resizeCanvas() {
        canvas.resize(spriteWidth * canvasZoom, spriteHeight * canvasZoom);
        canvasBG.resize(canvas.width + 2, canvas.height + 2);

        canvasBG.rect(0, 0, canvasBG.width, canvasBG.height, '#fff');
        canvasBG.rect(1, 1, canvasBG.width - 2, canvasBG.height - 2, '#3f5c67');

        canvasGrid.crop(new Phaser.Rectangle(0, 0, spriteWidth * canvasZoom, spriteHeight * canvasZoom));
        
    }

    function refresh() {
        //  Update both the Canvas and Preview
        canvas.clear();
        preview.clear();

        for (var y = 0; y < spriteHeight; y++)
        {
            for (var x = 0; x < spriteWidth; x++)
            {
                var i = data[y][x];

                if (i !== '.' && i !== ' ')
                {
                    color = game.create.palettes[palette][i];
                    canvas.rect(x * canvasZoom, y * canvasZoom, canvasZoom, canvasZoom, color);
                    // preview.rect(x * previewSize, y * previewSize, previewSize, previewSize, color);
                }
            }
        }
    }

    function createEventListeners() {

        keys = game.input.keyboard.addKeys(
            {
                'erase': Phaser.Keyboard.X,
                'save': Phaser.Keyboard.S,
                'up': Phaser.Keyboard.UP,
                'down': Phaser.Keyboard.DOWN,
                'left': Phaser.Keyboard.LEFT,
                'right': Phaser.Keyboard.RIGHT,
                'color0': Phaser.Keyboard.ZERO,
                'color1': Phaser.Keyboard.ONE,
                'color2': Phaser.Keyboard.TWO,
                'color3': Phaser.Keyboard.THREE,
                'color4': Phaser.Keyboard.FOUR,
                'color5': Phaser.Keyboard.FIVE,
                'color6': Phaser.Keyboard.SIX,
                'color7': Phaser.Keyboard.SEVEN,
                'color8': Phaser.Keyboard.EIGHT,
                'color9': Phaser.Keyboard.NINE,
                'color10': Phaser.Keyboard.A,
                'color11': Phaser.Keyboard.B,
                'color12': Phaser.Keyboard.C,
                'color13': Phaser.Keyboard.D,
                'color14': Phaser.Keyboard.E,
                'color15': Phaser.Keyboard.F
            }
        );

        keys.erase.onDown.add(cls, this);
        keys.save.onDown.add(save, this);
        keys.up.onDown.add(shiftUp, this);
        keys.down.onDown.add(shiftDown, this);
        keys.left.onDown.add(shiftLeft, this);
        keys.right.onDown.add(shiftRight, this);

        for (var i = 0; i < 16; i++)
        {
            keys['color' + i].onDown.add(setColor, this, 0, i);
        }

        game.input.mouse.capture = true;
        game.input.onDown.add(onDown, this);
        game.input.onUp.add(onUp, this);
        game.input.addMoveCallback(paint, this);

    }

    function cls() {

        resetData();
        refresh();

    }

    function drawPalette() {
        //  Draw the palette to the UI bmd
        ui.clear(0, 0, 32 * 16, 32);

        var x = 0;

        for (var clr in game.create.palettes[palette]) {
            ui.rect(x, 0, 32, 32, game.create.palettes[palette][clr]);
            x += 32;
        }

        ui.copy('uiGrid');

    }

    function setColor(i, p) {

        if (typeof p !== 'undefined')
        {
            //  It came from a Keyboard Event, in which case the color index is in p, not i.
            i = p;
        }

        if (i < 0)
        {
            i = 15;
        }
        else if (i >= 16)
        {
            i = 0;
        }

        colorIndex = i;
        color = game.create.palettes[palette][pmap[colorIndex]];

        paletteArrow.x = (i * 32) + 8;

    }

    function nextColor() {

        var i = colorIndex + 1;
        setColor(i);

    }

    function prevColor() {

        var i = colorIndex - 1;
        setColor(i);

    }

    function increaseSize(sprite) {

        if (sprite.name === 'width')
        {
            if (spriteWidth === 16)
            {
                return;
            }

            spriteWidth++;
        }
        else if (sprite.name === 'height')
        {
            if (spriteHeight === 16)
            {
                return;
            }

            spriteHeight++;
        }

        resetData();
        resizeCanvas();

        widthText.text = "Width: " + spriteWidth;
        heightText.text = "Height: " + spriteHeight;

    }

    function decreaseSize(sprite) {

        if (sprite.name === 'width')
        {
            if (spriteWidth === 4)
            {
                return;
            }

            spriteWidth--;
        }
        else if (sprite.name === 'height')
        {
            if (spriteHeight === 4)
            {
                return;
            }

            spriteHeight--;
        }

        resetData();
        resizeCanvas();

        widthText.text = "Width: " + spriteWidth;
        heightText.text = "Height: " + spriteHeight;

    }

    function increaseSpeed() {
        speed++;
        speedText.text = "Speed: " + speed;
    }

    function decreaseSpeed() {
        speed--;
        speedText.text = "Speed: " + speed;
    }

    function create() {
        //   So we can right-click to erase
        document.body.oncontextmenu = function() { return false; };

        Phaser.Canvas.setUserSelect(game.canvas, 'none');
        Phaser.Canvas.setTouchAction(game.canvas, 'none');

        game.stage.backgroundColor = '#607780';

        createUI();
        createDrawingArea();
        createEventListeners();

        resetData();
        setColor(2);

    }

    function outputJSON() {
        var levelid = prompt("Leved id?");

        var src = frames[0];

        var walls = [];
        for (var i = 0; i < src.length; i++) {
            for(var j = 0; j < src[i].length; j++) {
                if (src[i][j] == String(WALL)) {
                    var reversedy = spriteHeight - 1 - i;
                    walls.push({"x": j, "y": reversedy});
                }
            }
        }

        var obj = {
            "id": parseInt(levelid),
            "background": "default",
            "config": {
                "speed": speed,
                "xtiles": spriteWidth,
                "ytiles": spriteHeight
            },
            "initial_path": "default",
            "obstacles": {
                "walls": walls,
                "traps": traps
            }
        }
        console.log(obj);
        return JSON.stringify(obj, null, 2);
    }

    function saveToFile() {
        var json = outputJSON();
        var blob = new Blob([json], {type: "text/plain;charset=utf-8"});
        var filename = "level" + String(JSON.parse(json)["id"]) + ".json";
        saveAs(blob, filename);
        return filename;
    }

    function save() {
        //  Save current frame
        frames[frame - 1] = cloneData();
        saveToFile();

        var output = "";

        var src = frames[0];

        output = output.concat("[\n");

        for (var y = 0; y < src.length; y++)
        {
            output = output.concat("\t'");
            output = output.concat(src[y].join(''));

            if (y < src.length - 1) {
                output = output.concat("',\n");
            }
            else {
                output = output.concat("'\n");
            }
        }
        
        output = output.concat("];\n");
        output = output.concat("width: " + spriteWidth + ", height: " + spriteHeight);
        console.log(output);

        saveText.alpha = 1;
        game.add.tween(saveText).to( { alpha: 0 }, 2000, "Linear", true);

    }

    function shiftLeft() {
        canvas.moveH(-canvasZoom);

        for (var y = 0; y < spriteHeight; y++) {
            var r = data[y].shift();
            data[y].push(r);
        }

    }

    function shiftRight() {
        canvas.moveH(canvasZoom);

        for (var y = 0; y < spriteHeight; y++) {
            var r = data[y].pop();
            data[y].splice(0, 0, r);
        }

    }

    function shiftUp() {
        canvas.moveV(-canvasZoom);

        var top = data.shift();
        data.push(top);

    }

    function shiftDown() {
        canvas.moveV(canvasZoom);

        var bottom = data.pop();
        data.splice(0, 0, bottom);

    }

    function onDown(pointer) {
        if (pointer.y <= 32)
        {
            setColor(game.math.snapToFloor(pointer.x, 32) / 32);
        } else {
            isDown = true;

            if (pointer.rightButton.isDown)
            {
                isErase = true;
            }
            else
            {
                isErase = false;
            }

            paint(pointer);
        }

    }

    function onUp() {
        isDown = false;
    }

    function paint(pointer) {
        //  Get the grid loc from the pointer
        var x = game.math.snapToFloor(pointer.x - canvasSprite.x, canvasZoom) / canvasZoom;
        var y = game.math.snapToFloor(pointer.y - canvasSprite.y, canvasZoom) / canvasZoom;

        if (x < 0 || x >= spriteWidth || y < 0 || y >= spriteHeight) {
            return;
        }

        if (!isDown) {
            return;
        }

        if (isErase) {
            if (data[y][x] = TRAP) {
                for (var i = 0; i < traps.length; i++) {
                    if (traps[i].position.x == x && traps[i].position.y == (spriteHeight-1-y)) {
                        traps.splice(i, 1);
                    }
                }
            }
            data[y][x] = '.';
            canvas.clear(x * canvasZoom, y * canvasZoom, canvasZoom, canvasZoom, color);
            preview.clear(x * previewSize, y * previewSize, previewSize, previewSize, color);
        } else {
            if (colorIndex == TRAP) {
                var open = prompt("Time open? ");
                var closed = prompt("Time closed? ");
                var position = {"x": x, "y": (spriteHeight-1-y)};
                traps.push({"time_open": open, "time_closed": closed, "position": position})
            }
            data[y][x] = pmap[colorIndex];
            canvas.rect(x * canvasZoom, y * canvasZoom, canvasZoom, canvasZoom, color);
        }

    }
}