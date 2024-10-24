const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const formDates = inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''})
const formEvents = inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''})
const formUsrTimes = inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})

const varDates = varSheet.getRange("A5:A").getValues.filter((varDate) => {return varDate != ''})




