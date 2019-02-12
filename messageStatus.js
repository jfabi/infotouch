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
            timeSinceTweetText = Math.round(secondsSinceTweet / 60 / 60 / 24) + ' days ago'
        } else if (secondsSinceTweet > 60 * 60) {
            timeSinceTweetText = Math.round(secondsSinceTweet / 60 / 60) + ' hours ago'
        } else if (secondsSinceTweet > 60) {
            timeSinceTweetText = Math.round(secondsSinceTweet / 60) + ' minutes ago'
        } else {
            timeSinceTweetText = secondsSinceTweet + ' seconds ago'
        }
    }
    
    if ((lastDisplayId != displayId || lastDisplayText != displayText) && displayText != '') {
        console.log('UPDATE IN DISPLAY TEXT !!!')
        console.log(displayId)
        console.log(displayText)
        lastDisplayId = displayId;
        lastDisplayText = displayText;

        textSize = '32px';
        textColor = textColorLookup[displayId];
        backgroundColor = backgroundColorLookup[displayId];
        borderRadius = '2rem';

        displayText = "Ur attentn! Plzz just wn to wind it okay how abootu we just sit and tal awhillz hmm?";

        if (displayText.length < 11) {
            textSize = '121px';
            borderRadius = '8rem';
        } else if (displayText.length < 17) {
            textSize = '96px';
            borderRadius = '8rem';
        } else if (displayText.length < 25) {
            textSize = '84px';
            borderRadius = '4rem';
        } else if (displayText.length < 40) {
            textSize = '74px';
            borderRadius = '4rem';
        } else if (displayText.length < 70) {
            textSize = '60px';
            borderRadius = '4rem';
        } else if (displayText.length < 140) {
            textSize = '40px';
            borderRadius = '3rem';
        }

        htmlForMessageStatus = '';
        htmlForMessageStatus += '<div class="message-status message-container" style="color: ' + textColor;
        htmlForMessageStatus += '; background-color: ' + backgroundColor + '; font-size: ' + textSize;
        htmlForMessageStatus += '; webkit-border-radius: ' + borderRadius + '; border-radius: ' + borderRadius;
        htmlForMessageStatus += ';">' + displayText;
        htmlForMessageStatus += '</div>';
        
        if (document.getElementById('message-status') == null) {
            $('#main').append('<div id="message-status" class="normal-colors"><span id="message-status-body"></span><span id="message-status-ago"></span></div>');
            document.getElementById('message-status-body').innerHTML = htmlForMessageStatus;
            $('.rotation-group').slick('slickAdd', '#message-status');
        } else {
            document.getElementById('message-status-body').innerHTML = htmlForMessageStatus;
        }

        htmlForMessageAgo = '';
        htmlForMessageAgo = '<h4 class="message-last-updated">' + timeSinceTweetText;
        htmlForMessageAgo += '</h4>';

        document.getElementById('message-status-ago').innerHTML = htmlForMessageAgo;
    } else {
        htmlForMessageAgo = '';
        htmlForMessageAgo = '<h4 class="message-last-updated">' + timeSinceTweetText;
        htmlForMessageAgo += '</h4>';

        if (document.getElementById('message-status') == null) {
            $('#main').append('<div id="message-status"><span id="message-status-body"></span><span id="message-status-ago"></span></div>');
            document.getElementById('message-status-ago').innerHTML = htmlForMessageAgo;
        } else {
            document.getElementById('message-status-ago').innerHTML = htmlForMessageAgo;
        }
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
setInterval(twitterGetLatestStatuses,115000);
