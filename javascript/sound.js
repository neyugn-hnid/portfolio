window.onload = function (e) {
    createSound("music_backgroud");
    console.log("loaded s")
};

function createSound(soundname) {
    soundManager.createSound({
        id: String(Math.random() * 1000),
        url: `/assets/audios/${soundname}.mp3`,
        autoLoad: true,
        autoPlay: true,
        onload: function () {
            // alert('The sound ' + this.id + ' loaded!');
        },
        volume: 100
    });
}