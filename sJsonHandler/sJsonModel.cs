using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace sJsonHandler
{
    public class sJsonModel
    {
        public string name = "";
        public int id = 0;
        public sJsonModelInputInfo modelInputs = new sJsonModelInputInfo();
        public sJsonModelOutputInfo modelOutputs = new sJsonModelOutputInfo();

        public sJsonModel()
        {

        }
    }
}
