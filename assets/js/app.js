/**
 * 1. render song
 * 2.  
 */

const $  = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');

const playBtn = $('.btn-toggle-play')
const pauseBtn = $('btn-toggle-pause')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const player = $('.player')
const playlist = $('.playlist')

const progress = $('#progress')
const PLAYER_STORAGE_KEY = 'VI_PLAYER'

const volum = $('#volum')

const app = {
    currentIndex : 0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))  || {},
    songs:[
        {
            name:'Hãy trao cho anh',
            singer:"Sơn Tùng MTP",
            path:"./assets/music/haytraochoanh.mp3",
            image:'./assets/img/song/haytraochoanh.jpg'
        },
        {
            name:'Ai Chung Tình Được Mãi',
            singer:"Một ai đó hát ă nha",
            path:"./assets/music/aichungtinhduocmai.mp3",
            image:'./assets/img/song/aichungtinhduocmai.jpg'
        },
        {
            name:'Anh Cứ Đi Đi',
            singer:"Harri Won",
            path:"./assets/music/anhcudidi.mp3",
            image:'./assets/img/song/anhcudidi.jpg'
        },
        {
            name:'Nàng Thơ',
            singer:"Quang Dũng",
            path:"./assets/music/nangtho.mp3",
            image:'./assets/img/song/nangtho.jpg'
        },
        {
            name:'Tòng Phu',
            singer:"Sơn Tùng MTP",
            path:"./assets/music/tongphu.mp3",
            image:'./assets/img/song/tongphu.jpg'
        },
        {
            name:'Waitting For You',
            singer:"Mono",
            path:"./assets/music/waitingforyou.mp3",
            image:'./assets/img/song/waittingforyou.jpg'
        },
        {
            name:'Phía Sau Em',
            singer:"Kay Trần",
            path:"./assets/music/phiasauem.mp3",
            image:'./assets/img/song/phiasauem.jpg'
        },
    ],
    setConfig:function(key,value){
        this.config[key] = value,
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function(){ //render song in list song
        var htmls = this.songs.map((song,index) => {
             return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
             <div class="thumb" style ="background-image:url('${song.image}')">
                 
             </div>
             <div class="body">
                 <h2 class="title">${song.name}</h2>
                 <p class="author">${song.singer}</p>
             </div>
             <div class="option">
                 <i class="fas fa-ellipsis-h"></i>
             </div>
         </div>`
        })
        playlist.innerHTML = htmls.join('\n');
    },

    defineProperties:function(){
        Object.defineProperty(this,'currentSong',{
            get:function(){
                return this.songs[this.currentIndex]
            }
        });
    },
    handleEvent: function(){ // scoll top 
        const cdWidth = cd.offsetWidth;
        const _this = this;

        //xữ lý CD quay
        const cdThumdAnimate =  cdThumb.animate ([
            {
                transform:'rotate(360deg)'
            }
        ],{
            duration:10000,
            iterations:Infinity,
        })
        cdThumdAnimate.pause();
        // console.log(cdThumdAnimate);

        // xữ lý zoom in/ zoom out
        document.onscroll = function(){
            const scrollTop = window.screenY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth- scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xữ lý khi click Play
        playBtn.onclick = function() {
            if(_this.isPlaying){
                audio.pause()
            }else{   
                audio.play()             
            }    
        }

        // khi song được playing
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumdAnimate.play();
        }

        // khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumdAnimate.pause(); 
        }

        // khi tiến độ bài hát thay đổi.
        audio.ontimeupdate = function () {
            if(audio.duration){
                const progressPercent = Math.floor((audio.currentTime/audio.duration)*100)
                progress.value = progressPercent;
                //console.log(Math.floor(audio.duration * progressPercent / 100));
            }            
        }

        // Xữ lý khi tua song 
        progress.onchange = function(e){
           const seekTime = Math.floor(e.target.value * audio.duration / 100)
           audio.currentTime = seekTime
        }

        volum.onchange = function(e){
            // console.log(e.target.value);
            const volumeTime = e.target.value / 100
            audio.volume = volumeTime;
        }

        // Xữ lý next song
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xữ lý prev Song
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xữ lý random song
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom",_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        // Xữ lý khi audio Ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        // Xữ lý khi audio repeat
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat",_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // xữ lý lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                // Xữ lý song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // Xữ lý option
                if(e.target.closest('.option')){

                }
            }
        }


    },
    loadCurrentSong:function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
    },
    loadConfig:function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong:function(){
        this.currentIndex++;
        if(this.currentIndex > this.songs.length - 1){
            this.currentIndex = 0;
        }   
        this.loadCurrentSong()
    },
    prevSong:function(){
        this.currentIndex--;
        if(this.currentIndex  < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong:function() {
        let newIndex;
        newIndex = Math.floor(Math.random()* this.songs.length)
        if(newIndex == this.currentIndex){
            newIndex = Math.floor(Math.random()* this.songs.length)
        }
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong:function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block:'center'
            });
        },100)
    },
    start:function(){
        // gán cấu hình từ config vào app
        this.loadConfig();

        // định nghĩa các thuộc tính
        this.defineProperties();

        // Lắng nghe và xữ lý các sự kiện Dom
        this.handleEvent();

        // tải thông tin bài hát đầu tiên và UI khi chạy ứng dụng
        this.loadCurrentSong()

        // render ra các bài hát
        this.render();

        // hiện thị trạng thái ban đầu của repeat và random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}

app.start()

