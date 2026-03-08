const QUARK_COLORS = {
    'up': '#D00',
    'down': '#00D',
    'charm': '#0D0',
    'strange': '#0DD',
    'top': '#DD0',
    'bottom': '#D0D'
}

function setupHTML() {
    let table = ""

    for(let x = 0; x < TABS[1].length; x++) {
        table += `<button id="btn_tab${x}" class="btn_tab" onclick="TABS.choose(${x})">${TABS[1][x].title}</button>`
    }

    Element.setHTML("tabs_div", table)

    table = ""

    for(let x = 0; x < QUARKS.names.length; x++) {
        table +=
        `<div id="${QUARKS.names[x]}_div" class="quark">
            <span class="quark_name">${QUARKS.capNames[x]}</span><br><br>
            <span id="${QUARKS.names[x]}_amount"></span><br>
            <span id="${QUARKS.names[x]}_perSec"></span><br><br>
            <button class="quark_btn" onclick="QUARKS.gain(${x})">Gain + <span id="${QUARKS.names[x]}_gain"></span></button>
        </div>`
    }

    Element.setHTML("quark_table", table)

    table = ""

    for(let x = 0; x < UPGS.upgs.length; x++) {
        let data = UPGS.upgs[x]
        let res = data.res
        let txt = []

        for(let i = 0; i < res.length; i++) {
            txt.push(`<span id="upg${x}cost${i}">X</span><span class="quark_name"> ${QUARKS.capNames[i]}</span>`)
        }

        table +=
        `<div id="upgrade${x}" class="upgrade">
			<div class="desc">
				<h3>${x+1}. ${data.name}</h3><br>
				${data.desc}<br>
				<span id="upgrade${x}_cost">Cost: ${txt.join(", ")}</span>
			</div>
            <button id="upgrade${x}_bought" onclick="UPGS.buy('upgs', ${x})">
				Purchase
			</button>
		</div>`
    }

    Element.setHTML("upgs_table", table)

    table = ""

    for(let x = 0; x < UPGS.hadronUpgs.length; x++) {
        table +=
        `<div id="hadUpgrade${x}" class="hadUpg">
            <span class="hadUpg_name">${UPGS.hadronUpgs[x].name}: <span id="had_amount${x}">X</span></span><br><br>
            <span class="hadUpg_desc">${UPGS.hadronUpgs[x].desc}</span><br><br>
            <button class="hadUpg_btn" onclick="UPGS.buy('hadronUpgs', ${x})">
                Cost: <span id="hadUpg${x}_cost"></span>
            </button>
        </div>`
    }

    Element.setHTML("hadrons_table", table)

    table = ""

    for(let x = 1; x < LEPTONS.names.length; x++) {
        table +=
        `<div id="${LEPTONS.names[x]}_div" class="lepton">
            <span class="lepton_name">${LEPTONS.capNames[x]}</span><br><br>
            <span id="${LEPTONS.names[x]}_amount"></span><br><br>
            <span id="${LEPTONS.names[x]}_perSec"></span><br><br>
            <button class="lepton_btn" onclick="LEPTONS.buy(${x})">Buy (Cost: <span id="lepton${x}_cost">X</span>)</button>
        </div>`
    }

    Element.setHTML("leptons_table", table)

    tmp.el = {}
	let all = document.getElementsByTagName("*")

	for (let i = 0; i < all.length; i++) {
		let x = all[i]
		tmp.el[x.id] = new Element(x.id)
	}
}

function updateTabsHTML() {
    for(let x = 0; x < TABS[1].length; x++) {
        tmp.el["btn_tab"+x].setDisplay(TABS[1][x].unl ? TABS[1][x].unl() : true)
        tmp.el["btn_tab"+x].setClasses({btn_tab: true, choosed: player.tab == x})

        if(tmp.el["tab_div"+x] !== undefined) tmp.el["tab_div"+x].setDisplay(player.tab == x)
    }
}

function updateQuarksHTML() {
    if(player.tab != 0) return

    for(let x = 0; x < QUARKS.names.length; x++) {
        let id = QUARKS.names[x];

        tmp.el[id+"_div"].setDisplay(QUARKS.unls[id]())

        if(QUARKS.unls[id]()) {
            tmp.el[id+"_amount"].setHTML(format(player.quarks[id]) + " " + QUARKS.capNames[x] + " Quarks")
            tmp.el[id+"_amount"].changeStyle("color", QUARK_COLORS[id])

            tmp.el[id+"_perSec"].setHTML("(" + format(-QUARKS.decays[id]()) + " / sec)")
            tmp.el[id+"_perSec"].changeStyle("color", "#F7B05B")

            tmp.el[id+"_gain"].setHTML(format(QUARKS.gains[id]()))
        }
    }
}

function updateUpgradesHTML() {
    if(player.tab != 1) return

    for(let x = 0; x < UPGS.upgs.length; x++) {
        let data = UPGS.upgs[x];

        tmp.el["upgrade"+x].setDisplay(data.unl() || player.upgrades.includes(x))

        if(data.unl() || player.upgrades.includes(x)) {
            let res = data.res

            for(let i = 0; i < res.length; i++) {
                tmp.el["upg"+x+"cost"+i].changeStyle("color", UPGS.canResource(res[i], data.cost()[i]) ? "chartreuse" : "#db1313")

                tmp.el["upg"+x+"cost"+i].setTxt(format(data.cost()[i]))
            }
        }

        if(player.upgrades.includes(x)) {
            tmp.el["upgrade"+x+"_cost"].setDisplay(false)
            tmp.el["upgrade"+x+"_bought"].setTxt("Bought")
            tmp.el["upgrade"+x+"_bought"].changeStyle("color", "chartreuse")
        }
    }
}

function updateHadUpgradesHTML() {
    if(player.tab != 2) return

    tmp.el["hadrons"].setTxt("Hadrons: " + player.hadrons)

    for(let x = 0; x < UPGS.hadronUpgs.length; x++) {
        let data = UPGS.hadronUpgs[x]

        tmp.el["hadUpgrade"+x].setDisplay(data.unl() || UPGS.haveHadron(x).gt(0))

        if(data.unl() || UPGS.haveHadron(x).gt(0)) {
            tmp.el["had_amount"+x].setTxt(player.hadronUpgs[x])

            tmp.el["hadUpg"+x+"_cost"].changeStyle("color", UPGS.canHadrons(data.cost()) ? "chartreuse" : "#db1313")
            tmp.el["hadUpg"+x+"_cost"].setTxt(format(data.cost(), 0))
        }
    }
}

function updateLeptonsHTML() {
    if(player.tab != 3) return

    for(let x = 0; x < LEPTONS.names.length; x++) {
        let id = LEPTONS.names[x]

        tmp.el[id+"_div"].setDisplay(LEPTONS.unls[id]())

        if(LEPTONS.unls[id]()) {
            tmp.el[id+"_amount"].setHTML(format(player.leptons[id]) + " " + LEPTONS.capNames[x] + "s")

            if(x != LEPTONS.names.length) {
                tmp.el[id+"_perSec"].setHTML("(" + format(LEPTONS.gain(LEPTONS.names[x + 1])) + " / sec)")
                tmp.el[id+"_perSec"].changeStyle("color", "#F7B05B")
            }

            if(id != "lepton") {
                tmp.el["lepton"+x+"_cost"].changeStyle("color", LEPTONS.can(player.leptons['lepton'], LEPTONS.cost[id]()) ? "chartreuse" : "#db1313")
                tmp.el["lepton"+x+"_cost"].setTxt(format(LEPTONS.cost[id](), 0))
            }
        }
    }
}

function updateHTML() {
    tmp.el.app.setDisplay(tmp.ready >= 1)

    updateTabsHTML()
    updateQuarksHTML()
    updateUpgradesHTML()
    updateHadUpgradesHTML()
    updateLeptonsHTML()
}
