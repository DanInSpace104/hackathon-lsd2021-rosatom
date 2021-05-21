var websocket = null;
var schemepath = null;


readyPage = function () {
    template_name = "indexfield";
    wsuripath = curConfig.attrs.socket_address; // wsUri + ":" + wsPort + namespace; //
    console.log("connect to", wsuripath)
    socket = io.connect(wsuripath);

    // Connect to websocket
    socket.on('connect', function () {
        console.log('Websocket connect', wsuripath);
        $("#serverState").text("Установлено");
        $("#serverState").removeClass('btn-red-full').addClass('btn-green-full');
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

    socket.on('my_response', function (msg) {
        //$('#log').append('<br>' + $('<div>').text('Received #' + msg.count + ': ' + msg.data).html());
        // console.log(msg);
        // console.log("state="+connectStatus);
        // if (msg["count"] > 1) {
        //     if (template_name == "indexfield") processMessage(msg["data"]);
        //     if (template_name == "controlview") processMessageControl(msg["data"]);
        // };
    });

    var ping_pong_times = [];
    var start_time;
    window.setInterval(function () {
        start_time = (new Date).getTime();
        if (schemepath !== null) {
            socket.emit('my_ping');
        }
        // console.log(connectStatus);
    }, 5000);


    socket.on('my_pong', function () {
        var latency = (new Date).getTime() - start_time;
        // ping_pong_times.push(latency);
        // ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        // var sum = 0;
        // for (var i = 0; i < ping_pong_times.length; i++)
        //     sum += ping_pong_times[i];
        // $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    });

    $("#btnReset").click(function () {
        if (socket != null) {
            console.log("resetall");
            socket.emit('resetall');
        }
        else
            console.log("reset not work, socket not work");
    });

}

function processMessage(message) {
    /* Модифицировать, добавить проверку на тип ус-ва, тип индикатора...вообще переработать тут все*/
    try {
        var jso = JSON.parse(message);
    }
    catch (e) {
        console.log("Ошибка json", message, e); // передать объект исключения обработчику ошибок
    }
    var s = " ";
    var n = " ";
    console.log("it's alive", jso["slaves"]);
    // if (jso["slaves"] != null) { // message["slaves"]

    //     for (ob of jso["slaves"]) { // message["slaves"]
    //         {
    //             // console.log(ob["name"]+ob["data"]);
    //             //console.log();
    //             let nameobj = ob["name"];
    //             //TO-DO

    //             for (bx of boxss) {
    //                 //   console.log(bx.attrs.id);
    //                 if (bx.attrs.id === nameobj) {
    //                     //TO-DO
    //                     // console.log("Yes baby",ob);
    //                     let st = -1;
    //                     if (ob["data"] == 0 || ob["data"] == 240) st = 1;
    //                     if (ob["data"] > 0 && ob["data"] < 240) st = 2;

    //                     if (ob["online"] == false) st = 0;
    //                     bx.attrs.state = st;
    //                     ChangeSate(bx);
    //                 }
    //             }
    //         }
    //     }
    // }
    // stage.draw();
}