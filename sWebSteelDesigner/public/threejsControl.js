// Declare Variables
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({
    antialias: true
});

var raycaster;
var projector = new THREE.Projector();
var control;

var sceneRegion;
var sceneWidth;
var sceneHeight;

var sceneObjects = [];

var boxObjects = [];
var groundObjects = [];
var verticalObjects = [];

var gui;
var sprite;

function UpdateView() {



    UpdateGridState();
    UpdateControlState();
    UpdateCursor();

    if (drawMode == "Volumn" || drawMode == "Void") {
        if (recDrawingAid.clickedPoints.length == 2) verticalPl.position.copy(recDrawingAid.lastClicked);
        recDrawingAid.UpdateDrawingAid(sceneMouse3d_ground, lastSceneMouse3dLeftDn, sceneMouse3d_Vertical, scene);
        if (recDrawingAid.clickedPoints.length == 3) {
            //cal volumn object count...
            recDrawingAid.FinalizeDrawing(drawMode, scene);
            //sceneObjects.push(recFinal);
            //boxObjects.push(recFinal);
        }
    }

    //    if (drawMode == "Delete") {
    //        var lastHoveringObj;
    //        if (ObjOnHovering) {
    //            lastHoveringObj = ObjOnHovering;
    //            SetObjHighlightedMaterial(ObjOnHovering);
    //        }
    //        if (lastHoveringObj != ObjOnHovering) {
    //            SetObjDefaultMaterial(lastHoveringObj);
    //        }
    //    }
    //    console.log(ObjOnHovering);

    if (ObjOnClicked) {
        if (drawMode == "Delete") {
            RemoveObjFromScene(ObjOnClicked);
            $('#delete').removeClass('yellow').removeClass('scaledUP');

            ObjOnHovering = null;
            drawMode = "View";
        } else {
            SetObjHighlightedMaterial(ObjOnClicked);
        }
        //console.log(ObjOnClicked.userData.name);
    }
}

function renderScene() {
    UpdateView();

    requestAnimationFrame(renderScene);

    control.update();
    renderer.render(scene, camera);
}

function Initiate3DView() {
    //Set ThreeJS scene
    SetBaseScene("div_3dCanvas");
    SetBaseOrbitControl();

    //construct raycaster
    raycaster = new THREE.Raycaster();

    //light
    SetBaseLights();

    //ground plane
    SetBaseGround(true);
    SetVerticalPlane();
    SetBaseGrid(50, mouseGridSnap);
    SetBaseAxis();

    //mouse control
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    //
    //    //resizing why here?
    //    //after resizing mouse location issue
    window.addEventListener('resize', onWindowResized, false);
}

function ChangeOpacityOfObjects(objTypeName, opacaityVal) {
    for (var i = scene.children.length - 1; i >= 0; i--) {
        var objType = scene.children[i].userData.name;
        if (objType == objTypeName) {
            scene.children[i].material.opacity = opacaityVal;
        }
    }
}

function RemoveObjFromScene(threeObjSelected) {
    var linkedIds = [];
    for (var i = scene.children.length - 1; i >= 0; i--) {
        var guid = threeObjSelected.uuid;
        if (scene.children[i].uuid == guid) {
            var linkId = scene.children[i].userData.linkedID;
            if (linkId) {
                linkedIds.push(linkId);
            }

            var boxIndex = boxObjects.indexOf(scene.children[i]);
            if (boxIndex > -1) {
                boxObjects.splice(boxIndex, 1);
            }
            scene.remove(scene.children[i]);
        }
    }
    for (var i = 0; i < linkedIds.length; ++i) {
        var guid = linkedIds[i];
        for (var j = scene.children.length - 1; j >= 0; j--) {
            if (guid == scene.children[j].uuid) {
                //
                //                var boxIndex = boxObjects.indexOf(scene.children[j]);
                //                if (boxIndex > -1) {
                //                    boxObjects.splice(boxIndex, 1);
                //                }
                scene.remove(scene.children[j]);
                break;
            }
        }
    }
}

function SetBaseScene(RegionID) {
    sceneRegion = document.getElementById(RegionID);
    sceneRegion.appendChild(renderer.domElement);

    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight; //why using jquary?

    camera.aspect = sceneWidth / sceneHeight;
    camera.position.set(15, 30, 30);
    camera.updateProjectionMatrix();

    renderer.setSize(sceneWidth, sceneHeight);
    renderer.setClearColor(0x333333, 1);
    //renderer.setPixelRatio( window.devicePixelRatio );
}

function SetBaseOrbitControl() {

    control = new THREE.OrbitControls(camera, renderer.domElement);

    control.target.set(0, 0, 0);
    control.rotateSpeed = 1.0;
    control.zoomSpeed = 1.2;
    control.panSpeed = 0.8;

    control.noZoom = false;
    control.noPan = false;

    control.staticMoving = false;
    control.dynamicDampingFactor = 0.15;

    control.keys = [65, 83, 68];
}

function SetBaseLights() {
    scene.add(new THREE.AmbientLight(0x404040));

    //    var spotLight = new THREE.SpotLight( 0xffffff , 1, 0, Math.PI / 2, 1 );
    //    	spotLight.position.set( 50, 50, 50 );
    //    	spotLight.target.position.set( 0, 0, 0 );
    //
    //    	spotLight.castShadow = true;
    //
    //    	spotLight.shadowBias = 0.0001;
    //    	spotLight.shadowDarkness = 0.5;
    //
    //    	spotLight.shadowMapWidth = 256;
    //    	spotLight.shadowMapHeight = 256;
    //
    //    	spotLight.shadowCameraNear = 0.01;
    //    	spotLight.shadowCameraFar = 10;
    //    	spotLight.shadowCameraFov = 100;
    //        
    //        scene.add(spotLight);
}

function SetBaseGround(IsVisible) {
    var groundPln = new THREE.PlaneGeometry(2000, 2000, 8, 8);
    groundPln.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    ground = new THREE.Mesh(groundPln, new THREE.MeshBasicMaterial({
        color: 0xbeb29e,
        opacity: 0.3,
        transparent: true,
        wireframe: false
    }));
    ground.visible = false; // IsVisible;
    ground.castShadow = true;
    ground.receiveShadow = true;

    ground.userData.name = "Ground";
    groundObjects.push(ground);
    scene.add(ground);
}

function SetVerticalPlane() {
    var verticalPlGeo = new THREE.PlaneGeometry(3000, 3000, 10, 10);
    verticalPl = new THREE.Mesh(verticalPlGeo, new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: false,
        transparent: true
    }));
    verticalPl.visible = false;
    verticalPl.material.opacity = 0.3;

    verticalPl.userData.name = "Coordinate_Vertical";
    verticalObjects.push(verticalPl);
    scene.add(verticalPl);

    ObjDragPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 8, 8),
        new THREE.MeshBasicMaterial({
            visible: false
        })
    );
    ObjDragPlane.userData.name = "Coordinate_Horizontal";
    scene.add(ObjDragPlane);
}

function SetBaseAxis() {
    var materialx = new THREE.LineBasicMaterial({
        color: 0xb5121b
    }, 3);
    var materialy = new THREE.LineBasicMaterial({
        color: 0x00a651
    }, 3);
    var materialz = new THREE.LineBasicMaterial({
        color: 0x0000ff
    }, 3);

    var Xaxis = GetThreeJS_Line(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1000, 0, 0), materialx);
    scene.add(Xaxis);
    var Yaxis = GetThreeJS_Line(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1000, 0), materialy);
    scene.add(Yaxis);
    var Zaxis = GetThreeJS_Line(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1000), materialz);
    scene.add(Zaxis);

    //var axisHelper = new THREE.AxisHelper(50);
    //scene.add(axisHelper);
}

function SetBaseGrid(size, step) {
    var grid = new THREE.GridHelper(size, step);
    grid.setColors(0x555555, 0x444444);
    grid.material.opacity = 0.2;

    grid.position.y -= 0.01;
    scene.add(grid);
}

function onWindowResized() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize(window.innerWidth, window.innerHeight);
}

//function DisplayGUI() {
//    var gui = new DAT.GUI();
//
//    var slideStep = 0.1;
//    parameters = {
//        name: "Name",
//        region: "",
//        grid: true,
//        color: "#0000ff",
//        xCoor: 1
//    }
//
//    gui.add(parameters, 'name').name('ProjectName'); // projectName
//    gui.add(parameters, 'region', ["East Coast", "Central", "West Coast"]).name('region'); // dropdown
//    gui.add(parameters, 'grid').name('Grid'); // true false;
//    gui.add(parameters, 'color').name('Color'); // color;
//    gui.add(parameters, 'xCoor').min(1).max(100).step(slideStep).name("xCoor");
//
//    gui.open();
//
//}

function PlaceTextSprite() {
    if (sceneObjects.length > 0) {
        var ObjSprite = sceneObjects[0];

        var spritey = MakeTextSprite("This", {
            fontsize: 32,
            backgroundColor: {
                r: 255,
                g: 100,
                b: 100,
                a: 1
            }
        });
        spritey.position = ObjSprite.position.clone().multiplyScalar(1);
        scene.add(spritey);
    }
}

function MakeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 15;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : {
            r: 0,
            g: 0,
            b: 0,
            a: 1.0
        };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0
        };

    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;
    //var spriteAlignment = THREE.SpriteAlignment.topLeft;
    //var spriteAlignment = THREE.Sprite.alignment.top;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText(message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        //alignment: spriteAlignment
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);
    return sprite;

}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
