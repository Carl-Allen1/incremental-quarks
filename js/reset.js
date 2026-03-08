function forceReset(type) {
    switch(type) {
        case "quark":
            for(let x = 0; x < QUARKS.names.length; x++) {
                player.quarks[QUARKS.names[x]] = E(0)
            }

            player.upgrades = []

            break;

        case "hadron":
            forceReset("quark")

            player.hadronUpgs = {}

            break;

        default:

            break;
    }

    setupHTML()
    updateHTML()
}
