﻿using sJsonHandler;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
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
            //new Json Class Test
            sJsonDataPackage dataPack = sJsonDataPackage.Objectify(jsonStr);
            sJsonClientInfo clientInfo = dataPack.clientInfo;

            SaveClientInfo(clientInfo);

            //For new Json Class C# Test in Grasshopper
            string path = @"C:\Users\jlee\Documents\SGHWebApplications\sWebSteelDesigner\fromWeb.json";
            File.WriteAllText(path, jsonStr);


            return "SUCCESS";
        }
        
        bool SaveClientInfo(sJsonClientInfo clientInfo)
        {
           
            SteelDesiDBDataContext SDDB = new SteelDesiDBDataContext();
            //check to see if this information is already in the database based on the key (clientfirmname and clientemail)
            ClientInfo CI = (from c in SDDB.ClientInfos
                                  where c.clientEmail == clientInfo.clientEmail && c.clientFirmName == clientInfo.clientFirmName
                                  select c).FirstOrDefault();

            //if this user already submitted their info we do nothing otherwise create a new clientInfo object and
            //based on the passed data, then send it to the database  
            if(CI == null)
            {
                //create the clientinfo object
                CI = new ClientInfo
                {
                    clientInfoID = Guid.NewGuid(),
                    clientFirmName = clientInfo.clientFirmName,
                    clientEmail = clientInfo.clientEmail,
                    clientComment = clientInfo.clientComment,
                    clientFirstName = clientInfo.clientFirstName,
                    clientLastName = clientInfo.clientLastName,
                    clientOccupation = clientInfo.clientOccupation
                };
                //send the clientinfo object to the database
                SDDB.ClientInfos.InsertOnSubmit(CI);
                SDDB.SubmitChanges();

                return true;
            }
            else
            {
                //the key of clientFirmName and clientEmail is not unique (ie this client already shows up in the database)
                //currently we dont do anything when this happens

                return false;
            }


        }
    }


    //string readPath = @"C:\Users\jlee\Documents\SGHWebApplications\sWebSteelDesigner\fromRH.json";
    //if (File.Exists(readPath))
    //{
    //    File.Delete(readPath);
    //}
    //if (File.Exists(readPath))
    //{
    //    return File.ReadAllText(readPath);
    //}
    //else
    //{
    //    return "";
    //}

}
