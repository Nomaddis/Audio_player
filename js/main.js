let audio, canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;

//Hide Pause-btn
$('.pause-btn').hide();
//$('.analyser-btn .blue').hide();

//initialize
initAudio($('#playlist li:first-child'));

function initAudio(element) {
    let song = element.attr('song');
    let title = element.text();
    let cover = element.attr('cover');
    let artist = element.attr('artist');
    //console.log('song-', song, ' title- ', title, ' cover -', cover, ' artist -', artist);
    //Create audio obj
    audio = new Audio('audio/' + song);
    if(!audio.currentTime) {
        $('#duration').html('0.00');
    }
    $('#audio-player .audio-title').text(title);
    $('#audio-player .audio-artist').text(artist);
    //console.log($('#audio-player .audio-artist').text(artist));
    //Insert cover
    $('img.audio-cover').attr('src','img/covers/' + cover);
    $('#playlist li').removeClass('active');
    element.addClass('active');
    //Analyser
    document.getElementById('audio_box').appendChild(audio);
    context = new AudioContext(); // AudioContext object instance
    analyser = context.createAnalyser(); // AnalyserNode method
    canvas = document.getElementById('analyser_render');
    ctx = canvas.getContext('2d');
    // Re-route audio playback into the processing graph of the AudioContext
    source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    frameLooper();
    //on track end play next
    audio.onended = function() {
        nxt();
    };
    audio.crossOrigin = "anonymous";
}


//Play btn
$('.play-btn').click(function () {
   audio.play();
    $('.play-btn').hide();
    $('.pause-btn').show();
    //$('#duration').fadeIn(400);
    showDuration();
});

//Pause btn
$('.pause-btn').click(function () {
    audio.pause();
    $('.pause-btn').hide();
    $('.play-btn').show();
});

//Stop btn function
$('.stop-btn').click(function () {
    audio.pause();
    audio.currentTime = 0;
    $('.pause-btn').hide();
    $('.play-btn').show();
    //$('#duration').fadeOut(400);
});

//Next btn function
$('.next-btn').click(function () {
    nxt();
});
let nxt = function () {
        audio.pause();
        let next = $('#playlist').find('li.active').next();
        if(next.length === 0) {
            next = $('#playlist').find('li:first-child')
        }
        initAudio(next);
        audio.play();
        showDuration();
};

//Prev btn function
$('.prev-btn').click(function () {
    audio.pause();
    let prev = $('#playlist').find('li.active').prev();
    if(prev.length === 0) {
        prev = $('#playlist').find('li:last-child')
    }
    initAudio(prev);
    audio.play();
    showDuration();
});


//playlist click function
$('#playlist li').click(function () {
    $('#playlist li').removeClass('active');
    $(this).addClass('active');
    audio.pause();
    initAudio($('#playlist li.active'));
    audio.play();
    showDuration();
});


// Volume Control
//set/get volume value when page load
$('.volume').on("input", function () {
    audio.volume = parseFloat(this.value/100);
    let volume = $('.volume').val();
    localStorage.setItem('values', volume);
});
function setVolume(val) {
    $('.volume').val(val);
    audio.volume = parseFloat(val/100);
}
window.onload = setVolume(localStorage.getItem('values'));
//mute btn
let mute = true;
$('.mute-btn').click(function () {
    if(mute) {
        setVolume(0);
        mute = false;
    } else {
        setVolume(localStorage.getItem('values'));
        mute = true;
    }

});
$('.mute-btn').click(function () {
    $('.mute-btn').toggleClass('mute-btn_muted');
});

//Time duration function
function showDuration() {
    $(audio).on('timeupdate', function () {
        //get time
        let s = parseInt(audio.currentTime % 60);
        let m = parseInt((audio.currentTime)/60)%60;
        // add 0 if less then 10
        if(s<10) {
            s = '0'+s;
        }
        $('#duration').html(m + '.' + s);
        if(audio.currentTime > 0) {
            value = Math.floor((100 / audio.duration) * audio.currentTime);
        }
        $('#progress').css('width', value+'%');
    });
}

// frameLooper() animates any style
function frameLooper(){
    window.requestAnimationFrame(frameLooper);
    fbc_array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(fbc_array);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = '#00CCFF'; // Color of the bars
    bars = 100;
    for (let i = 0; i < bars; i++) {
        bar_x = i * 3;
        bar_width = 2;
        bar_height = -(fbc_array[i] / 2);
        //  fillRect( x, y, width, height ) // Explanation of the parameters below
        ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
    }
}

//Show/hide analyser
$('.analyser-btn').click(function () {
    $('.analyser-btn').toggleClass('blue-analyser');
    if($('.analyser-btn').hasClass('blue-analyser')) {
        $('#mp3_player').show();
    } else {
        $('#mp3_player').hide();
    }
});

