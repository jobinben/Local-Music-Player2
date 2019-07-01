
exports.$ = (id) => {
    return document.getElementById(id);
}

exports.convertDuration = (time) => {
    //计算分钟 单数返回 '01' ， 多数返回 '010'
    const minutes = "0" + Math.floor(time / 60);
    //计算秒 单数返回 '02', 多数返回 '020'
    const seconds = "0" + Math.floor( time - minutes * 60 );
    return minutes.substr(-2) + ":" + seconds.substr(-2);
}