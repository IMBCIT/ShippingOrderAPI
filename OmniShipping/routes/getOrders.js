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
    `Select OH.Company, ORR.Plant, OH.OrderNum AS orderNo, S.ShipToNum, S.Name, S.Address1 as jobAddress1, S.Address2 as jobAddress2, S.Address3 as jobAddress3,
      S.City as jobCity, S.State as jobState, S.Zip as jobZip, C.CustID, C.CustNum, C.Name name, C.PhoneNum phoneNo, C.Address1 as address1, C.Address2 as address2, C.City as city,
      C.State, OD.OrderLine as line, OD.LineDesc as item, OD.OrderQty itemQuant, OH.OrderComment as comments, OD.RequestDate as deliveryDateTime, OH.ShipViaCode as shipBy,
      CONVERT(nvarchar, DATEADD(second, OH.ChangeTime, '0:00:00'), 108) AS ChangeTime, OH.ChangeDate From Erp.OrderHed AS OH
      Inner Join Erp.OrderDtl AS OD on OH.Company = OD.Company AND OH.CustNum = OD.CustNum AND OH.OrderNum = OD.OrderNum
      Inner Join Erp.OrderRel as ORR on OD.Company = ORR.Company AND OD.OrderNum = ORR.OrderNum AND OD.OrderLine = ORR.OrderLine
      Inner Join Erp.Customer as C on OH.Company = C.Company AND OH.CustNum = C.CustNum Left Join Erp.ShipTo as S on OD.Company = S.Company AND OD.CustNum = S.CustNum AND OH.ShipToNum = S.ShipToNum Where ORR.OpenOrder = '1' AND OD.OpenLine = '1'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/pos", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select PH.Company, PR.Plant,PA.Name as BuyerName, PA.EMailAddress, V.Name as SupplierName, V.Address1, V.Address2, V.Address3, V.City, V.State, V.Zip, V.PhoneNum, PH.ShipViaCode, PH.PONum, Convert(Varchar,PD.POLine) as POLine, Convert(Varchar,PR.PORelNum) as PORelNum,
      PD.PartNum, PD.LineDesc, PR.TranType, PR.DueDate, PR.RelQty, PR.ReceivedQty, PR.ArrivedQty, PR.InvoicedQty, PR.NeedByDate, PH.ChangeDate, PD.UnitCost * (PR.RelQty - PR.ReceivedQty) as ExtCostOpen
      From Erp.POHeader as PH Inner Join Erp.PODetail as PD on PH.Company = PD.Company and PH.PONum = PD.PONUM Inner Join Erp.PORel as PR on PD.Company = PR.Company and PD.PONUM = PR.PONum and PD.POLine = PR.POLine
      Inner Join Erp.Vendor as V on PH.Company = V.Company and PH.VendorNum = V.VendorNum Inner Join Erp.PurAgent as PA on PH.Company = PA.Company and PH.BuyerID = PA.BuyerID
      Where PH.OpenOrder = '1' and PD.OpenLine = '1' and PR.OpenRelease = '1'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/shiptocontacts", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select CC.Company,CC.CustNum, CC.ShipToNum, C.CustID, C.Name as CustName, CC.Name as ContactName, CC.EMailAddress, CC.PhoneNum, CC.PerConID
      from ERP.CustCnt as CC
      Inner Join (Select PC.Company, PC.PerConID From ERP.PerConLnk as PC where PC.ContextLink = 'ShipTo') as PC on CC.Company = PC.Company and CC.PerConID = PC.PerConID
      Inner Join ERP.Customer as C on CC.Company = C.Company and CC.CustNum = C.CustNum
      Where CC.ShipToNum <> '' AND CC.ShipToNum <> 'MAINADDRESS' AND CC.ShipToNum <> 'MAILINGADDRES'
      Group By CC.Company,CC.CustNum,CC.ShipToNum, C.CustID,C.Name,CC.Name,CC.EMailAddress, CC.PerConID,CC.PhoneNum
      Order By CC.Company, C.CustID, CC.PerConID, CC.ShipToNum`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/completed", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select OH.Company, ORR.Plant, OH.OrderNum AS orderNo, S.ShipToNum, S.Name, S.Address1 as jobAddress1, S.Address2 as jobAddress2, S.Address3 as jobAddress3,
      S.City as jobCity, S.State as jobState, S.Zip as jobZip, C.CustID, C.CustNum, C.Name name, C.PhoneNum phoneNo, C.Address1 as address1, C.Address2 as address2, C.City as city,
      C.State, OD.OrderLine as line, OD.LineDesc as item, OD.OrderQty itemQuant, OH.OrderComment as comments, OD.RequestDate as deliveryDateTime, OH.ShipViaCode as shipBy,
      CONVERT(nvarchar, DATEADD(second, OH.ChangeTime, '0:00:00'), 108) AS ChangeTime, OH.ChangeDate From Erp.OrderHed AS OH
      Inner Join Erp.OrderDtl AS OD on OH.Company = OD.Company AND OH.CustNum = OD.CustNum AND OH.OrderNum = OD.OrderNum
      Inner Join Erp.OrderRel as ORR on OD.Company = ORR.Company AND OD.OrderNum = ORR.OrderNum AND OD.OrderLine = ORR.OrderLine
      Inner Join Erp.Customer as C on OH.Company = C.Company AND OH.CustNum = C.CustNum Left Join Erp.ShipTo as S on OD.Company = S.Company AND OD.CustNum = S.CustNum AND OH.ShipToNum = S.ShipToNum
      Where OD.OpenLine = '0'`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

router.get("/epicor/backorders", function (req, res) {
  const request = new sql.Request(connection);

  request.query(
    `Select ODT.Company,FC.Plant,ODT.CountRow,
	ODT.CustNum, ODT.CustID, ODT.CustName,ODT.ShiptoNum, ODT.ShipToName, ODT.OrderNum, ODT.OrderLine,ODT.PartNum,ODT.ProdCode,
	ODT.HedReqDate,ODT.DtlReqDate,ODT.OrrReqDate, ODT.LineReqDate, ODT.OrderRelNum, ODT.OrderDate,ODT.RelNeedByDate,ODT.OurStockShippedQty,ODT.OurJobShippedQty,ODT.OrderQty
	
	From dbo.ttFiscalPeriodRepPlant as FC 
	
	Inner Join
	(Select C.Company,1 as CountRow, C.CustNum,C.CustID,C.Name As CustName,ORR.Plant,SR.SalesRepCode,SR.EMailAddress,SR.Name as SalesRepName,od.OrderQty,
	ST.TerritoryID,ST.TerritoryDesc,
	Case when UID.EntryPerson is null then '' else UID.EntryPerson end as EntryPerson,
	Case when UID.EntryPersonName is null then '' else UID.EntryPersonName end as EntryPersonName,OH.OrderDate,STT.ShipToNum, STT.Name as ShipToName,
	OH.OrderNum,OD.OrderLine,OD.PartNum, Case when P.ProdCode is null then 'NA' else P.ProdCode end as ProdCode,OH.RequestDate as HedReqDate,
	OD.RequestDate as DtlReqDate,ORR.ReqDate as OrrReqDate,
	Case when OD.RequestDate is null then OH.RequestDate Else OD.RequestDate end as LineReqDate, ORR.OrderRelNum,
	Case when ORR.NeedByDate is null and OD.NeedByDate is null and OH.NeedByDate is null then OH.OrderDate
	when ORR.NeedByDate is null and OD.NeedByDate is null then OH.NeedByDate 
	When ORR.NeedByDate is null then OD.NeedByDate else ORR.NeedByDate end as RelNeedByDate, ORR.OurReqQty as OurRelReqQty, 
	OD.DiscountPercent,OD.PricePerCode,OD.UnitPrice,
	
	Case when ORR.OurReqQty = 0 then 0 else (ORR.OurReqQty - (ORR.OurStockShippedQty + ORR.OurJobShippedQty)) * ((OD.DocExtPriceDtl / ORR.OurReqQty) * (1-(OD.DiscountPercent/100))) end
	as OrderValue,
	
	Case when OD_UD.Number05 = 0 then 0 else OD_UD.Number05 end as BurFreight,
	Sum(Case when OM.ExtMiscHedChg is null then 0 else OM.ExtMiscHedChg end) as ExtMiscHedChg,
	Sum(Case when OM.ExtMiscLineChg is null then 0 else OM.ExtMiscLineChg end) as ExtMiscLineChg,
	
	Case when ORR.OurReqQty = 0 then 0 else (ORR.OurReqQty  * ((OD.DocExtPriceDtl / ORR.OurReqQty) * (1-(OD.DiscountPercent/100)))) end /* as OrderValue */ + 
	(Case when OM.ExtMiscHedChg is null then 0 else OM.ExtMiscHedChg end) /* as ExtMiscHedChg */ + 
	(Case when OM.ExtMiscLineChg is null then 0 else OM.ExtMiscLineChg end) /* as ExtMiscLineChg */ -
	(Case when OD_UD.Number05 = 0 then 0 else OD_UD.Number05 end) /* as BurFreight */ as ExtOrdCommissionableAmt,
	ORR.OurStockShippedQty,ORR.OurJobShippedQty
	
	From ERP.OrderHed as OH
	
		Inner Join ERP.OrderDtl as OD on
		OH.Company = OD.Company and
		OH.OrderNum = OD.OrderNum 
	
		Inner Join ERP.OrderDtl_UD as OD_UD on
		OD.SysRowID = OD_UD.ForeignSysRowID
	
		Inner Join ERP.OrderRel as ORR on
		OD.Company = ORR.Company and
		OD.OrderNum = ORR.OrderNum and
		OD.OrderLine = ORR.OrderLine
	
		Left Join ERP.Part as P on
		OD.Company = P.Company and
		OD.PartNum = P.PartNum
	
		Inner Join ERP.Customer as C on
		OH.Company = C.Company and
		OH.CustNum = C.CustNum
	
		Left Join ERP.ShipTo as STT on
		OH.Company = STT.Company and
		OH.CustNum = STT.CustNum and
		OH.ShipToNum = STT.ShipToNum
	
	
	
		Left Join /* -- UserName for Entry Person when bad ID then " " -- */
				(Select UF.CurComp,OH.OrderNum, Case when UF.DcdUserID = OH.EntryPerson then UF.DcdUserID else '' end as EntryPerson,
				Case when UF.Name is null then '' Else UF.Name end as EntryPersonName
				From ERP.UserFile as UF 
		
				Left Join ERP.OrderHed as OH on
				UF.CurComp = OH.Company and
				UF.DcdUserID = OH.EntryPerson
		
				Group By UF.CurComp,OH.OrderNum,UF.DcdUserID,OH.EntryPerson,UF.Name) as UID on
		
		OH.Company = UID.CurComp and
		OH.OrderNum = UID.OrderNum
	
		Left Join ERP.SalesRep as SR on
		C.Company = SR.Company and
		C.SalesRepCode = SR.SalesRepCode
	
		Left Join ERP.SalesTer as ST on
		C.Company = ST.Company and
		C.TerritoryID = ST.TerritoryID
	
	Left Join /*  ---Misc Hed and Line Charges---  */
				(Select OH.Company, OH.OrderNum,OD.OrderLine,
							 
				Case when OM.DocMiscAmt is null then 0 when OM.OrderLine = 0 then 0 else OM.DocMiscAmt end as ExtMiscLineChg,
				Case when OM.DocMiscAmt is null then 0 When OM.OrderLIne > 0 then 0 else OM.DocMiscAmt end as ExtMiscHedChg
							
	
				From ERP.OrderHed as OH 
	
				Inner join ERP.OrderDtl as OD on
				OH.Company = OD.Company and
				OH.OrderNum = OD.OrderNum 
	
				Inner Join ERP.OrderMsc as OM on
				OD.Company = OM.Company and
				OD.OrderNum = OM.OrderNum and
				OD.OrderLine = Case when OM.OrderLine = 0 then 1 else OM.OrderLine end
		
				where 
					OM.MiscCode <> 'FRTO' and
					OM.MiscCode<> 'INFR' and
					OM.MiscCode <> 'FRHT' and
					OM.MiscCode <> 'FC' and
					OM.MiscCode <> 'LEGA' and
					OM.MiscCode <> 'PVFF' and
					OM.MiscCode <> 'RST%' and
					--OM.MiscCode <> 'STRG' and
					OM.MiscCode <> 'RSTF'
		
				Group By OH.Company, OH.OrderNum,OD.OrderLine,OM.DocMiscAmt,OM.OrderLine) 
		as OM on
		
		C.Company = OM.Company and
		OH.OrderNum = OM.OrderNum and
		OD.OrderLine = OM.OrderLine
							
		where 
		OH.OrderDate>='1/1/2017' and 
		(OH.OpenOrder = 1 and
		OD.OpenLine = 1 and
		ORR.OpenRelease = 1) and
		(ORR.OurJobShippedQty + ORR.OurStockShippedQty) > 0
		
		Group By C.Company, C.CustNum,C.CustID,C.Name,ORR.Plant,ST.TerritoryID,ST.TerritoryDesc,OH.EntryPerson,STT.ShipToNum, STT.Name,
		OH.OrderNum,OD.OrderLine,OD.PartNum,OD.DocExtPriceDtl,
	
		Case when P.ProdCode is null then 'NA' else P.ProdCode end, ORR.OrderRelNum,ORR.ReqDate,OD.DiscountPercent,OD.PricePerCode,OD.UnitPrice,
		OH.EntryPerson, OH.EntryPerson,SR.SalesRepCode,SR.EMailAddress,SR.Name,UID.EntryPerson,UID.EntryPersonName,OH.OrderDate,ORR.OurReqQty, 
		ORR.OurJobShippedQty , ORR.OurStockShippedQty,ORR.ReqDate,OD.RequestDate,OH.RequestDate,ORR.NeedByDate, OD.NeedByDate, OH.NeedByDate,
		ORR.OurReqQty,OD.UnitPrice,OD.DocUnitPrice,OD_UD.Number05,OD.OrderQty,OM.ExtMiscLineChg,OM.ExtMiscHedChg) as ODT on
	
	
		FC.Company = ODT.Company and
		FC.Plant = ODT.Plant and
		FC.SalesRepCode = ODT.SalesRepCode and
		(FC.PerStartDate  <= ODT.OrrReqDate and
		FC.PerEndDate >= ODT.OrrReqDate)`,
    function (err, recordset) {
      if (err) console.log(err);

      res.json(recordset.recordset);
    }
  );
});

module.exports = router;
