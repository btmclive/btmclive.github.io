/*
pub struct Stream {
    id: String,
    stream_id: Option<String>,
    user_id: String,
    user_login: String,
    user_name: String,
    title: String,
    description: String,
    created_at: String,
    published_at: String,
    url: String,
    thumbnail_url: String,
    viewable: String,
    view_count: u64,
    language: String,
    #[serde[rename = "type"]]
    stream_type: String,
    duration: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    muted_segments: Option<Vec<Pagination>>,
}
*/
// -- Example json structure


/* 
<div class="card">
    <div class="card-content">
        <div class="card-image">
            <img src"{thumbnail}>
        </div>
        <div class="stream-header">
            <h2><a href="https://twitch.tv/btmc">[date]</a></h2>
        </div>
        <div class="stream-info">
        </div>
    </div>
</div>
*/ 
// -- Example card html structure
document.addEventListener("DOMContentLoaded", async function () {
    // load
    fetch('https://btmcs-backend.onrender.com/twitch/latest')
        .then(response => response.json())
        .then(data => {
            data.forEach(async entry => {
                await createCards(entry);
            })
        })
        .catch(error => {
            console.error("Error getting Twitch status: ", error);
        });
})

async function createCards(entry) {
    const container = document.getElementsByClassName("cards-container")[0];
    
    const card = document.createElement('div');
        card.classList.add('card');
    
    const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');
    
    // card thumbnail
    const cardImgLink = document.createElement('a');
    const cardImage = document.createElement('div');
        cardImage.classList.add('card-image');
        const cardDuration = document.createElement('p');
        cardDuration.classList.add("card-duration");
        cardImgLink.appendChild(cardImage);
        cardImgLink.appendChild(cardDuration);
        cardContent.appendChild(cardImgLink);

    const cardTitle = document.createElement('div');
        cardTitle.classList.add('card-title');

    const cardTitleText = document.createElement('a');
        cardContent.appendChild(cardTitle);
        cardTitle.appendChild(cardTitleText);
        cardTitleText.innerHTML = "Loading..";
    
    // card desc
    const cardDesc = document.createElement('div');
        cardDesc.classList.add('card-desc');
    const el_date = document.createElement('p');
    const el_games = document.createElement('p');
    // const el_duration = document.createElement('p');
    // const el_start = document.createElement('p');
    const el_end = document.createElement('p');

    // append text content
    cardContent.appendChild(cardDesc);

    // append card-content to card
    card.appendChild(cardContent);
    
    // append card to cards-container
    container.appendChild(card);

    let chapters = await getChapters(entry.id);
    if (!Array.isArray(chapters) || chapters.length === 0) {
        const game = await getGame(entry.id);
        chapters = game;
    }
   
    const seen = new Set();
    let games = [];
    if (Array.isArray(chapters)) {
        for (const e of chapters) {
            const name = e && (typeof e === 'string' ? e : e.game);
            if (!name) continue;
            const key = name.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                games.push(name);
            }
        }
        games = games.join(', ');
    } else {
        games = chapters;
    }
    
    // fill in info
    const thumbnail = entry.thumbnail_url.replace("%{width}", "426").replace("%{height}", "240")
    const date = new Date(entry.created_at);
    const timestamp_start = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const endtime_fmt = new Date(date.getTime() + stringToSecs(entry.duration) * 1000);
    const timestamp_end = `${endtime_fmt.toLocaleDateString()} ${endtime_fmt.toLocaleTimeString()}`;
    const tz = new Date().toLocaleDateString(undefined, { day: '2-digit', timeZoneName: 'long' }).substring(4).match(/\b(\w)/g).join('');
    
    cardTitleText.innerHTML = `${entry.title}`;
    cardTitleText.href = entry.url;
    cardImage.innerHTML = `<img src="${thumbnail}" alt="thumbnail" loading="lazy">`;
    cardDuration.innerHTML = entry.duration;
    cardImgLink.href = entry.url;
    el_date.innerHTML = `Started: ${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${tz}`;

    el_games.innerHTML = `${games}`;
    // el_start.innerHTML = `Started: ${timestamp_start} ${tz}`;
    el_end.innerHTML = `Ended: ${timestamp_end} ${tz}`;
    cardDesc.append(el_date, el_end, games);
}

// https://github.com/GigaFyde/twitch-vod-chapters/blob/master/handler.js
async function getChapters(vodId) {
    const response = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        body: `[{"operationName":"VideoPlayer_ChapterSelectButtonVideo","variables\":{"includePrivate":false,"videoID":"${vodId}" },"extensions":{"persistedQuery":{"version":1,"sha256Hash":"71835d5ef425e154bf282453a926d99b328cdc5e32f36d3a209d0f4778b41203"}}}]`
        , headers: {
            "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
        }});
    const data = await response.json();
    let result = [];
    let edge = data[0].data.video["moments"].edges
    for (let i = 0; i < edge.length; i++) {
        result.push({ 'game': edge[i].node.details.game.displayName });
    }
    return result
}

async function getGame(vodId) {
    const response = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        body: `[{"operationName":"ContentClassificationContext","variables\":{"clipSlug":"","isClip":false,"isStream":false,"isVOD":true,"vodID":"${vodId}" },"extensions":{"persistedQuery":{"version":1,"sha256Hash":"57bb6c1aca3631b2b3e74b1c3c8adbecbbcc3becb70ec52d7c5ef0f90d7c3b02"}}}]`
        , headers: {
            "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko"
        }});
    const data = await response.json();
    const gameName = data[0]?.data?.video?.game?.name;
    if (gameName) return gameName
}
function stringToSecs(str) {
    const regex = /(\d+)([hms])/g;
    let secs = 0;
    while ((array = regex.exec(str)) !== null) {
        const v = parseInt(array[1]);
        const time = array[2];

        if (time == "h") {
            secs += 3600 * v;
        } else if (time == "m") {
            secs += 60 * v;
        } else {
            secs += v
        }
    }
    return secs
}