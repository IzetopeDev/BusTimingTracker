//To comment out whenever doing testing. Because node_modules not pushed to google.
//import "@types/google-apps-script"

const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")

const formValues = {
    DateNTimes: inputSheet.getRange("A2:A").getValues().filter((formDate) => {return formDate != ''}),
    TravelEvents: inputSheet.getRange("B2:B").getValues().filter((formEvent) => {return formEvent != ''}),
    UsrTimes: inputSheet.getRange("C2:C").getValues().filter((formUsrTimes) => {return formUsrTimes != ''})
}

const varValues = {
    Dates: varSheet.getRange("A5:A").getValues().filter((varDate) => {return varDate != ''}),
    TravelEvents: ['Leaving house', 'Boarding Bus', 'Reaching TTSB', 'Reaching RTTP']
}


const CustCnvTo = {
    MMDDYYYY(dateStr = "") {
        console.log(`CustCnvTo.MMDDYYYY called | dateStr = ${dateStr}`)

        dateStr = new Date(dateStr)
        return `${dateStr.getMonth() + 1}/${dateStr.getDate()}/${dateStr.getFullYear()}` 
        //the +1 for month is because either JS or AppScript uses a 0 index for months (but not dates)
    },

    HHMM(inputDate) {
        console.log(`CustCnvTo.HHMM called | inputDate = ${inputDate}`)

        let HH = 0
        let MM = 0

        switch (typeof(inputDate)) {
            case "string":
                dateStr = new Date(inputDate)
                HH = dateStr.getHours()
                MM = dateStr.getMinutes()
                break

            case "number":
                HH = Math.floor(inputDate / 60)
                MM = Math.floor((inputDate / 60 - HH) * 60)    
                break
                
            default:
                console.log("ERR: in Obj CustCnvTo.HHMM(), param inputDate type is outside scope!")            
        }
      
        // converting into string so that when filled into varSheet, it is recognised as a time of day 
        if (HH < 10) {HH = `0${HH}`} else {HH = `${HH}`}
        if (MM < 10) {MM = `0${MM}`} else {MM = `${MM}`}

        return `${HH}:${MM}`
    }
}

function GetNewEntriesStartIndex() {
    //gets the index of the first new entry in the array formDate. 
    //a new entry is determined as the entry that is not already recorded in Var Sheet. 
    console.log(`GetNewEntriesStartIndex called`)
    
    let varDateStrings = varValues.Dates.map((varDate) => {varDate = new Date(varDate); return CustCnvTo.MMDDYYYY(varDate)})
    let formDateStrings = formValues.DateNTimes.map((formDate) => {formDate = new Date(formDate); return CustCnvTo.MMDDYYYY(formDate)})
    
    if (varDateStrings.length != 0) { 
        let lastVarDate = varDateStrings[varDateStrings.length - 1]
        return parseInt(formDateStrings.lastIndexOf(lastVarDate)) + 1
    } else {
        return 0
    }
}

function GetUpNLowBounds(dataPoint = "", formTiming = "") {
    console.log(`GetUpNLowBounds called | dataPoint = ${dataPoint}, formTiming = ${formTiming}`)

    dataPoint = new Date(dataPoint)
    formTiming = new Date(formTiming)

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
    let upperBoundInMin = dataPointInMin + 30 * percentageErr()
    let lowerBoundInMin = dataPointInMin - 30 * percentageErr()
    // set to be 30 min max error. 

    return [CustCnvTo.HHMM(upperBoundInMin), CustCnvTo.HHMM(dataPointInMin), CustCnvTo.HHMM(lowerBoundInMin)]

}

function FillTables() {
    console.log(`FillTables called`)

    let newEntries = {
        StartIndex: GetNewEntriesStartIndex(), 
        Dates:[], 
        Timings:[], 
        TravelEvents:[], 
        UsrTimes:[]
    }

    formValues.DateNTimes.forEach((formData, i) => {if (i >= newEntries.StartIndex) { 
        formData = new Date(formData); 
        newEntries.Dates.push(CustCnvTo.MMDDYYYY(formData)); 
        newEntries.Timings.push(formData) // CustCnvTo.HHMM() unused because GetUpNLowBounds requires date string
    }})
    formValues.TravelEvents.forEach((travelEvent, i) => {if (i >= newEntries.StartIndex) {newEntries.TravelEvents.push(travelEvent)}})
    formValues.UsrTimes.forEach((formUsrTime, i) => {if (i >= newEntries.StartIndex) {newEntries.UsrTimes.push(formUsrTime)}}) // CustCnvTo.HHMM() unused because GetUpNLowBounds requires date string
    

    function GetUniqueDates(rawDates = "") {
        console.log(`GetUniqueDates called | rawDates = ${rawDates}`)

        let output = []

        rawDates.forEach((raw) => {
            raw = CustCnvTo.MMDDYYYY(raw)
            
            let isMatch = false
            output.forEach((stored) => {if (raw == stored) {isMatch = true}})

            if (!isMatch) {output.push(raw)} 
        })

        return output
    }

    let newVarValues = {
        StartRow: varValues.Dates.length + 5,
        Dates: GetUniqueDates(newEntries.Dates),
        TEColumns: ["B","E","H","K"],

        //I can't use getRow() and getColumn() because those are methods in appscript
        getYCoord(date = "") {
            return this.Dates.indexOf(date) + this.StartRow
        },

        getXCoord(travelEvent = "") {
            return this.TEColumns[varValues.TravelEvents.indexOf(travelEvent)]
        }
    }

    console.log('var newVarValues :>> ', newVarValues);

    for (let i = 0 ; i < newEntries.Dates.length; i++) {
        let dataPoint = {
            Values: GetUpNLowBounds(newEntries.UsrTimes[i], newEntries.Timings[i]),
            Date: newEntries.Dates[i],
            TravelEvent: newEntries.TravelEvents[i]
        }

        for (let x = 0; x < 3; x++) {
            varSheet.getRange(`${newVarValues.getXCoord(dataPoint.TravelEvent[0])}${newVarValues.getYCoord(dataPoint.Date)}`).offset(0,x).setValue(dataPoint.Values[x])
        }

        varSheet.getRange(`A${newVarValues.getYCoord(dataPoint.Date)}`).setValue(dataPoint.Date)
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
    for (let i = 0; i < newFormDates.length; i++) {
        varSheet.getRange(`A${5 + varValues.Dates.length + i}`).setValue(newUniqueDates[i])
    }
}
*/
