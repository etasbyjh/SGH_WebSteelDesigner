using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sJsonHandler
{
    public class sJsonModelOutputInfo
    {
        public List<sJsonMesh> newBuildingBoxes = new List<sJsonMesh>();
        public List<sJsonMesh> structurMeshes = new List<sJsonMesh>();

        public string floorCount = "";
        public string grossFloorArea = "";
        public string grossFacadeArea = "";
        public string beamCount = "";
        public string beamWeight = "";
        public string girderCount = "";
        public string girderWeight = "";
        public string columnCount = "";
        public string totalWeight = "";
        public string steelWeight = "";

        public sJsonModelOutputInfo()
        {

        }
    }
}
