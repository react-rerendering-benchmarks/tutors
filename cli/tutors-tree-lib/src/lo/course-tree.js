import { convertMdToHtml } from "../utils/markdown";
import { allLos } from "./lo-utils";
let rootCourse;
export function decorateCourseTree(lo) {
    if (lo.type === "course") {
        rootCourse = lo;
        rootCourse.walls = [];
        ["talk", "note", "lab", "web", "archive", "github"].forEach((type) => addWall(rootCourse, type));
    }
    lo.contentHtml = convertMdToHtml(lo === null || lo === void 0 ? void 0 : lo.contentMd);
    lo.summary = convertMdToHtml(lo === null || lo === void 0 ? void 0 : lo.summary);
    lo.icon = getIcon(lo);
    lo.parentCourse = rootCourse;
    lo.breadCrumbs = [];
    crumbs(lo, lo.breadCrumbs);
    if (lo.los) {
        lo.panels = getPanels(lo.los);
        lo.units = getUnits(lo.los);
        for (const childLo of lo.los) {
            childLo.parentLo = lo;
            if (lo.los) {
                decorateCourseTree(childLo);
            }
        }
    }
}
function getPanels(los) {
    return {
        panelVideos: los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type === "panelvideo"),
        panelTalks: los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type === "paneltalk"),
        panelNotes: los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type === "panelnote"),
    };
}
function getUnits(los) {
    let standardLos = los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type !== "unit" && lo.type !== "panelvideo" && lo.type !== "paneltalk" && lo.type !== "panelnote" && lo.type !== "side");
    standardLos = sortLos(standardLos);
    return {
        units: los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type === "unit"),
        sides: los === null || los === void 0 ? void 0 : los.filter((lo) => lo.type === "side"),
        standardLos: standardLos,
    };
}
function sortLos(los) {
    const orderedLos = los.filter((lo) => { var _a; return (_a = lo.frontMatter) === null || _a === void 0 ? void 0 : _a.order; });
    const unOrderedLos = los.filter((lo) => { var _a; return !((_a = lo.frontMatter) === null || _a === void 0 ? void 0 : _a.order); });
    orderedLos.sort((a, b) => a.frontMatter.order - b.frontMatter.order);
    return orderedLos.concat(unOrderedLos);
}
function getIcon(lo) {
    if (lo.frontMatter && lo.frontMatter.icon) {
        return {
            // @ts-ignore
            type: lo.frontMatter.icon["type"],
            // @ts-ignore
            color: lo.frontMatter.icon["color"],
        };
    }
    return undefined;
}
function crumbs(lo, los) {
    if (lo) {
        crumbs(lo.parentLo, los);
        los.push(lo);
    }
}
function addWall(course, type) {
    var _a;
    const los = allLos(type, course.los);
    if (los.length > 0) {
        (_a = course.walls) === null || _a === void 0 ? void 0 : _a.push(los);
    }
}
//# sourceMappingURL=course-tree.js.map