using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;


namespace sJsonHandler
{
    public class sJsonDataPackage
    {
        public sJsonClientInfo clientInfo = new sJsonClientInfo();
        public List<sJsonModel> models = new List<sJsonModel>();

        public sJsonDataPackage()
        {

        }

        public string Jsonify()
        {
            return JsonConvert.SerializeObject(this);
        }

        public static sJsonDataPackage Objectify(string jsonModel)
        {
            return JsonConvert.DeserializeObject<sJsonDataPackage>(jsonModel);
        }
    }
}
