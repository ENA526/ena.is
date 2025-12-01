const queue = []
let running = false

export function enqueue(job) {
    queue.push(job)
    run()
}

async function run() {

    if (running) return
    running = true

    while (queue.length) {
        const job = queue.shift()
        await process(job)
    }

    running = false
}

async function process(job) {
    try {
        await job()
    } catch (e) {
        console.error("LOGGER FAILED:", e)
    }
}
