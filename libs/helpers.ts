import postcss from "postcss";
import postcssJs from "postcss-js";
import CheatSheet from "../cheatsheet";

const arbitrarySupportedClasses = {
    pt: "padding-top",
    pb: "padding-bottom",
    pl: "padding-left",
    pr: "padding-right",
    p: "padding",
    mb: "margin-bottom",
    m: "margin",
    mt: "margin-top",
    ml: "margin-left",
    mr: "margin-right",
    w: "width",
    h: "height",
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    bg: "background",
    border: "border-color",
    text: "color",
    aspect: "aspect-ratio",
    color: "color",
    "max-w": "max-width",
    "max-h": "max-height",
    "min-w": "min-width",
    "min-h": "min-height"
};

const breakpointPartialClasses = {
    "sm": "sm",
    "md": "md",
    "lg": "lg",
    "xl": "xl",
    "2xl": "2xl"
} as const;

const partialClasses = {
    hover: "hover",
    disabled: "disabled"
} as const;

const allPartialClasses = {
    ...breakpointPartialClasses,
    ...partialClasses
} as const;

const getNotFoundClasses = (classNames: string[], foundClassNames: string[]) => {
    const prefixes: string[] = Object.values(allPartialClasses);
    return classNames.filter((val) => !foundClassNames.includes(val)).filter((val) => !prefixes.some((pre) => val.startsWith(pre)));
}

const convertToCss = (classNames: string[], type = "core") => {
    let cssCode = ``;
    let foundClasses = [];
    CheatSheet.forEach((element) => {
        element.content.forEach((content) => {
            content.table.forEach((list) => {
                if (classNames.includes(list[0])) {
                    foundClasses.push(list[0]);
                    cssCode += `${list[1]}\n`;
                }

                if (classNames.includes(list[1])) {
                    foundClasses.push(list[1]);
                    const semicolon = list[2][list[2].length - 1] !== ";" ? ";" : "";
                    cssCode += `${list[2]}${semicolon}\n`;
                }
            });
        });
    });
    // Check for arbitrary values

    const arbitraryClasses = classNames.filter((className) =>
        className.includes("[")
    );

    arbitraryClasses.forEach((className) => {
        try {
            const property = className.split("-[")[0].replace(".", "");

            const properyValue = className.match(/(?<=\[)[^\][]*(?=])/g)[0];
            if (arbitrarySupportedClasses[property]) {
                foundClasses.push(className);
                cssCode += `${arbitrarySupportedClasses[property]}: ${properyValue};\n`;
            }
        }
        catch (e) {
            console.log(e)
        }
    });

    const nfc = getNotFoundClasses(classNames, foundClasses);
    return { cssCode, notFound: type === "core" ? nfc : nfc.map((c) => type + ":" + c), type };
};

const getBreakPoints = (input: string, breakpoint: string) => {
    return input
        .replaceAll("\n", " ")
        .split(" ")
        .filter((i: string) => i.startsWith(breakpoint + ":"))
        .map((i: string) => i.substring(3));
};

const getPrefixClass = (input: string, prefix: string) => {
    return input
        .replaceAll("\n", " ")
        .split(" ")
        .filter((i) => i.startsWith(`${prefix}:`))
        .map((i) => i.replace(`${prefix}:`, ""));
};

const breakpointReplacer = (cssCode: string, type: keyof typeof breakpointPartialClasses) => {
    const m: Record<keyof typeof breakpointPartialClasses, number> = { "sm": 0, "md": 1, "lg": 2, "xl": 3, "2xl": 4 };
    const breakpoints = CheatSheet[0].content[1].table;
    const index = m[type];
    if (index === undefined) {
        throw new Error(";/");
    }
    return breakpoints[index][1].replace("...", "\n  " + cssCode)
    
}

export const getConvertedClasses = (input) => {

    if (input === "") return { resultCss: "", notFound: [] };

    const classNames = input.split(/\s+/).map((i) => i.trim()).filter((i) => i !== "");

    const allPrefixClasses = Object.values(partialClasses)
        .map((t) => [getPrefixClass(input, t), t])
        .filter(([a]) => a.length !== 0)
        .map(([c, t]: [string[], keyof typeof partialClasses]) => convertToCss(c, t));
    const allBreakpointClasses = Object.values(breakpointPartialClasses)
        .map((t) => [getBreakPoints(input, t), t])
        .filter(([a]) => a.length !== 0)
        .map(([c, t]: [string[], keyof typeof breakpointPartialClasses]) => convertToCss(c, t));

    const converted = [convertToCss(classNames), ...allBreakpointClasses, ...allPrefixClasses];

    const { cssCode, notFound } = converted.reduce((acc, { cssCode, notFound, type }) => {
        acc.notFound = acc.notFound.concat(notFound);
        acc.cssCode = acc.cssCode + "\n";
        if (type in breakpointPartialClasses) {
            acc.cssCode = acc.cssCode + breakpointReplacer(cssCode, type as keyof typeof breakpointPartialClasses);
            return acc;
        }
        if (type in partialClasses) {
            acc.cssCode = acc.cssCode + `\n:${type} {\n ${cssCode}}`;
            return acc;
        }
        acc.cssCode = acc.cssCode + cssCode;
        return acc;
    }, {
        cssCode: "",
        notFound: [] as string[]
    });

    console.log(notFound);

    return { resultCss: cssCode.trimEnd(), notFound };
};

export const convertFromCssToJss = (css: string) => {
    try {
        const root = postcss.parse(css);
        const jss = JSON.stringify(postcssJs.objectify(root))
        return jss;
    } catch (e) {
        console.log(e);
    }
};
