//To comment out whenever doing testing. Because node_modules not pushed to google.
//import "@types/google-apps-script"

const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const formValues = {
    Dates: inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''}),
    TravelEvents: inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''}),
    UsrTimes: inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})
}

const varValues = {
    Dates: varSheet.getRange("A5:A").getValues().filter((varDate) => {return varDate != ''}),
    TravelEvents: ['Leaving house', 'Boarding Bus', 'Reaching TTSB', 'Reaching RTTP']

}

function GetNewEntriesStartIndex() {
    //gets the index of the first new entry in the array formDate. 
    //a new entry is determined as the entry that is not already recorded in Var Sheet. 
    
    let varDateStrings = varValues.Dates.map((varDate) => {varDate = new Date(varDate); return varDate.toLocaleDateString()})
    let formDateStrings = formValues.Dates.map((formDate) => {formDate = new Date(formDate); return formDate.toLocaleDateString()})
    
    if (varDateStrings.length != 0) { 
        let lastVarDate = varDateStrings[varDateStrings.length - 1]
        return parseInt(formDateStrings.lastIndexOf(lastVarDate)) + 1
    } else {
        return 0
    }
}

function GetUpNLowBounds(dataPoint, formTiming) {
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

function FillTables() {
    let newEntries = {
        StartIndex: GetNewEntriesStartIndex(), 
        Dates:[], 
        Timings:[], 
        TravelEvents:[], 
        UsrTimes:[]
    }

    formValues.Dates.forEach((formDate, i) => {if (i >= newEntries.StartIndex) { formDate = new Date(formDate); newEntries.Dates.push(formDate)}})
    newEntries.Timings = newEntries.Dates.map((newFormDate) => {newFormDate = new Date(newFormDate); return newFormDate.toLocaleTimeString()})
    // there may be issues with the never property              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
    formValues.TravelEvents.forEach((travelEvent, i) => {if (i >= newEntries.StartIndex) {newEntries.TravelEvents.push(travelEvent)}})
    formValues.UsrTimes.forEach((formUsrTime, i) => {if (i >= newEntries.StartIndex) {newEntries.UsrTimes.push(formUsrTime)}})
    
    function GetUniqueDates(rawDates) {
        let output = []
        
        rawDates.forEach((raw, i) => {
            let isMatch = false

            output.forEach((stored, j) => {if (raw == stored) {isMatch = true; return}})

            if (!isMatch){
                output.push(raw)
            } 
        })

        return output
    }

    let newVarValues = {
        StartRow: varValues.Dates.length + 5,
        Dates: GetUniqueDates(newEntries.Dates).map((dateStr) => {dateStr = new Date(dateStr); return `${dateStr.getMonth()}/${dateStr.getDate()}/${dateStr.getFullYear()}`}),
        TEColumns: ["B","E","H","K"],

        //I can't use getRow() and getColumn() because those are methods in appscript
        getYCoord(date) {
            return this.Dates.indexOf(date) + this.StartRow
        },

        getXCoord(travelEvent) {
            return TEColumns[varValues.TravelEvents.indexOf(travelEvent)]
        }
    }

    console.log('var newVarValues :>> ', newVarValues);

    for (i = 0 ; i < newEntries.Dates.length; i) {
        let dataPoint = {
            Values: GetUpNLowBounds(newEntries.UsrTimes[i], newEntries.Timings[i]),
            Date: newEntries.Dates[i],
            TravelEvent: newEntries.TravelEvents[i]
        }

        for (x = 0; x < 3; x++){
            varSheet.getRange(`${newVarValues.getXCoord(dataPoint.TravelEvent)}${newVarValues.getYCoord(dataPoint.Date)}`).offset(0,x).setValue(dataPoint.Values[x])
        }
    }
}

/*
function TestingGrounds() {
    const formStartIndex = GetNewEntriesStartIndex()
    let newFormDates = [], newTravelEvents = [], newFormUsrTimes = []

    formDates.forEach((formDate, i) => {if (i >= formStartIndex) {newFormDates.push(formDate)}})
    let newFormTimings = newFormDates.map((newFormDate) => {newFormDate = new Date(); return newFormDate.toLocaleTimeString()})
    travelEvents.forEach((travelEvent, i) => {if (i >= formStartIndex) {newTravelEvents.push(travelEvent)}})
    formUsrTimes.forEach((formUsrTime, i) => {if (i >= formStartIndex) {newFormUsrTimes.push(formUsrTime)}})

    let newUniqueDates = new Set(newFormDates)
    for (i = 0; i < newFormDates.length; i++) {
        varSheet.getRange(`A${5 + varValues.Dates.length + i}`).setValue(newUniqueDates[i])
    }
}
*/
