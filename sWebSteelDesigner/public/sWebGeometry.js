var BoxDefaultColor = 0x66ccff;
var BoxHighlightedColor = 0xccffff;
var BoxOutlineDefaultColor = 0x006699;
var VoidDefaultColor = 0xff6666;
var VoidHighlightedColor = 0xffcccc;
var VoidOutlineDefaultColor = 0x993333;

var BeamColor = 0xff0000;
var GirderColor = 0x1e00ff;

var aidSize = mouseGridSnap / 10;

//Drawing Aid
function SGH_RecDrawingAid(threeScene, type) {
    this.objType = type;
    this.drawingPoint = this.GetPointSphere();
    this.drawingBoundaryMesh = this.GetDrawingBoundaryMesh();
    this.drawingBoundaryMesh.geometry.dynamic = true;

    this.drawingBoundaryLines = this.GetDrawingBoundaryLines();
    this.IsOnGrid = false;

    this.clickedPoints = [];
    this.lastClicked = new THREE.Vector3(0, 0, 0);

    threeScene.add(this.drawingPoint);
    threeScene.add(this.drawingBoundaryMesh);
    threeScene.add(this.drawingBoundaryLines);
}

function InitiateRecDrawingAid(ThreeScene, drawModeIn) {
    drawMode = drawModeIn;
    ResetSceneMouse3dDownCondition();
    recDrawingAid = new SGH_RecDrawingAid(ThreeScene, drawModeIn);

    UpdateSceneHistory("Drawing " + drawModeIn);

    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            drawMode = "View";
            recDrawingAid.RemoveDrawingAid(ThreeScene);

            DeactivateCursorText();
            //UpdateSceneHistory("Canceled: Drawing " + drawModeIn);
        }
    })
}

function SetObjDefaultMaterial(Obj) {
    if (Obj) {
        if (Obj.userData.name.includes('Volume')) {
            Obj.material.color.setHex(BoxDefaultColor);
        } else if (Obj.userData.name.includes('Void')) {
            Obj.material.color.setHex(VoidDefaultColor);
            Obj.material.opacity = 0.4;
        }
    }
}

function SetObjHighlightedMaterial(Obj) {
    if (Obj) {
        if (Obj.userData.name.includes('Volume')) {
            Obj.material.color.setHex(BoxHighlightedColor);
        }
        if (Obj.userData.name.includes('Void')) {
            Obj.material.color.setHex(VoidHighlightedColor);
            Obj.material.opacity = 0.6;
        }
    }
}

SGH_RecDrawingAid.prototype.GetDrawingBoundaryLines = function (type) {
    var BoxLines = new THREE.BoxHelper(this.drawingBoundaryMesh);
    BoxLines.userData.name = "DrawingAid";
    BoxLines.material.transparent = true;
    BoxLines.material.opacity = 0.2;
    if (this.objType == "Volume") {
        BoxLines.material.color = BoxOutlineDefaultColor;
    } else if (this.objType == "Void") {
        BoxLines.material.color = VoidOutlineDefaultColor;
    }
    return BoxLines;
}

SGH_RecDrawingAid.prototype.GetDrawingBoundaryMesh = function () {
    var geometry = new THREE.BoxGeometry(1, 1, 1);

    var material = null;

    if (this.objType == "Volume") {
        material = new THREE.MeshBasicMaterial({
            color: BoxDefaultColor,
            opacity: 0.01,
            transparent: true
        });
    } else if (this.objType == "Void") {
        material = new THREE.MeshBasicMaterial({
            color: VoidDefaultColor,
            opacity: 0.01,
            transparent: true
        });
    }

    var boundary = new THREE.Mesh(geometry, material);

    boundary.userData.name = "DrawingAid";
    return boundary;
}

SGH_RecDrawingAid.prototype.GetPointSphere = function () {
    var vertexGeo = new THREE.SphereGeometry(aidSize, 10, 10);
    var vertexMat = new THREE.MeshBasicMaterial({
        color: 0xb5121b
    });
    var vertexSphere = new THREE.Mesh(vertexGeo, vertexMat);
    vertexSphere.userData.name = "DrawingAid";
    return vertexSphere;
}

SGH_RecDrawingAid.prototype.RemoveDrawingAid = function (threeScene) {
    for (var i = threeScene.children.length - 1; i >= 0; i--) {
        if (threeScene.children[i].userData.name == "DrawingAid") {
            threeScene.remove(scene.children[i]);
        }
    }
}


SGH_RecDrawingAid.prototype.FinalizeDrawing = function (type, threeScene) {
    this.drawingBoundaryMesh.userData.name = type;
    //    var LabMat = new THREE.MeshLambertMaterial();
    //    LabMat.color = 0x5a471b;
    //    LabMat.fog = ture;

    this.drawingBoundaryMesh.material.opacity = 0.9;

    this.drawingBoundaryLines.userData.name = type + "_Frame";
    this.drawingBoundaryLines.material.opacity = 0.9;
    //??
    this.drawingBoundaryMesh.userData.linkedID = this.drawingBoundaryLines.uuid;

    SetObjDefaultMaterial(this.drawingBoundaryMesh);
    if (type == "Volume") {
        this.drawingBoundaryLines.material.color = BoxOutlineDefaultColor;
    } else if (type == "Void") {
        this.drawingBoundaryLines.material.color = VoidOutlineDefaultColor;
    }
    //this.ScaleFactorToVertice();

    sceneObjects.push(this.drawingBoundaryMesh);
    boxObjects.push(this.drawingBoundaryMesh);

    this.RemoveDrawingAid(threeScene);

    DeactivateCursorText();

    drawMode = "View";
    console.log("View Mode");

    UpdateSceneHistory(type + ' Added, (X:' + this.drawingBoundaryMesh.scale.x + sceneUnit + ' Y:' + this.drawingBoundaryMesh.scale.z + sceneUnit + ' Z:' + this.drawingBoundaryMesh.scale.y + sceneUnit + ')');
}

SGH_RecDrawingAid.prototype.UpdateDrawingAid = function (hoveringPointIn, clickedPointIn, verticalRef, threeScene) {



    var hoveringPoint = hoveringPointIn;
    var clickedPoint = clickedPointIn;
    var verticalRef = verticalRef;

    if (mouseGridOn) {
        hoveringPoint = SetMousesOnGridSnap(hoveringPointIn);
        clickedPoint = SetMousesOnGridSnap(clickedPointIn);
        verticalRef = SetMousesOnGridSnap(verticalRef);
    }

    this.drawingPoint.position.copy(hoveringPoint);

    if (IsClickedAtDifferentLocationInXYPlane(this.lastClicked, clickedPoint, 1)) {
        if (clickedPoint.length() > 0 && this.clickedPoints.length < 3) {
            this.clickedPoints.push(clickedPoint);
            var clickedPointSphere = this.GetPointSphere();
            clickedPointSphere.position.copy(clickedPoint);
            threeScene.add(clickedPointSphere);
            this.lastClicked = clickedPoint;
        }
        //4th clicked add
    }
    if (IsClickedAtDifferentLocationInXYPlane(this.lastClicked, hoveringPoint, 1)) {
        var newPositionX = 0.0;
        var newPositionY = 0.0;
        var newPositionZ = 0.0;
        var newDimX = 1.0;
        var newDimY = 1.0;
        var newDimZ = 1.0;
        var newOpacaity = 0.1;

        var deltaX = 1.0;
        var deltaY = 1.0;
        var deltaZ = 1.0;

        if (this.clickedPoints.length == 0) {
            newPositionX = hoveringPoint.x;
            newPositionY = hoveringPoint.y;
            newPositionZ = hoveringPoint.z;
            //this.GetDrawingBoundaryMesh.visible = false;
            UpdateCursorText(null, null, 0);

        } else if (this.clickedPoints.length == 1) {
            newDimX = (hoveringPoint.x - this.clickedPoints[0].x);
            newDimY = (hoveringPoint.y - this.clickedPoints[0].y);
            newDimZ = (hoveringPoint.z - this.clickedPoints[0].z);

            newPositionX = (newDimX * 0.5) + this.clickedPoints[0].x;
            newPositionY = (newDimY * 0.5) + this.clickedPoints[0].y;
            newPositionZ = (newDimZ * 0.5) + this.clickedPoints[0].z;

            newOpacaity = 0.3;

            deltaX = hoveringPoint.x - this.lastClicked.x;
            deltaY = 0.1;
            deltaZ = hoveringPoint.z - this.lastClicked.z;

            UpdateCursorText(null, null, 0, this.drawingBoundaryMesh);

        } else if (this.clickedPoints.length == 2) {
            var verticlMousePoint = verticalRef;

            newDimX = (this.clickedPoints[1].x - this.clickedPoints[0].x);
            newDimY = (verticlMousePoint.y - this.clickedPoints[1].y);
            newDimZ = (this.clickedPoints[1].z - this.clickedPoints[0].z);

            newPositionX = (newDimX * 0.5) + this.clickedPoints[0].x;
            newPositionY = (newDimY * 0.5) + this.clickedPoints[0].y;
            newPositionZ = (newDimZ * 0.5) + this.clickedPoints[0].z;

            newOpacaity = 0.3;

            deltaX = this.lastClicked.x - this.clickedPoints[0].x;
            deltaY = verticlMousePoint.y - this.lastClicked.y;
            deltaZ = this.lastClicked.z - this.clickedPoints[0].z;

            var newDrawingPoint = new THREE.Vector3(this.lastClicked.x, verticlMousePoint.y, this.lastClicked.z);
            this.drawingPoint.position.copy(newDrawingPoint);

            UpdateCursorText(this.lastClicked.x, -1 * this.lastClicked.z, null, this.drawingBoundaryMesh);
        }

        var newPosition = new THREE.Vector3(newPositionX, newPositionY, newPositionZ);
        this.drawingBoundaryMesh.material.opacity = newOpacaity;

        this.drawingBoundaryMesh.scale.x = Math.abs(deltaX);
        this.drawingBoundaryMesh.scale.y = Math.abs(deltaY);
        this.drawingBoundaryMesh.scale.z = Math.abs(deltaZ);


        this.drawingBoundaryMesh.position.copy(newPosition);
        this.drawingBoundaryLines.update(this.drawingBoundaryMesh);

    }

}

SGH_RecDrawingAid.prototype.ScaleFactorToVertice = function () {
    //    var xf = this.drawingBoundaryMesh.scale.x;
    //    var yf = this.drawingBoundaryMesh.scale.y;
    //    var zf = this.drawingBoundaryMesh.scale.z;
    //
    //    for (var i = 0; i < this.drawingBoundaryMesh.geometry.vertices.length; ++i) {
    //        var v = this.drawingBoundaryMesh.geometry.vertices[i].clone();
    //        var posi = this.drawingBoundaryMesh.position.clone();
    //
    //        var tranMag = new THREE.Vector3(0.5 * xf, 0.5 * yf, 0.5 * zf).length();
    //        var tranv = v.sub(posi).normalize().multiplyScalar(tranMag);
    //        var newv = posi.add(tranv);
    //
    //        this.drawingBoundaryMesh.geometry.vertices[i] = newv;
    //    }
    //
    //    this.drawingBoundaryMesh.geometry.verticesNeedUpdate = true;
    //    this.drawingBoundaryMesh.geometry.elementsNeedUpdate = true;
    //    this.drawingBoundaryMesh.geometry.buffersNeedUpdate = true;
    //
    //    this.drawingBoundaryMesh.scale.x = 1;
    //    this.drawingBoundaryMesh.scale.y = 1;
    //    this.drawingBoundaryMesh.scale.z = 1;
    //
    //    this.drawingBoundaryLines.update(this.drawingBoundaryMesh);
}


//Three Geometry
function RotateGeometry(Geom) {
    Geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
}

function GetThreeJS_Vector3(x, y, z) {
    var pt = new THREE.Vector3(x, y, z);
    try {
        RotateGeometry(pt);
        return pt;
    } catch (err) {
        return pt;
    }

}

function GetThreeJS_Vertex(vec3, size) {
    var dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(vec3);
    var dotMaterial = new THREE.PointCloudMaterial({
        size: size,
        sizeAttenuation: false
    });
    var dot = new THREE.PointCloud(dotGeometry, dotMaterial);
    return dot;
}

function GetThreeJS_Line(sp, ep, mat) {
    var ln = new THREE.Geometry();
    ln.vertices.push(sp, ep);
    RotateGeometry(ln);
    return new THREE.Line(ln, mat);
}

function GetThreeJS_PolyLine(vec3s, mat) {
    var pln = new THREE.Geometry();
    for (i = 0; i < vec3s.length; ++i) {
        pln.vertices.push(vec3s[i]);
    }
    RotateGeometry(pln);
    return new THREE.Line(pln, mat);
}
