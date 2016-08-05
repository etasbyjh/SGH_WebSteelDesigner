using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

namespace sWebSteelDesigner
{
    /// <summary>
    /// Summary description for AskSGHservice
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class AskSGHservice : System.Web.Services.WebService
    {
        [WebMethod(EnableSession = true)]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string AskSGH(string jsonStr)
        {
            string path = @"C:\Users\jlee\Documents\SGHWebApplications\sWebSteelDesigner\fromWeb.json";
            File.WriteAllText(path, jsonStr);
            return "received";
        }
    }
}
