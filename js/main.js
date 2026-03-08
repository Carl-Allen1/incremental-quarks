var diff = 0
var date = Date.now()
var player
var tmp = {
    nan: 0,
    step: 1,
    ready: 0,
}

const QUARKS = {
    names: ['up', 'down', 'charm', 'strange', 'top', 'bottom'],
    capNames: ['Up', 'Down', 'Charm', 'Strange', 'Top', 'Bottom'],
    gain(x) {
        let id = this.names[x]
        player.quarks[id] = player.quarks[id].add(this.gains[id]())
    },
    decay(x) {
        let decay = this.decays[x]()
        return decay
    },
    unls: {
        up() { return true },
        down() { return player.upgrades.includes(0) },
        charm() { return player.upgrades.includes(1) },
        strange() { return false },
        top() { return false },
        bottom() { return false }
    },
    decays: {
        up() {
            let a = E(0).add(player.age > 0 ? 1 : 0).div(E(2).pow(UPGS.haveHadron(1)))

            a = a.sub(player.upgrades.includes(4) ? QUARKS.gains['up']().div(E(2)) : 0)

            a = a.sub(player.leptons['lepton'].div(10));

            return a
        },
        down() {
            let a = E(0).add(player.age > 0 ? 1 : 0).div(E(4).pow(UPGS.haveHadron(1)))

            a = a.sub(player.leptons['lepton'].div(10));

            return a
        },
        charm() {
            let a = E(0).add(player.age > 0 ? 1 : 0)

            a = a.sub(player.leptons['lepton'].div(10));

            return a
        }
    },
    gains: {
        up() {
            let a = E(1).mul(E(4).pow(UPGS.haveHadron(0)))

            return a
        },
        down() {
            let a = E(0.5).mul(E(2).pow(UPGS.haveHadron(0)))
                .add(player.upgrades.includes(3) ? player.quarks['up'].div(100) : 0)

            return a
        },
        charm() {
            let a = E(0.25)
                .add(player.upgrades.includes(5) ? player.quarks['up'].div(1000) : 0)

            return a
        }
    }
}

const LEPTONS = {
    names: ['lepton', 'electron', 'muon', 'tau', 'e_neut', 'm_neut', 't_neut'],
    capNames: ['Lepton', 'Electron', 'Muon', 'Tau', 'E-Neut', 'M-Neut', 'T-Neut'],
    gain(source) {
        let a = this.gains[source] ? this.gains[source]() : E(0)

        return a
    },
    can(amount, cost) {
        return amount.gte(cost)
    },
    unls: {
        lepton() { return true },
        electron() { return true },
        muon() { return false },
        tau() { return false },
        e_neut() { return false },
        m_neut() { return false },
        t_neut() { return false }
    },
    gains: {
        electron() {
            return E(1).mul(player.leptons['electron'])
        }
    },
    cost: {
        electron() {
            return E(1).mul(E(16).pow(player.leptons['electron']))
        }
    },
    buy(x) {
        let id = this.names[x]

        if(this.can(player.leptons['lepton'], this.cost[id]())) {
            player.leptons['lepton'] = player.leptons['lepton'].sub(this.cost[id]())
            player.leptons[id] = player.leptons[id].add(E(1))
        }
    }
}

const UPGS = {
    can(type, x) {
        let data = this[type][x]

        switch(type) {
            case "upgs":
                for(let i = 0; i < data.res.length; i++) {
                    if(!this.canResource(data.res[i], data.cost()[i])) return false
                }

                break;

            case "hadronUpgs":
                if(!this.canHadrons(data.cost())) return false

                break;

            default:

                break;
        }

        return true
    },
    canResource(res, cost) {
        return player.quarks[res].gte(cost)
    },
    canHadrons(cost) {
        return player.hadrons.gte(cost)
    },
    buy(type, x) {
        if(this.can(type, x) && (type == "upgs" ? !player.upgrades.includes(x) : true)) {
            let data = this[type][x]

            switch(type) {
                case "upgs":
                    for(let i = 0; i < data.res.length; i++) {
                        player.quarks[data.res[i]] = player.quarks[data.res[i]].sub(data.cost()[i])
                    }

                    player.upgrades.push(x)

                    if(data.effect) { data.effect() }

                    break;

                case "hadronUpgs":
                    player.hadrons = player.hadrons.sub(data.cost())

                    if(player.hadronUpgs[x] === undefined) player.hadronUpgs[x] = E(0)
                    player.hadronUpgs[x] = player.hadronUpgs[x].add(E(1))

                    break;

                default:

                    break;
            }
        }
    },
    haveHadron(x) { return player.hadronUpgs[x] !== undefined ? player.hadronUpgs[x] : E(0) },
    upgs: [
        {
            unl() { return true },
            name: "Inverting",
            desc: "Unlock the Down Quark",
            res: ['up'],
            cost() { return [E(25)] }
        },
        {
            unl() { return player.quarks['down'].gte(5) || player.age > 0 },
            name: "How Charismatic",
            desc: "Unlock the Charm Quark",
            res: ['up', 'down'],
            cost() { return [E(50), E(10)] }
        },
        {
            unl() { return player.upgrades.includes(1) },
            name: "Condensed?",
            desc: "Condense all progress to gain Hadrons (Forces a Quark reset)",
            res: ['up', 'down', 'charm'],
            cost() { return [E(100).mul(E(4).pow(player.totalHadrons)), E(25).mul(E(4).pow(player.totalHadrons)),
                E(10).mul(E(4).pow(player.totalHadrons))] },
            effect() {
                if(player.age == 0) {
                    setTimeout(() => {
                        alert("Uh oh! The Hadrons have made the environment unstable!")
                    }, 500)
                    setTimeout(() => {
                        alert("Quarks will now decay over time!")
                    }, 1000)
                }

                player.age = 1

                let hadronGain = player.upgrades.includes(6) ? E(1).add(E(2*Math.floor(Math.log10(player.quarks['up'])))) : 1

                player.hadrons = player.hadrons.add(hadronGain)
                player.totalHadrons = player.totalHadrons.add(hadronGain)
                player.tab = 2

                forceReset("quark")
            }
        },
        {
            unl() { return player.age > 0 },
            name: "Connected",
            desc: "Up Quarks boost Down Quark gain at a reduced rate",
            res: ['up'],
            cost() { return [E(200)] }
        },
        {
            unl() { return player.upgrades.includes(3) },
            name: "Passive Income",
            desc: "You now gain Up Quarks passively at a reduced rate",
            res: ['up', 'down'],
            cost() { return [E(300), E(150)] }
        },
        {
            unl() { return player.upgrades.includes(4) },
            name: "Incredibly Eloquent",
            desc: "Upgrade 4 now also affects Charm Quarks",
            res: ['up'],
            cost() { return [E(1000)] }
        },
        {
            unl() { return player.totalHadrons.gte(2) },
            name: "More Hadrons!",
            desc: "Hadron gain is now increased by Up Quarks at a severely reduced rate",
            res: ['up', 'down', 'charm'],
            cost() { return [E(1500), E(750), E(200)] }
        },
        {
            unl() { return player.totalHadrons.gte(5) && player.age < 2 },
            name: "Condensing again!",
            desc: "Condense all progress to gain a Lepton (Forces a Hadron reset)",
            res: ['up', 'down', 'charm'],
            cost() { return [E(1e4), E(5e4), E(5000)] },
            effect() {
                player.age = 2

                player.leptons['lepton'] = player.leptons['lepton'].add(1)

                player.tab = 3

                forceReset("hadron")
            }
        }
    ],
    hadronUpgs: [
        {
            id: 0,
            unl() { return player.age > 0 },
            name: "Proton",
            desc: "Double Down Quark gain and multiply Up Quark Gain by 4",
            cost(x=UPGS.haveHadron(this.id)) { return E(3).pow(x) }
        },
        {
            id: 1,
            unl() { return player.age > 0 },
            name: "Neutron",
            desc: "Divide Up Quark decay by 2, and Down Quark decay by 4",
            cost(x=UPGS.haveHadron(this.id)) { return E(3).pow(x) }
        }
    ]
}

function loop() {
    diff = Date.now()-date;
    calc(diff/1000);
    updateHTML()
    date = Date.now();
}

function format(ex, acc=4) {
    ex = E(ex)
    neg = ex.lt(0)?"-":""

    if (ex.mag == Infinity) return neg + 'Infinity'
    if (ex.lt(0)) ex = ex.mul(-1)
    if (ex.eq(0)) return ex.toFixed(acc)

    let e = ex.log10().floor()

    if (e.lt(4)) {
        return neg+ex.toFixed(Math.max(Math.min(acc-e.toNumber(), acc), 0))
    } else {
        let m = ex.div(E(10).pow(e))

        return neg+(e.log10().gte(9)?'':m.toFixed(4))+'e'+format(e, 0, "sc")
    }
}

setInterval(loop, 50);
