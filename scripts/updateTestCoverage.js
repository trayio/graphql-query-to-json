const fetch = require("node-fetch")
const {parseCoverageFromFile} = require("./parseCoverageFromFile")

const sendCoverageDataToTrayWorkflow = (coverageData) => {
    fetch("https://1141188d-d67c-46f9-a6c6-1369999bf294.trayapp.io", {
        method: "POST",
        body: JSON.stringify(coverageData),
        headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token":
                process.env.TRAY_DEV_ACCOUNT_WORKFLOW_UNIVERSAL_CSRF_TOKEN,
        },
    })
}

const coverageData = parseCoverageFromFile()
sendCoverageDataToTrayWorkflow(coverageData)
