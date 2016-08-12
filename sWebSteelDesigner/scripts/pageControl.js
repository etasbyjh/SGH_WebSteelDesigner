var drawMode = "View";
var drawingAid;
var buildingVol;

var mouseGridOn = true;
var mouseGridSnap = 1;
var sceneUnit = "Feet";

var areaUnit = "ft2";
var areaForceUnit = "psf";
var weightUnit = "kips";
if (sceneUnit == "Meter") {
    areaUnit = "m2";
    areaForceUnit = "N/m2";
    weightUnit = "N";
}

var buildingType = "Office";
var targetFloorHeight = 12;
var maxFloorDepth = 30;
var wallToWindowRatio = 50;
var maxXColSpan = 30;
var maxYColSpan = 30;
var maxBeamSpan = 6;
var slabThickness = 4; //in
var metalDeckThickness = 3; //in
var slabEdgeDepth = 12; //in
var designStrength = "LRFD";
var designStiffness = "L/360";

var clientOccupation = "";
var clientFirmName = "";
var clientEmail = "";
var clientFirstName = "";
var clientLastName = "";
var clientComment = "";

var floorCount = "";
var grossFloorArea = "";
var grossFacadeArea = "";
var beamCount = "";
var beamWeight = "";
var girderCount = "";
var girderWeight = "";
var columnCount = "";
var totalWeight = "";
var steelWeight = "";

var floorCostFactor = "";
var facadeCostFactor = "";
var steelCostFactor = "";
var laborCostFactor = "";
var totalEstimatedCost = "";

var receivedData;



$(document).ready(function () {
    IsTouchDevice = is_touch_device();
    console.log(IsTouchDevice);

    Initiate3DView();

    setTimeout(ActivateClientInfo, 1000);

    
    
    ActivateUIs();
    UpdateSceneInfo();

    UpdateValuesFromButtons(true, true);
    UpdateValuesFromSliders();

    //3d control
    $('#drawVol').click(function () {
        InitiateRecDrawingAid(scene, "Volume");
    })

    $('#drawVoid').click(function () {
        InitiateRecDrawingAid(scene, "Void");
    })

    $('#delete').click(function () {
        drawMode = "Delete";
        $(this).addClass('yellow').addClass('scaledUP');
        $(document).keydown(function (e) {
            if (e.keyCode == 27) { //esc
                $('#delete').removeClass('yellow').removeClass('scaledUP');
            }
        })
        UpdateSceneHistory("Select Object To Delete");
    })

    $('#objectInfo').click(function () {
        drawMode = "Info";
        UpdateSceneHistory("Select Object To Get Information");
    })

    $('#send').click(function () {
        $('#sendLoading').addClass('active');
        $('#send').addClass('disabled');

        DataCommunication();
    })

    $('#resultTitle').hide();
    $('#costFactors').hide();
    $('#receive').click(function () {
        $.getJSON("fromRH.json", function (jsonMo) {
            GetStructuralThreeMeshesFromJSON(scene, sceneObjects, jsonMo, 0);
            UpdateResultInfo(jsonMo);
        });

        $('#resultTitle').delay(1500).fadeIn(1500);
        setTimeout(function () {
            $('#costFactors').delay(500).fadeIn(1500);
        }, 1500);
    })

    UpdateCostFactors();
    renderScene();
});


function DataCommunication() {

    UpdateSceneHistory("Sending Building Geometry To SGH");

    var jsonPackage = GetsJsonDataPackageFromInitialScene(boxObjects);
    jsonPackage.clientInfo = new sJsonClientInfo();
    jsonPackage.clientInfo.clientOccupation = clientOccupation;
    jsonPackage.clientInfo.clientFirmName = clientFirmName;
    jsonPackage.clientInfo.clientEmail = clientEmail;
    jsonPackage.clientInfo.clientFirstName = clientFirstName;
    jsonPackage.clientInfo.clientLastName = clientLastName;
    jsonPackage.clientInfo.clientComment = clientComment;
    

    jsonPackage.models[0].modelInputs.sceneUnit = sceneUnit;
    jsonPackage.models[0].modelInputs.buildingType = buildingType;
    jsonPackage.models[0].modelInputs.targetFloorHeight = targetFloorHeight;
    jsonPackage.models[0].modelInputs.maxFloorDepth = maxFloorDepth;
    jsonPackage.models[0].modelInputs.wallToWindowRatio = wallToWindowRatio;
    jsonPackage.models[0].modelInputs.maxXColSpan = maxXColSpan;
    jsonPackage.models[0].modelInputs.maxYColSpan = maxYColSpan;
    jsonPackage.models[0].modelInputs.maxBeamSpan = maxBeamSpan;
    jsonPackage.models[0].modelInputs.slabThickness = slabThickness;
    jsonPackage.models[0].modelInputs.metalDeckThickness = metalDeckThickness;
    jsonPackage.models[0].modelInputs.slabEdgeDepth = slabEdgeDepth;
    jsonPackage.models[0].modelInputs.designStrength = designStrength;
    jsonPackage.models[0].modelInputs.designStiffness = designStiffness;

    var jasonfied = jsonPackage.Jsonify();

    var result = "";

    $.ajax({
        type: "POST",
        url: "AskSGHservice.asmx/AskSGH",
        cache: false,
        //async: false,
        contentType: "application/json; charset=utf-8",
        data: "{ 'jsonStr':'" + jasonfied + "' }",
        dataType: "json",
        success: setTimeout(function (data) {
            if (data !== "") {
                receivedData = data;
                result = data;
                $('#sendLoading').removeClass('active');
                $('#send').removeClass('disabled');

                $('#received').popup({
                    on: 'manual',
                    duration: 400
                }).popup('show');
                $('#receive').removeClass('olive').addClass('red').transition({
                    animation: 'jiggle',
                    duration: 1000,
                }).transition('set looping').popup({
                    on: 'focus'
                });

                UpdateSceneHistory("You Have Received Structural Information From SGH");
            }
        }, 15000), ///temp!!!

        error: ajaxFailed
    });

    $('#receive').click(function () {
        UpdateSceneHistory("Receiving Structural Information From SGH");

        ChangeOpacityOfObjects('Volume', 0.2);
        ChangeOpacityOfObjects('Void', 0);

        $(this).removeClass('red').addClass('inverted').addClass('olive').transition('remove looping').removeClass('jiggle');
        $('#received').popup('hide');

        $(this).popup({
            popup: false
        });
        return result;
    })
}

function UpdateSceneHistory(txToAdd) {
    $('#modelStatus').append(txToAdd + '<br/>');
    //    if ($('#modelStatus').children().length > 3) {
    //        $('#modelStatus').find('br:first').remove();
    //    }
    $('#modelStatusWindow').scrollTop($('#modelStatusWindow')[0].scrollHeight);
}

function ActivateClientInfo() {

    $('#GetClientInfo').modal({
        dimmerSettings: {
            opacity: 0.5
        }
    }).modal('show');

    UpdateValuesByDropdown($('#clientOccupation'), 'clientOccupation');

    $('#infoBttnAccept').click(function () {
        $('#GetClientInfo').modal('toggle');
        UpdateValuesFromInputs();
    });
    $('#infoBttnSkip').click(function () {
        $('#GetClientInfo').modal('toggle');
    })
}

function UpdateCostFactors() {
    UpdateValueFromRangeSliderFn($('#floorCostFactorRn'), 0, 500, 100, 50, $('#floorCostFactor'), 'floorCostFactor', '#D9E778', "Floor Cost Factor :", "$/" + areaUnit, UpdateTotalCost);
    UpdateValueFromRangeSliderFn($('#facadeCostFactorRn'), 100, 500, 350, 50, $('#facadeCostFactor'), 'facadeCostFactor', '#D9E778', "Facade Cost Factor :", "$/" + areaUnit, UpdateTotalCost);
    UpdateValueFromRangeSliderFn($('#steelCostFactorRn'), 100, 1000, 500, 100, $('#steelCostFactor'), 'steelCostFactor', '#D9E778', "Steel Cost Factor :", "$/Tonne", UpdateTotalCost);
    UpdateValueFromRangeSliderFn($('#laborCostFactorRn'), 1000, 5000, 1500, 500, $('#laborCostFactor'), 'laborCostFactor', '#D9E778', "Labor Cost Factor :", "$/Member", UpdateTotalCost);
}

//?????
function UpdateTotalCost() {
    var fCost = parseFloat(floorCostFactor) * parseFloat(grossFloorArea);
    var faCost = parseFloat(facadeCostFactor) * parseFloat(grossFacadeArea);
    var stCost = (parseFloat(beamCount) + parseFloat(girderCount) + parseFloat(columnCount)) * parseFloat(laborCostFactor);
    var matCost = (parseFloat(beamWeight) + parseFloat(girderWeight)) * parseFloat(steelCostFactor); //no column for now;

    var totalCost = numberWithCommas(fCost + faCost + stCost + matCost);
    if (totalCost == "NaN") {
        totalCost = "Estimate Cost";
    } else {
        totalCost = '$' + totalCost;
    }

    $('#totalEstimatedCost').html(totalCost);
}

function UpdateResultInfo(jsonMo) {
    floorCount = jsonMo.buildingInfo.floorCount;
    grossFloorArea = jsonMo.buildingInfo.grossFloorArea;
    grossFacadeArea = jsonMo.buildingInfo.grossFacadeArea;
    beamCount = jsonMo.buildingInfo.beamCount;
    beamWeight = jsonMo.buildingInfo.beamWeight;
    girderCount = jsonMo.buildingInfo.girderCount;
    girderWeight = jsonMo.buildingInfo.girderWeight;
    columnCount = jsonMo.buildingInfo.columnCount;
    totalWeight = jsonMo.buildingInfo.totalWeight;
    steelWeight = jsonMo.buildingInfo.steelWeight;

    $('#floorCount').html('&nbsp ' + floorCount);
    $('#grossFloorArea').html('&nbsp ' + numberWithCommas(grossFloorArea) + '&nbsp ' + areaUnit);
    $('#grossFacadeArea').html('&nbsp ' + numberWithCommas(grossFacadeArea) + '&nbsp ' + areaUnit);
    $('#beamCount').html('&nbsp ' + beamCount);
    $('#beamWeight').html('&nbsp ' + numberWithCommas(beamWeight) + '&nbsp ' + weightUnit);
    $('#girderCount').html('&nbsp ' + girderCount);
    $('#girderWeight').html('&nbsp ' + numberWithCommas(girderWeight) + '&nbsp ' + weightUnit);
    $('#columnCount').html('&nbsp ' + columnCount);
    $('#totalWeight').html('&nbsp ' + numberWithCommas(totalWeight) + '&nbsp ' + weightUnit);
    $('#steelWeight').html('&nbsp ' + steelWeight + '&nbsp ' + areaForceUnit);

}

function UpdateValuesFromSliders() {
    UpdateValueFromRangeSlider($('#mouseGridSnapRn'), 0, 10, mouseGridSnap, 1, $('#mouseGridSnap'), 'mouseGridSnap', '#FF851B', sceneUnit);
    UpdateValueFromRangeSlider($('#wallToWindowRatioRn'), 0, 100, wallToWindowRatio, 5, $('#wallToWindowRatio'), 'wallToWindowRatio', '#FFE21F', '%');

    //unit sensitive
    var lowerUnit = " Inch";
    if (sceneUnit == "Meter") {
        lowerUnit = " Centimeter";
    }

    UpdateValueFromRangeSlider($('#targetFloorHeightRn'), 0, 30, targetFloorHeight, 1, $('#targetFloorHeight'), 'targetFloorHeight', '#FFE21F', sceneUnit);
    UpdateValueFromRangeSlider($('#maxFloorDepthRn'), 0, 50, maxFloorDepth, 2.5, $('#maxFloorDepth'), 'maxFloorDepth', '#FFE21F', sceneUnit);

    UpdateValueFromRangeSlider($('#maxXColSpanRn'), 0, 50, maxXColSpan, 2.5, $('#maxXColSpan'), 'maxXColSpan', '#25a233', sceneUnit);
    UpdateValueFromRangeSlider($('#maxYColSpanRn'), 0, 50, maxYColSpan, 2.5, $('#maxYColSpan'), 'maxYColSpan', '#25a233', sceneUnit);
    UpdateValueFromRangeSlider($('#maxBeamSpanRn'), 0, 50, maxBeamSpan, 2.5, $('#maxBeamSpan'), 'maxBeamSpan', '#25a233', sceneUnit);
    UpdateValueFromRangeSlider($('#slabThicknessRn'), 0, 12, slabThickness, 0.5, $('#slabThickness'), 'slabThickness', '#25a233', lowerUnit);
    UpdateValueFromRangeSlider($('#slabEdgeDepthRn'), 0, 24, slabEdgeDepth, 1, $('#slabEdgeDepth'), 'slabEdgeDepth', '#25a233', lowerUnit);
    UpdateValueFromRangeSlider($('#metalDeckThicknessRn'), 0, 7, metalDeckThickness, 0.5, $('#metalDeckThickness'), 'metalDeckThickness', '#25a233', lowerUnit);
}

function UpdateValuesFromInputs() {
    UpdateValueFromInput($('#clientFirmName'));
    UpdateValueFromInput($('#clientEmail'));
    UpdateValueFromInput($('#clientFirstName'));
    UpdateValueFromInput($('#clientLastName'));
    UpdateValueFromInput($('#clientComment'));
}

function UpdateValueFromInput(quryObj) {
    var val = quryObj.html('input').val();
    window[quryObj.attr('id')] = val;
}

function UpdateValueFromRangeSliderFn(rangeObj, mini, maxi, start, step, pObj, varName, colorTx, preTx, postTx, paramFunc) {
    rangeObj.range({
        min: mini,
        max: maxi,
        step: step,
        start: start,
        onChange: function (val) {
            var htmlTx = val;
            htmlTx = (preTx + '&nbsp ' + htmlTx);
            htmlTx += ('&nbsp ' + postTx);


            pObj.html(htmlTx).css({
                'color': colorTx,
                'font-size': '15px',
            });
            window[varName] = val;
            if (paramFunc && (typeof paramFunc == "function")) {
                paramFunc();
            }
        }
    });
}

function UpdateValueFromRangeSlider(rangeObj, mini, maxi, start, step, pObj, varName, colorTx, unitTx) {
    rangeObj.range({
        min: mini,
        max: maxi,
        step: step,
        start: start,
        onChange: function (val) {
            var htmlTx = val;
            if (unitTx) {
                htmlTx += ('&nbsp ' + unitTx);
            }

            pObj.html(htmlTx).css({
                'color': colorTx,
                'font-size': '15px',
            });
            window[varName] = val;
            UpdateSceneInfo();
        }
    });
}

function UpdateValuesFromButtons(UpdatingSceneInfo, UpdatingSliderInfo) {
    $('.ui.button').click(function () {
        $(this).removeClass('active')
            .addClass('active')
            .siblings('button')
            .removeClass('active');
        var objVal = $(this).text();
        var objID = $(this).parent('div').attr('id');
        window[objID] = objVal;
        if (UpdatingSceneInfo) {
            UpdateSceneInfo();
        }
        if (UpdatingSliderInfo) {
            UpdateValuesFromSliders();
        }
    });
}

function UpdateValuesByDropdown(qureyObj, varName, UpdatingSceneInfo) {
    qureyObj.dropdown({
        onChange: function (val) {
            window[varName] = val;
            if (UpdatingSceneInfo) {
                UpdateSceneInfo();
            }
        }
    });
}
//wip
function SetDefaultValueByUnit() {
    $('.ui.button').click(function () {
        if ($(this).attr('id') == "Feet") {
            maxFloorDepth = 30;
            targetFloorHeight = 15;
        } else {
            maxFloorDepth = 10;
            targetFloorHeight = 4;
        }
    });
}

function UpdateSceneInfo() {
    if (mouseGridSnap == 0) {
        mouseGridOn = false;
    } else {
        mouseGridOn = true;
    }

    $('#sceneUnitText').css({
        'color': 'orange',
        'font-size': '13px',
        'padding-left': '5px'
    }).text(sceneUnit);
    $('#sceneGridSnapText').css({
        'color': 'orange',
        'font-size': '13px',
        'padding-left': '5px'
    }).html(mouseGridSnap + '&nbsp ' + sceneUnit);
    $('#buildingType').css({
        'color': 'yellow',
        'font-size': '13px',
        'padding-left': '5px'
    }).text(buildingType);
    $('#targetFloorHeightText').css({
        'color': 'yellow',
        'font-size': '13px',
        'padding-left': '5px'
    }).html(targetFloorHeight + '&nbsp ' + sceneUnit);
}

function ActivateUIs() {

       $('#touchUI').hide();
        if (IsTouchDevice) {
           $('#touchUI').show();
        }

    ShowToolTips();

    $('#SceneSetIcon').click(function () {
        $('#SceneSets').modal({
            dimmerSettings: {
                opacity: 0.7
            }
        }).modal('show');
    })
    $('#ArchSetIcon').click(function () {
        $('#ArchSets').modal({
            dimmerSettings: {
                opacity: 0.7
            }
        }).modal('show');
    })
    $('#EngineerSetIcon').click(function () {
        $('#EngineerSets').modal({
            dimmerSettings: {
                opacity: 0.7
            }
        }).modal('show');
    })
    $('#CostSetIcon').click(function () {
        $('#CostSets').modal({
            dimmerSettings: {
                opacity: 0.7
            }
        }).modal('show');
    })

    $('.accordion').accordion();
    $('.dropdown').dropdown();
}

function ShowToolTips() {

    $('.icon').popup({
        on: 'hover',
        duration: 500,
    })
    $('.image').popup({
        on: 'hover',
        duration: 500
    })
}

function TouchRemoveIconControl(ToActive) {
    var qyObj = $('#exitDrawMode');
    if (ToActive) {
        qyObj.removeClass('disabled');
        qyObj.css({
            '-webkit-transform': 'scale(1.6)'
        });
    } else {
        qyObj.addClass('disabled');
        qyObj.css({
            '-webkit-transform': 'scale(1)'
        });
    }
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function ajaxFailed(xmlRequest) {
    alert(xmlRequest.status + ' \n\r ' +
        xmlRequest.statusText + '\n\r' +
        xmlRequest.responseText);
}
