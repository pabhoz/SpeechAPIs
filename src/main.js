/***********
 * GLOBALS *
 ***********/
// Recognition instance
var translator;
var SpeechRecognition;
var noteListArea;
var css;
var speechSynthesis;

document.body.onload = () => {
    initApp();
}

function initApp() {
    checkForCompatibility();
    noteListArea = document.body.querySelector('#notesList');
    css = document.documentElement.style;
    setColorPickerColor(getComputedStyle(document.documentElement).getPropertyValue('--note-color'));

}

function checkForCompatibility(msg = undefined) {
    try {
        SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;

        translator = new Recognition(new SpeechRecognition());
        translator.subscribe('processed', (content) => {
            createNewNote(content);
        });

        // Como las voces se demoran en cargar, hacemos una promesa que intente cada
        // 10 milisegundos consultarlas, si ya están consultables, las guarda en la
        // variable voices, ahora que ya están guardadas, podemos asignar la voz a 
        // nuestro translator usando el método translator.setVoice() y le pasamos
        // la voz que nos guste.
        let voicesPromise = new Promise((resolve, reject) => {
            let id;
            id = setInterval(function () {
                if (speechSynthesis.getVoices().length !== 0) {
                    resolve(speechSynthesis.getVoices());
                    clearInterval(id);
                }
            }, 10);
        });
        voicesPromise.then((voices) => {
            translator.voices = voices;
            populateVoicesSelector(voices);
            // establecemos el idioma por defecto a español
            setLang('es');
        });
    }
    catch (e) {
        console.error(e);
        msg = msg || 'Este navegador no soporta el API de Speech Recognition';
        alert(msg);
    }
}

function createNewNote(content) {
    const note = document.createElement('div');
    note.classList.add('note');
    const noteContent = document.createElement('div');
    noteContent.innerHTML = content;
    const noteAction = document.createElement('button');
    noteAction.onclick = (event) => { readNote(event); };
    noteAction.innerHTML = 'Reproducir';

    note.appendChild(noteContent);
    note.appendChild(noteAction);
    console.log(noteListArea);
    noteListArea.appendChild(note);
}

function startRecording() {
    translator.start();
}

function stopRecording() {
    translator.stop();
}

function readTextArea() {
    const content = document.querySelector('#textArea textarea').value;
    translator.read(content);
}

function readNote(e) {
    const note = e.target.parentElement;
    const content = note.querySelector('div').innerHTML;
    translator.read(content);
}

function changeUIColor(rgbString) {
    css.setProperty('--note-color', rgbString);
}

function setLang(lang) {
    translator.lang = lang;
    const voices = loadVoices(lang);
    populateVoicesSelector(voices);
}

function setVoice(voiceName) {
    translator.voice = voiceName;
}

function setColorPickerColor(rgb) {
    const colorInput = document.querySelector('#appColor');
    let [r, g, b] = rgb.split(', ');
    colorInput.value = rgbToHex(r, g, b);
}

function setUIColor(hex) {
    const rgb = hexToRgb(hex);
    const color = `${rgb.r},${rgb.g},${rgb.b}`;
    css.setProperty('--note-color', color);
}

function loadVoices(lang) {
    const regex = (lang == 'es') ? /es-/gm : /en-/gm;
    const matches = translator.voices.filter((voice) => {
        return voice.lang.match(regex);
    });
    return matches;
}

function populateVoicesSelector(voices) {
    const voiceSelect = document.querySelector('#voiceSelector');
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = option.innerHTML = voice.name;
        voiceSelect.appendChild(option);
    });
    setVoice(voiceSelect.querySelector('option').value);
}

// COLOR CONVERTIONS
function componentToHex(c) {
    var hex = Number(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return `#${componentToHex(r.replace(' ', ''))}${componentToHex(g.replace(' ', ''))}${componentToHex(b.replace(' ', ''))}`;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
