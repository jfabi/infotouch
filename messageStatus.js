// Written by Joshua Fabian, jfabi@alum.mit.edu

//  gets latest Twitter tweets

var lastDisplayText = '';
var lastDisplayId = '';
var lastAnnounceText = '';
var lastAnnounceId = '';

var codebird = new Codebird;
codebird.setConsumerKey(twitterConsumerKey, twitterConsumerSecret);
codebird.setToken(twitterAccessToken, twitterAccessSecret);

var backgroundColorLookup = {
    R: 'red', r: 'red',
    G: 'green', g: 'green',
    B: 'blue', b: 'blue',
    N: 'black', n: 'black',
    P: 'purple', p: 'purple',
    T: '#008080', t: '#008080',
    S: '#ff9a00', s: '#ff9a00',
    W: 'white', w: 'white'
};

var textColorLookup = {
    R: 'white', r: 'white',
    G: 'white', g: 'white',
    B: 'white', b: 'white',
    N: 'white', n: 'white',
    P: 'white', p: 'white',
    T: '#white', t: 'white',
    S: 'black', s: 'black',
    W: 'black', w: 'black'
};

var twitterParams = 'screen_name=' + encodeURIComponent('jfabi_info') + '&count=5';
        
var twitterGetLatestStatuses = function twitterGetLatestStatuses() {
    codebird.__call(
        'statuses_userTimeline',
        twitterParams,
        function (reply, rate, err) {
            console.log('OUTPUTS FROM TWITTER !!!!')
            console.log(reply);
            console.log(err);

            var mostRecentDisplayText = '';
            var mostRecentDisplayId = '';
            var mostRecentAnnounceText = '';
            var mostRecentAnnounceId = '';

            for (i = reply.length - 1; i >= 0; i--) {
                if (reply[i]['text'].length > 2) {
                    var id = reply[i]['text'].substr(0,1);
                    var text = reply[i]['text'].substr(2);
                    var announceIdSet = 'xXyYzZ';
                    var secondsSinceTweet = (Date.now() - (new Date(reply[i]['created_at'])).getTime()) / 1000;

                    if (announceIdSet.includes(id)) {
                        mostRecentAnnounceId = id;
                        mostRecentAnnounceText = text;
                    } else {
                        mostRecentDisplayId = id;
                        mostRecentDisplayText = text;
                    }
                }
            }
            twitterStatusUpdate(mostRecentDisplayId,mostRecentDisplayText,mostRecentAnnounceId,mostRecentAnnounceText,secondsSinceTweet);
        }
    );
};

var twitterStatusUpdate = function twitterStatusUpdate(displayId,displayText,announceId,announceText,secondsSinceTweet) {
    timeSinceTweetText = '';

    if (secondsSinceTweet != null && secondsSinceTweet != '') {
        // Time passed initially in seconds
        if (secondsSinceTweet > 60 * 60 * 24) {
            timeSinceTweetText = Math.round(secondsSinceTweet / 60 / 60 / 24) + 'd ago'
        } else if (secondsSinceTweet > 60 * 60) {
            timeSinceTweetText = Math.round(secondsSinceTweet / 60 / 60) + 'h ago'
        } else if (secondsSinceTweet > 60) {
            timeSinceTweetText = Math.round(secondsSinceTweet / 60) + 'm ago'
        } else {
            timeSinceTweetText = secondsSinceTweet + 's ago'
        }
    }
    
    if ((lastDisplayId != displayId || lastDisplayText != displayText) && displayText != '') {
        console.log('UPDATE IN DISPLAY TEXT !!!')
        console.log(displayId)
        console.log(displayText)
        lastDisplayId = displayId;
        lastDisplayText = displayText;

        textColor = textColorLookup[displayId];
        backgroundColor = backgroundColorLookup[displayId];

        htmlForMessageStatus = '';
        htmlForMessageStatus += '<h1 class="message-status" style="color: ' + textColor;
        htmlForMessageStatus += '; background-color: ' + backgroundColor + '">' + displayText;
        htmlForMessageStatus += '</h1>';
        document.getElementById('message-status-body').innerHTML = htmlForMessageStatus;
        htmlForMessageAgo = '';
        htmlForMessageAgo = '<h4 class="message-status" style="color: ' + textColor;
        htmlForMessageAgo += '; background-color: ' + backgroundColor + '">' + timeSinceTweetText;
        htmlForMessageAgo += '</h4>';
        document.getElementById('message-status-ago').innerHTML = htmlForMessageAgo;
    } else {
        htmlForMessageAgo = '';
        htmlForMessageAgo = '<h4 class="message-status" style="color: ' + textColor;
        htmlForMessageAgo += '; background-color: ' + backgroundColor + '">' + timeSinceTweetText;
        htmlForMessageAgo += '</h4>';
        document.getElementById('message-status-ago').innerHTML = htmlForMessageAgo;
    }

    if ((lastAnnounceId != announceId || lastAnnounceText != announceText) && announceText != '') {
        console.log('UPDATE IN ANNOUNCE TEXT !!!')
        console.log(announceId)
        console.log(announceText)
        lastAnnounceId = announceId;
        lastAnnounceText = announceText;

        // Play audio announcement here
    }
};

twitterGetLatestStatuses();
setInterval(twitterGetLatestStatuses,15000);








