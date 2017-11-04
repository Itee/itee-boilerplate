/**
 * Created by Tristan on 14/10/2017.
 */

module.exports = {
    "help-message": [
        "Itee UI - Help",
        "",
        "Usage: npm run <script>",
        "where <script> is one of:",
        "",
        "help, doc, test, unit, bench, lint, build, release",
        ""
    ],
    "help":         {
        "Description": [ "Will display this help" ],
        "Usage":       [
            "To see help for all scripts:",
            "   npm run help",
            "",
            "To filter for specifics scripts:",
            "   npm run help [regex]"
        ]
    },
    "doc":          {
        "Desciption": [
            "Will run the jsdoc, and create documentation",
            "under `documentation` folder, using the docdash theme"
        ],
        "Usage":      "npm run doc"
    },
    "test":         {
        "Desciption": [
            "Will run the test framworks (unit and bench), and create reports",
            "under `test/report` folder, using the mochawesome theme"
        ],
        "Usage":      "npm run test"
    },
    "unit":         {
        "Desciption": [
            "Will run the karma server for unit tests",
            "/!\\Deprecated: will be remove as soon as test script is fixed"
        ],
        "Usage":      "npm run unit"
    },
    "bench":        {
        "Desciption": [
            "Will run the karma server for benchmarks",
            "/!\\Deprecated: will be remove as soon as test script is fixed"
        ],
        "Usage":      "npm run bench"
    },
    "lint":         {
        "Desciption": [
            "Will run the eslint in pedantic mode with auto fix when possible"
        ],
        "Usage":      "npm run lint"
    },
    "build":        {
        "Desciption": [
            "Will build the app"
        ],
        "Usage":      [
            "npm run build -- <options>",
            "",
            "With <options>:",
            "",
            "-d or --dev    to build in devlopment environment",
            "-p or --prod   to build in production environment",
            "(in case no environment is provide both will be compile)",
            "",
            "-f:<format> or --format:<format>   to specify the output build",
            "where format could be any of: 'amd', 'cjs', 'es', 'iife', 'umd'",
            "",
            "-s or --sourcemap  to build related source map"
        ]
    },
    "release":         {
        "Desciption": [
            "Will run all the lint, test stuff, and if succeed will build the app",
            "/!\\ Need to be run before any PR !"
        ],
        "Usage":      "npm run release"
    }
};