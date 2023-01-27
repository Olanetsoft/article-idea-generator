"use strict";
exports.__esModule = true;
var react_1 = require("react");
var solid_1 = require("@heroicons/react/solid");
var next_themes_1 = require("next-themes");
var Header = function () {
    var _a = next_themes_1.useTheme(), systemTheme = _a.systemTheme, theme = _a.theme, setTheme = _a.setTheme;
    var _b = react_1.useState(false), mounted = _b[0], setMounted = _b[1];
    react_1.useEffect(function () {
        setMounted(true);
    }, []);
    var renderThemeChanger = function () {
        if (!mounted)
            return null;
        var currentTheme = theme === "system" ? systemTheme : theme;
        if (currentTheme === "dark") {
            return (React.createElement(solid_1.SunIcon, { className: "w-10 h-10 text-yellow-500 ", role: "button", onClick: function () { return setTheme("light"); } }));
        }
        else {
            return (React.createElement(solid_1.MoonIcon, { className: "w-10 h-10 text-gray-900 ", role: "button", onClick: function () { return setTheme("dark"); } }));
        }
    };
    return (React.createElement("header", { className: " flex w-full p-5 justify-between text-sm text-gray-800" },
        React.createElement("div", { className: "flex space-x-4 items-center font-Ubuntu" }, renderThemeChanger()),
        React.createElement("div", { className: "flex space-x-4 font-Ubuntu items-center" },
            React.createElement("h1", { className: "font-bold dark:bg-gray-900 dark:text-gray-100 text-2xl" },
                React.createElement("a", { href: "https://github.com/Olanetsoft/article-idea-generator" },
                    React.createElement("svg", { "aria-hidden": "true", className: "h-8 w-8 fill-slate-600 group-hover:fill-slate-700 dark:text-gray-100" },
                        React.createElement("path", { d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" }))))),
        "); }; export default Header;"));
};
