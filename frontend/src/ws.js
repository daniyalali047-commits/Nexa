import {io} from 'socket.io-client'

export function connectWs(){
return io('https://literate-space-happiness-qvqwpvg4jq4rf45p5-3000.app.github.dev')
}

