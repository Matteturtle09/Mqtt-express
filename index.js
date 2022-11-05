const app = require("express")();
const {createHash} = require("crypto");
require('dotenv').config();

const PORT = 8080;

var mqtt = require('mqtt');
var cors = require('cors');





var options = {
    host: '21a62d44d56a4ded8e53696c6ee7025a.s1.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'CRBapp',
    password: process.env.PASSWORD
}

// initialize the MQTT client
var client = mqtt.connect(options);

app.listen(PORT, () => console.log("inizio ora"));

app.use(cors({
  origin: 'https://crbpwa.netlify.app',
}));

app.set('trust proxy', true);

app.get("/api/status", (req, res) => {
  res.status(200).send({
    api: "on",
    mouse: "micky",
    ip: req.ip,
  });
});



app.get("/api/mqtt/:id/:message/:apikiwi", (req, res) => {
  const { id } = req.params;
  const { message } = req.params;
  const { apikiwi } = req.params;

  if (apikiwi === process.env.APIKEY) {
    client.publish(id, message, function (error) {
      if (error) {
        console.log(error)
      } else {
        res.status(200).send({
          channel: createHash("sha256").update(id).digest('hex'),
          message: createHash("sha256").update(message).digest('hex')
        });
      }
    });
    
    
  } else {
    res.status(401).send({
      channel: id,
      message: message,
      errore: "🔴",
          
    });
    
  }
});
