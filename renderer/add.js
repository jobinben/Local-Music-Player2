const { ipcRenderer } = require('electron');
const { $ } = require('../common/common');
const path = require('path'); //这是node可以获取一个路径的API

let musicFilePath = [];
$("select-music").addEventListener('click', () => {
    ipcRenderer.send('open-music-file')
});

$("add-music").addEventListener('click', () => {
    if(musicFilePath.length == 0) {
        alert("没有选择音乐哦");
    } else {
        ipcRenderer.send('add-tracks', musicFilePath);
        alert("导入成功!");
    }
    
})


const renderListHTML =(paths) => {
    const musicList = $('musicList');
    const musicItemsHTML = paths.reduce( (html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`;
        return html;
    },'');
    
    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
}

ipcRenderer.on("selected-file", (event, path) => {
    if(Array.isArray(path)) {
        //把路径传给它处理
        renderListHTML(path);
        musicFilePath = path; //把选择后的目录存储起来
    }
})
