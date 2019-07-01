const { ipcRenderer } = require('electron');
const { $, convertDuration } = require('../common/common');



let musicAudio = new Audio();
let allTracks;
let currentTracks;

const rendererListHTML = (tracks) => {
    const trackList = $('tracksList');
    const trackItemHTML = tracks.reduce((html, track) => {
        html += `<li class="row music-list list-group-item d-flex align-items-center justify-content-center" >
        <div class="col-9">
            <i class="fa fa-music mr-3 text-secondary" aria-hidden="true"></i>
            <b>${track.fileName}</b>
        </div>
        <div class="col-2">
            <i class="fa fa-play mr-3" aria-hidden="true" data-id="${track.id}"></i>
            <i class="fa fa-trash" aria-hidden="true" data-id="${track.id}"></i>
        </div>
        </li>`;
        return html;
    }, '');
    const defaultItem = `<div class="alert alert-primary">还没有添加任何音乐</div>`
    trackList.innerHTML = tracks.length ? `<ul class="list-group">${trackItemHTML}</ul>` : defaultItem;
}

$('add-music-btn').addEventListener('click', () => {
    ipcRenderer.send('add-music-window');

});


ipcRenderer.on('getTracks', (event, tracks) => {
    console.log("====", tracks);
    rendererListHTML(tracks);
    allTracks = tracks;
});

$('tracksList').addEventListener('click', (event) => {
    event.preventDefault();
    const { dataset, classList } = event.target; //dataset是dom的一个方法，可以获取data-*定义的值; classList也是dom的方法，里面的一个contains方法可以判断当前的class名称存不存在，还有其他方法，remove,add,replace,
    const id = dataset && dataset.id;
    if (id && classList.contains("fa-play")) {
        //开始播放音乐
        if (currentTracks && currentTracks.id === id) {
            //继续播放音乐
            musicAudio.play();
            classList.replace('fa-play', 'fa-pause'); //替换class
        } else {
            //播放新的歌曲
            currentTracks = allTracks.find(track => track.id === id); //获取对应id的数据
            musicAudio.src = currentTracks.path;
            musicAudio.play();
            //把其他正在播放的音乐图标替换掉
            const resetIcon = document.querySelector('.fa-pause');
            if(resetIcon) {
                resetIcon.classList.replace('fa-pause', 'fa-play');
            }
            classList.replace('fa-play', 'fa-pause'); //替换class
        }


    } else if (id && classList.contains("fa-pause")) {
        //处理暂停逻辑
        musicAudio.pause();
        classList.replace('fa-pause', 'fa-play');//替换class

    } else if (id && classList.contains("fa-trash")) {
        //处理删除逻辑
        if (confirm('确定删除这首歌曲吗？')) { //confirm是一个提示弹框，返回boolean值
            ipcRenderer.send('delete-music', id);
            //刚好这首歌在播放，删除后应该停止播放
            musicAudio.pause();
        }

    }
});

const rendererPlayerHTML = (name,duration) => {
    const player = $('player-status');
    const html = `<div class="col font-weight-bold">正在播放: ${name}</div>
                <div class="col">
                    <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
                </di>
    `;
    player.innerHTML = html;
}

const updateProgressHTML = (currentTime, duration) => {
    const progress = Math.floor(currentTime / duration * 100);
    const bar = $('player-progress');
    bar.innerHTML = progress + "%";
    bar.style.width = progress + "%";
    const seeker = $('current-seeker');
    seeker.innerHTML = convertDuration(currentTime);
}

musicAudio.addEventListener('loadedmetadata', () => {
    //渲染播放器状态
    rendererPlayerHTML(currentTracks.fileName, musicAudio.duration);
});

musicAudio.addEventListener('timeupdate', () => {
    //更新播放器状态
    updateProgressHTML(musicAudio.currentTime, musicAudio.duration);
})