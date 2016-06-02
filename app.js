https = require('https');

//This fecth an entire list to store somewhere where the server internally checks the match
//Callback take 2 arguments: userlist, lastTimestamp
function getWholeList(name, callback){
    var request = 0;
    var userlist = [];
    var lastTimestamp;

    function loopcall(data){
        request += 1;
        console.log(request + "/" + Math.floor((data._total/100)+1));
        //Since the order is DESC, the first request is the last followers
        if(userlist.length == 0){
            lastTimestamp = Date.parse(data.follows[0].created_at);
        }

        if(data.follows.length != 0){
            data.follows.forEach(function(item){
                userlist.push(item.user.name);
            });
            _channelFollows(name, data._cursor, loopcall);
        }else {
            callback(userlist, lastTimestamp);
        }
    }
    _channelFollows(name, 0, loopcall);
}

//Request to do every X minutes to get all the new subscribers since the last check (untilTimestamp)
//Get all the new subs until a specific timestamp (which should be time of last subscriber from last check)
function getNewFollowers(name, untilTimestamp, callback){
    var request = 0;
    var userlist = [];
    var lastTimestamp;
    var finished = false;

    function loopcall(data){
        request += 1;
        console.log(request);
        //Since the order is DESC, the first request is the last followers
        if(userlist.length == 0){
            lastTimestamp = Date.parse(data.follows[0].created_at);
        }

        if(data.follows.length != 0){
            data.follows.forEach(function(item){
                if(Date.parse(item.created_at) <= untilTimestamp){
                    finished = true;
                } else {
                    userlist.push(item.user.name);
                }
            })
        } else {
            finished = true;
        }
        if(!finished){
            _channelFollows(name, data._cursor, loopcall);
        }else {
            callback(userlist, lastTimestamp);
        }
    }
    _channelFollows(name, 0, loopcall);
}

//Wrap the rest request into this easy to use function
function _channelFollows(name, cursor, callback){
    if(cursor == 0){
        var endpoint = 'https://api.twitch.tv/kraken/channels/' + name + '/follows?direction=DESC&limit=100';
    }
    else {
        var endpoint = 'https://api.twitch.tv/kraken/channels/' + name + '/follows?cursor=' + cursor + '&direction=DESC&limit=100';
    }
    var buffer = '';
    https.get(endpoint, (res) => {
        res.on('data', (data) => {
            buffer += data;
        });

        res.on('end', _ => {
            callback(JSON.parse(buffer));
        });
    });
}
