const app = require("express")();
const { createHash } = require("crypto");
require("dotenv").config();

const util = require("util");
const dns = require("dns");
const lookup = util.promisify(dns.lookup);

const PORT = 8080;

var mqtt = require("mqtt");
var cors = require("cors");

async function HostnameToIp(hostname) {
  let result = await lookup(hostname);
  console.log(result);
  return result.address;
}

var options = {
  host: "21a62d44d56a4ded8e53696c6ee7025a.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "CRBapp",
  password: process.env.PASSWORD,
};

// initialize the MQTT client
var client = mqtt.connect(options);

app.listen(PORT, () => console.log("inizio ora"));

app.use(
  cors({
    origin: "*",
  })
);

app.set("trust proxy", true);

app.get("/api/status", (req, res) => {
  if (req.ip == HostnameToIp("ovh.snortattack.org")) {
    res.status(200).send({
      api: "on",
      mouse: "micky",
      ip: req.ip,
    });
  }else{
    res.status(401).send({
      ip: req.ip,
      message: "non credo che tu sia autorizzato (⌐■_■)",
      errore: "🔴",
    });
  }
});

app.get("/api/mqtt/:id/:message/:apikiwi", (req, res) => {
  const { id } = req.params;
  const { message } = req.params;
  const { apikiwi } = req.params;

  if (apikiwi === process.env.APIKEY) {
    client.publish(id, message, function (error) {
      if (error) {
        console.log(error);
      } else {
        res.status(200).send({
          channel: createHash("sha256").update(id).digest("hex"),
          message: createHash("sha256").update(message).digest("hex"),
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
