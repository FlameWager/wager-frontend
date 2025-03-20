import amp from "amplitude-js"
import { flameWager } from "./flameWager"

const amplitude = amp.getInstance()

const log = (event, properties) => {
    amplitude.logEvent(event, { ...properties, network: flameWager.sdk._network })
}

export default { log }
