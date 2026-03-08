const TABS = {
    choose(x) {
        player.tab = x
    },
    1: [
        {title: "Quarks", unl() { return true }},
        {title: "Upgrades", unl() { return player.quarks['up'].gte(10) || player.upgrades.includes(0)
            || player.age >= 1 }},
        {title: "Hadrons", unl() { return player.age >= 1 }},
        {title: "Leptons", unl() { return player.age >= 2 }}
    ]
}
