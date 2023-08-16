export function findLos(los, lotype) {
    const result = [];
    for (const lo of los) {
        if (lo.type === lotype) {
            result.push(lo);
        }
        if (lo.type === "unit" || lo.type === "side") {
            result.push(...findLos(lo.los, lotype));
        }
    }
    return result;
}
export function allLos(lotype, los) {
    const allLos = [];
    for (const topic of los) {
        allLos.push(...findLos(topic.los, lotype));
    }
    return allLos;
}
//# sourceMappingURL=lo-utils.js.map