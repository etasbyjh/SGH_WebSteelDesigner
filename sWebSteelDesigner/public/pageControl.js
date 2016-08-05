//Interactive Geometries
var drawMode = "View";
var drawingAid;
var buildingVol;
var modelJson;

var receivedData;

$(document).ready(function () {
    Initiate3DView();

    ShowToolTips();
    ActivateModals();
    ScrollStatusWindow();

    //3d control
    $('#drawVol').click(function () {
        InitiateRecDrawingAid(scene, "Volumn");
    })

    $('#drawVoid').click(function () {
        InitiateRecDrawingAid(scene, "Void");
    })

    $('#delete').click(function () {
        drawMode = "Delete";
    })

    $('#objectInfo').click(function () {
        drawMode = "Info";
    })

    $('#send').click(function () {

        $('#sendLoading').addClass('active');
        $('#send').addClass('disabled');

        var result = DataCommunication();
        if (result === "received") {
            $('#sendLoading').removeClass('active');
            $('#send').removeClass('disabled');
            $('#receive').transition({
                animation: 'bounce',
                duration: 200,
                interval: 10
            })
        }
    })

    $('#receive').click(function () {
        $.getJSON("fromRH.json", function (jsonMo) {
            $('#info').text(GetBuildingInfoAsString(jsonMo));
            GetThreeMeshesFromJSON(scene, sceneObjects, jsonMo);
        });
    })

    renderScene();
});
function DataCommunication() {
    modelJson = GetJsonModelFromScene(boxObjects).ToJSON();

    var result = "";
    $.ajax({
        type: "POST",
        url: "AskSGHservice.asmx/AskSGH",
        async: false,
        cache: false,
        contentType: "application/json; charset=utf-8",
        data: "{ 'jsonStr':'" + modelJson + "' }",
        dataType: "json",
        success: function (data) {
            result = data;
        },
        error: ajaxFailed
    });
    return result;
}

function ActivateModals() {
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
    $('.dropdown').dropdown('show');
}

function ScrollStatusWindow() {
    $('#modelStatusWindow').scrollTop($('#modelStatusWindow')[0].scrollHeight);
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
