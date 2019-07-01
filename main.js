const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const MusicDataStore = require('./renderer/MusicDataStore');

const myDataStore = new MusicDataStore({'name': 'Music Data'});

class AppWindow extends BrowserWindow { //重构BrowserWindow这个类，就不用一直复制很多代码
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true, //这里设置为true的情况下就是可以用node.js的API
      }
    }
    // const finalConfig = Object.assign(basicConfig,config);//把两个对象合并起来，也可以用es6的扩展语法
    const finalConfig = { ...basicConfig, ...config };

    super(finalConfig); //最后把类的主要参数传进super 调用appwindow时，就是这个参数
    this.loadFile(fileLocation);//加载的页面

    //优雅的显示窗口，提前加载页面
    this.once('ready-to-show', () => {
      this.show()
    });

  }
}

app.on('ready', () => {
  const mainWindow = new AppWindow({}, './renderer/index.html'); //因为构造方法里面的参数有两个，一个是对象，所以加个{}

  mainWindow.webContents.on("did-finish-load", (event, arg) => {//这个是electron内置的方法，当窗口渲染完后就做的一些事件
    mainWindow.send('getTracks', myDataStore.getTracks()); //打开时发送事件，让DOM渲染
  })

  ipcMain.on('add-music-window', (event, arg) => {
    const addWindow = new AppWindow({
      width: 600,
      height: 400,
      parent: mainWindow,
    }, './renderer/add.html');
  });

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{
        name: 'Music', extensions: ['mp3','mp4'],
      }]

    }, (files) => { //files是文件的路径
     event.sender.send('selected-file',files);
    })
  });

  ipcMain.on('add-tracks', (event, tracks) => {
    //这样把数据存入Music Data的文件中
    const updataTracks = myDataStore.addTracks(tracks).getTracks();
    mainWindow.send('getTracks', updataTracks); //添加后发送出去
  });

  ipcMain.on('delete-music', (event, deletedId) => {
    const updataTracks = myDataStore.deleteTracks(deletedId).getTracks();
    mainWindow.send('getTracks', updataTracks); //删除后发送出去数据 更新数据
  })





  // console.log(app.getPath('userData')); //获取文件放置的位置
  // ipcMain.on('message', (event, arg) => { //event是个复杂的对象，arg是发送者的发过来的信息。
  //   // event.sender.send('rely', 'this is main');//也可以直接用mainWindow本身发送事件
  //   mainWindow.send('reply', ' this is main');
  // })


  // const secondWindow = new BrowserWindow({
  //   width:200,
  //   height:200,
  //   webPreferences: {
  //     nodeIntegration: true
  //   },
  //   parent: mainWindow, //这个属性是继承父类窗口一样，当关闭父窗口，这个子窗口也关闭了
  // })
  // secondWindow.loadFile('index.html');
})