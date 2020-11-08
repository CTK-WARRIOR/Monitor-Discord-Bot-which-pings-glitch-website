const { TOKEN, PREFIX } = require("./config.json")


const http = require("http");
const express = require("express");
const app = express();
var server = http.createServer(app);
const fetch = require("node-fetch");
const discord = require("discord.js");
const prefix = PREFIX
const client = new discord.Client();
const fs = require("fs");
const bodyParser = require("body-parser");

app.use(express.static("public"));

app.use(bodyParser.json());

let count = 0;
let invcount = 0;
let user = 0;
let rounds = 0;

setInterval(function() {
  let database = JSON.parse(fs.readFileSync("./link.json", "utf8"));
  count = 0;
  invcount = 0;
  user = database.length;
  rounds++;

  database.forEach(m => {
    m.link.forEach(s => {
      count++;

      fetch(s).catch(err => {
        invcount++;
      });
    });
  });
  console.log("Interval :)")
  client.user.setActivity(`!monitor | Watching ${count} website`);
}, 240000);

app.get("/", async (request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end(
    `Monitoring ${count} websites and ${invcount} Invalid website with ${user} Users, Fetch Number : ${rounds}`
  );
});

const listener = server.listen(2022, function() {
  console.log(`Your app is listening on port ` + listener.address().port);
});

client.on("ready", async () => {
  client.user.setActivity(`!monitor | Watching ${count} website`);
  console.log("Ready To ping Every Single bot");
});

client.on("message", async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(" ");
  const command = args.shift().toLowerCase();
  // the rest of your code

  if (command == "monitor") {
    if (!args[0]) {
      return send("Please give website link to monitor", message, "RED");
    }

    if (!isURL(args[0])) {
      return send(
        "Given Url is invalid, Make sure you send working URL",
        message,
        "RED"
      );
    }

    let database = JSON.parse(fs.readFileSync("./link.json", "utf8"));

    const check = database.find(x => x.id === message.author.id);

    if (check) {
      if (check.link.length === 5) {
        return send(
          "You reached your limit, you can not add more than 5 website.",
          message,
          "YELLOW"
        );
      }

      let numb = database.indexOf(check);
      database[numb].link.push(args[0]);
    } else {
      database.push({
        id: message.author.id,
        name: message.author.username,
        link: [args[0]]
      });
    }

    fs.writeFile("./link.json", JSON.stringify(database, null, 2), err => {
      if (err) console.log(err);
    });

    send("Added Your Website to monitoring", message, "YELLOW");

    message.delete();
  } else if (command === "stats") {
    let data = JSON.parse(fs.readFileSync("./link.json", "utf8"));

    if (!data) return send("Something went wrong...", message, "YELLOW");

    data = data.find(x => x.id === message.author.id);

    if (!data) {
      return send(
        "You do not have any site to monitor, use `!monitor` too add a website",
        message,
        "YELLOW"
      );
    }

    let embed = new discord.MessageEmbed()
      .setAuthor(`You have ${data.link.length} Website`)
      .setColor("GREEN")
      .setDescription(
        `**:white_check_mark: ${data.link.join("\n\n:white_check_mark: ")}**`
      );

    message.reply("Check your Dm :)");
    message.author.send(embed).catch(err => {
      return message.channel.send(
        "Your dms are disabled so, please enable to get stats"
      );
    });
  } else if (command === "remove") {
    let database = JSON.parse(fs.readFileSync("./link.json", "utf8"));
    if (!database) return send("Something went wrong...", message, "YELLOW");

    let data = database.find(x => x.id === message.author.id);

    if (!data) {
      return send(
        "You do not have any site to monitor, use `!monitor` too add a website",
        message,
        "YELLOW"
      );
    }
    let value = database.indexOf(data);
    let array = [];
    database[value].link.forEach((m, i) => {
      array.push(`**[${i + 1}]**: \`${m}\``);
    });

    let embed = new discord.MessageEmbed()
      .setTitle("Send The number of the link to remove")
      .setColor("BLUE")
      .setDescription(array.join("\n"));

    const msg = await message.channel.send(embed);

    let responses = await message.channel.awaitMessages(
      msg => msg.author.id === message.author.id,
      { time: 300000, max: 1 }
    );
    let repMsg = responses.first();

    if (!repMsg) {
      msg.delete();
      return send(
        "Cancelled The Process of deleting monitor website.",
        message,
        "RED"
      );
    }

    if (isNaN(repMsg.content)) {
      msg.delete();
      return send(
        "Cancelled The Process of deleting monitor website due to **invalid digit**",
        message,
        "RED"
      );
    }

    if (!database[value].link[parseInt(repMsg.content) - 1]) {
      msg.delete();
      return send("There is no link exist with this number.", message, "RED");
    }

    if (database[value].link.length === 1) {
      delete database[value];

      var filtered = database.filter(el => {
        return el != null && el != "";
      });

      database = filtered;
    } else {
      delete database[value].link[parseInt(repMsg.content) - 1];

      var filtered = database[value].link.filter(el => {
        return el != null && el != "";
      });

      database[value].link = filtered;
    }

    fs.writeFile("./link.json", JSON.stringify(database, null, 2), err => {
      if (err) console.log(err);
    });

    repMsg.delete();
    msg.delete();

    return send(
      "Removed the website from monitoring, you can check website using `!stats`",
      message,
      "GREEN"
    );
  }
});

client.login(TOKEN);

function isURL(url) {
  if (!url) return false;
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))|" + // OR ip (v4) address
    "localhost" + // OR localhost
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(url);
}

//--------------------------------------------------- F U N C T I O N S ---------------------------------------------

function send(content, message, color) {
  if (!color) color = "GREEN";

  return message.channel.send({
    embed: { description: content, color: color }
  });
}
