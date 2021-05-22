import {} from '/assets/libjs/socket.io.min.js';
// import {myfunc} from '/assets/js/custom.js';

let namespace;
let wsuripath;
var connectStatus;
function readyPage (myfunc) {

    namespace = "/apisocket0"; //TODO в конфигах
    wsuripath = "ws://2.57.186.96:5000/apisocket0"
    console.log("connect"); //location.protocol + '//' + document.domain + ':' + location.port + namespace
    const socket = io.connect(wsuripath);

    socket.on('connect', function () {
        console.log('Websocket connect', wsuripath);

        socket.emit('join', 0); //TODO shemeid
        // $("#serverState").text("Установлено");
        // $("#serverState").removeClass('btn-red-full').addClass('btn-green-full');
        connectStatus = 1;
    });

    socket.on('connection', function () {
        console.log('Websocket connection');
        $("#serverState").text("Устанавливается...");
        $("#serverState").removeClass();
        $("#serverState").addClass('btn-green-border');
        connectStatus = 2;
    });

    socket.on('disconnect', function () {
        console.log('Websocket disconnect');
        $("#serverState").text("Разорвано");
        $("#serverState").removeClass('btn-green-full').addClass('btn-red-full');
        connectStatus = -1;
    });


    socket.on('my_response', myfunc);

    socket.on('my_message', function (msg) { console.log(msg) })

}
export {readyPage}