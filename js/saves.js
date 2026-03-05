function E(x) { return new Decimal(x) };

function calc(dt) {
    for(let x = 0; x < QUARKS.names.length; x++) {
        let id = QUARKS.names[x]

        if(QUARKS.unls[id]()) {
            player.quarks[id] = player.quarks[id].sub(QUARKS.decay(id).mul(dt))

            if(player.quarks[id] < 0) player.quarks[id] = E(0)
        }
    }

    tmp.ready += dt
}

function getPlayerData() {
    let data = {
        tab: 0,
        age: "quark",
        quarks: {},
        upgrades: [],
        hadrons: E(0),
        totalHadrons: E(0),
        hadronUpgs: {}
    }

    for(let x = 0; x < QUARKS.names.length; x++) { data.quarks[QUARKS.names[x]] = E(0) }

    return data
}

function wipe() {
    player = getPlayerData();
}

function hardReset() {
    wipe()
    save()
    setupHTML()
    updateHTML()
}

function loadPlayer(load) {
    player = Object.assign(getPlayerData(), load)
    convertStringToDecimal()

    player.tab = 0
}

function convertStringToDecimal() {
    for(let x = 0; x < QUARKS.names.length; x++) {
        player.quarks[QUARKS.names[x]] = E(player.quarks[QUARKS.names[x]])
    }

    player.hadrons = E(player.hadrons)
    player.totalHadrons = E(player.totalHadrons)
}

function save() {
    if (localStorage.getItem("quarksSave") == '') wipe()

    localStorage.setItem("quarksSave", btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function loadGame() {
    wipe()
    load(localStorage.getItem("quarksSave"))

    setupHTML()
    updateHTML()

    setInterval(save,1000)
}
