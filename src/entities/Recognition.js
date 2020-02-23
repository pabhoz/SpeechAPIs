class Recognition {
    
    constructor(speechRecognitionInstance) {
        this.sri = speechRecognitionInstance;
        this.content = '';
        this.lang = 'es';
        this.listeners = {
            processed: ()=>{ console.log("Voice message processed, this is a default message, please subscribe."); },
        };
    }

    get sri() {
        return this._sri;
    }

    set sri(speechRecognitionInstance) {
        if (speechRecognitionInstance instanceof SpeechRecognition) {
            this._sri = speechRecognitionInstance;
            this.initSRI();
        }
    }

    get lang() {
        return this._lang;
    }

    set lang(lang) {
        this._lang = lang;
    }

    get voices() {
        return this._voices;
    }

    set voices(voices) {
        this._voices = voices;
    }

    get voice() {
        return this._voice;
    }

    set voice(voice) {
        for(let i = 0; i < this.voices.length ; i++) {
            if(this.voices[i].name === voice) {
                this._voice = this.voices[i];
            }
          }
    }

    subscribe(event,callback){
        this.listeners[event] = callback;
    }

    emit(event,content){
        this.listeners[event](content);
    }

    start() {
        this.content = '';
        this.sri.start();
        const recordingPromise = new Promise((resolve, reject) => {
            setTimeout(function(){
              resolve("¡Éxito!");
            }, 250);
          });
    }

    stop() {
        this.sri.stop();
        
    }

    initSRI() {
        this.sri.continuous = true;
        this.sri.lang = 'es';
        this.sri.onresult = (speechRecognitionEvent) => {
            const current = speechRecognitionEvent.resultIndex;
            const transcript = speechRecognitionEvent.results[current][0].transcript;

            const mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

            if(!mobileRepeatBug) {
                this.content += transcript;
            }
            this.emit('processed', this.content);
        }
    }

    read(content) {
        var speech = new SpeechSynthesisUtterance();
        speech.text = content;
        speech.volume = 1;
        speech.rate = 0.8;
        speech.pitch = 1;
        speech.lang = this.lang;
        speech.voice = this.voice;
    
        window.speechSynthesis.speak(speech);
    }
}
