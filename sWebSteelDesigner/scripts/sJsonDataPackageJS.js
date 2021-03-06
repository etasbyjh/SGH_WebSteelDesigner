function sJsonDataPackage() {
    this.clientInfo = new sJsonClientInfo();
    this.models = [];

    this.Jsonify = function () {
        return JSON.stringify(this);
    }
}

function GetsJsonDataPackageFromInitialScene(Th_Meshes, modelName, modelID) {
    var jmo = new sJSonModel();
    if (modelName != null) {
        jmo.name = modelName;
    } else {
        jmo.name = "Initial Input Model";
    }
    if (modelID != null) {
        jmo.id = modelID;
    }

    jmo.modelInputs = new sJsonModelInputInfo();
    jmo.modelOutputs = new sJsonModelOutputInfo();

    for (var i = 0; i < Th_Meshes.length; ++i) {
        var jm = GetJsonMeshFromTHREEMesh(Th_Meshes[i]);
        if (jm.objType.includes("Volume")) {
            jmo.modelInputs.volumeBoxes.push(jm);
        } else {
            jmo.modelInputs.voidBoxes.push(jm);
        }
    }

    var jdata = new sJsonDataPackage();
    jdata.models.push(jmo);

    return jdata;
}

function sJSonModel() {
    this.name = "";
    this.id = 0;
    this.modelInputs = null;
    this.modelOutputs = null;
}

function GetStructuralThreeMeshesFromJSON(threeScene, threeSceneObjects, json, outputIndex) {

    for (var i = 0; i < json.models[outputIndex].modelOutputs.structurMeshes.length; ++i) {
        var vbox = json.models[outputIndex].modelOutputs.structurMeshes[i];

        var threeGeo = new THREE.Geometry();
        for (var j = 0; j < vbox.vertices.length; ++j) {
            var vv = vbox.vertices[j];
            threeGeo.vertices.push(new THREE.Vector3(vv.X, vv.Y, vv.Z));
        }
        for (var j = 0; j < vbox.faces.length; ++j) {
            var vf = vbox.faces[j];
            var fn = new THREE.Vector3(vf.nX, vf.nY, vf.nZ);
            if (vf.isQuad) {
                threeGeo.faces.push(new THREE.Face3(vf.a, vf.b, vf.c, vf.d, fn));
            } else {
                threeGeo.faces.push(new THREE.Face3(vf.a, vf.b, vf.c, fn));
            }
        }

        threeGeo.name = vbox.name;
        //threeGeo.id = vbox.id;

        threeGeo.computeFaceNormals();
        threeGeo.computeVertexNormals();

        threeGeo.elementsNeedUpdate = true;
        threeGeo.normalsNeedUpdate = true;
        threeGeo.verticesNeedUpdate = true;

        var threeMat = new THREE.MeshBasicMaterial({
            color: BeamColor,
            opacity: 1.0,
            castShadow: true,
            //wireframe: true
            //transparent: true
        });
        var threeMesh = new THREE.Mesh(threeGeo, threeMat);
        //var positionVec = new THREE.Vector3(vbox.cenX, vbox.cenY, vbox.cenZ);
        //threeMesh.position.copy(positionVec);
        //threeMesh.name = vbox.name;

        var wires = new THREE.WireframeHelper(threeMesh, 0x710000);
        //edges.material.linewidth = 2;
        scene.add(wires);

        threeMesh.scale.x = 1;
        threeMesh.scale.y = 1;
        threeMesh.scale.z = 1;

        threeScene.add(threeMesh);
    }
    var test = null;
}

function sJsonClientInfo() {
    this.clientOccupation = "";
    this.clientFirmName = "";
    this.clientEmail = "";
    this.clientFirstName = "";
    this.clientLastName = "";
    this.clientComment = "";
}

function sJsonModelInputInfo() {
    this.volumeBoxes = [];
    this.voidBoxes = [];

    this.sceneUnit = "";
    this.buildingType = "";
    this.targetFloorHeight = "";
    this.maxFloorDepth = "";
    this.wallToWindowRatio = "";
    this.maxXColSpan = "";
    this.maxYColSpan = "";
    this.maxBeamSpan = "";
    this.slabThickness = "";
    this.metalDeckThickness = "";
    this.slabEdgeDepth = "";
    this.designStrength = "";
    this.designStiffness = "";
}

function sJsonModelOutputInfo() {
    this.newBuildingBoxes = [];
    this.structurMeshes = [];

    this.floorCount = "";
    this.grossFloorArea = "";
    this.grossFacadeArea = "";
    this.beamCount = "";
    this.beamWeight = "";
    this.girderCount = "";
    this.girderWeight = "";
    this.columnCount = "";
    this.totalWeight = "";
    this.steelWeight = "";
}

function sJsonMesh() {
    this.id = "";
    this.name = "";
    this.objType = "";
    this.vertices = [];
    this.faces = [];

    this.cenX = 0.0;
    this.cenY = 0.0;
    this.cenZ = 0.0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;

}

function GetJsonMeshFromTHREEMesh(Th_Mesh) {
    var jm = new sJsonMesh();

    jm.objType = Th_Mesh.userData.name;

    var threeGeo = Th_Mesh.geometry;
    jm.cenX = Th_Mesh.position.x;
    jm.cenY = Th_Mesh.position.y;
    jm.cenZ = Th_Mesh.position.z;
    jm.scaleX = Th_Mesh.scale.x;
    jm.scaleY = Th_Mesh.scale.y;
    jm.scaleZ = Th_Mesh.scale.z;

    //jm.id = threeGeo.id;
    //jm.name = threeGeo.name;
    for (var i = 0; i < threeGeo.vertices.length; ++i) {

        var threev = threeGeo.vertices[i];

        var jv = new sJsonVertex();
        jv.id = i;
        jv.X = threev.x;
        jv.Y = threev.y;
        jv.Z = threev.z;
        //jv.Rratio = threeGeo.colors[i].r;
        //jv.Gratio = threeGeo.colors[i].g;
        //jv.Bratio = threeGeo.colors[i].b;
        jm.vertices.push(jv);
    }
    for (var i = 0; i < threeGeo.faces.length; ++i) {
        var jf = new sJsonFace();
        jf.id = i;
        jf.a = threeGeo.faces[i].a;
        jf.b = threeGeo.faces[i].b;
        jf.c = threeGeo.faces[i].c;

        var threev = threeGeo.faces[i].clone();

        jf.nX = threev.normal.x;
        jf.nY = threev.normal.y;
        jf.nZ = threev.normal.z;
        jm.faces.push(jf);
    }

    return jm;
}

function sJsonVertex() {
    this.id = 0;
    this.X = 0.0;
    this.Y = 0.0;
    this.Z = 0.0;
    this.Rratio = 0.0;
    this.Gratio = 0.0;
    this.Bratio = 0.0;
}

function sJsonFace() {
    this.id = 0;
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.nX = 0.0;
    this.nY = 0.0;
    this.nZ = 0.0;
}
