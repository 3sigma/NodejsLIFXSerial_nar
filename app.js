'use strict';

// Définitions pour l'ampoule LIFX
var LifxClient = require('node-lifx').Client;
var client = new LifxClient();
var etatLampe = 0;

// Définitions pour le port série
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var port = "/dev/ttyACM0";
var sp = new SerialPort(port, {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});

// Evénements pour l'ampoule LIFX
client.on('light-new', onLightNew);
// node-lifx est capable de découvrir les ampoules présentes sur le réseau:
//client.init();
// Mais ceci n'étant pas fiable à 100%, un peu d'aide ne fait pas de mal...
client.init({lights:  ['192.168.1.14']});
 
// Callback pour l'ampoule LIFX: fonction appelée lorsqu'une ampoule est découverte
function onLightNew(light) {
    light.getState(function(err, info) {
        if (err) {
            console.log(err);
        }
	    // Affichage d'informations sur l'ampoule
        console.log('Label: ' + info.label);
        console.log('Power:', (info.power === 1) ? 'on' : 'off');
        console.log('Color:', info.color, '\n');
        
        // Evénements pour le port série
        // Définis uniquement si l'ampoule qui nous intéresse existe
        if (info.label == "AmpouleBureau") {
            sp.on('data', onData);
            sp.on('error', onError);
        }
    });
    
}

// Callbacks pour le port série
// Allumage / extinction en fonction de la luminosité
function onData(data) {
    console.log("Luminosite: " + data)
    if ((data > 200) && (etatLampe === 1)) {
        console.log("Extinction lampe");
        client.light("AmpouleBureau").off();
        etatLampe = 0;
    }
    else if ((data < 150) && (etatLampe === 0)) {
        console.log("Allumage lampe");
        client.light("AmpouleBureau").on();
        etatLampe = 1;
    }
}
 
function onError() {
    console.log("Erreur !");
}


