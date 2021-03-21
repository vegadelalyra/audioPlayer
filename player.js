/* Implementation of the presentation of the audio player */
import lottieWeb from 'https://cdn.skypack.dev/lottie-web';

const playIconContainer = document.getElementById('play-icon');
const audioPlayerContainer = document.getElementById('audio-player-container');
const seekSlider = document.getElementById('seek-slider');
const volumeSlider = document.getElementById('volume-slider');
const muteIconContainer = document.getElementById('mute-icon');
let playState = 'play';
let muteState = 'unmute';

const playAnimation = lottieWeb.loadAnimation({
  container: playIconContainer,
  path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json',
  renderer: 'svg',
  loop: false,
  autoplay: false,
  name: "Play Animation",
});

const muteAnimation = lottieWeb.loadAnimation({
    container: muteIconContainer,
    path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/mute/mute.json',
    renderer: 'svg',
    loop: false,
    autoplay: false,
    name: "Mute Animation",
});

playAnimation.goToAndStop(14, true);

playIconContainer.addEventListener('click', () => {
    if(playState === 'play') {
        audio.play();
        playAnimation.playSegments([14, 27], true);
        requestAnimationFrame(whilePlaying);
        playState = 'pause';
    } else {
        audio.pause();
        playAnimation.playSegments([0, 14], true);
        cancelAnimationFrame(raf);
        playState = 'play';
    }
});

muteIconContainer.addEventListener('click', () => {
    if(muteState === 'unmute') {
        muteAnimation.playSegments([0, 15], true);
        audio.muted = true;
        muteState = 'mute';
    } else {
        muteAnimation.playSegments([15, 25], true);
        audio.muted = false;
        muteState = 'unmute';
    }
});

const showRangeProgress = (rangeInput) => {
    if(rangeInput === seekSlider) audioPlayerContainer.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
    else audioPlayerContainer.style.setProperty('--volume-before-width', rangeInput.value / rangeInput.max * 100 + '%');
}

seekSlider.addEventListener('input', (e) => {
    showRangeProgress(e.target);
});
volumeSlider.addEventListener('input', (e) => {
    showRangeProgress(e.target);
});





/* Implementation of the functionality of the audio player */

var audio = document.querySelector('audio');
const durationContainer = document.getElementById('duration');
const currentTimeContainer = document.getElementById('current-time');
const outputContainer = document.getElementById('volume-output');
let raf = null;

const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
}

const displayDuration = () => {
    durationContainer.textContent = calculateTime(audio.duration);
}

const setSliderMax = () => {
    seekSlider.max = Math.floor(audio.duration);
}

 const displayBufferedAmount = () => {
    var bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
    audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
}

const whilePlaying = () => {
    seekSlider.value = Math.floor(audio.currentTime);
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    raf = requestAnimationFrame(whilePlaying);
}

if (audio.readyState > 0) {
    displayDuration();
    setSliderMax();
    displayBufferedAmount();
} else {
    audio.addEventListener('loadedmetadata', () => {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
    });
}

audio.addEventListener('progress', displayBufferedAmount);

seekSlider.addEventListener('input', () => {
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    if(!audio.paused) {
        cancelAnimationFrame(raf);
    }
});

seekSlider.addEventListener('change', () => {
    audio.currentTime = seekSlider.value;
    if(!audio.paused) {
        requestAnimationFrame(whilePlaying);
    }
});

volumeSlider.addEventListener('input', (e) => {
    const value = e.target.value;

    outputContainer.textContent = value;
    audio.volume = value / 100;
});




/* Implementation of the Media Session API */
if('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Komorebi',
        artist: 'Anitek',
        album: 'MainStay',
        artwork: [
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '96x96', type: 'image/png' },
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '128x128', type: 'image/png' },
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '192x192', type: 'image/png' },
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '256x256', type: 'image/png' },
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '384x384', type: 'image/png' },
            { src: 'https://assets.codepen.io/4358584/1.300.jpg', sizes: '512x512', type: 'image/png' }
        ]
    });
    navigator.mediaSession.setActionHandler('play', () => {
        if(playState === 'play') {
            audio.play();
            playAnimation.playSegments([14, 27], true);
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            playAnimation.playSegments([0, 14], true);
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if(playState === 'play') {
            audio.play();
            playAnimation.playSegments([14, 27], true);
            requestAnimationFrame(whilePlaying);
            playState = 'pause';
        } else {
            audio.pause();
            playAnimation.playSegments([0, 14], true);
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        audio.currentTime = audio.currentTime - (details.seekOffset || 10);
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
        audio.currentTime = audio.currentTime + (details.seekOffset || 10);
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.fastSeek && 'fastSeek' in audio) {
          audio.fastSeek(details.seekTime);
          return;
        }
        audio.currentTime = details.seekTime;
    });
    navigator.mediaSession.setActionHandler('stop', () => {
        audio.currentTime = 0;
        seekSlider.value = 0;
        audioPlayerContainer.style.setProperty('--seek-before-width', '0%');
        currentTimeContainer.textContent = '0:00';
        if(playState === 'pause') {
            playAnimation.playSegments([0, 14], true);
            cancelAnimationFrame(raf);
            playState = 'play';
        }
    });
}

//Events and functionalities of the images
let title = document.querySelector("#plays"); //This is the title of the audio player
var count = 0;
var first = 1;
//Randomize the playlist with a random index
// const random = (min,max)=>{
//     return Math.round(Math.random()*(max-min) + min);
// }
const x = (arr)=>{
    
    if (first == 0){
        first = 1;
        count++;
    }else{
        if (count == (arr.length-1)){
            count=0;
        }else{
            count++;
        }
    }

    let miau = arr[count];
    return miau;
}
const y = (arr) => {
    
    if (first == 1){
        first = 0;
        count--;
        if (count == -1){
            count=(arr.length-1);
        }
    }else{
        if (count == 0){
            count=(arr.length-1);
        }else{
            count--;
        }
    } 

    let miau = arr[count];
    return miau;    
}


//EPIC PLAYLIST ARRAY
const epicPlaylist = [
    "/playlists/epic/Armored Titan - Shingeki no Kyoji.mp3",
    "/playlists/epic/Kara Theme - Detroit Become Human.mp3",
    "/playlists/epic/The Opened Way - Shadow of the Colossus.mp3",
    "/playlists/epic/Ultra Instinct - Dragon Ball Super.mp3",
];

//REFLEX PLAYLIST ARRAY
const reflexPlaylist = [
    "/playlists/reflex/Death Note - Main Theme.mp3",
    "/playlists/reflex/Final Fantasy - Prelude (Orchestral).mp3",
    "/playlists/reflex/Floating Museum - Ghost In The Shell.mp3",
    "/playlists/reflex/Gwyn, Lord of Cinder - Dark Souls.mp3",
];


//COOL PLAYLIST ARRAY
const coolPlaylist = [
    "/playlists/cool/Pearl Jam - Black.mp3",
    "/playlists/cool/higurashi no naku koro ni opening full.mp3",
    "/playlists/cool/Naruto Ending Theme - Wind by Akeboshi.mp3",
    "/playlists/cool/Naruto Hinata Bicycle ending xd.mp3",
];

//Epic playlist (fire button)
var epic = document.querySelector("#epic");
const fire = (e)=>{e.target.src="/img/epicOn.png"};
const fireOff = (e)=>{e.target.src="/img/epic.png"};
epic.addEventListener("mouseover",fire);
epic.addEventListener("mouseout",fireOff);
//To tune the playlist name and the lights up
epic.addEventListener("click",(e)=>{ 
    e.target.src="img/epicOn.png";
    mind.src="img/mind.png";
    cool.src="img/cool.png";
    epic.removeEventListener("mouseout",fireOff);
    mind.addEventListener("mouseout",brainOff);
    cool.addEventListener("mouseout",chillOff);
    title.textContent = `epic playlist`;
});
epic.addEventListener("contextmenu",(e)=>{ 
    e.target.src="img/epicOn.png";
    mind.src="img/mind.png";
    cool.src="img/cool.png";
    epic.removeEventListener("mouseout",fireOff);
    mind.addEventListener("mouseout",brainOff);
    cool.addEventListener("mouseout",chillOff);
    title.textContent = `epic playlist`;
});
//Functions for each image/button (and bound its playlist)
epic.addEventListener('click', () => {
    //Changing the song
    audio.pause();
    audio = new Audio(x(epicPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //here we will run a hack so the browser will always load the audio and run the code xd
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    }
});
epic.oncontextmenu = ()=>{
    //Changing the song
    audio.pause();
    audio = new Audio(y(epicPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //acá usamos un hack para que siempre nos ejecute duración
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    };
    return false;
};



//Chill playlist (mind button)
var mind = document.querySelector("#mind");
const brain = (e)=>{e.target.src="/img/mindOn.png"};
const brainOff = (e)=>{e.target.src="/img/mind.png"};
mind.addEventListener("mouseover",brain);
mind.addEventListener("mouseout",brainOff);
//To tune the playlist name and the lights up
mind.addEventListener("click",(e)=>{
    e.target.src="img/mindOn.png";
    epic.src="img/epic.png";
    cool.src="img/cool.png";
    mind.removeEventListener("mouseout",brainOff);
    epic.addEventListener("mouseout",fireOff);
    cool.addEventListener("mouseout",chillOff);
    title.textContent = `reflex playlist`;
});
mind.addEventListener("contextmenu",(e)=>{
    e.target.src="img/mindOn.png";
    epic.src="img/epic.png";
    cool.src="img/cool.png";
    mind.removeEventListener("mouseout",brainOff);
    epic.addEventListener("mouseout",fireOff);
    cool.addEventListener("mouseout",chillOff);
    title.textContent = `reflex playlist`;
});
//Functions for each image/button (and bound its playlist)
mind.addEventListener('click', () => {
    //Changing the song
    audio.pause();
    audio = new Audio(x(reflexPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //acá usamos un hack para que siempre nos ejecute duración
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    }
});
mind.oncontextmenu = ()=>{
    //Changing the song
    audio.pause();
    audio = new Audio(y(reflexPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //acá usamos un hack para que siempre nos ejecute duración
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    };
    return false;
};


//Cool playlist (sunglasses button)
var cool = document.querySelector("#cool");
const chill = (e)=>{e.target.src="/img/coolOn.png"};
const chillOff = (e)=>{e.target.src="/img/cool.png"};
cool.addEventListener("mouseover",chill);
cool.addEventListener("mouseout",chillOff);
//To tune the playlist name and the lights up
cool.addEventListener("click",(e)=>{
    e.target.src="img/coolOn.png";
    mind.src="img/mind.png";
    epic.src="img/epic.png";
    cool.removeEventListener("mouseout",chillOff);
    mind.addEventListener("mouseout",brainOff);
    epic.addEventListener("mouseout",fireOff);
    title.textContent = `cool playlist`;
});
cool.addEventListener("contextmenu",(e)=>{
    e.target.src="img/coolOn.png";
    mind.src="img/mind.png";
    epic.src="img/epic.png";
    cool.removeEventListener("mouseout",chillOff);
    mind.addEventListener("mouseout",brainOff);
    epic.addEventListener("mouseout",fireOff);
    title.textContent = `cool playlist`;
});
//Functions for each image/button (and bound its playlist)
cool.addEventListener('click', () => {
    //Changing the song
    audio.pause();
    audio = new Audio(x(coolPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //acá usamos un hack para que siempre nos ejecute duración
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    }
});
cool.oncontextmenu = ()=>{
    //Changing the song
    audio.pause();
    audio = new Audio(y(coolPlaylist));
    audio.load();
    //For the animation stuff
    playAnimation.playSegments([14, 27], true);
    requestAnimationFrame(whilePlaying);
    playState = 'pause';
    cancelAnimationFrame(raf);
    //acá usamos un hack para que siempre nos ejecute duración
    if (audio.readyState > 0) {
        displayDuration();
        setSliderMax();
        displayBufferedAmount();
        audio.play();
    } else {
        audio.addEventListener('loadedmetadata', () => {
            displayDuration();
            setSliderMax();
            displayBufferedAmount();
            audio.play();
        });
    }
    return false;
};

//DRAG AND DROP
var dragSrcEl = null;
//dragstart - gives some transparency when start to drag 
function handleDragStart(e){
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html',this.innerHTML);
}

//This section allows us to drop and move the info
function handleDragOver(e){
    if(e.preventDefault){
        e.preventDefault(); //Neccesary. Allows us to drop and avoid the element to behave as an URL (default browser behaviour)
    }
    
    e.dataTransfer.dropEffect = 'move'; //Gives the visual effect of drop
    //Avoid the element to behave as an URL or as defult browser DnD
    return false;
}

function handleDragEnter(e){
    //this is the current hover target
    this.classList.add('over');
}
//This both functions are bundled: its purpose is to replace the hover css animation (which would run too much times)
function handleDragLeave(e){
    //this is previous target element
    this.classList.remove('over');
}

function handleDrop(e){
    //once again, a line to avoid the default browser; stopPropagation will help us stop any redirecting
    if (e.stopPropagation){
        e.stopPropagation();
    };
    e.preventDefault();
    
    if (dragSrcEl != this){
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }
    var files = e.dataTransfer.files;
    for (let i = 0, f; f = files[i]; i++)

    return false;
}

function handleDragEnd(e){
    audioPlayerContainer.classList.remove('over');
}

audioPlayerContainer.addEventListener('dragstart',handleDragStart);
audioPlayerContainer.addEventListener('dragover',handleDragOver);
audioPlayerContainer.addEventListener('dragenter',handleDragEnter);
audioPlayerContainer.addEventListener('dragleave',handleDragLeave);
audioPlayerContainer.addEventListener('drop',handleDrop);
audioPlayerContainer.addEventListener('dragend',handleDragEnd);