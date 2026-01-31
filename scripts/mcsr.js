/* ----- structs
pub struct Final {
    elo: u32,
    today: Today,
    season: Season,
    overall: Overall,
}
pub struct Today {
    matches: u32,
    deaths: u32,
    elo: i32,
    wins: u32,
    draws: u32,
    losses: u32,
    forfeits: u32,
    forfeit_wins: u32,
    slowest: String,
    fastest: String,
    resets: u32,
    avg: String
}
pub struct Season {
    matches: u32,
    deaths: u32,
    elo_peak: u32,
    elo_lowest: u32,
    pb: String,
    forfeits: u32,
    forfeit_wins: u32,
    slowest: String,
    resets: u32,
}
pub struct Overall {
    elo_peak: u32,
    elo_lowest: u32,
    pb: String,
}
pub struct Session {
    matches: u32,
    deaths: u32,
    elo: i32,
    wins: u32,
    draws: u32,
    losses: u32,
    forfeits: u32,
    forfeit_wins: u32,
    slowest: String,
    fastest: String,
    resets: u32,
    avg: String
}
----- */
const UUID = "8a8174eb699a49fcb2299af5eede0992";
const eloRanges = [
    { min: 800, max: 899, name: "Iron 3", short: "I3", class: "rank-iron" },
    { min: 900, max: 999, name: "Gold 1", short: "G1", class: "rank-gold" },
    { min: 1000, max: 1099, name: "Gold 2", short: "G2", class: "rank-gold" },
    { min: 1100, max: 1199, name: "Gold 3", short: "G3", class: "rank-gold" },
    { min: 1200, max: 1299, name: "Emerald 1", short: "Em1", class: "rank-em" },
    { min: 1300, max: 1399, name: "Emerald 2", short: "Em2", class: "rank-em" },
    { min: 1400, max: 1499, name: "Emerald 3", short: "Em3", class: "rank-em" },
    { min: 1500, max: 1599, name: "Diamond 1", short: "D1", class: "rank-dia" },
];
const netherSeeds = [
    { code: "HOUSING", name: "Housing Bastion" },
    { code: "STABLES", name: "Stables Bastion" },
    { code: "TREASURE", name: "Treasure Bastion" },
    { code: "BRIDGE", name: "Bridge Bastion" },
]
const owSeeds = [
    { code: "SHIPWRECK", name: "Shipwreck" },
    { code: "RUINED_PORTAL", name: "Ruined Portal" },
    { code: "BURIED_TREASURE", name: "Buried Treasure" },
    { code: "DESERT_TEMPLE", name: "Desert Temple" },
    { code: "VILLAGE", name: "Village" },
]
const button = document.getElementById("refresh-btn");
// -- colors --
const color_red = "#fb2323";
const color_green = "#2bec64";

// intercept form process
let forms = document.querySelectorAll(".input-form");
forms.forEach(form => {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  })
})
async function fetchLatestStream() {
    try {
        const res = await fetch("https://btmcs-backend.onrender.com/twitch/latest", { cache: "no-cache" });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let stream = await res.text();
        return JSON.parse(stream)[0];
    } catch (e) {
        return "Failed to fetch stream info: " + e;
    }
}
async function fetchDeaths() {
    try {
        const res = await fetch("https://btmcs-backend.onrender.com/mcsr/deaths", { cache: "no-cache"});
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let stream = await res.text();
        return stream;
    } catch (e) {
        return "Failed to fetch deaths: " + e;
    }
}
async function fetchData() {
    try {
        const res = await fetch("https://btmcs-backend.onrender.com/mcsr/data", { cache: "no-cache" });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let stream = await res.text();
        return stream;
    } catch (e) {
        if (e == "HTTP 500") {
            document.getElementById("error").innerHTML = `${e}, probably panicked.`;
        } else {
            document.getElementById("error").innerHTML = e
        }
        setTimeout(() => { if (document.hidden()) { window.location.reload(); } }, 5000);
        return "Failed to fetch elo: " + e;
    }
}
async function fetchSession(time) {
    try {
        const res = await fetch(`https://btmcs-backend.onrender.com/mcsr/session/${time}`, { cache: "no-cache" });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let stream = await res.text();
        return stream;
    } catch (e) {
        if (e == "HTTP 500") {
            document.getElementById("error").innerHTML = `${e}, probably panicked.`;
        } else {
            document.getElementById("error").innerHTML = e
        }
        setTimeout(() => { if (document.hidden()) { window.location.reload(); } }, 5000);
        return "Failed to fetch elo: " + e;
    }
}
async function showInfo() {
    button.setAttribute('disabled', '');
    button.classList.add("disabled");
    const data = JSON.parse(await fetchData());
    const r = getRank(data.elo);
    let elo_today;
    if (data.today.elo > 0) {
        elo_today = `+${data.today.elo}`;
        document.getElementById("net-elo").style.color = "green";
    } else {
        elo_today = data.today.elo;
        document.getElementById("net-elo").style.color = "#e32c2c";
    }
    // -- quick -- //
    document.getElementById("rank-display").innerHTML = `${r.name}`;
    document.getElementById("rank-display").classList = `${r.class} force-large`
    document.getElementById("elo-display").innerHTML = `<span class="${r.class}">${data.elo}</span> elo | ${elo_today} elo today`;
    document.getElementById("death-display").innerHTML = `${data.season.deaths} deaths in ${data.season.matches} matches`;
    document.getElementById("daily-display").innerHTML = `${data.today.deaths} deaths in ${data.today.matches} matches today`;
    document.getElementById("ratio-display").innerHTML = `Death to match ratio: ${(Number.parseFloat(data.season.deaths / data.season.matches).toFixed(4)*100).toFixed(2)}% this season | ${(Number.parseFloat(data.today.deaths / data.today.matches).toFixed(4)*100).toFixed(2)}% today`;
    
    // -- today -- //
    document.getElementById("WLD-today").innerHTML = `
    <span style="color: #20b920">${data.today.wins}W</span> 
    | <span style="color: #ea1212">${data.today.losses}L</span> 
    | <span style="color: #60a5fa">${data.today.draws}D</span>
    | ${data.today.forfeits}FFs`;
    document.getElementById("net-elo").innerHTML = `${elo_today} elo`;
    document.getElementById("ff-wins-today").innerHTML = `${data.today.forfeit_wins} wins by forfeits`;
    document.getElementById("fastest-today").innerHTML = `PB: ${data.today.fastest}`;
    document.getElementById("slowest-today").innerHTML = `Slowest time: ${data.today.slowest}`;
    document.getElementById("avg-today").innerHTML = `Average time: ${data.today.avg}`;
    document.getElementById("resets-today").innerHTML = `${data.today.resets} Resets`;
    // -- season -- //
    document.getElementById("peak-elo-season").innerHTML = `Peak elo: <span class="${getRank(data.season.elo_peak).class}">${data.season.elo_peak} (${getRank(data.season.elo_peak).short})</span>`;
    document.getElementById("lowest-elo-season").innerHTML = `Lowest elo: <span class="${getRank(data.season.elo_lowest).class}">${data.season.elo_lowest} (${getRank(data.season.elo_lowest).short})</span>`;
    document.getElementById("pb-season").innerHTML = `PB: ${data.season.pb}`;
    document.getElementById("slowest-season").innerHTML = `Slowest time: ${data.season.slowest}`;
    document.getElementById("forfeits-season").innerHTML = `Forfeits: ${data.season.forfeits}`;
    document.getElementById("ff-wins-season").innerHTML = `${data.season.forfeit_wins} wins by forfeits`;
    document.getElementById("resets-season").innerHTML = `${data.season.resets} Resets`;
    // -- overall -- //
    document.getElementById("pb-overall").innerHTML = `PB: ${data.overall.pb}`;
    document.getElementById("peak-elo-overall").innerHTML = `Peak elo: <span class="${getRank(data.overall.elo_peak).class}">${data.overall.elo_peak} (${getRank(data.overall.elo_peak).short})</span>`;
    document.getElementById("lowest-elo-overall").innerHTML = `Lowest elo: <span class="${getRank(data.overall.elo_lowest).class}">${data.overall.elo_lowest} (${getRank(data.overall.elo_lowest).short})</span>`;
    
    button.removeAttribute('disabled');
    button.classList.remove("disabled");
    createNotif("Updated", 1700)
}
function getRank(elo) {
    for (const range of eloRanges) {
        if (elo >= range.min && elo <= range.max) {
            return { name: range.name, class: range.class, short: range.short };
        }
    }
    return "idk what rank"
}
function getTime() {
    const pst = new Date('1970-01-01T08:00:00Z');
    document.getElementById("utc-time").innerHTML += ` (${pst.toLocaleTimeString()})`;
}

async function showSession() {
    const latest_stream = await fetchLatestStream();
    const time_session_start = new Date(latest_stream.created_at);
    const session = JSON.parse(await fetchSession(time_session_start.valueOf() / 1000));
    
    let elo_session;
    if (session.elo > 0) {
        elo_session = `+${session.elo}`;
        document.getElementById("net-elo-session").style.color = "green";
    } else {
        elo_session = session.elo;
        document.getElementById("net-elo-session").style.color = "#e32c2c";
    }
    // -- session -- //
    document.getElementById("session-start").innerHTML = `Session started @ ${time_session_start.toLocaleTimeString()}`;
    document.getElementById("WLD-session").innerHTML = `
    <span style="color: #20b920">${session.wins}W</span> 
    | <span style="color: #ea1212">${session.losses}L</span> 
    | <span style="color: #60a5fa">${session.draws}D</span>
    | ${session.forfeits}FFs`;
    document.getElementById("net-elo-session").innerHTML = `${elo_session} elo`;
    document.getElementById("ff-wins-session").innerHTML = `${session.forfeit_wins} wins by forfeits`;
    document.getElementById("fastest-session").innerHTML = `PB: ${session.fastest}`;
    document.getElementById("slowest-session").innerHTML = `Slowest time: ${session.slowest}`;
    document.getElementById("avg-session").innerHTML = `Average time: ${session.avg}`;
    document.getElementById("resets-session").innerHTML = `${session.resets} Resets`;
    document.getElementById("deaths-session").innerHTML = `${session.deaths} deaths in ${session.matches} matches (${(Number.parseFloat(session.deaths / session.matches).toFixed(4)*100).toFixed(2)}%)`;
}

async function getVsData(player) {
    fetch(`https://mcsrranked.com/api/users/beasttrollmc/versus/${player}/matches`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("vs-info").innerHTML = "";
            document.getElementById("mcsr-vs-err").innerHTML = "";
            if (data.data.length === 0) throw new Error("No matches found.");
            data.data.forEach(async entry => {
                await createVsEntries(entry);
            })
            createCollapse()
        })
        .catch(error => {
            document.getElementById("mcsr-vs-err").innerHTML = error;
            console.error("Error getting matches: ", error);
        });
}

async function createVsEntries(entry) {
    const con = document.getElementById("vs-info");
    let players = [];

    const div_card = document.createElement("div");
        div_card.classList.add("mcsr-card-match");
    const div_main = document.createElement("div");
        div_main.classList.add("mcsr-cm-main");
    const div_expand = document.createElement("div");
        div_expand.classList.add("expand-content");
    
    entry.players.forEach(e => {
        players.push({ "name": e.nickname , "uuid": e.uuid, "elo": e.eloRate });
    })
    
    // --- main --- ///
    // winner
    const div_opp = document.createElement("div");
    div_opp.classList.add("mcsr-opp");

    const winner = players.find((e) => e.uuid == entry.result.uuid ?? "draw");
    const opp = players.find((e) => e.name !== "BeasttrollMC").name;
    const el_opp = document.createElement('p');
        el_opp.innerHTML = opp
    const div_result = document.createElement("div");
    const el_result = document.createElement('p');
    const result = detectWinner(winner);
        el_result.innerHTML = result == null ? "Draw" : (result ? "Won" : "Lost");
        el_result.style.color = result == null ? "#86d3df" : (result ? color_green : color_red);
    // elo gain
    const div_elo_gain = document.createElement("div");
    const el_elo_gain = document.createElement('p');
    // result time
    const div_time = document.createElement("div");
    const el_time = document.createElement('p');
        el_time.innerHTML = formatMS(entry.result.time);
        el_time.style.color = result ? "" : "gray";
    // match date
    const date = new Date(entry.date * 1000);
    const div_date = document.createElement("div");
        div_date.classList.add("mcsr-date")
    const el_date = document.createElement('p');
        el_date.innerHTML = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    // match id
    const div_id = document.createElement("div");
    const el_id = document.createElement('a');
        el_id.innerHTML = entry.id;
        el_id.href = `https://mcsrranked.com/stats/beasttrollmc/${entry.id}`
        el_id.target = "_blank";
        el_id.style.textAlign = "right";
    // --- //

    // --- expanded --- //
    // seed type
    const div_seed = document.createElement("div");
    const el_seed_header = document.createElement('h3');
        el_seed_header.innerHTML = "Seed Type";

    const el_ow_seed = document.createElement('p');
    const el_neth_seed = document.createElement('p');
    el_ow_seed.innerHTML = owSeeds.find((e) => e.code == entry.seed.overworld).name;
    el_neth_seed.innerHTML = netherSeeds.find((e) => e.code == entry.seed.nether).name;

    // elo
    const div_elo_main = document.createElement("div");
    const div_elo_info = document.createElement("div");
    const div_elo_players = document.createElement("div");
    const div_elo_changes = document.createElement("div");
    const el_elo_header = document.createElement("h3");
        el_elo_header.innerHTML = "Elo Changes";
        div_elo_info.append(div_elo_players, div_elo_changes);
        div_elo_main.append(el_elo_header, div_elo_info);
    entry.changes.forEach((e) => {
        if (e.uuid == UUID) {
            el_elo_gain.innerHTML = e.change > 0 ? `+${e.change} elo` : `${e.change} elo`;
            el_elo_gain.style.color = (e.change < 3 && e.change > -3) ? "gray" : (e.change < -3 ? color_red : color_green);
        }
        const el_elo = document.createElement('p');
        const el_elo_players = document.createElement('p');
        div_elo_players.appendChild(el_elo_players);
        div_elo_changes.appendChild(el_elo);
            el_elo_players.innerHTML = players.find((p) => p.uuid == e.uuid).name;
            el_elo_players.style.fontWeight = "bold";
            el_elo.innerHTML = `${e.eloRate} → ${e.eloRate + e.change}`;
            el_elo.style.color = (e.change < 3 && e.change > -3) ? "gray" : (e.change < -3 ? color_red : color_green);
    })
    div_elo_info.style.display = "flex"; div_elo_info.style.gap = "1em";
    div_elo_players.style.display = "flex"; div_elo_players.style.flexDirection = "column"; div_elo_players.style.textAlign = "left";
    div_elo_changes.style.display = "flex"; div_elo_changes.style.flexDirection = "column"; div_elo_changes.style.alignContent = "center";

    // --- //
    
    // append
    div_opp.appendChild(el_opp);
    div_result.appendChild(el_result);
    div_elo_gain.appendChild(el_elo_gain);
    div_time.appendChild(el_time);
    div_date.appendChild(el_date);
    div_id.appendChild(el_id);
    div_seed.append(el_seed_header, el_ow_seed, el_neth_seed);
    div_expand.append(div_seed, div_elo_main);
    div_main.append(div_opp, div_result, div_elo_gain, div_time, div_date, div_id);
    div_card.append(div_main, div_expand);
    con.appendChild(div_card);
}
function createCollapse() {
    const coll = document.getElementsByClassName("mcsr-card-match");
    Array.from(coll).forEach(e => {
        e.addEventListener("click", function (ev) {
            if (ev.target.closest(".expand-content")) return
            const card = ev.target.closest(".mcsr-card-match");
            card.classList.toggle("expanded");
            if (card.classList.contains("expanded")) {
                card.querySelector(".expand-content").style.display = "flex";
                card.style.cursor = "zoom-out"
            } else {
                card.style.cursor = "zoom-in"
                setTimeout(() => {
                        card.querySelector(".expand-content").style.display = "none";
                }, 250);
            }
        })
    })
}
function formatMS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
}
function detectWinner(winner) {
    if (winner?.name == "BeasttrollMC") {
        return true
    } else if (winner?.name == undefined) {
        return null
    } else {
        return false
    };
}

document.querySelector("#vs-search #submit").addEventListener("click", async function (ev) {
    const inputs = ev.target.closest(".input-form").elements;
    if (inputs["user"].value == "") return
    await getVsData(inputs["user"].value);
})
document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q !== null) {
        const el = document.getElementById("vs-search-input");
        const inputs = document.getElementById("vs-search-form").elements;
        if (el) el.value = q;
        await getVsData(inputs["user"].value);
    }
})
document.addEventListener("DOMContentLoaded", showInfo());
document.addEventListener("DOMContentLoaded", showSession());
document.addEventListener("DOMContentLoaded", getTime());
button.addEventListener("click", showInfo);
setInterval(() => {
    showInfo();
}, (1000 * 60 * 2.5));

