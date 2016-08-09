var mouseMoved = false;
var mouseMoveTolerance = 1;


var screenMouse = new THREE.Vector2(0, 0);
var lastScreenMouseLeftDn = new THREE.Vector2(0, 0);
var lastScreenMouseRightDn = new THREE.Vector2(0, 0);

var sceneMouse3d = new THREE.Vector3(0, 0, 0);
var sceneMouse3d_ground = new THREE.Vector3(0, 0, 0);
var sceneMouse3d_Vertical = new THREE.Vector3(0, 0, 0);
var lastSceneMouse3dLeftDn = new THREE.Vector3(0, 0, 0);
var lastSceneMouse3dRightDn = new THREE.Vector3(0, 0, 0);

var screenChanging = false;

var ObjOnHovering;
var ObjOnClicked;

var ObjDragOffset = new THREE.Vector3();
var ObjDragPlane;


//grid control
function UpdateGridState() {
    $('#gridOn').click(function () {
        mouseGridOn = true;
    })
    $('#gridOff').click(function () {
        mouseGridOn = false;
    })
}

function SetMousesOnGridSnap(mouseIn) {
    if (mouseIn.x !== 0) {
        var x = Math.round(mouseIn.x / mouseGridSnap) * mouseGridSnap;
    }
    if (mouseIn.y !== 0) {
        var y = Math.round(mouseIn.y / mouseGridSnap) * mouseGridSnap;
    }
    if (mouseIn.z !== 0) {
        var z = Math.round(mouseIn.z / mouseGridSnap) * mouseGridSnap;
    }
    return new THREE.Vector3(x, y, z);
}

function SetObjectLoactionOnGridSnap(Obj, locPt) {
    var tempPtsnap = SetMousesOnGridSnap(locPt);
    tempPtsnap.y = locPt.y;

    var box = new THREE.Box3().setFromObject(Obj);
    var boxSize = box.size();
    if ((boxSize.x / mouseGridSnap) % 2 !== 0) {
        tempPtsnap.x += (mouseGridSnap * 0.5);
    }
    if ((boxSize.z / mouseGridSnap) % 2 !== 0) {
        tempPtsnap.z += (mouseGridSnap * 0.5);
    }

    ObjOnClicked.position.copy(tempPtsnap);
}

//three js controls
function UpdateControlState() {
    if (control) {
        if (control.state !== -1) {
            screenChanging = true;
        } else {
            screenChanging = false;
        }
    } else {
        screenChanging = false;
    }
}

//key controls
$(document).keydown(function (e) {
    if (e.keyCode == 27) { //esc
        SetObjDefaultMaterial(ObjOnClicked);
        ObjOnClicked = null;
        drawMode = "View";
    }
})

//mouse controls
function UpdateCursorText(xOverride, zOverride, yOverride, threeObj) {
    var curText = $('#cursorText');
    var mx = Math.round(sceneMouse3d_ground.x, 1);
    var mz = Math.round(-1 * sceneMouse3d_ground.z, 1);
    var my = Math.round(sceneMouse3d_Vertical.y, 1);

    if (xOverride != null) {
        mx = xOverride;
    }
    if (zOverride != null) {
        mz = zOverride;
    }
    if (yOverride != null) {
        my = yOverride;
    }

    document.body.onmousemove = moveCursor;

    var txx = "x:" + mx + " y:" + mz + " z:" + my;
    if (threeObj != null) {
        txx = "x:" + mx + " y:" + mz + " z:" + my + "\n" + "w:" + threeObj.scale.x + " d:" + threeObj.scale.z + " h:" + Math.round(threeObj.scale.y, 0);
    }
    curText.text(txx);

    var curTxtLen = [curText.width(), curText.height];

    var leftLoc = screenMouse.x + 15 + 'px';
    var topLoc = screenMouse.y + 2 + 'px';

    function moveCursor(e) {
        if (!e) {
            e = window.event;
        }
        curText.css({
            left: leftLoc,
            top: topLoc
        });
    }
}

function DeactivateCursorText() {
    $('#cursorText').text("");
}


function UpdateCursor() {
    if (screenChanging === false) {
        if (drawMode.indexOf("Volumn") !== -1 || drawMode.indexOf("Void") !== -1) {
            $('#div_3dCanvas').css('cursor', 'crosshair');
            control.enabled = false;
        } else if (drawMode == "Delete") {
            $('#div_3dCanvas').css('cursor', 'pointer');
        } else {
            control.enabled = true;
            if (ObjOnClicked) {
                $('#div_3dCanvas').css('cursor', 'move');
            } else {
                if (ObjOnHovering) {
                    $('#div_3dCanvas').css('cursor', 'pointer');
                } else {
                    $('#div_3dCanvas').css('cursor', 'default');
                }
            }
        }
    }
}

function ResetSceneMouse3dDownCondition() {
    lastSceneMouse3dLeftDn = new THREE.Vector3(0, 0, 0);
    lastSceneMouse3dRightDn = new THREE.Vector3(0, 0, 0);
}
//check if I can fix this...
function IsClickedAtDifferentLocationInXYPlane(clickedNow, lastClicked, detectTol) {
    if (Math.abs(clickedNow.x - lastClicked.x) > detectTol || Math.abs(clickedNow.y - lastClicked.y) > detectTol || Math.abs(clickedNow.z - lastClicked.z) > detectTol) {
        return true;
    } else {
        return false;
    }
}

function getIntersectionAtScreenCoordinatesBy(x, y, Objs) {
    var nx = (x / sceneWidth) * 2 - 1;
    var ny = -(y / sceneHeight) * 2 + 1;

    var vector = new THREE.Vector3(nx, ny, 0.5);
    projector.unprojectVector(vector, camera);
    //vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    //raycaster.setFromCamera(screenMouse, camera);

    if (Objs.constructor === Array) {
        var intersects = raycaster.intersectObjects(Objs);
    } else {
        var intersects = raycaster.intersectObject(ground);
    }

    if (intersects.length > 0) {
        return intersects[0];
    }

    return null;
}

function onDocumentMouseMove(event) {
    screenMouse.x = event.clientX;
    screenMouse.y = event.clientY;

    if (Math.abs(lastScreenMouseLeftDn.x - event.clientX) > 10 || Math.abs(lastScreenMouseRightDn.y - event.clientY) > 10) mouseMoved = true;

    event.preventDefault();

    var mouseIntersect_ground = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, groundObjects);
    if (mouseIntersect_ground) {
        sceneMouse3d_ground = mouseIntersect_ground.point;
    }

    var mouseIntersect_vertical = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, verticalObjects);
    if (mouseIntersect_vertical) {
        sceneMouse3d_Vertical = mouseIntersect_vertical.point;
    }

    var mouseIntersect = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, sceneObjects);
    if (mouseIntersect) {
        if (event.button == 0) {
            sceneMouse3d = mouseIntersect.point;
            if (ObjOnClicked === null) {
                ObjOnHovering = mouseIntersect.object;
            }
        } else {
            ObjOnHovering = null;
        }
    } else {
        ObjOnHovering = null;
    }

    //drag
    if (ObjOnClicked) {
        var mouseIntersect_OffsetPlane = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, ObjDragPlane);
        if (mouseIntersect_OffsetPlane) {
            var tempPt = mouseIntersect_OffsetPlane.point.sub(ObjDragOffset);
            if (mouseGridOn) {
                SetObjectLoactionOnGridSnap(ObjOnClicked, tempPt);
            } else {
                ObjOnClicked.position.copy(tempPt);
            }
        }
    } else {
        if (mouseIntersect) {
            ObjDragPlane.position.copy(mouseIntersect.object.position);
            ObjDragPlane.lookAt(camera.position);
        }
    }
}

function onDocumentMouseDown(event) {
    mouseMoved = false;
    lastScreenMouseLeftDn.x = event.clientX;
    lastScreenMouseLeftDn.y = event.clientY;

    event.preventDefault();

    if (drawMode == "View" || drawMode == "Delete") {
        var mouseIntersect = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, sceneObjects);
        if (mouseIntersect) {
            if (event.button == 0) {
                ObjOnClicked = mouseIntersect.object;
                ObjOnHovering = null;
            }
        } else {
            //SetObjDefaultMaterial(ObjOnClicked);
            ObjOnClicked = null;
        }
    }

    var mouseIntersect_ground = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, groundObjects);
    if (mouseIntersect_ground) {
        sceneMouse3d = mouseIntersect_ground.point;
        if (event.button == 0) {
            lastSceneMouse3dLeftDn = mouseIntersect_ground.point;

        } else {
            lastSceneMouse3dRightDn = mouseIntersect_ground.point;
        }
    }

    //cal offset
    var mouseIntersect_OffsetPlane = getIntersectionAtScreenCoordinatesBy(event.clientX, event.clientY, ObjDragPlane);
    if (mouseIntersect_OffsetPlane) {
        ObjDragOffset.copy(mouseIntersect_OffsetPlane.point).sub(ObjDragPlane.position);
    }
}

function onDocumentMouseUp(event) {
    //if (mouseMoved) return;

    var x = event.clientX;
    var y = event.clientY;

    event.preventDefault();

    if (event.button == 0) {
        if (ObjOnClicked) {
            SetObjDefaultMaterial(ObjOnClicked);
            //drag
            ObjOnClicked = null;

        }
    }
}
