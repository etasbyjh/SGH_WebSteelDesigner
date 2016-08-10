using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sJsonHandler
{
    public class sJsonModelInputInfo
    {
        List<sJsonMesh> volumeBoxes = new List<sJsonMesh>();
        List<sJsonMesh> voidBoxes = new List<sJsonMesh>();

        public string sceneUnit = "";
        public string buildingType = "";
        public string targetFloorHeight = "";
        public string maxFloorDepth = "";
        public string wallToWindowRatio = "";
        public string maxXColSpan = "";
        public string maxYColSpan = "";
        public string maxBeamSpan = "";
        public string slabThickness = "";
        public string metalDeckThickness = "";
        public string slabEdgeDepth = "";
        public string designStrength = "";
        public string designStiffness = "";

        public sJsonModelInputInfo()
        {

        }
    }
}
