using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sJsonHandler
{
    public class sJsonMesh
    {
        public string id = "";
        public string name = "";
        public string objType = "";
        public List<sJsonVertex> vertices = new List<sJsonVertex>();
        public List<sJsonFace> faces = new List<sJsonFace>();

        public double cenX = 0.0;
        public double cenY = 0.0;
        public double cenZ = 0.0;
        public double scaleX = 1.0;
        public double scaleY = 1.0;
        public double scaleZ = 1.0;

        public sJsonMesh()
        {

        }
    }

    public class sJsonVertex
    {
        public int id = 0;
        public double X = 0.0;
        public double Y = 0.0;
        public double Z = 0.0;
        public double Rratio = 0.0;
        public double Gratio = 0.0;
        public double Bratio = 0.0;

        public sJsonVertex()
        {

        }
    }

    public class sJsonFace
    {
        public int id = 0;
        public int a = 0;
        public int b = 0;
        public int c = 0;
        public double nX = 0.0;
        public double nY = 0.0;
        public double nZ = 0.0;

        public sJsonFace()
        {

        }
    }

}
