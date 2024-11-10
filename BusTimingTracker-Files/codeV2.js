//To comment out whenever doing testing. Because node_modules not pushed to google.
import "@types/google-apps-script"

const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const travelEvents = ['Leaving house', 'Boarding Bus', 'Reaching TTSB', 'Reaching RTTP']

const formValues = {
    Dates: inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''}),
    TravelEvents: inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''}),
    UsrTimes: inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})
}

const varDates = varSheet.getRange("A5:A").getValues().filter((varDate) => {return varDate != ''})

function GetNewEntriesStartIndex() {
    //gets the index of the first new entry in the array formDate. 
    //a new entry is determined as the entry that is not already recorded in Var Sheet. 
    
    let varDateStrings = varDates.map((varDate) => {varDate = new Date(varDate); return varDate.toLocaleDateString()})
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

    class NewVarValues {
        constructor() {
            this.StartRow =  varDates.length + 5
            this.Dates = new Set(newEntries.Dates)
        }

        getRow(date) {
            return this.Dates.indexOf(date) + this.StartRow + varDates.length
        }
    }

    formValues.Dates.forEach((formDate, i) => {if (i >= newEntries.StartIndex) {newEntries.Dates.push(formDate)}})
    newEntries.Timings = newEntries.Dates.map((newFormDate) => {newFormDate = new Date(); return newFormDate.toLocaleTimeString()})
    formValues.TravelEvents.forEach((travelEvent, i) => {if (i >= newEntries.StartIndex) {newEntries.TravelEvents.push(travelEvent)}})
    formValues.UsrTimes.forEach((formUsrTime, i) => {if (i >= newEntries.StartIndex) {newEntries.UsrTimes.push(formUsrTime)}})
    
    console.log('newEntries Object:>> ', newEntries);



    /* 
    // I geniunely have no idea what the below code is meant to do... 
    let newUniqueDates = new Set(newFormDates)
    for (i = 0; i < newFormDates.length; i++) {
        varSheet.getRange(`A${5 + varDates.length + i}`).setValue(newUniqueDates[i])
    }

    for (i = 0; i < newFormDates.length; i++) {
        let calUpNLowBounds = GetUpNLowBounds(newFormUsrTimes[i], newFormTimings[i])

        const DataPoint = {
            date: newFormDates[i],
            travelEvent: newTravelEvents[i],
            upperBound: calUpNLowBounds[0],
            usrTime: calUpNLowBounds[1],
            lowerBound: calUpNLowBounds[2]
        }
    }
    */ 
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
        varSheet.getRange(`A${5 + varDates.length + i}`).setValue(newUniqueDates[i])
    }
}
*/
