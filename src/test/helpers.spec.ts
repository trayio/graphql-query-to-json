import {debugLog} from "../utils"

describe("Helpers", () => {
    describe("Debug logging", () => {
        let spy
        beforeEach(() => {
            process.env.__GQTOJSON_DEBUG = "true"
            spy = jest.spyOn(console, "log").mockImplementation()
        })

        afterEach(() => {
            delete process.env.__GQTOJSON_DEBUG
            spy.mockRestore()
        })
        it("Debug logging", () => {
            jest.spyOn(global.console, "log")
            debugLog("hello")
            expect(spy).toHaveBeenCalled()
        })
    })
})
