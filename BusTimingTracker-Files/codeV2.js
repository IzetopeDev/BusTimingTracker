const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const travelEvents = ['Leaving house', 'Boarding Bus', 'Reaching TTSB', 'Reaching RTTP']

const formDates = inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''})
const formEvents = inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''})
const formUsrTimes = inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})

const varDates = varSheet.getRange("A5:A").getValues.filter((varDate) => {return varDate != ''})

function CnvToDateStr(dateObject) {
    // Err Handling: check if dateObject is a date
    dateObject = new Date(dateObject)
    return `${dateObject.getDate()}${dateObject.getMonth() + 1}${dateObject.getFullYear()}`
}

function GetIndexOfNewEntries() {
    varDates = varDates.map((varDate) => {return CnvToDateStr(varDate)})
    formDates = formDates.map((formDate) => {return CnvToDateStr(formDate)})
    
    if (varDates.length == 0) {
        return 2

    } else {
        let lastVarDate = varDates[varDates.length - 1]
        return parseInt(formDates.lastIndexOf(lastVarDate) + 3)

    }
}







