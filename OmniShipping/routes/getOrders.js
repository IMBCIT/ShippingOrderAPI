const express = require("express");
const router = express.Router();
const sql = require("mssql");
const connection = require("../database/db");

router.get("/epicor/facilities", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    "Select Company, plant, name, address1, address2, city, zip, phonenum, state from Erp.Plant",
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/users", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select E.Company, E.EmpID, E.DcdUserID, E.Name, E.EMailAddress, U.OfficePhone, U.Phone as cellPhone, P.RoleCode, P.PerConID, EU.Plant_c as plant, E.EmpStatus
      From Erp.EmpBasic as E inner join Erp.EmpBasic_UD as EU on E.SysRowID = EU.ForeignSysRowID Left Join Erp.PerCon as P on E.Company = P.Company and E.PerConID = P.PerConID
      Left Join Erp.UserFile as U on E.Company = U.CurComp and E.DcdUserID = U.DcdUserID Where E.EmpStatus = 'A' AND E.Name NOT LIKE '%Backflush%'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/customers", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select C.Company, CU.Plant_c as plant, C.CustID, C.CustNum, C.Name, C.Address1, C.Address2, C.Address3, C.City, C.State, C.Zip, C.BTAddress1, C.BTAddress2, C.BTAddress3, C.BTCity, C.BTState, C.BTZip, C.PhoneNum as primaryPhoneNum
      From Customer as C Inner Join Erp.Customer_UD as CU ON C.SysRowID = CU.ForeignSysRowID WHERE C.Name NOT LIKE '%Do Not%' AND C.Address1 NOT LIKE '%Do Not%' AND C.Address2 NOT LIKE '%Do Not%'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/drivers", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select PC.Company, 'MfgSys' as Plant, R.RoleCode, PC.FirstName, PC.MiddleName, PC.LastName, PC.Suffix, PC.Name, PC.PhoneNum from Erp.PerCon as PC
      left join Erp.RoleCd as R on PC.Company = R.Company and PC.RoleCode = R.RoleCode where PC.RoleCode = 'Driver'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/trucks", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    "Select UT.Company, UT.LongDesc as Plant, UT.CodeTypeID, UT.CodeId, UT.CodeDesc from Ice.UDCodes as UT Where UT.CodeTypeID = 'TruckList' ",
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/trailers", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    "Select UT.Company, UT.CodeTypeID, UT.CodeId, SUBSTRING(UT.CodeDesc, 1, 6) as Plant, UT.LongDesc from Ice.UDCodes as UT Where UT.CodeTypeID = 'TrlrList' ",
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/orders", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `SELECT OH.Company,
    ORR.Plant,
    OH.OrderNum AS orderNo,
    S.ShipToNum,
    S.Name,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.Address1
        ELSE S.Address1
    END AS jobAddress1,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.Address2
        ELSE S.Address2
    END AS jobAddress2,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.Address3
        ELSE S.Address3
    END AS jobAddress3,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.City
        ELSE S.City
    END AS jobCity,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.State
        ELSE S.State
    END AS jobState,
    CASE
        WHEN OH.ShipViaCode = 'DS' THEN C.Zip
        ELSE S.Zip
    END AS jobZip,
    C.CustID,
    C.CustNum,
    C.Name name,
    C.PhoneNum phoneNo,
    C.Address1 AS address1,
    C.Address2 AS address2,
    C.City AS city,
    C.State,
    OD.OrderLine AS LINE,
    OD.LineDesc AS item,
    OD.OrderQty itemQuant,
    OH.OrderComment AS comments,
    OD.RequestDate AS deliveryDateTime,
    OH.ShipViaCode AS shipBy,
    CONVERT(nvarchar, DATEADD(SECOND, OH.ChangeTime, '0:00:00'), 108) AS ChangeTime,
    OH.ChangeDate
FROM Erp.OrderHed AS OH
INNER JOIN Erp.OrderDtl AS OD ON OH.Company = OD.Company
AND OH.CustNum = OD.CustNum
AND OH.OrderNum = OD.OrderNum
INNER JOIN Erp.OrderRel AS ORR ON OD.Company = ORR.Company
AND OD.OrderNum = ORR.OrderNum
AND OD.OrderLine = ORR.OrderLine
INNER JOIN Erp.Customer AS C ON OH.Company = C.Company
AND OH.CustNum = C.CustNum
LEFT JOIN Erp.ShipTo AS S ON OD.Company = S.Company
AND OD.CustNum = S.CustNum
AND OH.ShipToNum = S.ShipToNum
WHERE ORR.OpenOrder = '1'
AND OD.OpenLine = '1'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/pos", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `SELECT PH.Company,
    PR.Plant,
    PA.Name AS BuyerName,
    PA.EMailAddress,
    V.Name AS SupplierName,
    V.Address1,
    V.Address2,
    V.Address3,
    V.City,
    V.State,
    V.Zip,
    V.PhoneNum,
    PH.ShipViaCode,
    PH.PONum,
    Convert(Varchar,PD.POLine) AS POLine,
    Convert(Varchar,PR.PORelNum) AS PORelNum,
    PD.PartNum,
    PD.LineDesc,
    PR.TranType,
    PR.DueDate,
    PR.RelQty,
    PR.ReceivedQty,
    PR.ArrivedQty,
    PR.InvoicedQty,
    PR.NeedByDate,
    PH.ChangeDate,
    PD.UnitCost * (PR.RelQty - PR.ReceivedQty) AS ExtCostOpen
FROM Erp.POHeader AS PH
INNER JOIN Erp.PODetail AS PD ON PH.Company = PD.Company
AND PH.PONum = PD.PONUM
INNER JOIN Erp.PORel AS PR ON PD.Company = PR.Company
AND PD.PONUM = PR.PONum
AND PD.POLine = PR.POLine
INNER JOIN Erp.Vendor AS V ON PH.Company = V.Company
AND PH.VendorNum = V.VendorNum
INNER JOIN Erp.PurAgent AS PA ON PH.Company = PA.Company
AND PH.BuyerID = PA.BuyerID
WHERE PH.OpenOrder = '1'
AND PD.OpenLine = '1'
AND PR.OpenRelease = '1'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/shiptocontacts", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `SELECT CC.Company,
    CC.CustNum,
    CC.ShipToNum,
    C.CustID,
    C.Name AS CustName,
    CC.Name AS ContactName,
    CC.EMailAddress,
    CC.PhoneNum,
    CC.PerConID
FROM ERP.CustCnt AS CC
INNER JOIN
(SELECT PC.Company,
       PC.PerConID
FROM ERP.PerConLnk AS PC
WHERE PC.ContextLink = 'ShipTo') AS PC ON CC.Company = PC.Company
AND CC.PerConID = PC.PerConID
INNER JOIN ERP.Customer AS C ON CC.Company = C.Company
AND CC.CustNum = C.CustNum
WHERE CC.ShipToNum <> ''
AND CC.ShipToNum <> 'MAINADDRESS'
AND CC.ShipToNum <> 'MAILINGADDRES'
GROUP BY CC.Company,
      CC.CustNum,
      CC.ShipToNum,
      C.CustID,
      C.Name,
      CC.Name,
      CC.EMailAddress,
      CC.PerConID,
      CC.PhoneNum
ORDER BY CC.Company,
      C.CustID,
      CC.PerConID,
      CC.ShipToNum`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/completed", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `SELECT OH.Company,
    ORR.Plant,
    OH.OrderNum AS orderNo,
    S.ShipToNum,
    S.Name,
    S.Address1 AS jobAddress1,
    S.Address2 AS jobAddress2,
    S.Address3 AS jobAddress3,
    S.City AS jobCity,
    S.State AS jobState,
    S.Zip AS jobZip,
    C.CustID,
    C.CustNum,
    C.Name name,
    C.PhoneNum phoneNo,
    C.Address1 AS address1,
    C.Address2 AS address2,
    C.City AS city,
    C.State,
    OD.OrderLine AS LINE,
    OD.LineDesc AS item,
    OD.OrderQty itemQuant,
    OH.OrderComment AS comments,
    OD.RequestDate AS deliveryDateTime,
    OH.ShipViaCode AS shipBy,
    CONVERT(nvarchar, DATEADD(SECOND, OH.ChangeTime, '0:00:00'), 108) AS ChangeTime,
    OH.ChangeDate
FROM Erp.OrderHed AS OH
INNER JOIN Erp.OrderDtl AS OD ON OH.Company = OD.Company
AND OH.CustNum = OD.CustNum
AND OH.OrderNum = OD.OrderNum
INNER JOIN Erp.OrderRel AS ORR ON OD.Company = ORR.Company
AND OD.OrderNum = ORR.OrderNum
AND OD.OrderLine = ORR.OrderLine
INNER JOIN Erp.Customer AS C ON OH.Company = C.Company
AND OH.CustNum = C.CustNum
LEFT JOIN Erp.ShipTo AS S ON OD.Company = S.Company
AND OD.CustNum = S.CustNum
AND OH.ShipToNum = S.ShipToNum
WHERE OD.OpenLine = '0'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/backorders", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `SELECT ODT.Company,
    FC.Plant,
    ODT.CountRow,
    ODT.CustNum,
    ODT.CustID,
    ODT.CustName,
    ODT.ShiptoNum,
    ODT.ShipToName,
    ODT.OrderNum,
    ODT.OrderLine,
    ODT.PartNum,
    ODT.ProdCode,
    ODT.HedReqDate,
    ODT.DtlReqDate,
    ODT.OrrReqDate,
    ODT.LineReqDate,
    ODT.OrderRelNum,
    ODT.OrderDate,
    ODT.RelNeedByDate,
    ODT.OurStockShippedQty,
    ODT.OurJobShippedQty,
    ODT.OrderQty
FROM dbo.ttFiscalPeriodRepPlant AS FC
INNER JOIN
(SELECT C.Company,
       1 AS CountRow,
       C.CustNum,
       C.CustID,
       C.Name AS CustName,
       ORR.Plant,
       SR.SalesRepCode,
       SR.EMailAddress,
       SR.Name AS SalesRepName,
       od.OrderQty,
       ST.TerritoryID,
       ST.TerritoryDesc,
       CASE
           WHEN UID.EntryPerson IS NULL THEN ''
           ELSE UID.EntryPerson
       END AS EntryPerson,
       CASE
           WHEN UID.EntryPersonName IS NULL THEN ''
           ELSE UID.EntryPersonName
       END AS EntryPersonName,
       OH.OrderDate,
       STT.ShipToNum,
       STT.Name AS ShipToName,
       OH.OrderNum,
       OD.OrderLine,
       OD.PartNum,
       CASE
           WHEN P.ProdCode IS NULL THEN 'NA'
           ELSE P.ProdCode
       END AS ProdCode,
       OH.RequestDate AS HedReqDate,
       OD.RequestDate AS DtlReqDate,
       ORR.ReqDate AS OrrReqDate,
       CASE
           WHEN OD.RequestDate IS NULL THEN OH.RequestDate
           ELSE OD.RequestDate
       END AS LineReqDate,
       ORR.OrderRelNum,
       CASE
           WHEN ORR.NeedByDate IS NULL
                AND OD.NeedByDate IS NULL
                AND OH.NeedByDate IS NULL THEN OH.OrderDate
           WHEN ORR.NeedByDate IS NULL
                AND OD.NeedByDate IS NULL THEN OH.NeedByDate
           WHEN ORR.NeedByDate IS NULL THEN OD.NeedByDate
           ELSE ORR.NeedByDate
       END AS RelNeedByDate,
       ORR.OurReqQty AS OurRelReqQty,
       OD.DiscountPercent,
       OD.PricePerCode,
       OD.UnitPrice,
       CASE
           WHEN ORR.OurReqQty = 0 THEN 0
           ELSE (ORR.OurReqQty - (ORR.OurStockShippedQty + ORR.OurJobShippedQty)) * ((OD.DocExtPriceDtl / ORR.OurReqQty) * (1-(OD.DiscountPercent/100)))
       END AS OrderValue,
       CASE
           WHEN OD_UD.Number05 = 0 THEN 0
           ELSE OD_UD.Number05
       END AS BurFreight,
       Sum(CASE
               WHEN OM.ExtMiscHedChg IS NULL THEN 0
               ELSE OM.ExtMiscHedChg
           END) AS ExtMiscHedChg,
       Sum(CASE
               WHEN OM.ExtMiscLineChg IS NULL THEN 0
               ELSE OM.ExtMiscLineChg
           END) AS ExtMiscLineChg,
       CASE
           WHEN ORR.OurReqQty = 0 THEN 0
           ELSE (ORR.OurReqQty * ((OD.DocExtPriceDtl / ORR.OurReqQty) * (1-(OD.DiscountPercent/100))))
       END /* as OrderValue */ + (CASE
                                      WHEN OM.ExtMiscHedChg IS NULL THEN 0
                                      ELSE OM.ExtMiscHedChg
                                  END)/* as ExtMiscHedChg */ + (CASE
                                                                    WHEN OM.ExtMiscLineChg IS NULL THEN 0
                                                                    ELSE OM.ExtMiscLineChg
                                                                END)/* as ExtMiscLineChg */ - (CASE
                                                                                                   WHEN OD_UD.Number05 = 0 THEN 0
                                                                                                   ELSE OD_UD.Number05
                                                                                               END) /* as BurFreight */ AS ExtOrdCommissionableAmt,
                                                                                              ORR.OurStockShippedQty,
                                                                                              ORR.OurJobShippedQty
FROM ERP.OrderHed AS OH
INNER JOIN ERP.OrderDtl AS OD ON OH.Company = OD.Company
AND OH.OrderNum = OD.OrderNum
INNER JOIN ERP.OrderDtl_UD AS OD_UD ON OD.SysRowID = OD_UD.ForeignSysRowID
INNER JOIN ERP.OrderRel AS ORR ON OD.Company = ORR.Company
AND OD.OrderNum = ORR.OrderNum
AND OD.OrderLine = ORR.OrderLine
LEFT JOIN ERP.Part AS P ON OD.Company = P.Company
AND OD.PartNum = P.PartNum
INNER JOIN ERP.Customer AS C ON OH.Company = C.Company
AND OH.CustNum = C.CustNum
LEFT JOIN ERP.ShipTo AS STT ON OH.Company = STT.Company
AND OH.CustNum = STT.CustNum
AND OH.ShipToNum = STT.ShipToNum
LEFT JOIN /* -- UserName for Entry Person when bad ID then " " -- */
  (SELECT UF.CurComp,
          OH.OrderNum,
          CASE
              WHEN UF.DcdUserID = OH.EntryPerson THEN UF.DcdUserID
              ELSE ''
          END AS EntryPerson,
          CASE
              WHEN UF.Name IS NULL THEN ''
              ELSE UF.Name
          END AS EntryPersonName
   FROM ERP.UserFile AS UF
   LEFT JOIN ERP.OrderHed AS OH ON UF.CurComp = OH.Company
   AND UF.DcdUserID = OH.EntryPerson
   GROUP BY UF.CurComp,
            OH.OrderNum,
            UF.DcdUserID,
            OH.EntryPerson,
            UF.Name) AS UID ON OH.Company = UID.CurComp
AND OH.OrderNum = UID.OrderNum
LEFT JOIN ERP.SalesRep AS SR ON C.Company = SR.Company
AND C.SalesRepCode = SR.SalesRepCode
LEFT JOIN ERP.SalesTer AS ST ON C.Company = ST.Company
AND C.TerritoryID = ST.TerritoryID
LEFT JOIN /*  ---Misc Hed and Line Charges---  */
  (SELECT OH.Company,
          OH.OrderNum,
          OD.OrderLine,
          CASE
              WHEN OM.DocMiscAmt IS NULL THEN 0
              WHEN OM.OrderLine = 0 THEN 0
              ELSE OM.DocMiscAmt
          END AS ExtMiscLineChg,
          CASE
              WHEN OM.DocMiscAmt IS NULL THEN 0
              WHEN OM.OrderLIne > 0 THEN 0
              ELSE OM.DocMiscAmt
          END AS ExtMiscHedChg
   FROM ERP.OrderHed AS OH
   INNER JOIN ERP.OrderDtl AS OD ON OH.Company = OD.Company
   AND OH.OrderNum = OD.OrderNum
   INNER JOIN ERP.OrderMsc AS OM ON OD.Company = OM.Company
   AND OD.OrderNum = OM.OrderNum
   AND OD.OrderLine = CASE
                          WHEN OM.OrderLine = 0 THEN 1
                          ELSE OM.OrderLine
                      END
   WHERE OM.MiscCode <> 'FRTO'
     AND OM.MiscCode<> 'INFR'
     AND OM.MiscCode <> 'FRHT'
     AND OM.MiscCode <> 'FC'
     AND OM.MiscCode <> 'LEGA'
     AND OM.MiscCode <> 'PVFF'
     AND OM.MiscCode <> 'RST%'
     AND --OM.MiscCode <> 'STRG' and
OM.MiscCode <> 'RSTF'
   GROUP BY OH.Company,
            OH.OrderNum,
            OD.OrderLine,
            OM.DocMiscAmt,
            OM.OrderLine) AS OM ON C.Company = OM.Company
AND OH.OrderNum = OM.OrderNum
AND OD.OrderLine = OM.OrderLine
INNER JOIN
  (SELECT sd.Company,
          sd.OrderNum
   FROM erp.ShipDtl sd
   INNER JOIN erp.ShipHead sh ON sd.Company = sh.Company
   AND sd.PackNum = sh.PackNum
   WHERE sh.ReadyToInvoice = 1
   GROUP BY sd.Company,
            sd.OrderNum) AS sd ON oh.Company = sd.Company
AND oh.OrderNum = sd.OrderNum
INNER JOIN
  (SELECT orel.Company,
          orel.OrderNum,
          SUM(orel.OurJobShippedQty)+SUM(orel.OurStockShippedQty) AS OrderShippedQty
   FROM erp.OrderRel orel
   GROUP BY orel.Company,
            orel.OrderNum) AS BOFilter ON oh.Company = BOFilter.Company
AND oh.OrderNum = BOFilter.OrderNum
AND BOFilter.OrderShippedQty > 0 --DH Note: Limit the rows to orders that have had a shipment on ANY line.

WHERE OH.OrderDate>='1/1/2017'
  AND (OH.OpenOrder = 1
       AND OD.OpenLine = 1
       AND ORR.OpenRelease = 1)--and (ORR.OurJobShippedQty + ORR.OurStockShippedQty) > 0 --DH Note: This is the filter that is removing lines without any shipments on them even if the sales order is backordered.

GROUP BY C.Company,
         C.CustNum,
         C.CustID,
         C.Name,
         ORR.Plant,
         ST.TerritoryID,
         ST.TerritoryDesc,
         OH.EntryPerson,
         STT.ShipToNum,
         STT.Name,
         OH.OrderNum,
         OD.OrderLine,
         OD.PartNum,
         OD.DocExtPriceDtl,
         CASE
             WHEN P.ProdCode IS NULL THEN 'NA'
             ELSE P.ProdCode
         END,
         ORR.OrderRelNum,
         ORR.ReqDate,
         OD.DiscountPercent,
         OD.PricePerCode,
         OD.UnitPrice,
         OH.EntryPerson,
         OH.EntryPerson,
         SR.SalesRepCode,
         SR.EMailAddress,
         SR.Name,
         UID.EntryPerson,
         UID.EntryPersonName,
         OH.OrderDate,
         ORR.OurReqQty,
         ORR.OurJobShippedQty,
         ORR.OurStockShippedQty,
         ORR.ReqDate,
         OD.RequestDate,
         OH.RequestDate,
         ORR.NeedByDate,
         OD.NeedByDate,
         OH.NeedByDate,
         ORR.OurReqQty,
         OD.UnitPrice,
         OD.DocUnitPrice,
         OD_UD.Number05,
         OD.OrderQty,
         OM.ExtMiscLineChg,
         OM.ExtMiscHedChg) AS ODT ON FC.Company = ODT.Company
AND FC.Plant = ODT.Plant
AND FC.SalesRepCode = ODT.SalesRepCode
AND (FC.PerStartDate <= ODT.OrrReqDate
  AND FC.PerEndDate >= ODT.OrrReqDate)`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

module.exports = router;
