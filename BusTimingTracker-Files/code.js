/*
For reference only:


const inputSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1")
const varSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Var Sheet")
let formTimeHour = []
let formTimeMinute = []
let inputTimeHour = []
let inputTimeMinute = []

function GetLastDataIndex(){
  console.log('defining startRow by getting last data index.......')
  let storedDataDatesTrimmed = varSheet.getRange("A5:A").getValues().filter((data) => {return data != ''})
  let storedDataDatesFormatted = storedDataDatesTrimmed.map((data) => {
    dataAsDate = new Date(data)
    let dd = dataAsDate.getDate()
    let mm = dataAsDate.getMonth() + 1
    let yyyy = dataAsDate.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  })

  let formDates = inputSheet.getRange("A2:A").getValues().map((data) => {
    let dd = new Date(data).getDate()
    let mm = new Date(data).getMonth() + 1
    let yyyy = new Date(data).getFullYear()
    return `${dd}/${mm}/${yyyy}`
  })

  let StartRow = () => {
    if (storedDataDatesFormatted.length == 0) {
      return 2
    } else {
      return parseInt(formDates.lastIndexOf(storedDataDatesFormatted[storedDataDatesFormatted.length - 1]) + 3)
    }
  }

   return StartRow()
}

function InitialiseData(startRow){
  console.log("intialising data...")

  const formTime = inputSheet.getRange(`A${startRow}:A`).getValues()

  for (const data of formTime){
    if (data != '' ) {
      formTimeHour.push(new Date(data).getHours())
      formTimeMinute.push(new Date(data).getMinutes())
    } 
  }
  console.log(formTimeHour)
  console.log(formTimeMinute)
    
  const inputTime = inputSheet.getRange(`C${startRow}:C`).getValues()
  

  for (const data of inputTime) {
    let dataAsDate = new Date(data)
    let dataHours = dataAsDate.getHours() 
    let dataMinutes = dataAsDate.getMinutes()
    
    dataMinutes += 26
    if (dataMinutes >= 60) {
      dataMinutes -= 60
      dataHours += 1
      if (dataHours >= 24){
        dataHours -= 24
      } 
    } 

    if (data != '') {
      inputTimeHour.push(dataHours)
      inputTimeMinute.push(dataMinutes)
    }
  }

  console.log(inputTimeHour)
  console.log(inputTimeMinute)
}

function GetErrorCompensatedTime(){
  console.log("Compensating for Error...")

  function ConvertDoubleDigit(number) {
    if (number < 10) {
      number = `0${number}`
    } 
    return number
  }

  let percentageError = []

  let hourDifference = Math.abs(formTimeHour.map((data,i) => {return data - inputTimeHour[i]}))
  let minuteDifference = Math.abs(formTimeMinute.map((data,i) => {return data - inputTimeMinute[i]}))
  let timeDifference = hourDifference.map((data,i) => {return data * 60 + minuteDifference[i]})

  for (i = 0; i < timeDifference.length; i++) {
    if (timeDifference > 120) {
      percentageError.push(1)
    } else if (timeDifference == 0) {
      percentageError.push(0)
    } else {
      percentageError.push(timeDifference/120)
    }
  }
  
  console.log(`percentageError ${percentageError}`)

  output = percentageError.map((x,i) => {
    let upperBoundMinute = Math.ceil(inputTimeMinute[i] + x * 20)
    let upperBoundHour = inputTimeHour[i]
    if (upperBoundMinute >= 60) {
      upperBoundMinute -= 60
      upperBoundHour += 1 

      if (upperBoundHour >= 24) {
        upperBoundHour -= 24
      }
    } 

    let upperBoundHHMM = `${upperBoundHour}:${ConvertDoubleDigit(upperBoundMinute)}`
    

    let lowerBoundMinute = Math.floor(inputTimeMinute[i] - x * 20)
    let lowerBoundHour = inputTimeHour[i]
    if (lowerBoundMinute < 0) {
      lowerBoundMinute += 60
      lowerBoundHour -= 1 

      if (lowerBoundHour < 0){
        lowerBoundHour += 24
      } 
    }

    let lowerBoundHHMM = `${lowerBoundHour}:${ConvertDoubleDigit(lowerBoundMinute)}`


    let dataPoint = `${inputTimeHour[i]}:${ConvertDoubleDigit(inputTimeMinute[i])}` 
    return [upperBoundHHMM, dataPoint, lowerBoundHHMM]
  })
  
  console.log(`Error Compensated Time: ${output}`)
  return output
}

function FillTables(startRow) {
  console.log('attempting to fill tables...')
  let newFormEntriesDates = inputSheet.getRange(`A${startRow}:A`).getValues().filter((data) => {return data != ''})
  let totalIndex = newFormEntriesDates.length
  let formTravelEvents = inputSheet.getRange(`B${startRow}:B`).getValues()
  let errorCompensatedTime = GetErrorCompensatedTime()

  let leavingHouseTimings, boardingBusTimings, reachingTTSBTimings, reachingRTTPTimings = []

  for (i = 0; i <= totalIndex; i++) {
    let eventTime = () => {
      let localArray = []
      for (x = 0; x <= 4; x++) {
        localArray.push(errorCompensatedTime[i][x])
        return localArray 
      }
    }

    if (formTravelEvents[i] == 'Leaving house') {
      leavingHouseTimings.push(eventTime())
    } else if (formTravelEvents[i] == 'Boarding Bus') {
      boardingBusTimings.push(eventTime())
    } else if (formTravelEvents[i] == 'Reaching TTSB') {
      reachingTTSBTimings.push(eventTime())
    } else if (formTravelEvents[i] == 'Reaching RTTP') {
      reachingRTTPTimings.push(eventTime())
    } else {
      console.log(`data ${newFormEntriesDates[i]} does not match travelEvents`)
    }

  }

  let formDates = () => {
    let dateObjects = inputSheet.getRange(`A${startRow}:A`).getValues().filter((date) => {return date != ''})
    
    dateObjectDDMMYYYY = []
    for (const dateElement of dateObjects) {
      let dateElement = new Date(dateElement)
      let dd = dateElement.getDate()
      let mm = dateElement.getMonth() + 1
      let yyyy = dateElement.getFullYear()

      dateObjectDDMMYYYY.push(`${dd}${mm}${yyyy}`)
    }
    
    return dateObjectDDMMYYYY
  }


  let storedDataEntries = varSheet.getRange('A5:A').getValues().filter((data) => {return data != ''})
  let tableStartRow = storedDataEntries.length + 5
  
  for (i = 0; i <= formDates().length; i++) {
    varSheet.getRange(`A${tableStartRow + i}`).setValue(formDates()[i])  
  }

  for (i = 0; i <= formDates(),length; i++) {
    //fill leaving 
  } 

  for (i = 0; i <= formDates(),length; i++) {
    //fill boarding
  } 
  

  // NOTE: the dates will be WRONG!! cuz every table will not have blanks... 
  for (i = 0; i <= formDates(),length; i++) {
    //fill reaching TTSB
  } 
  
  for (i = 0; i <= formDates(),length; i++) {
    //fill reaching RTTP
  } 

}
function main() {
  InitialiseData(GetLastDataIndex())
  FillTables(GetLastDataIndex())
}


*/















