const axios = require("axios")
const rax = require('retry-axios')
var inquirer = require('inquirer');

const config = require("./config.json")

let token = config.token;
//let guildid = config.guildid;

var guildroles = [];

var guildchannels = [];
//var guildfeatures = [];

var newschannels = [];

var webinterval = 2000;

var messages = []

var channelids = [];

var webhooks = [];

var oldchannelids = [];

var webid = [];


axios.defaults.baseURL = 'https://discord.com/api/v8';

async function checktoken() {

    await new Promise(async function(resolve, reject) {

        await axios(`/users/@me`, {
                method: 'GET',
                headers: {
                    "Authorization": "Bot " + token,
                    "Content-Type": "application/json",
                },

                raxConfig: {
                    retry: 5,
                    onRetryAttempt: err => {
                        const cfg = rax.getConfig(err);
                        console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                    }
                }
            })
            .then(resp => {
                global.mainhead = {
                    "Authorization": 'Bot ' + token,
                    "Content-Type": "application/json"
                }
                global.secondhead = {
                    'Authorization': 'Bot ' + token
                }

                resolve()
            })
            .catch(async function(e) {

                await axios(`/users/@me`, {
                        method: 'GET',
                        headers: {
                            "Authorization": token,
                            "Content-Type": "application/json",
                        },

                        raxConfig: {
                            retry: 5,
                            onRetryAttempt: err => {
                                const cfg = rax.getConfig(err);
                                console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                            }
                        }
                    })
                    .then(resp => {

                        global.mainhead = {
                            "Authorization": token,
                            "Content-Type": "application/json"
                        };
                        global.secondhead = {
                            'Authorization': token
                        };

                        resolve()
                    })

                    .catch((e) => {
                        (

                            console.log("Error verifying token info"))
                        resolve();
                    })

            })

    })
}

async function getguild() {

    await axios(`/guilds/${guildid}`, {
            method: 'GET',
            headers: mainhead,
        })
        .then(async function(resp) {
        //    console.log(resp.data)
console.log("successfully fetched guild")
            if (resp.data.icon !== null) {
                await axios.get(`https://cdn.discordapp.com/icons/${resp.data.id}/${resp.data.icon}.png?size=4096`, {
                        responseType: 'arraybuffer'
                    })
                    .then(response => {

                        Buffer.from(response.data, 'binary').toString('base64')
                        //console.log(Buffer.from(response.data, 'binary').toString('base64'))
                        global.guildicon = "data:image/png;base64," + Buffer.from(response.data, 'binary').toString('base64')

                    })
            } else {
                global.guildicon = null;
            }

            global.copiedguildid = resp.data.id

            global.guildfeatures = resp.data.features

            global.guildname = resp.data.name
            global.guildexplicit = resp.data.explicit_content_filter
            global.guildnotifications = resp.data.default_message_notifications
            global.guildverification = resp.data.verification_level
            global.afkid = resp.data.afk_channel_id
            global.afktime = resp.data.afk_timeout
            global.systemid = resp.data.system_channel_id
            global.guildregion = resp.data.region
            global.guildrules = resp.data.rules_channel_id
            global.guildpublic = resp.data.public_updates_channel_id

        })

        .catch((e) => {
            console.log("error getting guild" + e)
        })

}

async function getroles() {

    await axios(`/guilds/${guildid}/roles`, {
            method: 'GET',
            headers: mainhead,
        })
        .then(async function(resp) {
        	console.log("successfully fetched roles")
            //console.log(resp.data)
            resp.data.map(async function(role) {
              //  console.log(role.name)

                guildroles.push({
                    "name": role.name,
                    "permissions": role.permissions,
                    "id": role.id,
                    "position": role.position,
                    "color": role.color,
                    "hoist": role.hoist,
                    "mentionable": role.mentionable
                })
                //guildroles.sort((a, b) => (a.position > b.position) ? 1 : -1)
            })
            guildroles.sort((a, b) => (a.position > b.position) ? 1 : -1)
        })
        .catch((e) => {
            console.log("error getting roles" + e)
        })

}

async function getchannels() {

    await axios(`/guilds/${guildid}/channels`, {
            method: 'GET',
            headers: mainhead,
        })
        .then(async function(resp) {
console.log("successfully fetched channels")
            resp.data.map(async function(channel) {
          //      console.log(channel)
          

                if (channel.type == 4) {
                    guildchannels.push({
                        "name": channel.name,
                        "type": channel.type,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "permission_overwrites": channel.permission_overwrites,
                        "nsfw": channel.nsfw,
                        "pos": channel.position
                    })
                } else if (channel.type == 0) {
                    guildchannels.push({
                        "name": channel.name,
                        "type": channel.type,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "permission_overwrites": channel.permission_overwrites,
                        "topic": channel.topic,
                        "nsfw": channel.nsfw,
                        "rate_limit_per_user": channel.rate_limit_per_user,
                        "po": channel.position
                    })
                } else if (channel.type == 2) {
                    guildchannels.push({
                        "name": channel.name,
                        "type": channel.type,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "permission_overwrites": channel.permission_overwrites,
                        "topic": channel.topic,
                        "nsfw": channel.nsfw,
                        "bitrate": channel.bitrate,
                        "user_limit": channel.user_limit,
                        "po": channel.position
                    })
                } else if (channel.type == 5) {
                    //console.log(channel)
                    guildchannels.push({
                        "name": channel.name,
                        "type": 0,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "permission_overwrites": channel.permission_overwrites,
                        "topic": channel.topic,
                        "nsfw": channel.nsfw,
                        "po": channel.position
                    })
                    newschannels.push({
                        "name": channel.name,
                        "type": channel.type,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "po": channel.position
                    })
                }

            })

            guildchannels.sort((a, b) => (a.parent_id > b.parent_id) ? 1 : -1)
            guildchannels.sort((a, b) => (a.pos < b.pos) ? 1 : -1)
            guildchannels.sort((a, b) => (a.po > b.po) ? 1 : -1)

            //console.log(guildchannels)
        })
        .catch((e) => {
            console.log("error getting channels" + e)
        })

}

async function createguild() {

    let interceptorId = rax.attach();

    await axios(`guilds`, {
            method: 'POST',
            headers: secondhead,
            raxConfig: {
                retry: 5,
                onRetryAttempt: err => {
                    const cfg = rax.getConfig(err);
                    console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                }
            },
            data: {
                "name": guildname,
                "icon": guildicon,
                "roles": guildroles,
                "channels": guildchannels,
                "region": guildregion,
                "verification_level": guildverification,
                "default_message_notifications": guildnotifications,
                "explicit_content_filter": guildexplicit,
                "afk_channel_id": afkid,
                "afk_timeout": afktime,
                "system_channel_id": systemid
            }
        })
        .then(async function(resp) {
        	console.log("created guild")
            //         console.log(resp.data)
            global.newguildid = resp.data.id
        })
        .catch((e) => {
            console.log("error creating guild " + e)
        })

}

async function addcom() {

    let interceptorId = rax.attach();

    await axios(`guilds/${guildid}`, {
            method: 'PATCH',
            headers: secondhead,
            raxConfig: {
                retry: 5,
                onRetryAttempt: err => {
                    const cfg = rax.getConfig(err);
                    console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                }
            },
            data: {
                "features": guildfeatures,
                "verification_level": guildverification,
                "default_message_notifications": guildnotifications,
                "explicit_content_filter": guildexplicit,
                "rules_channel_id": guildrules,
                //"public_updates_channel_id": 2

            }
        })
        .then(async function(resp) {
            console.log(resp.data)
        })
        .catch((e) => {
            console.log("error adding community " + e)
        })

}

async function create() {

    await checktoken()
    await getguild()
    await getroles()
    await getchannels()
    await createguild()
    //await addcom()
}


async function scrapeoldc() {

    channelids = [];

    await axios(`/guilds/${copiedguildid}/channels`, {
            method: 'GET',
            headers: secondhead,
        })
        .then(channels => {
        	console.log("successfully scraped old channels")
            channels.data.map(channel => {
                if (channel.type == 0 || channel.type == 5) {
                    oldchannelids.push({
                        "name": channel.name,
                        "type": channel.type,
                        "id": channel.id,
                        "parent_id": channel.parent_id,
                        "permission_overwrites": channel.permission_overwrites,
                        "topic": channel.topic,
                        "nsfw": channel.nsfw,
                        "rate_limit_per_user": channel.rate_limit_per_user,
                        "po": channel.position
                    })
                  //console.log(channel.id);
                }

            })

            oldchannelids.sort((a, b) => (a.parent_id > b.parent_id) ? 1 : -1)
            oldchannelids.sort((a, b) => (a.pos < b.pos) ? 1 : -1)
            oldchannelids.sort((a, b) => (a.po > b.po) ? 1 : -1)
        })
    //console.log(oldchannelids)

}

async function scrapec() {

    channelids = [];

    await axios(`/guilds/${newguildid}/channels`, {
            method: 'GET',
            headers: secondhead,
        })
        .then(channels => {
        	console.log("successfully scraped channels")
            channels.data.map(c => {
                if (c.type == 0 || c.type == 5) {
                    channelids.push(c.id);
                    //console.log(c.id);
                }
            })
        })
    //console.log(channelids)

}

async function getmsgs(oldchannelids) {

    messages = [];

    await axios(`/channels/${oldchannelids}/messages?limit=99`, {
            method: 'GET',
            headers: secondhead,
            raxConfig: {
                retry: 5,
                onRetryAttempt: err => {
                    const cfg = rax.getConfig(err);
                    console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                }
            },

        })
        .then(async function(resp) {
           // console.log(resp.data)
console.log("successfully fetched messages")
            resp.data.map(async function(message) {

                if (message.type !== 7 && message.type !== 8 && message.type !== 9 && message.type !== 10 && message.type !== 11) {

                    messages.push({

                        content: message.content,
                        //channel_id: '778656816300425226',

                        username: message.author.username,
                        avatar_url: 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png',

                        file: message.attachments,
                        embeds: message.embeds,
                        mentions: message.mentions,
                        mention_roles: message.mention_roles,
                        pinned: message.pinned,
                        mention_everyone: message.mention_everyone,
                        tts: message.tts,
                        timestamp: message.timestamp,
                        edited_timestamp: message.edited_timestamp,
                        flags: message.flags,
                        type: message.type
                    })

                }

            })

            messages.reverse()

        })

        .catch((e) => {
            console.log("error getting messages" + e)
        })

}

async function createwebhook(channelids) {

    await axios(`/channels/${channelids}/webhooks`, {
            method: 'POST',
            headers: secondhead,
            data: {
                "name": "Replay"
            }
        })

        .then(async function(resp) {
           // console.log(resp.data)
           console.log("successfully created webhook")
        })
        .catch((e) => {
            console.log("error creating webhook" + e)
        })

}

async function getweb(channelids) {

    var webcount = 0;

    webhooks = [];

    await axios(`/channels/${channelids}/webhooks`, {
            method: 'GET',
            headers: mainhead,
        })
        .then(json => {
            //console.log(json.data)
            console.log("successfully fetched webhooks")
            json.data.map(w => {
                webcount++
                //console.log(w.token);
                webhooks.push(`https://discord.com/api/webhooks/${w.id}/` + w.token)
                webid.push(w.id)
            })

            //global.webinterval = 2000;

          //  console.log(webhooks)
        })
        .catch((e) => {
            console.log("error getting webhooks" + e)
        })

}

async function sendmsgs(webhooks) {

    return new Promise((resolve, reject) => {

        if (messages.length == 0) {
            resolve()
        }

        var attempts = 0;

        for (var i = 0; i < messages.length; i++) {

            setTimeout(async function(i) {

                axios(webhooks, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        data: messages[i],
                        raxConfig: {
                            retry: 5,
                            onRetryAttempt: err => {
                                const cfg = rax.getConfig(err);
                                console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                            }
                        },

                    })
                    .then(async function(resp) {
                        console.log(resp.status)
                        attempts++
                        if (attempts >= messages.length) {
                            resolve()
                        }
                    })
                    .catch((e) => {
                        console.log("error sending message" + e)
                        attempts++
                        if (attempts >= messages.length) {
                            resolve()
                        }
                    })

            }, 2000 * i, i);

        }

    })
}

async function deleteweb(webid) {

    await axios(`/webhooks/${webid}`, {
            method: 'DELETE',
            headers: mainhead,
        })
        .then(json => {
         //   console.log(json.data)
            console.log("Successfully Deleted Webhook")
        })
        .catch((e) => {
            console.log("Failed To Delete Webhook")
        })

}

async function copymsgs() {

    await scrapeoldc()
    await scrapec()
    await getmsgs(oldchannelids[2].id)
    await createwebhook(channelids[2])
    await getweb(channelids[2])
    await sendmsgs(webhooks[0])
    await deleteweb(webid[0])

}

async function copy(oldchannelids, channelids, webhooks, webid) {

    await scrapeoldc()
    await scrapec()
    await getmsgs(oldchannelids)
    await createwebhook(channelids)
    await getweb(channelids)
    await sendmsgs(webhooks)
    await deleteweb(webid)

}

async function execute(oldchannelids, channelids, webhooks, webid) {

    for (var i = 0; i < 10; i++) {

        await copy(oldchannelids[i].id, channelids[i], webhooks[0], webid[0])

    }

}

//execute()

async function send() {

    await scrapeoldc()
    await scrapec()

    for (var i = 0; i < channelids.length; i++) {
      //  console.log(i)
 
        await getmsgs(oldchannelids[i].id)
        await createwebhook(channelids[i])
        await getweb(channelids[i])
        await sendmsgs(webhooks[0])
        await deleteweb(webid[i])

    }

}

async function make() {

    await create()
    await send()

}

console.log(`
	
	
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗███████╗
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔════╝
██║     ███████║██████╔╝██║   ██║██╔████╔██║█████╗  
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══╝  
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
                                                    

	
	`)
	
inquirer
  .prompt({
    type: 'input',
    name: 'guild',
    message: "Enter The Guild ID of the Server You Want to Clone",
  })
  .then(async function(answers) {
global.guildid = answers.guild;

make()

})
