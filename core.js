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
var userDataPath = path.join(app.getPath('userData'),'Data');
makeSureUserDataFolderIsThere()
console.log('user path: ', userDataPath)
var moment = require('moment')
var content = document.getElementById("contentDiv")
var localMediaStream
var sys = {
  modelID: 'unknown',
  isMacBook: false // need to detect if macbook for ffmpeg recording framerate value
}
//var instructions = "I'm going to ask you to name some pictures. When you hear a beep, a picture will appear on the computer screen. Your job is to name the picture using only one word. We'll practice several pictures before we begin"
var beepSound = path.join(__dirname, 'assets', 'beep.wav')
var exp = new experiment('Memory')
// construct a new ffmpeg recording object
var rec = new ff()
var wordsFilledTimeoutID
var nonWordsFilledTimeoutID
var wordsUnfilledTimeoutID
var nonWordsUnfilledTimeoutID
var tripletsA1TimeoutID
var tripletsA2TimeoutID
var wordsFilledTimeoutTime = 1000*30 // 30 seconds
var wordsUnfilledTimeoutTime = 1000*30 // 30 seconds
var nonWordsFilledTimeoutTime = 1000*30 // 30 seconds
var nonWordsUnfilledTimeoutTime = 1000*30 // 30 seconds
var tripletsA1TimeoutTime = 1000*30
var tripletsA2TimeoutTime = 1000*30
var imgTimeoutID
var imgDurationMS = 1000*2 // 2 seconds
exp.getRootPath()
exp.getMediaPath()
var wordsFilledMediaPath = path.resolve(exp.mediapath, 'wordsFilled', 'media')
var wordsUnfilledMediaPath = path.resolve(exp.mediapath, 'wordsUnfilled', 'media')
var nonWordsFilledMediaPath = path.resolve(exp.mediapath, 'nonWordsFilled', 'media')
var nonWordsUnfilledMediaPath = path.resolve(exp.mediapath, 'nonWordsUnfilled', 'media')
var tripletsA1MediaPath = path.resolve(exp.mediapath, 'tripletsA1', 'media')
var tripletsA2MediaPath = path.resolve(exp.mediapath, 'tripletsA2', 'media')
var wordsFilledTrials = readCSV(path.resolve(wordsFilledMediaPath, 'wordsFilled.csv'))
var wordsUnfilledTrials = readCSV(path.resolve(wordsUnfilledMediaPath, 'wordsUnfilled.csv'))
var nonWordsFilledTrials = readCSV(path.resolve(nonWordsFilledMediaPath, 'nonWordsFilled.csv'))
var nonWordsUnfilledTrials = readCSV(path.resolve(nonWordsUnfilledMediaPath, 'nonWordsUnfilled.csv'))
var tripletsA1Trials = readCSV(path.resolve(tripletsA1MediaPath, 'tripletsA1.csv'))
var tripletsA2Trials = readCSV(path.resolve(tripletsA2MediaPath, 'tripletsA2.csv'))
var maxNumberOfWordsFilledTrials = wordsFilledTrials.length
var maxNumerOfWordsUnfilledTrials = wordsUnfilledTrials.length
var maxNumberOfNonWordsFilledTrials = nonWordsFilledTrials.length
var maxNumberOfNonWordsUnfilledTrials = nonWordsUnfilledTrials.length
var maxNumberOfTripletsA1Trials = tripletsA1Trials.length
var maxNumberOfTripletsA2Trials = tripletsA2Trials.length
var wordsFilledFileToSave
var wordsUnfilledFileToSave
var nonWordsFilledFileToSave
var nonWordsUnfilledFileToSave
var tripletsA1FileToSave
var tripletsA2FileToSave
var wordsFilledHeader = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
var wordsUnfilledHeader = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
var nonWordsFilledHeader = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
var nonWordsUnfilledHeader = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
var tripletsA1Header = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'stim3', 'conditionType', 'wordStructure', 'correctResp', 'subjResp', 'accuracy', os.EOL]
var tripletsA2Header = ['subj', 'session', 'assessment', 'stim1', 'stim2', 'stim3', 'conditionType', 'wordStructure', 'correctResp', 'subjResp', 'accuracy', os.EOL]
var assessment = ''
var subjID
var sessID
var stimOnset
var accuracy
var rt
//var trialNum = document.getElementById("trialNumID")
//var trialNumber = 1
var t = -1
var tReal = t-1
lowLag.init(); // init audio functions
var wordsFilledInstructions = "words filled"
var wordsUnfilledInstructions = 'words unfilled'
var nonWordsFilledInstructions = "non words filled"
var nonWordsUnfilledInstructions = 'non words unfilled'
var tripletsA1Instructions = 'triplets A1'
var tripletsA2Instructions = 'triplets A2'
var clickCount = 0
var tripletResp = ['n','n','n']
var randomArray = [1,2,3,4,5,6,7,8,9]






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


// ffmpeg object constructor
function ff() {
  this.ffmpegPath = path.join(appRootDir,'ffmpeg','ffmpeg'),
  this.framerate = function () {

  },
  this.shouldOverwrite = '-y',         // do overwrite if file with same name exists
  this.threadQueSize = '50',           // preallocation
  this.cameraFormat = 'avfoundation',  // macOS only
  this.screenFormat = 'avfoundation',  // macOS only
  this.cameraDeviceID = '0',           // macOS only
  this.audioDeviceID = '0',            // macOS only
  this.screenDeviceID = '1',           // macOS only
  this.videoSize = '1280x720',         // output video dimensions
  this.videoCodec = 'libx264',         // encoding codec
  this.recQuality = '20',              //0-60 (0 = perfect quality but HUGE files)
  this.preset = 'ultrafast',
  this.videoExt = '.mp4',
  // filter is for picture in picture effect
  this.filter = '"[0]scale=iw/8:ih/8 [pip]; [1][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10"',
  this.isRecording = false,
  this.getSubjID = function() {
    var subjID = document.getElementById("subjID").value
    if (subjID === '') {
      console.log ('subject is blank')
      alert('Participant field is blank!')
      subjID = '0000'
    }
    return subjID
  },
  this.getSessID = function () {
    var sessID = document.getElementById("sessID").value
    if (sessID === '') {
      console.log ('session is blank')
      alert('Session field is blank!')
      sessID = '0000'
    }
    return sessID
  },
  this.getAssessmentType = function () {
    var assessmentType = document.getElementById("assessmentID").value
    if (assessmentType === '') {
      console.log ('assessment field is blank')
      alert('Assessment field is blank!')
    } else {
      return assessmentType
    }
  },
  this.datestamp = getDateStamp(),
  this.makeOutputFolder = function () {
    outpath = path.join(userDataPath, 'video')
    //fs.mkdirSync(path.join(app.getPath('userData'), 'video'))
    if (!fs.existsSync(outpath)) {
      fs.mkdirSync(outpath)
    }
    return outpath
  }
  this.outputFilename = function() {
    return path.join(this.makeOutputFolder(), this.getSubjID()+'_'+this.getSessID()+'_'+this.getAssessmentType()+'_'+getDateStamp()+this.videoExt)
  },
  this.getFramerate = function () {
    if (sys.isMacBook == true){
      var framerate = 30
    } else {
      var framerate = 29.97
    }
    return framerate
  },
  this.startRec = function() {
    cmd = [
      '"'+this.ffmpegPath +'"' +
      ' ' + this.shouldOverwrite +
      ' -thread_queue_size ' + this.threadQueSize +
      ' -f ' + this.screenFormat +
      ' -framerate ' + this.getFramerate().toString() +
      ' -i ' + '"' + this.screenDeviceID + '"' +
      ' -thread_queue_size ' + this.threadQueSize +
      ' -f ' + this.cameraFormat +
      ' -framerate ' + this.getFramerate().toString() +
      ' -video_size ' + this.videoSize +
      ' -i "' + this.cameraDeviceID + '":"' + this.audioDeviceID + '"' +
      ' -profile:v baseline' +
      ' -c:v ' + this.videoCodec +
      ' -crf ' + this.recQuality +
      ' -preset ultrafast' +
      ' -filter_complex ' + this.filter +
      ' -r ' + this.getFramerate().toString() +
      ' ' + '"' + this.outputFilename() + '"'
    ]
    console.log('ffmpeg cmd: ')
    console.log(cmd)
    this.isRecording = true
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      // console.log(`stdout: ${stdout}`);
      // console.log(`stderr: ${stderr}`);
    })
  },
  this.stopRec = function () {
    exec('killall ffmpeg')
  }
}


// open data folder in finder
function openDataFolder() {
  dataFolder = userDataPath
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder)
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
    {title: "Memory Analysis",
    defaultPath: userDataPath,
    properties: ["openFile"]},
  analyzeSelectedFile)
}


function analyzeSelectedFile(filePath) {
  console.log("file chosen: ", filePath)
}


// play audio file using lowLag API
function playAudio(fileToPlay) {
  lowLag.load(fileToPlay);
  lowLag.play(fileToPlay);
  return getTime()
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
function showWordsFilledInstructions(txt) {
  wordsFilledFileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextWordsFilledTrial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
  return getTime()
}

function showNonWordsFilledInstructions(txt) {
  nonWordsFilledFileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextNonWordsFilledTrial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
  return getTime()
}

function showWordsUnfilledInstructions(txt) {
  wordsUnfilledFileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextWordsUnfilledTrial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
  return getTime()
}


function showNonWordsUnfilledInstructions(txt) {
  nonWordsUnfilledFileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextNonWordsUnfilledTrial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
  return getTime()
}


function showTripletsA1Instructions(txt) {
  tripletsA1FileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextTripletsA1Trial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
  return getTime()
}


function showTripletsA2Instructions(txt) {
  tripletsA2FileToSave = path.join(userDataPath,subjID+'_'+sessID+'_'+assessment+'_'+getDateStamp()+'.csv')
  clearScreen()
  //rec.startRec()
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  var txtNode = document.createTextNode(txt)
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  var lineBreak = document.createElement("br")
  var btnDiv = document.createElement("div")
  var startBtn = document.createElement("button")
  var startBtnTxt = document.createTextNode("Start")
  startBtn.appendChild(startBtnTxt)
  startBtn.onclick = showNextTripletsA2Trial
  btnDiv.appendChild(startBtn)
  content.appendChild(textDiv)
  content.appendChild(lineBreak)
  content.appendChild(btnDiv)
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
  rec.stopRec()
  openNav()
}



function clearScreenAndStopRecording() {
  clearScreen()
  rec.stopRec()
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


function checkWordsFilledAccuracy() {
 if (keys.key === wordsFilledTrials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return acc
}

function checkWordsUnfilledAccuracy() {
 if (keys.key === wordsUnfilledTrials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return acc
}

function checkNonWordsFilledAccuracy() {
 if (keys.key === nonWordsFilledTrials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return acc
}

function checkNonWordsUnfilledAccuracy() {
 if (keys.key === nonWordsUnfilledTrials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return acc
}

function checkTripletsA1Accuracy() {
  tempRespStr = tripletResp.toString()
  respStr = tempRespStr.replace(/,/g,'') // replace commas with nothing
 if (respStr === tripletsA1Trials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return {acc: acc,
   respStr: respStr}
}

function checkTripletsA2Accuracy() {
  tempRespStr = tripletResp.toString()
  respStr = tempRespStr.replace(/,/g,'') // replace commas with nothing
 if (respStr === tripletsA2Trials[t].correctResp.trim()) {
   acc = 1
 } else {
   acc = 0
 }
 return {acc: acc,
   respStr: respStr}
}


function appendWordsFilledTrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, wordsFilledHeader)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}


function appendWordsUnfilledTrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, wordsUnfilledHeader)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}

function appendNonWordsFilledTrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, nonWordsFilledHeader)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}

function appendNonWordsUnfilledTrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, nonWordsUnfilledHeader)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}


function appendTripletsA1TrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, tripletsA1Header)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}

function appendTripletsA2TrialDataToFile(fileToAppend, dataArray) {
  dataArray.push(os.EOL)
  dataString = csvsync.stringify(dataArray)
  if (!fs.existsSync(fileToAppend)) {
    fs.appendFileSync(fileToAppend, tripletsA2Header)
    fs.appendFileSync(fileToAppend, dataArray)
  } else {
    fs.appendFileSync(fileToAppend, dataArray)
  }
  console.log("appended file: ", fileToAppend)
}




// update keys object when a keydown event is detected
function updateKeys() {
  // gets called from: document.addEventListener('keydown', updateKeys);
  iti = 1500 // milliseconds
  keys.key = event.key
  keys.time = performance.now() // gives ms
  keys.rt = 0
  console.log("key: " + keys.key)
  if (keys.key === '1' || keys.key === '2') {
    clearScreen()
    if (assessment === 'wordsFilled') {
      accuracy = checkWordsFilledAccuracy()
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      //['subj', 'session', 'assessment', 'stim1', 'stim2', 'correctResp', 'keyPressed', 'reactionTime', 'accuracy', os.EOL]
      appendWordsFilledTrialDataToFile(wordsFilledFileToSave, [subjID, sessID, assessment, wordsFilledTrials[t].stim1.trim(), wordsFilledTrials[t].stim2.trim(), wordsFilledTrials[t].correctResp.trim(), keys.key, keys.rt, accuracy])
      //waitSecs(1.5)
      setTimeout(showNextWordsFilledTrial, iti)
    } else if (assessment === 'wordsUnfilled') {
      accuracy = checkWordsUnfilledAccuracy()
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      appendWordsUnfilledTrialDataToFile(wordsUnfilledFileToSave, [subjID, sessID, assessment, wordsUnfilledTrials[t].stim1.trim(), wordsUnfilledTrials[t].stim2.trim(), wordsUnfilledTrials[t].correctResp.trim(), keys.key, keys.rt, accuracy])
      setTimeout(showNextWordsUnfilledTrial, iti)
    } else if (assessment === 'nonWordsFilled') {
      accuracy = checkNonWordsFilledAccuracy()
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      appendNonWordsFilledTrialDataToFile(nonWordsFilledFileToSave, [subjID, sessID, assessment, nonWordsFilledTrials[t].stim1.trim(), nonWordsFilledTrials[t].stim2.trim(), nonWordsFilledTrials[t].correctResp.trim(), keys.key, keys.rt, accuracy])
      setTimeout(showNextNonWordsFilledTrial, iti)

    } else if (assessment === 'nonWordsUnfilled') {
      accuracy = checkNonWordsUnfilledAccuracy()
      console.log("accuracy: ", accuracy)
      keys.rt = getRT()
      console.log("RT: ", keys.rt)
      appendNonWordsUnfilledTrialDataToFile(nonWordsUnfilledFileToSave, [subjID, sessID, assessment, nonWordsUnfilledTrials[t].stim1.trim(), nonWordsUnfilledTrials[t].stim2.trim(), nonWordsUnfilledTrials[t].correctResp.trim(), keys.key, keys.rt, accuracy])
      setTimeout(showNextNonWordsUnfilledTrial, iti)
    }
  } else if (keys.key === 'ArrowLeft') {

  }
}


// store state of navigation pane
var nav = {
  hidden: false
}


function clearAllTimeouts() {
  clearTimeout(wordsFilledTimeoutID)
  clearTimeout(nonWordsFilledTimeoutID)
  clearTimeout(wordsUnfilledTimeoutID)
  clearTimeout(nonWordsUnfilledTimeoutID)
  clearTimeout(tripletsA1TimeoutID)
  clearTimeout(tripletsA2TimeoutID)
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
    rec.stopRec()
  }
}

function getStarted() {
  subjID = document.getElementById("subjID").value
  sessID = document.getElementById("sessID").value
  assessment = document.getElementById("assessmentID").value
  console.log("assessment chosen: ", assessment)
  if (subjID === '' || sessID === '' || assessment === '') {
    console.log ('subject, session, or assessment is blank')
    alert('subject, session, or assessment is blank')
  } else {
    console.log ('subject is: ', subjID)
    console.log('session is: ', sessID)
    stopWebCamPreview()
    closeNav()
    resetTrialNumber()
    if (assessment === 'wordsFilled') {
      showWordsFilledInstructions(wordsFilledInstructions)
    } else if (assessment === 'nonWordsFilled') {
      showNonWordsFilledInstructions(nonWordsFilledInstructions)
    } else if (assessment === 'wordsUnfilled') {
      showWordsUnfilledInstructions(wordsUnfilledInstructions)
    } else if (assessment === 'nonWordsUnfilled') {
      showNonWordsUnfilledInstructions(nonWordsUnfilledInstructions)
    } else if (assessment === 'tripletsA1') {
      showTripletsA1Instructions(tripletsA1Instructions)
    } else if (assessment === 'tripletsA2') {
      showTripletsA2Instructions(tripletsA2Instructions)
    }
  }
}


function showNextTrial() {
  clearTimeout(trialTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxTrials) {
    clearScreen()
    t = maxTrials+1
    return false
  }
  picNum.value = t
  var img = document.createElement("img")
  img.src = path.join(exp.mediapath, 'pics', trials[t].PictureName.trim() + '.png')
  playAudio(path.join(exp.mediapath, 'beep.wav'))
  content.appendChild(img)
  trialTimeoutID = setTimeout(showNextTrial, 1000 * timeoutTime)
  return getTime()
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


function showNumber(randNumber) {
  clearScreen()
  //randNumber = getRandomInt(1,9)
  var textDiv = document.createElement("div")
  textDiv.style.textAlign = 'center'
  var p = document.createElement("p")
  p.style.fontSize = "72px"
  var txtNode = document.createTextNode(randNumber.toString())
  p.appendChild(txtNode)
  textDiv.appendChild(p)
  content.appendChild(textDiv)
}

function showNumberSequence() {
  var randomNumbers = shuffle(randomArray)
  var addedTime = 250
  setTimeout(clearScreen, 1000+addedTime) //clear the screen 1.25 sec after first sound clip played
  setTimeout(function () {
    showNumber(randomNumbers[0])
  },2000+addedTime) // show the number sequence for filled trial types
  setTimeout(function() {
    showNumber(randomNumbers[1])
  },3000+addedTime)
  setTimeout(function() {
    showNumber(randomNumbers[2])
  },4000+addedTime)
  setTimeout(function() {
    showNumber(randomNumbers[3])
  },5000+addedTime) // one second between each one
}


function showNextWordsFilledTrial() {
  clearTimeout(wordsFilledTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfWordsFilledTrials) {
    clearScreen()
    t = maxNumberOfWordsFilledTrials+1
    return false
  }
  var img = document.createElement("img")
  img.src = path.join(exp.mediapath, 'sound512px' + '.png')
  img.style.height = "40%"
  content.appendChild(img)
  t1 = performance.now()
  playAudio(path.join(wordsFilledMediaPath, 'audio', wordsFilledTrials[t].stim1.trim()+'.wav'))
  showNumberSequence()
  setTimeout(function() {
    clearScreen()
    var img = document.createElement("img")
    img.src = path.join(exp.mediapath, 'sound512px' + '.png')
    img.style.height = "40%"
    content.appendChild(img)
    t2 = performance.now()
    console.log("time since first file played: ", t2-t1)
    stimOnset = playAudio(path.join(wordsFilledMediaPath, 'audio', wordsFilledTrials[t].stim2.trim()+'.wav'))
  }, 6000)
  wordsFilledTimeoutID = setTimeout(showNextWordsFilledTrial, wordsFilledTimeoutTime)
  return stimOnset
}


function showNextNonWordsFilledTrial() {
  clearTimeout(nonWordsFilledTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfNonWordsFilledTrials) {
    clearScreen()
    t = maxNumberOfNonWordsFilledTrials+1
    return false
  }
  var img = document.createElement("img")
  img.src = path.join(exp.mediapath, 'sound512px' + '.png')
  img.style.height = "40%"
  content.appendChild(img)
  t1 = performance.now()
  playAudio(path.join(nonWordsFilledMediaPath, 'audio', nonWordsFilledTrials[t].stim1.trim()+'.wav'))
  showNumberSequence()
  setTimeout(function() {
    clearScreen()
    var img = document.createElement("img")
    img.src = path.join(exp.mediapath, 'sound512px' + '.png')
    img.style.height = "40%"
    content.appendChild(img)
    t2 = performance.now()
    console.log("time since first file played: ", t2-t1)
    stimOnset = playAudio(path.join(nonWordsFilledMediaPath, 'audio', nonWordsFilledTrials[t].stim2.trim()+'.wav'))
  }, 6000)
  nonWordsFilledTimeoutID = setTimeout(showNextNonWordsFilledTrial, nonWordsFilledTimeoutTime)
  return stimOnset
}


function showNextWordsUnfilledTrial() {
  clearTimeout(wordsUnfilledTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfNonWordsUnfilledTrials) {
    clearScreen()
    t = maxNumberOfNonWordsUnfilledTrials+1
    return false
  }
  var img = document.createElement("img")
  img.src = path.join(exp.mediapath, 'sound512px' + '.png')
  img.style.height = "40%"
  content.appendChild(img)
  t1 = performance.now()
  playAudio(path.join(wordsUnfilledMediaPath, 'audio', wordsUnfilledTrials[t].stim1.trim()+'.wav'))
  //showNumberSequence()
  setTimeout(function() {
    clearScreen()
    var img = document.createElement("img")
    img.src = path.join(exp.mediapath, 'sound512px' + '.png')
    img.style.height = "40%"
    content.appendChild(img)
    t2 = performance.now()
    console.log("time since first file played: ", t2-t1)
    stimOnset = playAudio(path.join(wordsUnfilledMediaPath, 'audio', wordsUnfilledTrials[t].stim2.trim()+'.wav'))
  }, 6000)
  wordsUnfilledTimeoutID = setTimeout(showNextWordsUnfilledTrial, wordsFilledTimeoutTime)
  return stimOnset
}


function showNextNonWordsUnfilledTrial() {
  clearTimeout(nonWordsUnfilledTimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfNonWordsUnfilledTrials) {
    clearScreen()
    t = maxNumberOfNonWordsUnfilledTrials+1
    return false
  }
  var img = document.createElement("img")
  img.src = path.join(exp.mediapath, 'sound512px' + '.png')
  img.style.height = "40%"
  content.appendChild(img)
  t1 = performance.now()
  playAudio(path.join(nonWordsUnfilledMediaPath, 'audio', nonWordsUnfilledTrials[t].stim1.trim()+'.wav'))
  //showNumberSequence()
  setTimeout(function() {
    clearScreen()
    var img = document.createElement("img")
    img.src = path.join(exp.mediapath, 'sound512px' + '.png')
    img.style.height = "40%"
    content.appendChild(img)
    t2 = performance.now()
    console.log("time since first file played: ", t2-t1)
    stimOnset = playAudio(path.join(nonWordsUnfilledMediaPath, 'audio', nonWordsUnfilledTrials[t].stim2.trim()+'.wav'))
  }, 6000)
  nonWordsUnfilledTimeoutID = setTimeout(showNextNonWordsUnfilledTrial, nonWordsUnfilledTimeoutTime)
  return stimOnset
}


function showNextTripletsA1Trial() {
  tripletResp = ['n','n','n']
  clickCount = 0
  clearTimeout(tripletsA1TimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfTripletsA1Trials) {
    clearScreen()
    t = maxNumberOfTripletsA1Trials+1
    return false
  }
  var img1 = document.createElement("img")
  var img2 = document.createElement("img")
  var img3 = document.createElement("img")
  img1.src = path.join(tripletsA1MediaPath, 'pics', tripletsA1Trials[t].stim1.trim()+'.bmp')
  img2.src = path.join(tripletsA1MediaPath, 'pics', tripletsA1Trials[t].stim2.trim()+'.bmp')
  img3.src = path.join(tripletsA1MediaPath, 'pics', tripletsA1Trials[t].stim3.trim()+'.bmp')
  img1.style = "flex: 0 1 auto; align-self: flex-start; margin 10px; width: 200px; height: 200px;"
  img2.style = "flex: 0 1 auto; align-self: center; margin 10px; width: 200px; height: 200px;"
  img3.style = "flex: 0 1 auto; align-self: flex-end; margin 10px; width: 200px; height: 200px;"
  img1.onclick = function () {
    addClickToCounter(1)
  }
  img2.onclick = function () {
    addClickToCounter(2)
  }
  img3.onclick = function () {
    addClickToCounter(3)
  }
  content.appendChild(img1)
  content.appendChild(img2)
  content.appendChild(img3)
  t1 = performance.now()
  playAudio(path.join(tripletsA1MediaPath, 'audio', tripletsA1Trials[t].stim1.trim()+'.wav'))
  setTimeout(function () {
    playAudio(path.join(tripletsA1MediaPath, 'audio', tripletsA1Trials[t].stim2.trim()+'.wav'))
  }, 1500)
  setTimeout(function () {
    playAudio(path.join(tripletsA1MediaPath, 'audio', tripletsA1Trials[t].stim3.trim()+'.wav'))
  }, 3000)
  tripletsA1TimeoutID = setTimeout(showNextTripletsA1Trial, tripletsA1TimeoutTime)
  return stimOnset
}


function showNextTripletsA2Trial() {
  tripletResp = ['n','n','n']
  clickCount = 0
  clearTimeout(tripletsA2TimeoutID)
  closeNav()
  clearScreen()
  t += 1
  if (t > maxNumberOfTripletsA2Trials) {
    clearScreen()
    t = maxNumberOfTripletsA2Trials+1
    return false
  }
  var img1 = document.createElement("img")
  var img2 = document.createElement("img")
  var img3 = document.createElement("img")
  img1.src = path.join(tripletsA2MediaPath, 'pics', tripletsA2Trials[t].stim1.trim()+'.bmp')
  img2.src = path.join(tripletsA2MediaPath, 'pics', tripletsA2Trials[t].stim2.trim()+'.bmp')
  img3.src = path.join(tripletsA2MediaPath, 'pics', tripletsA2Trials[t].stim3.trim()+'.bmp')
  img1.style = "flex: 0 1 auto; align-self: flex-start; margin 10px; width: 200px; height: 200px;"
  img2.style = "flex: 0 1 auto; align-self: center; margin 10px; width: 200px; height: 200px;"
  img3.style = "flex: 0 1 auto; align-self: flex-end; margin 10px; width: 200px; height: 200px;"
  img1.onclick = function () {
    addClickToCounter(1)
  }
  img2.onclick = function () {
    addClickToCounter(2)
  }
  img3.onclick = function () {
    addClickToCounter(3)
  }
  content.appendChild(img1)
  content.appendChild(img2)
  content.appendChild(img3)
  t1 = performance.now()
  playAudio(path.join(tripletsA2MediaPath, 'audio', tripletsA2Trials[t].stim1.trim()+'.wav'))
  setTimeout(function () {
    playAudio(path.join(tripletsA2MediaPath, 'audio', tripletsA2Trials[t].stim2.trim()+'.wav'))
  }, 1500)
  setTimeout(function () {
    playAudio(path.join(tripletsA2MediaPath, 'audio', tripletsA2Trials[t].stim3.trim()+'.wav'))
  }, 3000)
  tripletsA2TimeoutID = setTimeout(showNextTripletsA2Trial, tripletsA2TimeoutTime)
  return stimOnset
}



function addClickToCounter(imgIdx) {
  clickCount  += 1
  console.log("Clicked!")
  tripletResp[imgIdx-1] = 'y'
  console.log("tripletResp: ", tripletResp)
  if (clickCount < 2) {
  } else {
    //console.log("tripletResp: ", tripletResp)
    if (assessment === 'tripletsA1') {
      res = checkTripletsA1Accuracy()
      console.log("accuracy: ", res.acc)
      // keys.rt = getRT()
      // console.log("RT: ", keys.rt)
      appendTripletsA1TrialDataToFile(tripletsA1FileToSave, [subjID, sessID, assessment, tripletsA1Trials[t].stim1.trim(), tripletsA1Trials[t].stim2.trim(), tripletsA1Trials[t].stim3.trim(), tripletsA1Trials[t].conditionType.trim(), tripletsA1Trials[t].wordStructure.trim(), tripletsA1Trials[t].correctResp.trim(), res.respStr, res.acc])
      showNextTripletsA1Trial()
    } else if (assessment === 'tripletsA2') {
      res = checkTripletsA2Accuracy()
      console.log("accuracy: ", res.acc)
      // keys.rt = getRT()
      // console.log("RT: ", keys.rt)
      appendTripletsA2TrialDataToFile(tripletsA2FileToSave, [subjID, sessID, assessment, tripletsA2Trials[t].stim1.trim(), tripletsA2Trials[t].stim2.trim(), tripletsA2Trials[t].stim3.trim(), tripletsA2Trials[t].conditionType.trim(), tripletsA2Trials[t].wordStructure.trim(), tripletsA2Trials[t].correctResp.trim(), res.respStr, res.acc])
      showNextTripletsA2Trial()
    }
    clickCount = 0
  }
}



function resetTrialNumber() {
  t = -1
}





// event listeners that are active for the life of the application
document.addEventListener('keyup', checkForEscape)
document.addEventListener('keyup', updateKeys)
// document.getElementById("videoElement").style.visibility = "hidden"
// document.getElementById("textElement").style.visibility = "hidden"
// document.getElementById("audioElement").style.visibility = "hidden"
// document.getElementById("buttonElement").style.visibility = "hidden"
