// To comment out whenever doing testing. Because node_modules not pushed to google.
//import "@types/google-apps-script"

const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const travelEvents = ['Leaving house', 'Boarding Bus', 'Reaching TTSB', 'Reaching RTTP']

const formDates = inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''})
const formEvents = inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''})
const formUsrTimes = inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})

const varDates = varSheet.getRange("A5:A").getValues.filter((varDate) => {return varDate != ''})

function GetIndexOfNewEntries() {
    varDates = varDates.map((varDate) => {varDate = new Date(); return varDate.toLocaleDateString()})
    formDates = formDates.map((formDate) => {formDate = new Date(); return formDate.toLocaleDateString()})
    
    if (varDates.length == 0) {
        return 2

    } else {
        let lastVarDate = varDates[varDates.length - 1]
        return parseInt(formDates.lastIndexOf(lastVarDate) + 3)

    }
}

function CalUpNLowBounds(dataPoint, formTiming) {
    dataPoint = new Date(dataPoint)
    formTiming = new Date(formTiming)

    console.log('dataPoint :>> ', dataPoint);
    console.log('formTiming :>> ', formTiming);

    let hourDiff = Math.abs(dataPoint.getHours() - formTiming.getHours())
    let minDiff = Math.abs(dataPoint.getMinutes() - formTiming.getMinutes())

    let diffInMin = hourDiff * 60 + minDiff
    let percentageErr = () => {
        if (diffInMin > 120) {
            return 1
        } else if (diffInMin == 0) {
            return 0
        } else {
            return diffInMin/120
        }
    } 

    console.log('percentageErr :>> ', percentageErr());

    let dataPointInMin = dataPoint.getHours() * 60 + dataPoint.getMinutes()
    let upperBoundInMin = dataPointInMin + dataPointInMin * percentageErr()
    let lowerBoundInMin = dataPointInMin - dataPointInMin * percentageErr()
    
    function ToHHMM(valueInMin) {
        return `${Math.floor(valueInMin / 60)}:${(valueInMin / 60 - Math.floor(valueInMin / 60)) * 60}`
    }

    return [ToHHMM(upperBoundInMin), ToHHMM(dataPointInMin), ToHHMM(lowerBoundInMin)]

}








