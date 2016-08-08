var drawMode = "View";
var drawingAid;
var buildingVol;
var modelJson;

var mouseGridOn = true;
var mouseGridSnap = 1;
var sceneUnit = "Feet";
var buildingType = "Office";
var targetFloorHeight = 15;
var maxFloorDepth = 30;
var wallToWindowRatio = 50;
var maxXColSpan = 30;
var maxYColSpan = 30;
var maxBeamSpan = 10;
var slabThickness = 4; //in
var metalDeckThickness = 3; //in
var slabEdgeDepth = 12; //in
var designStrength = "LRFD";
var designStiffness = "L/360";

var clientOccupation = "";
var clientFirmName = "";

var receivedData;


$(document).ready(function () {
    Initiate3DView();

    ActivateUIs();
    UpdateSceneInfo();

    UpdateValuesFromButtons(true, true);
    UpdateValuesFromSliders();


    //3d control
    $('#drawVol').click(function () {
        InitiateRecDrawingAid(scene, "Volumn");
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

        $('#GetClientInfo').modal({
            dimmerSettings: {
                opacity: 0.5
            }
        }).modal('show');

        ActivateClientInfoForm();
        if (clientFirmName.length > 0) {
            $('#sendLoading').addClass('active');
            $('#send').addClass('disabled');

            DataCommunication();
        }
    })

    $('#receive').click(function () {
        $.getJSON("fromRH.json", function (jsonMo) {
            $('#info').text(GetBuildingInfoAsString(jsonMo));
            GetThreeMeshesFromJSON(scene, sceneObjects, jsonMo);
        });
    })



    //renderScene();
});

function DataCommunication() {

    UpdateSceneHistory("Sending Building Geometry To SGH");
    modelJson = GetJsonModelFromScene(boxObjects).ToJSON();

    var result = "";
    $.ajax({
        type: "POST",
        url: "AskSGHservice.asmx/AskSGH",
        cache: false,
        contentType: "application/json; charset=utf-8",
        data: "{ 'jsonStr':'" + modelJson + "' }",
        dataType: "json",
        success: function (data) {
            if (data !== "") {
                receivedData = data;
                result = data;
                $('#sendLoading').removeClass('active');
                $('#send').removeClass('disabled');

                $('#received').popup({
                    on: 'manual',
                    duration: 400
                }).popup('show');
                $('#receive').removeClass('violet').addClass('red').transition({
                    animation: 'jiggle',
                    duration: 1000,
                }).transition('set looping').popup({
                    on: 'focus'
                });

                UpdateSceneHistory("You Have Received Structural Information From SGH");
            }
        },
        error: ajaxFailed
    });

    $('#receive').click(function () {
        UpdateSceneHistory("Receiving Structural Information From SGH");

        ChangeOpacityOfObjects('Volumn', 0.2);

        $(this).removeClass('red').addClass('violet').transition('remove looping').removeClass('jiggle');
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

function ActivateClientInfoForm() {
    UpdateValuesByDropdown($('#clientOccupation'), 'clientOccupation');

    $('#clientInfo').form({
        on: 'blur'
    });
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

function IconClickActions() {
    $('.icon').click(function () {
        $(this).transition({
            animation: 'pulse',
            duration: 200
        })
    })
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
//
//function IconAPITest() {
//    $('.icon').state('deactivate');
//}
//
//function GridOnOff() {
//    $('#gridOnOff').css('color', '#B03060');
//    $('#gridOnOff').click(function () {
//        if (mouseGridOn) {
//            mouseGridOn = false;
//            $('#gridOnOff').css('color', 'white');
//        } else {
//            mouseGridOn = true;
//            $('#gridOnOff').css('color', '#B03060');
//        }
//    })
//}
//
//function JiggleUponClick() {
//    $('.item').click(function () {
//        $(this).transition({
//            animation: 'jiggle',
//            duration: 200,
//
//        })
//    })
//}
//
//function GetClickedItem() {
//    $(document).on("click", "#side1", function (event) {
//        console.log(event.target.id);
//        //$("#"+String(this.id)).css("background-color","yellow"); this is how to use as variable.
//    });
//}

function ajaxFailed(xmlRequest) {
    alert(xmlRequest.status + ' \n\r ' +
        xmlRequest.statusText + '\n\r' +
        xmlRequest.responseText);
}
