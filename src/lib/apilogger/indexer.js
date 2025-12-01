export function indexFields(req, res, config = {}) {

    const result = {}
    const indexSpec = config.index || {}

    for (const [section, fields] of Object.entries(indexSpec)) {

        const source = section === "request" ? req : res

        for (const path of fields) {

            const value = path.split(".").reduce((obj, k) => obj?.data?.[k], source)

            if (value !== undefined) {
                result[`${section}.${path}`] = value
            }
        }
    }

    return result
}
