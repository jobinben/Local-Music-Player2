const Store = require('electron-store');
const uuidv4 = require('uuid/v4');
const path = require('path');

class MusicDataStore extends Store{
    constructor(settings) {
        super(settings)
        this.tracks = this.get('tracks') || [];
    }

    saveTracks() {
        this.set('tracks', this.tracks);
        return this;
    }

    getTracks() {
        return this.get('tracks') || [];
    }

    addTracks(tracks) {
        const tracksWithProps = tracks.map( track => {
            return{
                id: uuidv4(),
                path: track,
                fileName: path.basename(track),
            }
        }).filter( track => {
            const currentTracksPath = this.getTracks().map(track => track.path)
            return currentTracksPath.indexOf(track.path) < 0;
        })

        //把数据存入原来的数组
        this.tracks = [...this.tracks, ...tracksWithProps];

        return this.saveTracks();
    }

    deleteTracks(deletedId) {
        this.tracks = this.tracks.filter( item => {
            //把不等于这个id的数据全部提取出来
            return item.id !== deletedId;
        });
        return this.saveTracks();
        
    }
}

module.exports = MusicDataStore;
