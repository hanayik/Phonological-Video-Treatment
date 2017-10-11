const {remote, shell} = require('electron')
const {Menu, MenuItem} = remote
const {dialog} = require('electron').remote
const path = require('path')
const csvsync = require('csvsync')
const fs = require('fs')
const os = require("os");
const $ = require('jQuery')
const {app} = require('electron').remote;
const appRootDir = require('app-root-dir').get() //get the path of the application bundle
const ffmpeg = appRootDir+'/ffmpeg/ffmpeg'
const exec = require( 'child_process' ).exec
const si = require('systeminformation');
const naturalSort = require('node-natural-sort')
const mkdirp = require('mkdirp');
var ipcRenderer = require('electron').ipcRenderer;
var moment = require('moment')
var content = document.getElementById("contentDiv")
var localMediaStream
var sys = {
  modelID: 'unknown',
  isMacBook: false // need to detect if macbook for ffmpeg recording framerate value
}
var exp = new experiment('Phonological-Video-Treatment')
var trialTimeoutID
var trialTimeoutTime = 1000*5 // 5 seconds
exp.getRootPath()
exp.getMediaPath()
var mediaPath = path.resolve(exp.mediapath, 'video')
var level1Trials = readCSV(path.resolve(exp.mediapath, 'level1.csv'))
var level2Trials = readCSV(path.resolve(exp.mediapath, 'level2.csv'))
var level3Trials = readCSV(path.resolve(exp.mediapath, 'level3.csv'))
var level4Trials = readCSV(path.resolve(exp.mediapath, 'level4.csv'))
var level5Trials = readCSV(path.resolve(exp.mediapath, 'level5.csv'))
var level6Trials = readCSV(path.resolve(exp.mediapath, 'level6.csv'))
var level7Trials = readCSV(path.resolve(exp.mediapath, 'level7.csv'))
var level8Trials = readCSV(path.resolve(exp.mediapath, 'level8.csv'))
var level9Trials = readCSV(path.resolve(exp.mediapath, 'level9.csv'))
var level10Trials = readCSV(path.resolve(exp.mediapath, 'level10.csv'))
var trials
var maxTrials = 20
var maxPracticeTrials = 2
var fileToSave
var fileHeader = ['subj', 'session', 'assessment', 'level', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
var level = ''
var subjID
var sessID
var stimOnset
var accuracy
var totalAccArray = []
var rt
var nextTrialTimeoutID
//var trialNum = document.getElementById("trialNumID")
//var trialNumber = 1
var t = -1
var tReal = t-1
var level1Instructions = ["<h1>In this task you will see two videos at a time. <br>" +
        "Each video is of a person's mouth saying a single word. <br>" +
        "Listen closely to both words. <br>" +
        "Press <span style='color:green'>GREEN</span> if they have the same number of syllables. <br>" +
        "Press <span style='color:red'>RED</span> if they do not. </h1>"]
var level2Instructions = ["<h1>In this task you will see two videos at a time. <br>" +
        "Each video is of a person's mouth saying a single word. <br>" +
        "Listen closely to both words. <br>" +
        "Press <span style='color:green'>GREEN</span> if the FIRST word has more syllables. <br>" +
        "Press <span style='color:red'>RED</span> if the SECOND word has more syllables. </h1>"]
var level3Instructions = ["<h1>In this task you will see two videos at a time. <br>" +
        "Each video is of a person's mouth saying a single word. <br>" +
        "Listen closely to both words. <br>" +
        "Press <span style='color:green'>GREEN</span> if they START with the same sound. <br>" +
        "Press <span style='color:red'>RED</span> if they do not. </h1>"]
var level4Instructions = level3Instructions
var level5Instructions = level3Instructions
var level6Instructions = ["<h1>In this task you will see two videos at a time. <br>" +
        "Each video is of a person's mouth saying a single word. <br>" +
        "Listen closely to both words. <br>" +
        "Press <span style='color:green'>GREEN</span> if they END with the same sound. <br>" +
        "Press <span style='color:red'>RED</span> if they do not. </h1>"]
var level7Instructions = level6Instructions
var level8Instructions = level6Instructions
var level9Instructions = ["<h1>In this task you will see two videos at a time. <br>" +
        "Each video is of a person's mouth saying a single word. <br>" +
        "Listen closely to both words. <br>" +
        "Press <span style='color:green'>GREEN</span> if they rhyme. <br>" +
        "Press <span style='color:red'>RED</span> if they do not. </h1>"]
var level10Instructions = level9Instructions
var randomArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]
var accCutOff = 0.8
var trialOrder = []
var userDataPath = path.join(app.getPath('userData'),'Data')
makeSureUserDataFolderIsThere()
var savePath
var summaryIsOnScreen = false
isPractice = false
var firstVideoNotFinished = true
var iti = 1500 // milliseconds
var fbTime = 750


function checkForUpdateFromRender() {
  ipcRenderer.send('user-requests-update')
  //alert('checked for update')
}

ipcRenderer.on('showSpinner', function () {
  //<div class="loader">Loading...</div>
  spinnerDiv = document.createElement('div')
  spinnerDiv.className = 'loader'
  spinnerDiv.style.zIndex = "1000";
  content.appendChild(spinnerDiv)
  console.log("added spinner!")

})

function getSubjID() {
  var subjID = document.getElementById("subjID").value.trim()
  if (subjID === '') {
    subjID = '0'
  }
  return subjID
}

function getSessID() {
  var sessID = document.getElementById("sessID").value.trim()
  if (sessID === '') {
    sessID = '0'
  }
  return sessID
}

function shuffle(array) {
  //https://bost.ocks.org/mike/shuffle/
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}


//camera preview on
function startWebCamPreview() {
  clearScreen()
  var vidPrevEl = document.createElement("video")
  vidPrevEl.autoplay = true
  vidPrevEl.id = "webcampreview"
  content.appendChild(vidPrevEl)
  navigator.webkitGetUserMedia({video: true, audio: false},
    function(stream) {
      localMediaStream = stream
      vidPrevEl.src = URL.createObjectURL(stream)
    },
    function() {
      alert('Could not connect to webcam')
    }
  )
}


// camera preview off
function stopWebCamPreview () {
  if(typeof localMediaStream !== "undefined")
  {
    localMediaStream.getVideoTracks()[0].stop()
    clearScreen()
  }
}


// get date and time for appending to filenames
function getDateStamp() {
  ts = moment().format('MMMM Do YYYY, h:mm:ss a')
  ts = ts.replace(/ /g, '-') // replace spaces with dash
  ts = ts.replace(/,/g, '') // replace comma with nothing
  ts = ts.replace(/:/g, '-') // replace colon with dash
  console.log('recording date stamp: ', ts)
  return ts
}


// runs when called by systeminformation
function updateSys(ID) {
  sys.modelID = ID
  if (ID.includes("MacBook") == true) {
    sys.isMacBook = true
  }

  //console.log("updateSys has updated!")
  //console.log(ID.includes("MacBook"))
  //console.log(sys.isMacBook)
} // end updateSys

si.system(function(data) {
  console.log(data['model']);
  updateSys(data['model'])
})


// open data folder in finder
function openDataFolder() {
  dataFolder = savePath
  if (!fs.existsSync(dataFolder)) {
    mkdirp.sync(dataFolder)
  }
  shell.showItemInFolder(dataFolder)
}


function makeSureUserDataFolderIsThere(){
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath)
  }
}


function chooseFile() {
  console.log("Analyze a file!")
  dialog.showOpenDialog(
    {title: "Video Treatment Analysis",
    defaultPath: savePath,
    properties: ["openFile"]},
  analyzeSelectedFile)
}


function analyzeSelectedFile(theChosenOne) {
  filePath = theChosenOne[0]
  console.log("file chosen: ", filePath)
  data = readCSV(filePath)
  len = data.length
  console.log('analyzing...')
  accSum = 0
  for (i = 0; i < len; i++) {
    if (Number(data[i]['accuracy']) === 1) {
      // if sounds were the same and accuracy was 1
      accSum += 1 // increase by 1
    }
  }
  clearScreen()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  if (20 !== len) {
    var warn_p = document.createElement("p")
    var warn_txt = document.createTextNode("Warning! The number of trials in the data file does not match the total number of trials for this test")
    warn_p.appendChild(warn_txt)
    textDiv.appendChild(warn_p)
  }
  accMsg = 'Accuracy: ' + accSum/len
  var acc_p = document.createElement("p")
  var acc_txtNode = document.createTextNode(accMsg)
  acc_p.appendChild(acc_txtNode)
  textDiv.appendChild(acc_p)
  content.appendChild(textDiv)
}


// get timestamp (milliseconds since file loaded)
function getTime() {
  return performance.now()
}


// read csv file. This is how experiments will be controlled, query files to show, etc.
function readCSV(filename){
  var csv = fs.readFileSync(filename)
  var stim = csvsync.parse(csv, {
    skipHeader: false,
    returnObject: true
  })
  //var stim = csvReader(filename)
  console.log(stim)
  return stim
  //stim = readCSV(myfile)
  //console.log(stim)
  //var myfile = __dirname+'/experiments/pnt/assets/txt/pntstim.csv'
}



// remove all child elements from a div, here the convention will be to
// remove the elements from "contentDiv" after a trial
function clearScreen() {
  while (content.hasChildNodes()) {
    content.removeChild(content.lastChild)
  }
  console.log("cleared the screen!")
}


// show text instructions on screen
function showInstructions(txt) {
  trialOrder = shuffle(randomArray)
  totalAccArray = []
  dir = path.join(savePath, 'Phon', getSubjID(), getSessID())
  if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }
  fileToSave = path.join(dir,subjID+'_'+sessID+'_Phon_level_'+level+'_'+getDateStamp()+'.csv')
  clearScreen()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  //var txtNode = document.createTextNode(txt)
  //p.appendChild(txtNode)
  p.innerHTML = txt
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var startBtnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.className = 'startBtn'
  startBtn.onclick = function() {
    showNextTrial(level)
  }
  startBtnDiv.appendChild(startBtn)
  var practiceBtnDiv = document.createElement("div")
  var practiceBtn = document.createElement("button")
  var practiceBtnTxt = document.createTextNode("Practice")
  practiceBtn.appendChild(practiceBtnTxt)
  practiceBtn.className = 'startBtn'
  practiceBtn.onclick = function() {
    showNextPracticeTrial(level)
  }
  practiceBtnDiv.appendChild(practiceBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(startBtnDiv)
  content.appendChild(lineBreak)
  content.appendChild(practiceBtnDiv)
  return getTime()
}



function showImg(imgPath, imgDurationMS) {
  clearScreen()
  var imageEl = document.createElement("img")
  imageEl.src = imgPath
  content.appendChild(imageEl)
  clearTimeout(imgTimeoutID)
  imgTimeoutID = setTimeout(clearScreen, imgDurationMS)
  return getTime()
}



function stopRecordingAndShowNav() {
  clearScreen()
  openNav()
}



function clearScreenAndStopRecording() {
  clearScreen()
  openNav()
}



// load experiment module js file. All experiments are written in js, no separate html file
function loadJS (ID) {
  if (!document.getElementById(ID +'JS')) {
    expDir = path.join(__dirname, '/experiments/', ID, path.sep)
    scrElement = document.createElement("script")
    scrElement.type = "application/javascript"
    scrElement.src = expDir + ID + '.js'
    scrElement.id = ID + 'JS'
    document.body.appendChild(scrElement)
    console.log('loaded: ', scrElement.src)
    //might need to wait for scrElement.onload event -- test this
    //http://stackoverflow.com/a/38834971/3280952
  }
}


// unload js at the end of experiment run
function unloadJS (ID) {
  if (document.getElementById(ID +'JS')) {
    scrElement = document.getElementById(ID +'JS')
    document.body.removeChild(scrElement)
    console.log('removed: ', ID +'JS')
  }
}

function waitSecs(secs) {
  var start = performance.now()
  console.log("waitSecs started at: ", start)
  var end = start
  while(end < (start + (secs*1000))) {
    end = performance.now()
 }
 console.log("waitSecs waited: ", end-start)
}


// wait for time (in ms) and then run the supplied function.
// for now, the supplied function can only have one input variable.
// this WILL HANG the gui
function waitThenDoSync(ms, doneWaitingCallback, arg){
   var start = performance.now()
   var end = start;
   while(end < start + ms) {
     end = performance.now()
  }
  if (arg !== undefined) {
    doneWaitingCallback(arg)
  } else {
    doneWaitingCallback()
  }
}


// wait for time (in ms) and then run the supplied function.
// for now, the supplied function can only have one input variable. (this does not hang gui)
function waitThenDoAsync (ms, doneWaitingCallback, arg) {
  start = performance.now()
  setTimeout(function () {
    if (arg !== undefined) {
      doneWaitingCallback(arg)
    } else {
      doneWaitingCallback()
    }
    end = performance.now()
    console.log('Actual waitThenDo() time: ', end - start)
  }, ms)
}


 // keys object for storing keypress information
var keys = {
  key : '',
  time : 0,
  rt: 0,
  specialKeys: [' ', 'Enter', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Shift', 'Tab', 'BackSpace'],
  letterKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  alphaNumericKeys: 'abcdefghijklmnopqrstuvwxyz1234567890'.split(''), // inspired by: http://stackoverflow.com/a/31755504/3280952
  whiteList: function () {
    return this.alphaNumericKeys.concat(this.specialKeys)
  },
  blackList: [],
  isAllowed: function () {
    idx = this.whiteList().indexOf(this.key)
    var val = false
    if (idx > 0) {
      val = true
    } else {
      val = false
    }
    return val
  }
}


// experiment object for storing session parameters, etc.
function experiment(name) {
  this.beginTime= 0,
  this.endTime= 0,
  this.duration= 0,
  this.name= name,
  this.rootpath= '',
  this.mediapath= '',
  this.getDuration = function () {
    return this.endTime - this.beginTime
  },
  this.setBeginTime = function() {
    this.beginTime = performance.now()
  },
  this.setEndTime = function () {
    this.endTime = performance.now()
  },
  this.getMediaPath = function () {
    this.mediapath = path.join(__dirname, '/assets/')
    return this.mediapath
  },
  this.getRootPath = function () {
    this.rootpath = path.join(__dirname,'/')
    return this.rootpath
  }
}


function getRT() {
  return keys.time - stimOnset
}


function checkAccuracy() {
 if (keys.key === trials[trialOrder[t]].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return acc
}




function appendTrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, fileHeader)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}


// update keys object when a keydown event is detected
function updateKeys() {
  if (summaryIsOnScreen) {
    return
  }
  if (firstVideoNotFinished) {
    return
  }
  // gets called from: document.addEventListener('keydown', updateKeys);
  keys.key = event.key
  keys.time = performance.now() // gives ms
  keys.rt = 0
  console.log("key: " + keys.key)
  if (keys.key === '1' || keys.key === '2') {
    if (!isPractice) {
      clearTimeout(nextTrialTimeoutID)
      clearTimeout(trialTimeoutID)
      clearScreen()
      accuracy = checkAccuracy()
      totalAccArray.push(accuracy)
      totalAcc = mean(totalAccArray)
      console.log('total acc: ', totalAcc)
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      showFeedback(accuracy)
      setTimeout(clearScreen, fbTime)
      //['subj', 'session', 'assessment', 'level', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
      appendTrialDataToFile(fileToSave, [subjID, sessID, 'PhonTx', level, trials[trialOrder[t]].stim1.trim(), trials[trialOrder[t]].stim2.trim(), trials[trialOrder[t]].correctResp.trim(), keys.key, keys.rt, accuracy])
      //waitSecs(1.5)
      setTimeout(function() {showNextTrial(level)}, iti + fbTime)
    } else if (isPractice) {
      clearTimeout(nextTrialTimeoutID)
      clearTimeout(trialTimeoutID)
      clearScreen()
      accuracy = checkAccuracy()
      //totalAccArray.push(accuracy)
      //totalAcc = mean(totalAccArray)
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      showFeedback(accuracy)
      setTimeout(clearScreen, fbTime)
      setTimeout(function() {showNextPracticeTrial(level)}, iti + fbTime)
    }
    firstVideoNotFinished = true
  } else if (keys.key === 'ArrowLeft') {

  }
}


function showFeedback (trialAcc) {
  if (trialAcc == true) {
    fbImg = path.join(exp.mediapath, 'correct' + '.png')
  } else if (trialAcc == false) {
    fbImg = path.join(exp.mediapath, 'incorrect' + '.png')
  }
  var img = document.createElement("img")
  img.src = fbImg
  img.style.height = '10%'
  content.appendChild(img)
}

function mean(arrayToAvg) {
  var sum = arrayToAvg.reduce((previous, current) => current += previous);
  var avg = sum / arrayToAvg.length;
  return avg
}


// store state of navigation pane
var nav = {
  hidden: false
}


function clearAllTimeouts() {
  clearTimeout(trialTimeoutID)
}


// open navigation pane
function openNav() {
  clearAllTimeouts()
  document.getElementById("navPanel").style.width = "150px"
  document.getElementById("contentDiv").style.marginLeft = "150px"
  document.body.style.backgroundColor = "rgba(0,0,0,0.3)"
  if (document.getElementById("imageElement")) {
    document.getElementById("imageElement").style.opacity = "0.1";
  }
  document.getElementById("closeNavBtn").innerHTML = "&times;"
}


// close navigation pane
function closeNav() {
    document.getElementById("navPanel").style.width = "0px";
    document.getElementById("contentDiv").style.marginLeft= "0px";
    document.getElementById("contentDiv").style.width= "100%";
    document.body.style.backgroundColor = "white";
    //document.getElementById("menuBtn").innerHTML = "&#9776;"
    if (document.getElementById("imageElement")) {
      document.getElementById("imageElement").style.opacity = "1";
    }
}


// toggle navigation pane, detect if hidden or not
function toggleNav() {
  if (nav.hidden) {
    openNav()
    nav.hidden = false
  } else {
    closeNav()
    nav.hidden = true
  }
}


// check if key that was pressed was the escape key or q. Quits experiment immediately
function checkForEscape() {
  key = event.key
  if (key === "Escape" || key=== "q") {
    console.log("Escape was pressed")
    openNav()
    nav.hidden = false
    // unloadJS(exp.name)
    clearScreen()
    resetVars()
  }
}


function resetVars() {
  t = -1
  accuracy = null
  totalAccArray = []
  rt = null
  trialOrder = []
  trials = null
  level = null
}

function getStarted() {
  summaryIsOnScreen = false
  resetVars()
  subjID = document.getElementById("subjID").value.trim()
  sessID = document.getElementById("sessID").value.trim()
  level = document.getElementById("levelID").value.trim()
  console.log("level chosen: ", level)
  if (subjID === '' || sessID === '' || level === '') {
    console.log ('subject, session, or level is blank')
    alert('subject, session, or level is blank')
  } else {
    console.log ('subject is: ', subjID)
    console.log('session is: ', sessID)
    stopWebCamPreview()
    closeNav()
    resetTrialNumber()
    if (level === 'level1') {
      showInstructions(level1Instructions)
    } else if (level === 'level2') {
      showInstructions(level2Instructions)
    } else if (level === 'level3') {
      showInstructions(level3Instructions)
    } else if (level === 'level4') {
      showInstructions(level4Instructions)
    } else if (level === 'level5') {
      showInstructions(level5Instructions)
    } else if (level === 'level6') {
      showInstructions(level6Instructions)
    } else if (level === 'level7') {
      showInstructions(level7Instructions)
    } else if (level === 'level8') {
      showInstructions(level8Instructions)
    } else if (level === 'level9') {
      showInstructions(level9Instructions)
    } else if (level === 'level10') {
      showInstructions(level10Instructions)
    }
  }
}


function showNextTrial(level) {
  isPractice = false
  firstVideoNotFinished = true
  if (level === 'level1') {
    trials = level1Trials
  } else if (level === 'level2') {
    trials = level2Trials
  } else if (level === 'level3') {
    trials = level3Trials
  } else if (level === 'level4') {
    trials = level4Trials
  } else if (level === 'level5') {
    trials = level5Trials
  } else if (level === 'level6') {
    trials = level6Trials
  } else if (level === 'level7') {
    trials = level7Trials
  } else if (level === 'level8') {
    trials = level8Trials
  } else if (level === 'level9') {
    trials = level9Trials
  } else if (level === 'level10') {
    trials = level10Trials
  }
  clearTimeout(trialTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxTrials-1) {
    clearScreen()
    clearAllTimeouts()
    showSummary()
    openNav()
    t = maxTrials+1
    return false
  }
  var vid = document.createElement("video")
  vid.src = path.join(mediaPath, trials[trialOrder[t]].stim1.trim() + '.mp4')
  vid.autoplay = true
  vid.controls = false
  content.appendChild(vid)
  vid.onended = function() {
    clearScreen()
    firstVideoNotFinished = false
    var vid2 = document.createElement("video")
    vid2.src = path.join(mediaPath, trials[trialOrder[t]].stim2.trim() + '.mp4')
    vid2.autoplay = true
    vid2.controls = false
    vid2.onplay = function() {
    stimOnset = getTime()
    }
    vid2.onended = function() {
      clearScreen()
      trialTimeoutID = setTimeout(function() {
        keys.rt = 0
        keys.key = ''
        accuracy = checkAccuracy()
        totalAccArray.push(accuracy)
        totalAcc = mean(totalAccArray)
        console.log('total acc: ', totalAcc)
        console.log("accuracy: ", accuracy)
        showFeedback(accuracy)
        setTimeout(clearScreen, fbTime)
        //['subj', 'session', 'assessment', 'level', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
        appendTrialDataToFile(fileToSave, [subjID, sessID, 'PhonTx', level, trials[trialOrder[t]].stim1.trim(), trials[trialOrder[t]].stim2.trim(), trials[trialOrder[t]].correctResp.trim(), keys.key, keys.rt, accuracy])
        nextTrialTimeoutID = setTimeout(function() {showNextTrial(level)}, iti + fbTime)
        firstVideoNotFinished = true
      }, trialTimeoutTime)
    }
    content.appendChild(vid2)
  }
  return getTime()
}


function showNextPracticeTrial(level) {
  console.log ('Doing practice trial')
  isPractice = true
  firstVideoNotFinished = true
  if (level === 'level1') {
    trials = level1Trials
  } else if (level === 'level2') {
    trials = level2Trials
  } else if (level === 'level3') {
    trials = level3Trials
  } else if (level === 'level4') {
    trials = level4Trials
  } else if (level === 'level5') {
    trials = level5Trials
  } else if (level === 'level6') {
    trials = level6Trials
  } else if (level === 'level7') {
    trials = level7Trials
  } else if (level === 'level8') {
    trials = level8Trials
  } else if (level === 'level9') {
    trials = level9Trials
  } else if (level === 'level10') {
    trials = level10Trials
  }
  clearTimeout(trialTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxPracticeTrials-1) {
    clearScreen()
    isPractice = false
    clearAllTimeouts()
    resetTrialNumber()
    getStarted()
    return false
  }
  var vid = document.createElement("video")
  vid.src = path.join(mediaPath, trials[trialOrder[t]].stim1.trim() + '.mp4')
  vid.autoplay = true
  vid.controls = false
  content.appendChild(vid)
  vid.onended = function() {
    clearScreen()
    firstVideoNotFinished = false
    var vid2 = document.createElement("video")
    vid2.src = path.join(mediaPath, trials[trialOrder[t]].stim2.trim() + '.mp4')
    vid2.autoplay = true
    vid2.controls = false
    vid2.onended = function() {
      clearScreen()
      trialTimeoutID = setTimeout(function() {
        clearScreen()
        keys.rt = 0
        keys.key = ''
        accuracy = checkAccuracy()
        console.log("accuracy: ", accuracy)
        showFeedback(accuracy)
        setTimeout(clearScreen, fbTime)
        setTimeout(function() {showNextPracticeTrial(level)}, iti + fbTime)
        firstVideoNotFinished = true
      }, trialTimeoutTime)
    }
    content.appendChild(vid2)
  }
  return getTime()
}


function showSummary() {
  summaryIsOnScreen = true
  accMin = 0.6
  if (totalAcc < accCutOff && totalAcc >= accMin) {
    accMsg = 'Accuracy: ' + totalAcc + '. Recommendation: Repeat current level (' + level + ')'
  } else if (totalAcc < accMin) {
    accMsg = 'Accuracy: ' + totalAcc + '. Recommendation: Move down one level'
  } else if (totalAcc >= accCutOff) {
    if (level === 'level10') {
      accMsg = 'Accuracy: ' + totalAcc + '. Recommendation: Already at the highest level. Try for a higher accuracy.'
    } else {
      accMsg = 'Accuracy: ' + totalAcc + '. Recommendation: Move up one level'
    }
  }
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(accMsg)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  content.appendChild(textDiv)
}


function resetTrialNumber() {
  t = -1
}

// event listeners that are active for the life of the application
document.addEventListener('keyup', checkForEscape)
document.addEventListener('keyup', updateKeys)
