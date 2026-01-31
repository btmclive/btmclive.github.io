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
// -- colors --
const color_red = "#fb2323";
const color_green = "#2bec64";

function detectWinner(winner) {
    if (winner?.name == "BeasttrollMC") {
        return true
    } else if (winner?.name == undefined) {
        return null
    } else {
        return false
    };
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